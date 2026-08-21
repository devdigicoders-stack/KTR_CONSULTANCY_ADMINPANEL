import React from 'react';
import { Eye, Download, MoreVertical, Search, Upload } from 'lucide-react';

const DocumentsTab = () => {
  const documents = [
    { name: 'PAN Card', category: 'Identity Proof', file: 'PAN_Card.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
    { name: 'Aadhaar Card', category: 'Identity Proof', file: 'Aadhaar_Card.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
    { name: 'Address Proof', category: 'Address Proof', file: 'Address_Proof.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
    { name: 'Bank Statement', category: 'Financial Document', file: 'Bank_Statement_May.pdf', uploaded: 'May 21, 2025', status: 'Pending' },
    { name: 'ITR Document', category: 'Financial Document', file: 'ITR_2024.pdf', uploaded: 'May 20, 2025', status: 'Rejected' },
    { name: 'Photo', category: 'Other Documents', file: 'Photo.jpg', uploaded: 'May 20, 2025', status: 'Verified' },
    { name: 'Business Proof', category: 'Business Document', file: 'Business_Proof.pdf', uploaded: 'May 19, 2025', status: 'Verified' },
    { name: 'Signature', category: 'Other Documents', file: 'Signature.png', uploaded: 'May 19, 2025', status: 'Verified' },
  ];

  const StatusBadge = ({ status }) => {
    const styles = {
      Verified: "text-green-600 bg-green-50",
      Pending: "text-orange-500 bg-orange-50",
      Rejected: "text-red-500 bg-red-50"
    };
    return (
      <span className={`${styles[status]} px-2 py-0.5 rounded text-[10px] font-bold`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          <button className="text-xs font-bold text-[#f59e0b] border-b-2 border-[#f59e0b] pb-2 whitespace-nowrap px-1">All Documents</button>
          <button className="text-xs font-bold text-gray-500 hover:text-[#081326] pb-2 whitespace-nowrap px-1">Verified</button>
          <button className="text-xs font-bold text-gray-500 hover:text-[#081326] pb-2 whitespace-nowrap px-1">Pending</button>
          <button className="text-xs font-bold text-gray-500 hover:text-[#081326] pb-2 whitespace-nowrap px-1">Rejected</button>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." className="w-48 pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none" />
          </div>
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none font-medium text-gray-600">
            <option>All Categories</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
              <th className="px-5 py-3 whitespace-nowrap">Document Name</th>
              <th className="px-5 py-3 whitespace-nowrap">Category</th>
              <th className="px-5 py-3 whitespace-nowrap">File Name</th>
              <th className="px-5 py-3 whitespace-nowrap">Uploaded On</th>
              <th className="px-5 py-3 whitespace-nowrap">Status</th>
              <th className="px-5 py-3 whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-gray-600 divide-y divide-gray-50">
            {documents.map((doc, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-bold text-[#081326] whitespace-nowrap">{doc.name}</td>
                <td className="px-5 py-3 whitespace-nowrap">{doc.category}</td>
                <td className="px-5 py-3 whitespace-nowrap font-medium">{doc.file}</td>
                <td className="px-5 py-3 whitespace-nowrap font-medium text-gray-500">{doc.uploaded}</td>
                <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={doc.status} /></td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-3">
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

      <div className="p-5 border-t border-gray-50 flex justify-between items-center bg-gray-50/30 gap-4 flex-wrap">
        <div className="flex-1 max-w-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-[#081326]">Storage Usage</span>
            <span className="text-[10px] text-gray-500 font-medium">32.4 MB of 100 MB used</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-[32.4%]"></div>
          </div>
        </div>
        <button className="bg-[#081326] text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[#11203d] transition-colors flex items-center gap-2">
          Upload New Document
        </button>
      </div>
    </div>
  );
};

export default DocumentsTab;
