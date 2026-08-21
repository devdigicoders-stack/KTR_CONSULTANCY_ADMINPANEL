import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { User, ChevronRight, ChevronDown } from 'lucide-react';

const data = [
  { name: 'Active', value: 4, color: '#16a34a' },
  { name: 'Closed', value: 2, color: '#94a3b8' },
  { name: 'Default', value: 0, color: '#ef4444' }
];

const accounts = [
  { type: 'Credit Card', lender: 'HDFC Bank', number: 'XXXX-XXXX-1234', status: 'Active', openDate: '10 Jan 2022', limit: '₹ 1,50,000' },
  { type: 'Personal Loan', lender: 'ICICI Bank', number: 'XXXX-XXXX-5678', status: 'Active', openDate: '15 May 2023', limit: '₹ 5,00,000' },
  { type: 'Auto Loan', lender: 'SBI', number: 'XXXX-XXXX-9012', status: 'Closed', openDate: '01 Feb 2020', limit: '₹ 8,00,000' },
];

const CreditInfo = () => {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-xl font-bold text-[#081326]">
          View Basic Credit Information
        </h2>
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-2 mb-6">
          <Link to="/" className="hover:text-[#f59e0b] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/clients" className="hover:text-[#f59e0b] transition-colors">Clients</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#081326]">Credit Information</span>
        </div>
      </div>

      {/* Master Card wrapping everything */}
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 space-y-8">
        
        {/* Client Selector */}
        <div className="flex items-center gap-2 text-sm font-bold text-[#081326] w-fit cursor-pointer hover:text-[#f59e0b] transition-colors">
          <User className="w-5 h-5" />
          <span>Rahul Sharma (CLT-00125)</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Credit Limit</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">₹ 5,00,000</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Current Balance</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">₹ 1,25,000</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Available Credit</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">₹ 3,75,000</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Utilization</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">25%</p>
          </div>
        </div>

        {/* Middle Row (Summary + Chart) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Credit Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-6 sm:p-8">
            <h3 className="font-bold text-[#081326] text-sm mb-6">Credit Summary</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Credit Bureau</span>
                <span className="text-xs font-bold text-[#081326]">TransUnion CIBIL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Credit Account Type</span>
                <span className="text-xs font-bold text-[#081326]">Individual</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Total Accounts</span>
                <span className="text-xs font-bold text-[#081326]">6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Active Accounts</span>
                <span className="text-xs font-bold text-[#081326]">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Closed Accounts</span>
                <span className="text-xs font-bold text-[#081326]">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Default Accounts</span>
                <span className="text-xs font-bold text-[#081326]">0</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-6 sm:p-8 flex flex-col">
            <h3 className="font-bold text-[#081326] text-sm mb-2">Account Status</h3>
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-8 sm:px-8">
              
              <div className="relative w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-2xl font-black text-[#081326]">6</span>
                  <span className="text-[10px] font-bold text-gray-500">Total Accounts</span>
                </div>
              </div>

              <div className="w-full sm:w-auto space-y-6">
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Active (4)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">66.67%</span>
                </div>
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Closed (2)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">33.33%</span>
                </div>
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Default (0)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Accounts Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="font-bold text-[#081326] text-sm">Recent Accounts</h3>
            <button className="border border-gray-200 rounded-md px-4 py-1.5 text-[11px] font-bold text-[#081326] hover:bg-gray-50 transition-colors">
              View All Accounts
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[11px] font-bold text-gray-500 tracking-wide border-b border-gray-50">
                  <th className="px-6 py-4 whitespace-nowrap">Account Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Lender Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Account Number</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Open Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Credit Limit</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-[#081326] divide-y divide-gray-50 bg-white">
                {accounts.map((acc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold whitespace-nowrap">{acc.type}</td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap">{acc.lender}</td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap">{acc.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {acc.status === 'Active' ? (
                        <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{acc.openDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-black">
                      {acc.limit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditInfo;
