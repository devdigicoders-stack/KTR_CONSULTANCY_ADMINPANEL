import React from 'react';
import { 
  X, FileText, Download, Eye, Calendar, User, Phone, 
  CheckCircle2, ShieldCheck, ExternalLink, Paperclip, ClipboardCheck 
} from 'lucide-react';
import { getAssetUrl } from '../../utils/url';

const SubmissionDetailsModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

  const {
    formTitle = 'Client Form Submission',
    formType = 'data_form',
    submittedAt,
    submittedFields = [],
    submittedData = {},
    uploadedFiles = [],
    sourceLabel = 'Link Submission',
    summaryText = ''
  } = submission;

  // If submittedFields array is empty, generate from submittedData object
  let displayFields = submittedFields;
  if (!displayFields || displayFields.length === 0) {
    displayFields = Object.entries(submittedData || {})
      .filter(([k, v]) => v !== undefined && v !== null && v !== '' && k !== 'applicants')
      .map(([k, v]) => {
        let label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
        label = label.charAt(0).toUpperCase() + label.slice(1);
        return { key: k, label, value: v };
      });
  }

  const formattedDate = submittedAt 
    ? new Date(submittedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'N/A';

  const handleDownloadFile = async (e, fileUrl, fileName) => {
    e.preventDefault();
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const cleanName = fileName || fileUrl.split('/').pop() || 'document';

    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', cleanName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#081326]/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-[#081326] px-5 py-4 flex items-center justify-between text-white border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                  {formTitle}
                </h3>
                <span className="text-[10px] font-bold bg-[#f59e0b] text-[#081326] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {sourceLabel}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Submitted on: <strong className="text-gray-200">{formattedDate}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Submission Source</span>
              <p className="font-bold text-[#081326] mt-0.5">Public Form Link</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Fields Captured</span>
              <p className="font-bold text-[#081326] mt-0.5">{displayFields.length} Details Entered</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Uploaded Files</span>
              <p className="font-bold text-[#081326] mt-0.5">{uploadedFiles.length} Document(s) Attached</p>
            </div>
          </div>

          {/* Submitted Form Fields (Questions & Answers) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#081326] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Details Received from Client</span>
            </h4>

            {displayFields.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {displayFields.map((field, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <span className="font-bold text-gray-700 sm:w-1/3 shrink-0">
                      {field.label || field.key}
                    </span>
                    <span className="font-semibold text-[#081326] sm:w-2/3 break-words">
                      {typeof field.value === 'object' 
                        ? JSON.stringify(field.value) 
                        : (field.value !== undefined && field.value !== null && field.value !== '' ? String(field.value) : '—')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-400 font-medium">
                No text fields were submitted.
              </div>
            )}
          </div>

          {/* Uploaded Documents / Files Section */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#081326] flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-amber-500" />
                <span>Uploaded Files Received ({uploadedFiles.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uploadedFiles.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#081326] truncate" title={file.name}>
                        {file.name || 'Submitted Document'}
                      </p>
                      <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                        {file.notes || 'Link Submission'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={getAssetUrl(file.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-gray-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </a>
                      <button
                        onClick={(e) => handleDownloadFile(e, file.fileUrl, file.name)}
                        className="p-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidential Internal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Internal Visibility Only:</strong> These submitted details are private to our internal team and are never visible to bankers or external shared links.
            </span>
          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubmissionDetailsModal;
