import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, Search, Filter, 
  Eye, Download, MoreVertical, ChevronLeft, ChevronRight,
  FolderOpen
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const styles = {
    Verified: "text-green-600 bg-green-50",
    Pending: "text-orange-500 bg-orange-50",
    Rejected: "text-red-500 bg-red-50"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      {status}
    </span>
  );
};

const Documents = () => {
  const { role } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Document Types');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const endpoint = role === 'admin' ? '/clients/documents/all' : '/clients/documents/my';
        const res = await api.get(endpoint);
        if (res.data.success) {
          setDocuments(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [role]);

  const getFullUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  // Filter Logic
  const filteredDocs = documents.filter(doc => {
    let matchesSearch = true;
    let matchesStatus = true;
    let matchesType = true;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = doc.name.toLowerCase().includes(q) || doc.client.toLowerCase().includes(q);
    }
    if (statusFilter !== 'All Status') {
      matchesStatus = doc.status === statusFilter;
    }
    if (typeFilter !== 'All Document Types') {
      matchesType = doc.category === typeFilter;
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col space-y-6 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#081326] flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#f59e0b] stroke-[2.5]" /> 
            {role === 'admin' ? 'All Client Documents' : 'My Documents'}
          </h2>
          <p className="text-sm font-bold text-gray-500 mt-1">
            {role === 'admin' ? 'Manage and verify all uploaded client documents securely.' : 'View and manage all documents you have submitted.'}
          </p>
        </div>
        {role === 'user' && (
          <button onClick={() => window.location.href = '/clients'} className="bg-[#f59e0b] text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-orange-500 transition-colors shadow-sm">
            <Upload className="w-4 h-4 stroke-[2.5]" /> Update Profile
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-[#f59e0b] transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><FileText className="w-6 h-6 text-blue-500" /></div>
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Documents</h5>
            <p className="text-2xl font-black text-[#081326] leading-none">{documents.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-[#f59e0b] transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100"><CheckCircle className="w-6 h-6 text-green-500" /></div>
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Verified</h5>
            <p className="text-2xl font-black text-[#081326] leading-none">{documents.filter(d => d.status === 'Verified').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-[#f59e0b] transition-all">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100"><FileText className="w-6 h-6 text-orange-500" /></div>
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Pending</h5>
            <p className="text-2xl font-black text-[#081326] leading-none">{documents.filter(d => d.status === 'Pending').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-[#f59e0b] transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100"><FileText className="w-6 h-6 text-red-500" /></div>
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Rejected</h5>
            <p className="text-2xl font-black text-[#081326] leading-none">{documents.filter(d => d.status === 'Rejected').length}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Filters */}
        <div className="p-5 border-b border-gray-50 flex gap-4 flex-wrap bg-gray-50/30">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-600 outline-none w-48 bg-white cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option>All Document Types</option>
            <option>Identity Proof</option>
            <option>Address Proof</option>
            <option>Financial</option>
            <option>Additional</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-bold text-gray-600 outline-none w-40 bg-white cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder={role === 'admin' ? "Search by document or client name..." : "Search by document..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#f59e0b] transition-colors" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 capitalize border-b border-gray-100">
                <th className="px-6 py-4 whitespace-nowrap">Doc ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Document Name</th>
                {role === 'admin' && <th className="px-6 py-4 whitespace-nowrap">Client Name</th>}
                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                <th className="px-6 py-4 whitespace-nowrap">Uploaded On</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
              {loading ? (
                 <tr>
                    <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-10 text-center text-gray-500 font-bold">Loading documents...</td>
                 </tr>
              ) : filteredDocs.length === 0 ? (
                 <tr>
                    <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-10 text-center text-gray-500 font-bold">No documents found.</td>
                 </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-bold text-[10px]">{doc.id}</td>
                    <td className="px-6 py-4 font-black text-[#081326] whitespace-nowrap">{doc.name}</td>
                    {role === 'admin' && <td className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">{doc.client}</td>}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-500">{doc.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-500">{new Date(doc.uploaded).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={doc.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a href={getFullUrl(doc.file)} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="View Document">
                          <Eye className="w-4 h-4 stroke-[2.5]" />
                        </a>
                        <a href={getFullUrl(doc.file)} download target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Download Document">
                          <Download className="w-4 h-4 stroke-[2.5]" />
                        </a>
                      </div>
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

export default Documents;
