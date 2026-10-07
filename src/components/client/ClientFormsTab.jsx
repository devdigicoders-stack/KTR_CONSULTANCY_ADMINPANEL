import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, FileText, UploadCloud, Clock, Eye, Download, 
  ExternalLink, Layers, RefreshCw, X, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getAssetUrl } from '../../utils/url';

const ClientFormsTab = ({ client }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchClientSubmissions = async () => {
    if (!client?._id) return;
    try {
      setLoading(true);
      const res = await api.get(`/forms/client/${client._id}/submissions`);
      if (res.data.success) {
        setForms(res.data.forms || []);
      }
    } catch (err) {
      console.error('Fetch client submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSubmissions();
  }, [client?._id]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-[#f59e0b] mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-bold">Loading submitted forms...</p>
      </div>
    );
  }

  // Flatten submissions
  const allSubmissions = [];
  forms.forEach(f => {
    (f.submissions || []).forEach((sub, idx) => {
      allSubmissions.push({
        id: `${f._id}_${idx}`,
        formTitle: f.title,
        formType: f.type,
        submittedAt: sub.submittedAt,
        clientData: sub.clientData || {},
        uploadedFiles: sub.uploadedFiles || []
      });
    });
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-black text-[#081326] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Filled Forms & Submissions for this Client</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Record of all online data forms and document uploads completed by {client.fullName}.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
          {allSubmissions.length} Submitted {allSubmissions.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {allSubmissions.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-xs font-black text-gray-700">No forms submitted yet by this client</h4>
          <p className="text-[11px] text-gray-400">
            Use <span className="font-bold text-[#081326]">Template Forms</span> or <span className="font-bold text-[#081326]">Create Form Link</span> to send an intake form to this client.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allSubmissions.map(sub => (
            <div
              key={sub.id}
              className="p-4 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-[#081326]">{sub.formTitle}</h4>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                    sub.formType === 'doc_request' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {sub.formType === 'doc_request' ? 'Doc Upload' : 'Data Form'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {new Date(sub.submittedAt).toLocaleString('en-IN')}
                  </span>
                  <span>•</span>
                  <span>{sub.uploadedFiles.length} files uploaded</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(sub)}
                className="px-3.5 py-1.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>View Submitted Data</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Submission Details</span>
                <h3 className="text-base font-black text-[#081326] mt-0.5">{selectedSubmission.formTitle}</h3>
                <p className="text-xs text-gray-400">
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

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Submitted Form Fields */}
              {selectedSubmission.clientData && Object.keys(selectedSubmission.clientData).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-[#081326]">Submitted Fields:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(selectedSubmission.clientData).map(([key, val]) => {
                      if (key === 'applicants' || typeof val === 'object' || !val) return null;
                      return (
                        <div key={key} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">{key}</span>
                          <span className="font-bold text-[#081326] break-all">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="font-black text-[#081326]">
                  Attached Files ({selectedSubmission.uploadedFiles.length}):
                </h4>
                {selectedSubmission.uploadedFiles.length === 0 ? (
                  <p className="text-gray-400 italic">No files uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSubmission.uploadedFiles.map((f, idx) => (
                      <div key={idx} className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-[#081326] truncate">{f.name || 'Document'}</span>
                        </div>
                        {f.fileUrl && (
                          <a
                            href={getAssetUrl(f.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 shrink-0"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-800"
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

export default ClientFormsTab;
