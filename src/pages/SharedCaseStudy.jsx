import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, Eye, Download, Printer, Share2, MessageSquare, 
  MapPin, CheckCircle2, AlertCircle, X, Send, Copy, ArrowLeft, 
  Lock, FileText, ChevronRight, Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import PdfViewer from '../components/common/PdfViewer';
import ImageViewer from '../components/common/ImageViewer';
import caseStudyService from '../utils/caseStudyStore';

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'https://admin.ktrconsultants.in';
  return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};

const SharedCaseStudy = () => {
  const { id, code } = useParams();
  const shareCode = code || id;

  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Raise Query Modal
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [queryForm, setQueryForm] = useState({
    bankerName: '',
    bankName: '',
    bankerPhone: '',
    queryText: ''
  });

  const fetchSharedCase = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await caseStudyService.getSharedCase(shareCode);
      if (res.success && res.data) {
        setCaseStudy(res.data);
      } else {
        setError(res.message || 'Case Study not found or link has expired.');
      }
    } catch (err) {
      console.error('Fetch shared case study error:', err);
      setError('Case Study not found or link has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shareCode) fetchSharedCase();
  }, [shareCode]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!queryForm.queryText.trim()) {
      toast.error('Query description is required');
      return;
    }

    try {
      setQuerySubmitting(true);
      const res = await caseStudyService.submitBankerQueryFromShare(shareCode, queryForm);
      if (res.success) {
        toast.success('Query submitted successfully! Staff will review and update.');
        setShowQueryModal(false);
        setQueryForm({ bankerName: '', bankName: '', bankerPhone: '', queryText: '' });
        fetchSharedCase();
      } else {
        toast.error(res.message || 'Failed to submit query');
      }
    } catch (err) {
      toast.error('Failed to submit query');
    } finally {
      setQuerySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#081326] border-t-amber-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">Loading Case Study Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-[#081326]">Discussion Portal Unavailable</h2>
          <p className="text-xs text-gray-500">{error || 'This link may have expired or been deactivated by staff.'}</p>
        </div>
      </div>
    );
  }

  const sortedFields = (caseStudy.customFields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedDocs = (caseStudy.documents || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-20">
      <Toaster position="top-right" />

      {/* Top Banker Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#081326] text-amber-400 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              KTR
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-[#081326] truncate">
                  KTR Consultants
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                  Banker Portal
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                Case Study Discussion: {caseStudy.caseNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQueryModal(true)}
              className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#081326] rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Raise Query</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer hidden sm:flex"
              title="Print Case"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Case Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#081326] text-amber-400 rounded-lg text-xs font-mono font-black">
                  {caseStudy.caseNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {caseStudy.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#081326] pt-1">
                {caseStudy.title}
              </h1>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Estimated Loan Amount</p>
              <p className="text-lg sm:text-xl font-black text-emerald-700">
                {caseStudy.estimatedLoanAmount ? `₹ ${Number(caseStudy.estimatedLoanAmount).toLocaleString('en-IN')}` : 'As Discussed'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 pt-2 border-t border-gray-100">
            {caseStudy.propertyLocation && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{caseStudy.propertyLocation}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-700">
              <span className="text-gray-400">Type:</span>
              <span className="font-bold">{caseStudy.propertyType}</span>
            </div>
            {sortedDocs.length > 0 && (
              <div className="flex items-center gap-1 text-gray-700">
                <span className="text-gray-400">Evidence:</span>
                <span className="font-bold">{sortedDocs.length} Documents</span>
              </div>
            )}
          </div>

          {/* Issue & Complication Summary */}
          {caseStudy.caseIssue && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Case Discussion Matter</p>
              <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">{caseStudy.caseIssue}</p>
            </div>
          )}

          {caseStudy.legalComplications && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1">
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Title & Legal Specifics</p>
              <p className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">{caseStudy.legalComplications}</p>
            </div>
          )}
        </div>

        {/* Configured Fields Section (Strict Serial Order) */}
        {sortedFields.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Case Details ({sortedFields.length} Serial Items)
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 divide-y divide-gray-100">
              {sortedFields.map((field, idx) => (
                <div key={field.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:w-1/3">
                    <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded text-[10px] font-mono font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-600">{field.label}</span>
                  </div>
                  <div className="sm:w-2/3">
                    <p className="text-xs sm:text-sm font-bold text-[#081326] break-words">
                      {field.value !== undefined && field.value !== '' ? String(field.value) : <span className="text-gray-400 font-normal italic">Pending verification</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section (Clean Banker List matching Screenshot) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Supporting Documents ({sortedDocs.length})
            </h2>
          </div>

          {sortedDocs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-xs font-bold text-gray-400">
              No documents attached to this case.
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {sortedDocs.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  onClick={() => setPreviewDoc(doc)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-mono font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-[#081326] group-hover:text-amber-600 transition-colors truncate">
                          {doc.name}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.2 rounded border shrink-0">
                          {doc.fileType}
                        </span>
                      </div>
                      {doc.notes && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 hover:bg-gray-100 text-gray-500 hover:text-[#081326] rounded-xl transition-colors cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={getAssetUrl(doc.fileUrl)}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 text-gray-500 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Queries & Clarifications */}
        {(caseStudy.bankerQueries || []).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
              Recorded Queries & Clarifications ({(caseStudy.bankerQueries || []).length})
            </h2>

            <div className="space-y-2.5">
              {(caseStudy.bankerQueries || []).map((q, qIdx) => (
                <div key={q.id || qIdx} className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#081326]">
                      {q.bankerName} ({q.bankName || 'Bank'})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      q.status === 'Resolved' || q.status === 'Answered'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl text-xs font-medium text-gray-700">
                    {q.queryText}
                  </div>

                  {q.staffReply && (
                    <div className="p-3 bg-blue-50/70 rounded-2xl text-xs text-blue-950 font-medium border border-blue-100 space-y-1">
                      <p className="text-[10px] font-bold text-blue-700 uppercase">Consultant Resolution:</p>
                      <p>{q.staffReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Raise Query Pill on Mobile */}
      <div className="fixed bottom-4 right-4 z-30 sm:hidden">
        <button
          onClick={() => setShowQueryModal(true)}
          className="px-5 py-3 bg-[#081326] text-amber-400 hover:bg-[#11203d] rounded-full text-xs font-black shadow-2xl flex items-center gap-2 border border-amber-400/40 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Raise Query</span>
        </button>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/85 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="font-black text-xs sm:text-sm text-[#081326] truncate">{previewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(previewDoc.fileUrl)}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2 bg-gray-100 overflow-hidden flex items-center justify-center">
              {previewDoc.fileType === 'pdf' || previewDoc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <PdfViewer url={getAssetUrl(previewDoc.fileUrl)} title={previewDoc.name} className="h-full" />
              ) : (
                <ImageViewer src={getAssetUrl(previewDoc.fileUrl)} alt={previewDoc.name} className="max-h-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* RAISE QUERY MODAL */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" /> Raise Banker Query / Requirement
              </h3>
              <button onClick={() => setShowQueryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuerySubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={queryForm.bankerName}
                    onChange={(e) => setQueryForm({ ...queryForm, bankerName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bank / Institution</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India"
                    value={queryForm.bankName}
                    onChange={(e) => setQueryForm({ ...queryForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={queryForm.bankerPhone}
                  onChange={(e) => setQueryForm({ ...queryForm, bankerPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Query / Required Clarification <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe legal pendency, missing link deed, or clarification required..."
                  value={queryForm.queryText}
                  onChange={(e) => setQueryForm({ ...queryForm, queryText: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={querySubmitting}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{querySubmitting ? 'Submitting...' : 'Submit Query'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedCaseStudy;

