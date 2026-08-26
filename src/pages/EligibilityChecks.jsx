import React, { useState, useEffect } from 'react';
import { Download, Search, CheckCircle, XCircle, Clock, Save, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const EligibilityChecks = () => {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingRemark, setEditingRemark] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/eligibility-checks`);
      const data = await res.json();
      if (data.success) {
        setChecks(data.data);
      }
    } catch (error) {
      console.error('Error fetching eligibility checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/eligibility-checks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setChecks(checks.map(item => item._id === id ? data.data : item));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const saveRemark = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/eligibility-checks/${id}/remark`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark: remarkText })
      });
      const data = await res.json();
      if (data.success) {
        setChecks(checks.map(item => item._id === id ? data.data : item));
        setEditingRemark(null);
      }
    } catch (error) {
      console.error('Error saving remark:', error);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredChecks.map(item => ({
      'Case ID': item.caseId,
      'Date': new Date(item.createdAt).toLocaleDateString(),
      'Name': item.fullName,
      'Mobile': item.mobile,
      'Location': item.location,
      'Property Name': item.propertyName || 'N/A',
      'Property Type': item.propertyType,
      'Loan Requirement': item.loanRequirement,
      'Property Status': item.propertyStatus || 'N/A',
      'Existing Docs': item.existingDocs || 'N/A',
      'Additional Details': item.additionalDetails || 'N/A',
      'Status': item.status,
      'Remark': item.remark || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eligibility Checks");
    XLSX.writeFile(wb, "Eligibility_Checks.xlsx");
  };

  const filteredChecks = checks.filter(item => {
    const matchesSearch = 
      item.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Completed</span>;
      case 'Rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><XCircle size={12}/> Rejected</span>;
      case 'In Progress': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> In Progress</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Eligibility Checks...</div>;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-[#de9e48]" size={26} />
            Eligibility Checks (Non-Approved Loans)
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track property eligibility inquiries</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-[#020d1c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#de9e48] focus:ring-1 focus:ring-[#de9e48] transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#de9e48] focus:ring-1 focus:ring-[#de9e48] font-medium text-gray-700 min-w-[150px]"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Case Details</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Property Info</th>
                <th className="px-6 py-4">Loan Reqm.</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredChecks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-600">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChecks.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#020d1c]">{item.caseId}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{item.fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 font-medium">{item.location}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.propertyType}</p>
                      {item.propertyName && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{item.propertyName}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#de9e48]">{item.loanRequirement}</p>
                      {item.propertyStatus && <p className="text-[10px] text-gray-500 mt-0.5">{item.propertyStatus}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(item.status)}
                        <select 
                          value={item.status}
                          onChange={(e) => updateStatus(item._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#de9e48] w-fit"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRemark === item._id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea 
                            value={remarkText}
                            onChange={(e) => setRemarkText(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded p-2 focus:outline-none focus:border-[#de9e48] resize-none h-16"
                            placeholder="Add remark..."
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveRemark(item._id)} className="bg-[#de9e48] text-white p-1.5 rounded hover:bg-[#c98e41]">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingRemark(null)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-300 font-semibold">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="min-w-[150px] max-w-[220px] whitespace-normal cursor-pointer group"
                          onClick={() => {
                            setEditingRemark(item._id);
                            setRemarkText(item.remark || '');
                          }}
                        >
                          {item.remark ? (
                            <p className="text-xs text-gray-600 line-clamp-3 group-hover:text-[#de9e48] transition-colors">{item.remark}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic group-hover:text-[#de9e48] transition-colors">+ Add Remark</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EligibilityChecks;
