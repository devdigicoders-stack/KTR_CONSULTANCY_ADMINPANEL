import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, ShieldCheck, CreditCard, MessageSquare, Briefcase, Calendar, Phone, Mail } from 'lucide-react';

const trendData = [
  { name: 'May 15', score: 710 },
  { name: 'May 16', score: 725 },
  { name: 'May 17', score: 740 },
  { name: 'May 18', score: 750 },
  { name: 'May 19', score: 765 },
  { name: 'May 20', score: 770 },
  { name: 'May 21', score: 775 },
  { name: 'May 22', score: 782 },
];

const activityData = [
  { name: 'Documents\nUploaded', count: 8 },
  { name: 'Scores\nChecked', count: 6 },
  { name: 'Profile\nUpdates', count: 4 },
  { name: 'Enquiries', count: 3 },
  { name: 'Other\nActivities', count: 2 },
];

const docData = [
  { name: 'Verified', value: 5, color: '#22c55e' },
  { name: 'Pending', value: 2, color: '#f59e0b' },
  { name: 'Rejected', value: 1, color: '#ef4444' }
];

const ClientDashboardTab = () => {
  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText className="w-4 h-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">Documents</span>
            </div>
            <p className="text-2xl font-bold text-[#081326]">8</p>
            <p className="text-[10px] font-bold text-green-500 mt-1">↑ 14%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ShieldCheck className="w-4 h-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">CIVIL Score</span>
            </div>
            <p className="text-2xl font-bold text-[#081326]">782</p>
            <p className="text-[10px] font-bold text-green-500 mt-1">↑ +12 pts</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CreditCard className="w-4 h-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">Credit Limit</span>
            </div>
            <p className="text-2xl font-bold text-[#081326]">₹ 5,00,000</p>
            <p className="text-[10px] font-bold text-green-500 mt-1">↑ 5%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MessageSquare className="w-4 h-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">Enquiries</span>
            </div>
            <p className="text-2xl font-bold text-[#081326]">3</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1">→ 0%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* CIVIL Score Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[350px] flex flex-col">
          <h3 className="font-bold text-[#081326] text-sm mb-6">CIVIL Score Trend</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[600, 900]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#081326', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center relative">
          <h3 className="font-bold text-[#081326] text-sm mb-6 w-full text-left">Document Status</h3>
          
          <div className="relative w-48 h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {docData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#081326]">8</span>
              <span className="text-[10px] font-bold text-gray-400">Total</span>
            </div>
          </div>

          <div className="mt-8 w-full space-y-4 px-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span><span className="font-bold text-[#081326]">Verified</span>
              </div>
              <span className="font-bold text-[#081326]">5 (62.5%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="font-bold text-[#081326]">Pending</span>
              </div>
              <span className="font-bold text-[#081326]">2 (25%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span><span className="font-bold text-[#081326]">Rejected</span>
              </div>
              <span className="font-bold text-[#081326]">1 (12.5%)</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Monthly Activity Summary */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[300px] flex flex-col">
          <h3 className="font-bold text-[#081326] text-sm mb-6">Monthly Activity Summary</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned To */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="font-bold text-[#081326] text-sm mb-6">Assigned To</h3>
          <div className="flex flex-col h-full justify-center pb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#081326] text-white flex items-center justify-center text-xl font-bold">AV</div>
              <div>
                <h4 className="font-bold text-[#081326] text-base">Aman Verma</h4>
                <p className="text-[11px] text-gray-500 font-medium">Relationship Manager</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-[#081326]">aman.verma@ktrconsultants.com</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-[#081326]">+91 91234 56789</span>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#081326] hover:bg-gray-50 transition-colors">
              Send Message
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ClientDashboardTab;
