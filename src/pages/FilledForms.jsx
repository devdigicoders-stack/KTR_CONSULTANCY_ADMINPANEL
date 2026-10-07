import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, FileText, UploadCloud, Search, Calendar, User, 
  Phone, Eye, Download, ExternalLink, ArrowRight, RefreshCw, 
  Layers, ChevronRight, X, Clock, FileCheck2, ShieldCheck, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';

const FilledForms = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'data_form' | 'doc_request'

  // Selected Submission for Detail Drawer / Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchFilledForms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forms/filled-forms');
      if (res.data.success) {
        setSubmissions(res.data.filledForms || []);
      }
    } catch (err) {
      console.error('Fetch filled forms error:', err);
      toast.error('Failed to load submitted forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilledForms();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesType = typeFilter === 'all' || sub.formType === typeFilter;
    const term = searchQuery.toLowerCase();
    const clientName = sub.client?.fullName?.toLowerCase() || '';
    const mobile = sub.client?.mobile || '';
    const formTitle = sub.formTitle?.toLowerCase() || '';
    const appId = sub.client?.applicationId?.toLowerCase() || '';

    const matchesSearch = !searchQuery || 
      clientName.includes(term) || 
      mobile.includes(term) || 
      formTitle.includes(term) || 
      appId.includes(term);

    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Banner & Nav Tabs */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Filled Forms & Client Submissions
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Central hub for all client-submitted forms and uploaded documents. All information and files are automatically linked to the client's profile and Document Repository.
            </p>
          </div>

          <button
            onClick={fetchFilledForms}
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <Link
            to="/template-forms"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>1. Template Forms</span>
          </Link>

          <Link
            to="/client-forms"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>2. Create Form Link</span>
          </Link>

          <Link
            to="/doc-requests"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-gray-400" />
            <span>3. Request Documents</span>
          </Link>

          <Link
            to="/filled-forms"
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#081326] text-white shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. Filled Forms (Submissions)</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-600 rounded-full font-bold">{submissions.length}</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#081326] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setTypeFilter('data_form')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'data_form'
                ? 'bg-[#081326] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Data Forms
          </button>
          <button
            onClick={() => setTypeFilter('doc_request')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'doc_request'
                ? 'bg-[#081326] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Doc Upload Requests
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, mobile, case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>

      {/* Submissions Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <RefreshCw className="w-8 h-8 animate-spin text-[#f59e0b] mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-500">Loading submitted forms...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-3">
          <FileCheck2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-black text-[#081326]">No client submissions yet</h3>
          <p className="text-xs text-gray-400">Forms submitted by clients via Template or Custom Links will appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Client Name & ID</th>
                  <th className="py-3.5 px-4">Form / Template</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Files Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredSubmissions.map((sub) => {
                  const client = sub.client || {};
                  const filesCount = sub.uploadedFiles?.length || 0;

                  return (
                    <tr key={sub.submissionId} className="hover:bg-gray-50/70 transition-colors">
                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-[#081326] text-xs">
                            {client.fullName || 'Client'}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                            {client.mobile && <span>{client.mobile}</span>}
                            {client.applicationId && (
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-bold">
                                {client.applicationId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Form Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#081326] text-xs line-clamp-1">{sub.formTitle}</div>
                        {sub.templateName && sub.templateName !== sub.formTitle && (
                          <span className="text-[10px] text-gray-400 font-medium">Template: {sub.templateName}</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          sub.formType === 'doc_request' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {sub.formType === 'doc_request' ? 'Doc Upload' : 'Data Form'}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-gray-500 font-medium text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Files Count */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          filesCount > 0 ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-gray-400 bg-gray-100'
                        }`}>
                          {filesCount} {filesCount === 1 ? 'file' : 'files'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="View submitted data and files"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Data</span>
                          </button>

                          {client._id && (
                            <Link
                              to={`/clients/${client._id}`}
                              className="px-3 py-1.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Open client profile and documents"
                            >
                              <span>Client Case</span>
                              <ExternalLink className="w-3 h-3 text-[#f59e0b]" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMISSION DETAILS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-5 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Client Submission Details</span>
                <h3 className="text-base font-black text-[#081326] mt-0.5">{selectedSubmission.formTitle}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Submitted on {new Date(selectedSubmission.submittedAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Client Info Banner */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Client Name</span>
                  <p className="text-sm font-black text-[#081326]">{selectedSubmission.client?.fullName}</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.client?.mobile || 'No mobile'}</p>
                </div>
                {selectedSubmission.client?._id && (
                  <Link
                    to={`/clients/${selectedSubmission.client._id}`}
                    className="px-3 py-1.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center gap-1"
                  >
                    <span>Go to Case Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#f59e0b]" />
                  </Link>
                )}
              </div>

              {/* Submitted Form Fields */}
              {selectedSubmission.clientData && Object.keys(selectedSubmission.clientData).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#081326]">Submitted Field Details:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(selectedSubmission.clientData).map(([key, val]) => {
                      if (key === 'applicants' || typeof val === 'object' || !val) return null;
                      return (
                        <div key={key} className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">{key}</span>
                          <span className="text-xs font-bold text-[#081326] break-all">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Files Section */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-[#081326]">
                  Uploaded Documents ({selectedSubmission.uploadedFiles?.length || 0}):
                </h4>
                {selectedSubmission.uploadedFiles?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No files were uploaded with this submission.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSubmission.uploadedFiles.map((f, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-black text-[#081326] truncate">{f.name || 'Document'}</p>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{f.docType || 'File'}</span>
                          </div>
                        </div>

                        {f.fileUrl && (
                          <a
                            href={getAssetUrl(f.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilledForms;
