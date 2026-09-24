import React from 'react';
import { User, Phone, Briefcase, IndianRupee, FileCheck, CheckCircle2, Clock, AlertCircle, Edit } from 'lucide-react';

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
        return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-black">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-black">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-black">Pending</span>;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Core Client Details */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-3">
            <div>
              <h3 className="font-black text-[#081326] text-base">Client Case Overview</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Primary intake details registered for this client</p>
            </div>
            <div className="flex items-center gap-3">
              {onEditClick && (
                <button 
                  onClick={onEditClick}
                  className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Edit Case Details (Loan Amount, Case Type, Name, Contact, Status)"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-600" /> Edit Details
                </button>
              )}
              {getStatusBadge(client.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* 1. Client Name */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Client Name</span>
              </div>
              <p className="text-base font-black text-[#081326]">{client.fullName || 'N/A'}</p>
            </div>

            {/* 2. Mobile No. */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mobile Number</span>
              </div>
              <p className="text-base font-black text-[#081326]">{client.mobile || 'N/A'}</p>
            </div>

            {/* 3. Profession */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Profession</span>
              </div>
              <p className="text-base font-black text-[#081326]">{client.occupation || 'N/A'}</p>
            </div>

            {/* 4. Loan Amount */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Loan Amount</span>
              </div>
              <p className="text-base font-black text-emerald-700">{formatCurrency(client.loanAmount)}</p>
            </div>

            {/* 5. Case Type */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Case Type</span>
              </div>
              <p className="text-base font-black text-[#081326]">{client.caseType || client.loanType || 'General Loan'}</p>
            </div>

            {/* 6. Status */}
            <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Case Status</span>
              </div>
              <p className="text-base font-black text-[#081326]">{client.status || 'Pending'}</p>
            </div>
          </div>
        </div>

        {/* Current Pendency Quick Glance Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[#081326] text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f59e0b]" /> Current Active Pendency
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              activePendencies.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              {activePendencies.length > 0 ? `${activePendencies.length} Open Requirements` : 'Zero Pendencies'}
            </span>
          </div>

          {activePendencies.length > 0 ? (
            <div className="space-y-2.5">
              {activePendencies.map((p, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-amber-950">{p.title}</p>
                      <span className="text-[10px] text-amber-700 font-bold">
                        {p.addedAt ? new Date(p.addedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-green-50/60 border border-green-100 rounded-xl flex items-center gap-3 text-green-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>All pendencies are cleared. Ready for next process stage.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Summary Stats */}
      <div className="w-full xl:w-72 shrink-0 space-y-4">
        <h3 className="font-black text-[#081326] text-xs uppercase tracking-wider px-1">Case Summary</h3>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0 font-bold">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Case Created</p>
            <p className="text-xs font-black text-[#081326] mt-0.5">
              {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0 font-bold">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Active Pendencies</p>
            <p className="text-base font-black text-amber-900 mt-0.5">{activePendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Resolved History</p>
            <p className="text-base font-black text-green-900 mt-0.5">{resolvedPendencies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0 font-bold">
            <FileCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Uploaded Docs</p>
            <p className="text-base font-black text-purple-900 mt-0.5">{client.documentsList?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
