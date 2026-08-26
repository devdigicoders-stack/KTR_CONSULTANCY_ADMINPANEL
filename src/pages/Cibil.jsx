import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Download, Eye, Trash2, X, AlertTriangle, FileText, CheckCircle, Info } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const styles = {
    success: "text-green-600 bg-green-50 border border-green-100",
    failed: "text-red-500 bg-red-50 border border-red-100",
    notFound: "text-orange-500 bg-orange-50 border border-orange-100",
  };
  const dotColor = {
    success: "bg-green-500",
    failed: "bg-red-500",
    notFound: "bg-orange-500"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      {dotColor[status] && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></span>}
      {status === 'notFound' ? 'Not Found' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Cibil = () => {
  const { role } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const endpoint = role === 'admin' ? '/cibil-reports/all' : '/cibil-reports/my';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching CIBIL reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      const res = await api.delete(`/cibil-reports/${reportToDelete}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        setReportToDelete(null);
        fetchReports();
      }
    } catch (error) {
      alert('Error deleting CIBIL report');
    }
  };

  const openPreview = (report) => {
    setSelectedReport(report);
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setSelectedReport(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-8">
      
      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-xl font-bold text-[#081326]">
          CIBIL Reports
        </h2>
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-2">
          <Link to="/" className="hover:text-[#f59e0b] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#081326]">CIBIL Reports</span>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="border-b border-gray-50 flex justify-between items-center px-4 py-3 bg-gray-50/30">
          <h3 className="text-sm font-bold text-[#081326]">All Generated Reports</h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                <th className="px-5 py-4 whitespace-nowrap">Date</th>
                <th className="px-5 py-4 whitespace-nowrap">Applicant Details</th>
                <th className="px-5 py-4 whitespace-nowrap">Bureau</th>
                <th className="px-5 py-4 whitespace-nowrap">Score</th>
                <th className="px-5 py-4 whitespace-nowrap">Status</th>
                <th className="px-5 py-4 whitespace-nowrap">Payment ID</th>
                <th className="px-5 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-500 font-medium">
                    No CIBIL reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#081326]">{report.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">PAN: <span className="font-mono">{report.pan}</span></div>
                      <div className="text-[11px] text-gray-500">Mob: {report.mobile}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-700">
                      {report.bureau}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {report.score ? (
                        <span className="font-black text-[#081326] bg-gray-100 px-2 py-1 rounded">
                          {report.score}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-gray-500">
                      {report.paymentId}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openPreview(report)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="View Full Report Details"
                        >
                          <Eye className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        {role === 'admin' && (
                          <button 
                            onClick={() => { setReportToDelete(report._id); setShowDeleteModal(true); }}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Modal (Slide Over) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#081326]/40 backdrop-blur-sm transition-opacity" 
            onClick={closePreview}
          />
          
          {/* Slide Over Content */}
          <div className="relative w-full max-w-xl bg-gray-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between shadow-sm relative z-10">
              <h2 className="text-lg font-black text-[#081326] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#f59e0b] stroke-[2.5]" /> CIBIL Report Details
              </h2>
              <button 
                onClick={closePreview} 
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                   <div className="w-14 h-14 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] font-black text-xl shrink-0">
                     {selectedReport.name?.substring(0, 2).toUpperCase() || 'NA'}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-[#081326]">{selectedReport.name}</h3>
                     <p className="text-sm text-gray-500 font-medium">PAN: <span className="font-mono text-gray-800">{selectedReport.pan}</span></p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Mobile Number</p>
                    <p className="text-sm font-bold text-[#081326]">{selectedReport.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Gender</p>
                    <p className="text-sm font-bold text-[#081326]">{selectedReport.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Credit Bureau</p>
                    <p className="text-sm font-bold text-[#081326]">{selectedReport.bureau}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Credit Score</p>
                    <p className="text-sm font-black text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded w-fit">{selectedReport.score || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-[#081326] mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" /> Transaction & Status
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Status</span>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Payment ID</span>
                    <span className="text-xs font-mono font-bold text-[#081326] bg-gray-100 px-2 py-1 rounded">{selectedReport.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Date Checked</span>
                    <span className="text-xs font-bold text-gray-700">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedReport.message && (
                    <div className="pt-2">
                      <span className="text-xs text-gray-500 block mb-1">API Message</span>
                      <p className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {selectedReport.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.pdfLink && (
                <div className="flex flex-col gap-3">
                  <div className="bg-[#081326] rounded-2xl p-6 shadow-sm border border-gray-800 text-white flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/20 transition-all duration-500"></div>
                    <div className="relative z-10">
                      <h4 className="font-bold text-lg mb-1 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#f59e0b]" /> Report Generated</h4>
                      <p className="text-xs text-gray-400">The full detailed CIBIL report PDF is available.</p>
                    </div>
                    <a 
                      href={selectedReport.pdfLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="relative z-10 bg-[#f59e0b] hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                  
                  {/* Inline PDF Viewer */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
                       <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                         <FileText className="w-4 h-4 text-gray-500" />
                         Live Report Document
                       </h4>
                    </div>
                    <iframe 
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedReport.pdfLink)}&embedded=true`}
                      title="CIBIL Report" 
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Report?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete this CIBIL report? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteReport}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cibil;
