import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { User, ChevronDown, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CreditInfoTab = ({ client }) => {
  const existingInfo = client?.creditInfo;

  // Form State
  const [formData, setFormData] = useState({
    creditLimit: '',
    currentBalance: '',
    totalEnquiries: '',
    utilization: '',
    accounts: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingInfo) {
      setFormData({
        creditLimit: existingInfo.creditLimit || '',
        currentBalance: existingInfo.currentBalance || '',
        totalEnquiries: existingInfo.totalEnquiries || '',
        utilization: existingInfo.utilization || '',
        accounts: existingInfo.accounts || []
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [existingInfo]);

  const handleAccountChange = (index, field, value) => {
    const updated = [...formData.accounts];
    updated[index][field] = value;
    setFormData({ ...formData, accounts: updated });
  };

  const addAccount = () => {
    setFormData({
      ...formData,
      accounts: [...formData.accounts, { accountType: 'Credit Card', lender: '', number: '', status: 'Active', openDate: '', limit: '' }]
    });
  };

  const removeAccount = (index) => {
    const updated = [...formData.accounts];
    updated.splice(index, 1);
    setFormData({ ...formData, accounts: updated });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.post(`/clients/${client._id}/credit-info`, formData);
      if (res.data.success) {
        toast.success("Credit Info saved successfully!");
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Credit Info");
    } finally {
      setIsSaving(false);
    }
  };

  // Derived Data for Chart
  const getChartData = () => {
    const data = [
      { name: 'Active', value: formData.accounts.filter(a => a.status === 'Active').length, color: '#16a34a' },
      { name: 'Closed', value: formData.accounts.filter(a => a.status === 'Closed').length, color: '#94a3b8' },
      { name: 'Default', value: formData.accounts.filter(a => a.status === 'Default').length, color: '#ef4444' }
    ];
    // Filter out 0 value so pie chart doesn't render empty slivers
    return data.filter(d => d.value > 0).length > 0 ? data.filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#e5e7eb' }];
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-[#081326] text-lg">Edit Credit Information</h3>
          {existingInfo && (
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 text-sm font-bold">Cancel</button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Credit Limit (₹)</label>
            <input type="text" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#f59e0b] outline-none" placeholder="e.g. 5,00,000" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Current Balance (₹)</label>
            <input type="text" value={formData.currentBalance} onChange={e => setFormData({...formData, currentBalance: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#f59e0b] outline-none" placeholder="e.g. 1,25,000" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Total Enquiries</label>
            <input type="number" value={formData.totalEnquiries} onChange={e => setFormData({...formData, totalEnquiries: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#f59e0b] outline-none" placeholder="e.g. 3" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Utilization %</label>
            <input type="text" value={formData.utilization} onChange={e => setFormData({...formData, utilization: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#f59e0b] outline-none" placeholder="e.g. 25%" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[#081326] text-sm">Credit Accounts</h4>
            <button onClick={addAccount} className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              <Plus className="w-4 h-4" /> Add Account
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.accounts.map((acc, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Type</label>
                  <select value={acc.accountType} onChange={e => handleAccountChange(index, 'accountType', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none">
                    <option>Credit Card</option>
                    <option>Personal Loan</option>
                    <option>Auto Loan</option>
                    <option>Home Loan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Lender</label>
                  <input type="text" value={acc.lender} onChange={e => handleAccountChange(index, 'lender', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none" placeholder="Bank Name" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Number</label>
                  <input type="text" value={acc.number} onChange={e => handleAccountChange(index, 'number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none" placeholder="XXXX-1234" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Status</label>
                  <select value={acc.status} onChange={e => handleAccountChange(index, 'status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none">
                    <option>Active</option>
                    <option>Closed</option>
                    <option>Default</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Limit/Amount</label>
                  <input type="text" value={acc.limit} onChange={e => handleAccountChange(index, 'limit', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-xs outline-none" placeholder="₹ 1,00,000" />
                </div>
                <div className="flex justify-end pb-1.5">
                  <button onClick={() => removeAccount(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {formData.accounts.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No accounts added yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={isSaving} className="bg-[#081326] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-gray-800 transition-colors">
            {isSaving ? 'Saving...' : 'Save Credit Information'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-[#081326] w-fit">
          <User className="w-5 h-5" />
          <span>{client.fullName} ({client._id})</span>
        </div>
        <button onClick={() => setIsEditing(true)} className="border border-gray-200 text-[#081326] px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
          Edit Info
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
          <p className="text-[11px] font-bold text-gray-500 mb-2">Credit Limit</p>
          <p className="text-xl font-black text-[#081326] tracking-tight">₹ {formData.creditLimit || '0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
          <p className="text-[11px] font-bold text-gray-500 mb-2">Current Balance</p>
          <p className="text-xl font-black text-[#081326] tracking-tight">₹ {formData.currentBalance || '0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
          <p className="text-[11px] font-bold text-gray-500 mb-2">Total Enquiries</p>
          <p className="text-xl font-black text-[#081326] tracking-tight">{formData.totalEnquiries || '0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-5">
          <p className="text-[11px] font-bold text-gray-500 mb-2">Utilization</p>
          <p className="text-xl font-black text-[#081326] tracking-tight">{formData.utilization || '0%'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-6 sm:p-8">
          <h3 className="font-bold text-[#081326] text-sm mb-6">Credit Summary</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Credit Bureau</span>
              <span className="text-xs font-bold text-[#081326]">TransUnion CIBIL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Total Accounts</span>
              <span className="text-xs font-bold text-[#081326]">{formData.accounts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Active Accounts</span>
              <span className="text-xs font-bold text-green-600">{formData.accounts.filter(a => a.status === 'Active').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Closed Accounts</span>
              <span className="text-xs font-bold text-gray-600">{formData.accounts.filter(a => a.status === 'Closed').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_15px_rgba(0,0,0,0.02)] p-6 sm:p-8">
          <h3 className="font-bold text-[#081326] text-sm mb-4">Account Mix</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={getChartData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {getChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-black text-[#081326] leading-none">{formData.accounts.length}</span>
              <span className="text-[9px] font-bold text-gray-400 mt-1">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-[#081326] text-sm mb-4">Account Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="px-5 py-3 text-left whitespace-nowrap">Account Type</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Lender</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Account Number</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Limit/Amount</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {formData.accounts.map((acc, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#081326]">{acc.accountType}</td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{acc.lender}</td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-[11px]">{acc.number}</td>
                  <td className="px-5 py-4">
                    <span className={`${acc.status === 'Active' ? 'text-green-600 bg-green-50' : acc.status === 'Closed' ? 'text-gray-600 bg-gray-100' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded text-[10px] font-bold`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#081326]">{acc.limit}</td>
                </tr>
              ))}
              {formData.accounts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500 font-medium">No accounts on record.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditInfoTab;
