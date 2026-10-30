import React, { useState } from 'react';
import { 
  User, Phone, Briefcase, IndianRupee, FileCheck, CheckCircle2, 
  Clock, AlertCircle, Edit, StickyNote, Calendar, FileText, Users,
  ShieldCheck, CreditCard, Lock, Tag, Sparkles, ClipboardCheck, Eye, Plus
} from 'lucide-react';
import SubmissionDetailsModal from './SubmissionDetailsModal';
import { FormattedNotes } from '../common/RichTextEditor';

// Age calculation helper (Formula: Current Year - Year of Birth)
const calculateAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const birthYear = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return age >= 0 ? age : null;
};

const OverviewTab = ({ client, onEditClick, onManageApplicants }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  if (!client) return null;

  const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');
  const resolvedPendencies = (client.pendencies || []).filter(p => p.status === 'Resolved');

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹ 0';
    return Number(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR'
    });
  };

  // Primary Applicant extraction
  const primaryApp = (client.applicants && client.applicants.length > 0) ? client.applicants[0] : null;
  const primaryName = primaryApp?.fullName || client.fullName || 'Client Case';
  const primaryDob = primaryApp?.dob || client.dob;
  const primaryAge = primaryApp?.age || calculateAge(primaryDob) || client.age;
  const primaryProfession = primaryApp?.occupation || client.occupation || 'N/A';
  const primaryPan = primaryApp?.panNumber || client.panNumber || '';
  const primaryAadhaar = primaryApp?.aadhaarNumber || client.aadhaarNumber || '';
  const primaryMobile = primaryApp?.mobile || client.mobile || '';
  const primaryCustomFields = primaryApp?.customFields && Array.isArray(primaryApp.customFields) ? primaryApp.customFields : [];

  // Co-Applicants (Index 1 onwards) or legacy coApplicant object
  const coApplicantsList = (client.applicants && client.applicants.length > 1) 
    ? client.applicants.slice(1) 
    : (client.hasCoApplicant && client.coApplicant?.fullName) 
      ? [client.coApplicant] 
      : [];

  const caseNotesText = client.caseNotes || client.notes || '';
  const internalNotesText = client.internalNotes || '';
  const customFieldsList = client.customFields && Array.isArray(client.customFields) ? client.customFields : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Main Column */}
      <div className="flex-1 space-y-3.5">
        
        {/* Core Highlighted Card: Applicant Name, Loan Amount, Case Type, Profession */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5 space-y-3.5">
          
          {/* Top Bar */}
          <div className="border-b border-gray-100 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Loan Case Overview
            </span>
          </div>

          {/* 4 Highlighted Focus Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Applicant Name (Highlighted) */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-gray-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Applicant Name
              </span>
              <p className="text-base sm:text-lg font-black text-[#081326] break-words" title={primaryName}>
                {primaryName}
              </p>
            </div>

            {/* 2. Loan Amount (Highlighted) */}
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/90">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Loan Amount
              </span>
              <p className="text-base sm:text-lg font-black text-emerald-900 truncate">
                {formatCurrency(client.loanAmount)}
              </p>
            </div>

            {/* 3. Case Type (Highlighted) */}
            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200/90">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Case Type
              </span>
              <p className="text-sm sm:text-base font-black text-blue-950 truncate" title={client.caseType || client.loanType}>
                {client.caseType || client.loanType || 'General Loan'}
              </p>
            </div>

            {/* 4. Profession (Highlighted) */}
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Profession
              </span>
              <p className="text-sm sm:text-base font-black text-amber-950 truncate" title={primaryProfession}>
                {primaryProfession}
              </p>
            </div>

          </div>

          {/* Secondary Details (Compact layout, no duplicate labels) */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
              {primaryDob && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>DOB: <strong className="text-gray-700">{new Date(primaryDob).toLocaleDateString('en-IN')}</strong> {primaryAge !== null && `(${primaryAge} Yrs)`}</span>
                </span>
              )}
              {primaryMobile && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>Mobile: <strong className="font-mono text-gray-700">{primaryMobile}</strong></span>
                </span>
              )}
              {primaryPan && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <CreditCard className="w-3 h-3 text-gray-400" />
                  <span>PAN: <strong className="font-mono text-gray-700 uppercase">{primaryPan}</strong></span>
                </span>
              )}
              {primaryAadhaar && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-gray-400" />
                  <span>Aadhaar: <strong className="font-mono text-gray-700">{primaryAadhaar}</strong></span>
                </span>
              )}
              <span className="text-[11px] text-gray-400 ml-auto">
                Ref ID: <span className="font-mono font-bold text-gray-600">KTR-{client._id ? client._id.toString().substring(18).toUpperCase() : 'CASE'}</span>
              </span>
            </div>

            {/* Primary Applicant Custom Fields */}
            {primaryCustomFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Applicant Attributes:</span>
                {primaryCustomFields.map((cf, cIdx) => (
                  <span key={cIdx} className="inline-flex items-center px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-md text-[11px] font-bold">
                    {cf.fieldName}: {cf.fieldValue}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Link Submitted Summary Section (Internal Visibility Only) */}
        {client.formSubmissions && client.formSubmissions.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 rounded-2xl shadow-xs border border-amber-200 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h4 className="font-black text-xs text-[#081326] flex items-center gap-1.5 uppercase tracking-wide">
                  <ClipboardCheck className="w-4 h-4 text-[#f59e0b]" />
                  <span>Link Submitted</span>
                </h4>
                <span className="text-[10px] font-bold bg-[#081326] text-amber-400 px-2 py-0.5 rounded-md">
                  {client.formSubmissions[0].formTitle || 'Client Form'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  Internal Team Only
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(client.formSubmissions[0])}
                className="px-2.5 py-1 bg-[#081326] hover:bg-[#11203d] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Eye className="w-3 h-3 text-[#f59e0b]" /> View Full Submission
              </button>
            </div>

            {/* Submitted details in smaller text below as requested */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-gray-500 font-medium">
                Received on: <strong className="text-gray-800">{new Date(client.formSubmissions[0].submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
                {client.formSubmissions[0].uploadedFiles?.length > 0 && (
                  <span className="ml-2 font-semibold text-amber-700">
                    • {client.formSubmissions[0].uploadedFiles.length} File(s) Attached
                  </span>
                )}
              </p>

              {/* Smaller text grid of captured form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {(client.formSubmissions[0].submittedFields || []).slice(0, 9).map((field, sIdx) => (
                  <div key={sIdx} className="bg-white p-2 rounded-lg border border-amber-200/70 text-[11px] shadow-2xs">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                      {field.label || field.key}
                    </span>
                    <p className="font-bold text-[#081326] truncate text-[11.5px] mt-0.5" title={String(field.value)}>
                      {typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value || '—')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Co-Applicants & Guarantors Section */}
        {coApplicantsList.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="text-xs font-black text-[#081326] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Co-Borrowers & Guarantors ({coApplicantsList.length})
              </h4>
              {(onManageApplicants || onEditClick) && (
                <button
                  onClick={onManageApplicants || onEditClick}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Manage Applicants & Guarantors"
                >
                  <Plus className="w-3 h-3 stroke-[3]" /> Add / Manage
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {coApplicantsList.map((app, idx) => {
                const coAge = app.age || calculateAge(app.dob);
                return (
                  <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-gray-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-black text-[#081326] truncate" title={app.fullName}>
                          {app.fullName || `Co-Applicant ${idx + 1}`}
                        </span>
                        {app.relationship && app.relationship !== 'Primary Applicant' && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded shrink-0">
                            {app.relationship}
                          </span>
                        )}
                      </div>
                      {coAge !== null && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          {coAge} Yrs
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-0.5 font-medium">
                      {app.occupation && <span>Prof: <strong className="text-gray-800">{app.occupation}</strong></span>}
                      {app.mobile && <span>Mob: <strong className="font-mono text-gray-800">{app.mobile}</strong></span>}
                      {app.panNumber && <span>PAN: <strong className="font-mono uppercase text-gray-800">{app.panNumber}</strong></span>}
                      {app.aadhaarNumber && <span>Aadhaar: <strong className="font-mono text-gray-800">{app.aadhaarNumber}</strong></span>}
                    </div>
                    {app.customFields && app.customFields.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-200/50">
                        {app.customFields.map((cf, cIdx) => (
                          <span key={cIdx} className="text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            {cf.fieldName}: {cf.fieldValue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-dashed border-gray-200 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-500">No Co-Applicants or Guarantors Added</span>
            </div>
            {(onManageApplicants || onEditClick) && (
              <button
                onClick={onManageApplicants || onEditClick}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> + Add Co-Applicant
              </button>
            )}
          </div>
        )}

        {/* Case-Level Custom Fields */}

        {/* Custom Fields (If any - compact key-value display) */}
        {customFieldsList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3 sm:p-4 space-y-2">
            <h4 className="text-xs font-black text-[#081326] flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Tag className="w-3.5 h-3.5 text-purple-600" /> Custom Case Attributes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {customFieldsList.map((cf, idx) => (
                <div key={idx} className="p-2 bg-purple-50/40 border border-purple-100 rounded-lg text-xs">
                  <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider block truncate">
                    {cf.fieldName}
                  </span>
                  <p className="font-bold text-[#081326] truncate text-[11px] mt-0.5" title={cf.fieldValue}>
                    {cf.fieldValue || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Notes & Internal Notes (Side by side or stacked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* General Case Notes */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-black text-xs text-[#081326] flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" /> Case Notes & Remarks
              </h4>
            </div>
            <div className="bg-amber-50/30 p-2.5 rounded-xl border border-amber-100 min-h-[44px]">
              <FormattedNotes 
                content={caseNotesText} 
                emptyText="No case notes logged." 
                className="text-gray-800"
              />
            </div>
          </div>

          {/* 🔒 Internal Notes (Internal Team Only) */}
          <div className="bg-amber-50/40 rounded-2xl shadow-xs border border-amber-200/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <h4 className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" /> Internal Notes
              </h4>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Team Only
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 min-h-[44px]">
              <FormattedNotes 
                content={internalNotesText} 
                emptyText="No internal confidential notes logged." 
                className="text-amber-950"
              />
            </div>
          </div>

        </div>

        {/* Current Active Pendency Glance (Compact) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-black text-[#081326] text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Active Pendencies
            </h4>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              activePendencies.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              {activePendencies.length > 0 ? `${activePendencies.length} Open` : 'Zero Pendencies'}
            </span>
          </div>

          {activePendencies.length > 0 ? (
            <div className="space-y-1.5">
              {activePendencies.map((p, idx) => (
                <div key={idx} className="p-2 bg-amber-50/50 border border-amber-200/70 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-950 truncate">{p.title}</p>
                    {p.description && (
                      <p className="text-[11px] text-amber-800 font-medium truncate">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-green-50/60 border border-green-100 rounded-lg flex items-center gap-2 text-green-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span>All case documents & checklist items are clear.</span>
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Case Summary Metrics (Compact) */}
      <div className="w-full lg:w-56 shrink-0 space-y-2.5">
        <h3 className="font-bold text-[#081326] text-[10px] uppercase tracking-wider px-1">Case Quick Stats</h3>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Registered</p>
            <p className="text-xs font-black text-[#081326] truncate">
              {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Open Pendency</p>
            <p className="text-xs font-black text-amber-900">{activePendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Resolved</p>
            <p className="text-xs font-black text-green-900">{resolvedPendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Repository Docs</p>
            <p className="text-xs font-black text-purple-900">{client.documentsList?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Submission Details Modal */}
      <SubmissionDetailsModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default OverviewTab;
