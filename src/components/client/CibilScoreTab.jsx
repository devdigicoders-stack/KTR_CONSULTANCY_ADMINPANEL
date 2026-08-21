import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const gaugeData = [
  { name: 'Red', value: 50, color: '#ef4444' },
  { name: 'Orange', value: 25, color: '#f59e0b' },
  { name: 'Green', value: 5.33, color: '#22c55e' },
  { name: 'Gray', value: 19.67, color: '#e5e7eb' }
];

const CibilScoreTab = () => {
  return (
    <div className="space-y-6">
      
      {/* Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gauge Chart Card */}
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
                782<span className="text-xl text-gray-400 font-bold ml-1">/900</span>
              </div>
              <div className="text-green-600 bg-green-50 px-4 py-1 rounded-md font-bold text-xs mt-2 shadow-sm border border-green-100">
                Good
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-2">
            <p className="text-[11px] font-bold text-[#081326]">Score Range: 750 - 900</p>
            <p className="text-[11px] font-bold text-[#081326]">Updated On: May 22, 2025</p>
            <div className="pt-2">
              <button className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-2.5 rounded-lg text-xs font-bold transition-colors">
                Refresh Score
              </button>
            </div>
          </div>
        </div>

        {/* Score Breakdown Box */}
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#081326]">Credit Age</span>
                <span className="text-[11px] font-bold text-[#f59e0b]">Medium Impact</span>
                <span className="text-xs font-bold text-[#081326]">85%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#081326]">Credit Mix</span>
                <span className="text-[11px] font-bold text-[#f59e0b]">Medium Impact</span>
                <span className="text-xs font-bold text-[#081326]">70%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-[#081326]">New Credit</span>
                <span className="text-[11px] font-bold text-gray-500">Low Impact</span>
                <span className="text-xs font-bold text-[#081326]">60%</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Good Score Alert Box */}
      <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex gap-4 items-start">
        <div className="w-8 h-8 rounded-full bg-[#f0f9ff] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#081326] mb-1">Good Score!</h4>
          <p className="text-xs text-gray-500">The client has a good credit score. They are eligible for higher credit limits with better interest rates.</p>
        </div>
      </div>

    </div>
  );
};

export default CibilScoreTab;
