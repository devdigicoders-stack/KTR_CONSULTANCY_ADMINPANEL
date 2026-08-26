import { Eye, Search, FileText } from 'lucide-react';

const DocumentsTab = ({ client }) => {
  const documents = client?.documentsList || [];
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

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
              <th className="px-6 py-3 whitespace-nowrap">Document</th>
              <th className="px-6 py-3 whitespace-nowrap">File Name</th>
              <th className="px-6 py-3 whitespace-nowrap">Uploaded On</th>
              <th className="px-6 py-3 whitespace-nowrap">Status</th>
              <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-gray-50">
            {documents.length > 0 ? documents.map((doc, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#081326]">{doc.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{doc.category || 'Document'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-600">
                  <a href={`${BACKEND_URL}${doc.file}`} target="_blank" rel="noreferrer" className="hover:text-blue-500 hover:underline">
                    {doc.name}
                  </a>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {new Date(doc.uploaded).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`${BACKEND_URL}${doc.file}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                  No documents found for this client.
                </td>
              </tr>
            )}
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
