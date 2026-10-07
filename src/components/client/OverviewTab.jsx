import React from 'react';
import { 
  User, Phone, Briefcase, IndianRupee, FileCheck, CheckCircle2, 
  Clock, AlertCircle, Edit, StickyNote, Calendar, FileText, Users,
  ShieldCheck, CreditCard
} from 'lucide-react';

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

const OverviewTab = ({ client, onEditClick }) => {
  if (!client) return null;

  const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');
  const resolvedPendencies = (client.pendencies || []).filter(p => p.status === 'Resolved');

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return Number(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[11px] font-black">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-black">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-black">Pending</span>;
    }
  };

  // Build applicants list
  const primaryAge = client.age || calculateAge(client.dob);
  const applicantsList = client.applicants && client.applicants.length > 0 
    ? client.applicants 
    : [{
        fullName: client.fullName,
        dob: client.dob,
        age: primaryAge,
        occupation: client.occupation,
        mobile: client.mobile,
        panNumber: client.panNumber,
        aadhaarNumber: client.aadhaarNumber,
        relationship: 'Primary Applicant'
      }];

  const caseNotesText = client.caseNotes || client.notes || '';

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
      {/* Main Core Client Details */}
      <div className="flex-1 space-y-4">
        
        {/* Loan Case Overview Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
            <div>
              <h3 className="font-black text-[#081326] text-sm sm:text-base">Loan Case Overview</h3>
              <p className="text-[11px] text-gray-400 font-medium">Core loan requirement and case status</p>
            </div>
            <div className="flex items-center gap-2">
              {onEditClick && (
                <button 
                  onClick={onEditClick}
                  className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Edit Case Details"
                >
                  <Edit className="w-3 h-3 text-amber-600" /> Edit Case
                </button>
              )}
              {getStatusBadge(client.status)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* 1. Loan Amount */}
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Loan Amount</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-emerald-800 truncate">{formatCurrency(client.loanAmount)}</p>
            </div>

            {/* 2. Case Type */}
            <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100/80">
              <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Case Type</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#081326] truncate">{client.caseType || client.loanType || 'General Loan'}</p>
            </div>

            {/* 3. Status */}
            <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100/80">
              <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Case Status</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-[#081326] truncate">{client.status || 'Pending'}</p>
            </div>
          </div>

          {/* Case Notes Section */}
          <div className="mt-3.5 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <StickyNote className="w-3 h-3 text-[#f59e0b]" /> Case Notes & Remarks
              </h4>
              {onEditClick && !caseNotesText && (
                <button 
                  onClick={onEditClick}
                  className="text-[10px] text-[#f59e0b] hover:underline font-bold cursor-pointer"
                >
                  + Add Notes
                </button>
              )}
            </div>
            {caseNotesText ? (
              <div className="p-3 bg-amber-50/40 border border-amber-200/60 rounded-xl text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                {caseNotesText}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">No remarks logged yet.</p>
            )}
          </div>
        </div>

        {/* Applicants Card (Displays Multiple Applicants with Auto Age) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h3 className="font-black text-[#081326] text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Applicants ({applicantsList.length})
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">All borrowers, co-applicants and guarantors on file</p>
            </div>
            {onEditClick && (
              <button 
                onClick={onEditClick}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                + Manage Applicants
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {applicantsList.map((app, idx) => {
              const appAge = app.age || calculateAge(app.dob);

              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    idx === 0 
                      ? 'bg-amber-50/30 border-amber-200/70' 
                      : 'bg-slate-50/60 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded">
                      {app.relationship || `Applicant ${idx + 1}`}
                    </span>
                    {appAge !== null && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {appAge} Yrs
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-black text-[#081326] truncate">
                    {app.fullName} {appAge !== null ? `(${appAge})` : ''}
                  </p>

                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p className="truncate">
                      Profession: <strong className="text-gray-900">{app.occupation || client.occupation || 'N/A'}</strong>
                    </p>
                    {app.mobile && (
                      <p className="truncate">
                        Mobile: <span className="font-mono text-gray-800">{app.mobile}</span>
                      </p>
                    )}
                    {app.panNumber && (
                      <p className="truncate text-[11px]">
                        PAN: <span className="font-mono font-bold text-gray-800">{app.panNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Pendency Glance */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-[#081326] text-xs sm:text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#f59e0b]" /> Active Pending Items
            </h4>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
              activePendencies.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              {activePendencies.length > 0 ? `${activePendencies.length} Open` : 'Zero Pendencies'}
            </span>
          </div>

          {activePendencies.length > 0 ? (
            <div className="space-y-2">
              {activePendencies.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-amber-950">{p.title}</p>
                    {p.description && (
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-green-50/60 border border-green-100 rounded-xl flex items-center gap-2 text-green-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>All documents & requirements are cleared.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Summary Stats */}
      <div className="w-full lg:w-64 shrink-0 space-y-3">
        <h3 className="font-black text-[#081326] text-[10px] uppercase tracking-wider px-1">Case Summary</h3>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Created</p>
            <p className="text-xs font-black text-[#081326]">
              {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Active Pendency</p>
            <p className="text-sm font-black text-amber-900">{activePendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Resolved History</p>
            <p className="text-sm font-black text-green-900">{resolvedPendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Uploaded Docs</p>
            <p className="text-sm font-black text-purple-900">{client.documentsList?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
