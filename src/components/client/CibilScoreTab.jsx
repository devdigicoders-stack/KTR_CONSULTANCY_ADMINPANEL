import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const gaugeData = [
  { name: 'Red', value: 50, color: '#ef4444' },
  { name: 'Orange', value: 25, color: '#f59e0b' },
  { name: 'Green', value: 5.33, color: '#22c55e' },
  { name: 'Gray', value: 19.67, color: '#e5e7eb' }
];

const CibilScoreTab = ({ client }) => {
  const latestReport = client?.cibilReports && client.cibilReports.length > 0 
    ? client.cibilReports[0] 
    : null;

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to fetch actual CIBIL from bureau (mocked here by saving a new report)
      const mockScore = Math.floor(Math.random() * (850 - 650 + 1)) + 650;
      const res = await api.post('/cibil-reports/save', {
        name: client.fullName,
        mobile: client.mobile,
        pan: client.panNumber,
        gender: client.gender,
        bureau: 'CIBIL',
        score: mockScore,
        status: 'Completed',
        client_id: client._id
      });
      if (res.data.success) {
        toast.success("CIBIL Score Generated Successfully!");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CIBIL Score.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!latestReport) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-orange-50 text-[#f59e0b] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-[#081326] mb-2">No CIBIL Record Found</h3>
        <p className="text-gray-500 text-sm max-w-md mb-6">This client does not have a CIBIL score generated yet. You can generate a fresh CIBIL report right now.</p>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-500/20"
        >
          {isGenerating ? 'Generating...' : 'Generate CIBIL Score'}
        </button>
      </div>
    );
  }

  // Calculate position on gauge based on score (mock logic)
  const score = latestReport.score;
  const isGood = score >= 750;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center relative">
          <h3 className="font-bold text-[#081326] text-sm absolute top-6 left-6">CIVIL Score</h3>
          
          <div className="relative w-64 h-32 mt-10 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={100}
                  outerRadius={125}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center flex flex-col items-center w-full pb-2">
              <div className="text-[44px] font-black text-[#081326] tracking-tight leading-none flex items-baseline justify-center">
                {score}<span className="text-xl text-gray-400 font-bold ml-1">/900</span>
              </div>
              <div className={`${isGood ? 'text-green-600 bg-green-50 border-green-100' : 'text-orange-600 bg-orange-50 border-orange-100'} px-4 py-1 rounded-md font-bold text-xs mt-2 shadow-sm border`}>
                {isGood ? 'Good' : 'Average'}
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-2">
            <p className="text-[11px] font-bold text-[#081326]">Bureau: {latestReport.bureau}</p>
            <p className="text-[11px] font-bold text-[#081326]">Updated On: {new Date(latestReport.createdAt).toLocaleDateString()}</p>
            <div className="pt-2">
              <button onClick={handleGenerate} disabled={isGenerating} className="bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-white px-8 py-2.5 rounded-lg text-xs font-bold transition-colors">
                {isGenerating ? 'Refreshing...' : 'Refresh Score'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <h3 className="font-bold text-[#081326] text-sm mb-8">Score Breakdown</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#081326]">Payment History</span>
                <span className="text-[11px] font-bold text-gray-500">High Impact</span>
                <span className="text-xs font-bold text-[#081326]">78%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#081326]">Credit Utilization</span>
                <span className="text-[11px] font-bold text-gray-500">High Impact</span>
                <span className="text-xs font-bold text-[#081326]">72%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CibilScoreTab;
