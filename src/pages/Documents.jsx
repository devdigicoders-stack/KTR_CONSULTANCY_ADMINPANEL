import React from 'react';
import { 
  Upload, FileText, CheckCircle, Search, Filter, 
  Eye, Download, MoreVertical, ChevronLeft, ChevronRight,
  FolderOpen
} from 'lucide-react';

const documentsData = [
  { id: 'DOC-1025', name: 'PAN Card', client: 'Rahul Sharma', category: 'Identity Proof', file: 'PAN_Card_Rahul.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
  { id: 'DOC-1024', name: 'Aadhaar Card', client: 'Rahul Sharma', category: 'Identity Proof', file: 'Aadhaar_Card_Rahul.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
  { id: 'DOC-1023', name: 'ITR 2024', client: 'Neha Verma', category: 'Financial', file: 'ITR_2024_Neha.pdf', uploaded: 'May 22, 2025', status: 'Pending' },
  { id: 'DOC-1022', name: 'Bank Statement', client: 'Aman Enterprises', category: 'Financial', file: 'Bank_Stmt_May.pdf', uploaded: 'May 21, 2025', status: 'Rejected' },
  { id: 'DOC-1021', name: 'Company Registration', client: 'Aman Enterprises', category: 'Business Proof', file: 'Comp_Reg.pdf', uploaded: 'May 21, 2025', status: 'Verified' },
  { id: 'DOC-1020', name: 'Address Proof', client: 'Vikas Singh', category: 'Address Proof', file: 'Address_Vikas.pdf', uploaded: 'May 20, 2025', status: 'Verified' },
  { id: 'DOC-1019', name: 'GST Certificate', client: 'Kavya Consulting', category: 'Business Proof', file: 'GST_Kavya.pdf', uploaded: 'May 20, 2025', status: 'Pending' },
];

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
  return (
    <div className="flex flex-col space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#081326] flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#f59e0b]" /> Documents & Data
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage and verify all uploaded client documents securely.</p>
        </div>
        <button className="bg-[#081326] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#11203d] transition-colors shadow-sm">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100"><FileText className="w-6 h-6 text-blue-500" /></div>
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Documents</h5>
            <p className="text-2xl font-bold text-[#081326] leading-none">1,458</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100"><CheckCircle className="w-6 h-6 text-green-500" /></div>
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verified</h5>
            <p className="text-2xl font-bold text-[#081326] leading-none">1,204</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100"><FileText className="w-6 h-6 text-orange-500" /></div>
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pending</h5>
            <p className="text-2xl font-bold text-[#081326] leading-none">185</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100"><FileText className="w-6 h-6 text-red-500" /></div>
          <div>
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rejected</h5>
            <p className="text-2xl font-bold text-[#081326] leading-none">69</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Filters */}
        <div className="p-5 border-b border-gray-50 flex gap-4 flex-wrap">
          <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 outline-none w-48 bg-white">
            <option>All Document Types</option>
            <option>Identity Proof</option>
            <option>Address Proof</option>
            <option>Financial</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 outline-none w-40 bg-white">
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search by document, client name or ID..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium outline-none" />
          </div>
          <button className="bg-gray-50 text-[#081326] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200 hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold text-gray-500 capitalize border-b border-gray-50">
                <th className="px-6 py-4 whitespace-nowrap">Doc ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Document Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Client Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                <th className="px-6 py-4 whitespace-nowrap">File Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Uploaded On</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
              {documentsData.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">{doc.id}</td>
                  <td className="px-6 py-4 font-bold text-[#081326] whitespace-nowrap">{doc.name}</td>
                  <td className="px-6 py-4 font-bold text-[#081326] whitespace-nowrap">{doc.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{doc.file}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500">{doc.uploaded}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={doc.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-4">
                      <button className="text-gray-400 hover:text-[#081326]"><Eye className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-[#081326]"><Download className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-[#081326]"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-5 border-t border-gray-50 flex justify-between items-center bg-gray-50/30 flex-wrap gap-4">
          <span className="text-sm text-gray-500 font-medium">Showing 1 to 7 of 1,458 entries</span>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#f59e0b] text-[#f59e0b] font-bold bg-[#f59e0b]/10 text-sm">1</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-sm hover:bg-gray-50">2</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-sm hover:bg-gray-50">3</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Documents;
