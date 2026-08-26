import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { User, ChevronRight, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreditInfo = () => {
  const { role } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get(role === 'admin' ? '/clients' : '/clients/my-clients');
        if (res.data.success && res.data.data.length > 0) {
          setClients(res.data.data);
          setSelectedClientId(res.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [role]);

  useEffect(() => {
    if (!selectedClientId) return;
    const fetchClientDetails = async () => {
      try {
        setDataLoading(true);
        const res = await api.get(`/clients/${selectedClientId}`);
        if (res.data.success) {
          setClientData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchClientDetails();
  }, [selectedClientId]);

  const existingInfo = clientData?.creditInfo || {};
  const accounts = existingInfo.accounts || [];

  const activeCount = accounts.filter(a => a.status === 'Active').length;
  const closedCount = accounts.filter(a => a.status === 'Closed').length;
  const defaultCount = accounts.filter(a => a.status === 'Default').length;
  
  const chartData = [
    { name: 'Active', value: activeCount, color: '#16a34a' },
    { name: 'Closed', value: closedCount, color: '#94a3b8' },
    { name: 'Default', value: defaultCount, color: '#ef4444' }
  ].filter(d => d.value > 0);
  
  if (chartData.length === 0) chartData.push({ name: 'None', value: 1, color: '#e5e7eb' });

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Credit Information...</div>;
  }

  if (clients.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold">No clients found.</div>;
  }

  // Formatting strings
  const formatMoney = (val) => val ? `₹ ${val}` : '₹ 0';

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
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 space-y-8 relative min-h-[400px]">
        {dataLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-2xl">
            <div className="w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm mt-3">Loading data...</p>
          </div>
        )}
        
        {/* Client Selector */}
        <div className="flex items-center gap-2 text-sm font-bold text-[#081326] w-fit cursor-pointer hover:text-[#f59e0b] transition-colors relative group">
          <User className="w-5 h-5 shrink-0" />
          <select 
             className="appearance-none bg-transparent outline-none cursor-pointer pr-6 font-bold text-[#081326] hover:text-[#f59e0b] transition-colors"
             value={selectedClientId}
             onChange={e => setSelectedClientId(e.target.value)}
          >
             {clients.map(c => (
               <option key={c._id} value={c._id} className="text-gray-800">{c.fullName} ({c._id})</option>
             ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-0 pointer-events-none" />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Credit Limit</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">{formatMoney(existingInfo.creditLimit)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Current Balance</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">{formatMoney(existingInfo.currentBalance)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Total Enquiries</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">{existingInfo.totalEnquiries || '0'}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
            <p className="text-[11px] font-bold text-gray-500 mb-2">Utilization</p>
            <p className="text-xl font-black text-[#081326] tracking-tight">{existingInfo.utilization || '0%'}</p>
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
                <span className="text-xs font-bold text-[#081326]">{accounts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Active Accounts</span>
                <span className="text-xs font-bold text-green-600">{activeCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Closed Accounts</span>
                <span className="text-xs font-bold text-gray-500">{closedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500">Default Accounts</span>
                <span className="text-xs font-bold text-red-500">{defaultCount}</span>
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
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-2xl font-black text-[#081326]">{accounts.length}</span>
                  <span className="text-[10px] font-bold text-gray-500">Total Accounts</span>
                </div>
              </div>

              <div className="w-full sm:w-auto space-y-6">
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Active ({activeCount})</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">
                    {accounts.length ? ((activeCount/accounts.length)*100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Closed ({closedCount})</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">
                    {accounts.length ? ((closedCount/accounts.length)*100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center gap-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-[11px] font-bold text-[#081326]">Default ({defaultCount})</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#081326]">
                    {accounts.length ? ((defaultCount/accounts.length)*100).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Accounts Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="font-bold text-[#081326] text-sm">Recent Accounts</h3>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[11px] font-bold text-gray-500 tracking-wide border-b border-gray-50">
                  <th className="px-6 py-4 whitespace-nowrap">Account Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Lender Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Account Number</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Credit Limit</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-[#081326] divide-y divide-gray-50 bg-white">
                {accounts.length > 0 ? accounts.map((acc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold whitespace-nowrap">{acc.accountType}</td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap text-gray-600">{acc.lender}</td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap font-mono text-gray-500">{acc.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {acc.status === 'Active' ? (
                        <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Active
                        </span>
                      ) : acc.status === 'Closed' ? (
                        <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Closed
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black">
                      {formatMoney(acc.limit)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium text-sm">
                      No accounts found for this client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreditInfo;
