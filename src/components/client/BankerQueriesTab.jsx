import React, { useState } from 'react';
import { 
  HelpCircle, CheckCircle, Clock, Send, MessageSquare, 
  Trash2, AlertTriangle, User, Building, Phone, Mail, FileText,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function BankerQueriesTab({ client, onRefresh }) {
  const queries = client?.bankerQueries || [];
  const [filter, setFilter] = useState('all'); // 'all', 'Pending', 'Resolved'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [statusVal, setStatusVal] = useState('In Progress');
  const [submitting, setSubmitting] = useState(false);

  const filteredQueries = queries.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'Pending') return q.status === 'Pending' || q.status === 'In Progress';
    if (filter === 'Resolved') return q.status === 'Resolved';
    return true;
  });

  const handleOpenRespond = (q) => {
    setSelectedQuery(q);
    setResponseText(q.staffResponse || '');
    setStatusVal(q.status || 'Resolved');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedQuery) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/clients/${client._id}/banker-queries/${selectedQuery._id}/respond`, {
        staffResponse: responseText,
        status: statusVal
      });
      if (res.data.success) {
        toast.success('Query response saved successfully');
        setSelectedQuery(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Are you sure you want to remove this query record?')) return;
    try {
      const res = await api.delete(`/clients/${client._id}/banker-queries/${queryId}`);
      if (res.data.success) {
        toast.success('Query removed successfully');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to remove query');
    }
  };

  // Direct WhatsApp sender helper (Ready for WhatsApp integration)
  const handleSendWhatsAppToBanker = (q) => {
    const text = `Hello ${q.bankerName || 'Sir/Madam'},\nRegarding your query on *${q.documentTitle || 'Case Documents'}* for client *${client.fullName}*:\n\n*Update:* ${q.staffResponse || 'We are reviewing this and will update you shortly.'}\n\n- KTR Consultants`;
    if (q.bankerMobile) {
      const cleanMobile = q.bankerMobile.replace(/[^0-9]/g, '');
      const fullPhone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
      window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      navigator.clipboard.writeText(text);
      toast.success('WhatsApp text copied to clipboard!');
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" /> Banker's Queries ({queries.length})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Queries and document clarifications submitted directly by bank officials from the Banker Document Portal
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-[#081326] shadow-2xs' : 'text-gray-500 hover:text-[#081326]'
            }`}
          >
            All ({queries.length})
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === 'Pending' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-500 hover:text-amber-600'
            }`}
          >
            Open ({queries.filter(q => q.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === 'Resolved' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Resolved ({queries.filter(q => q.status === 'Resolved').length})
          </button>
        </div>
      </div>

      {/* Query List */}
      {filteredQueries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-[#081326]">No Banker Queries</h4>
          <p className="text-xs text-gray-400 mt-1 font-medium max-w-sm mx-auto">
            {filter === 'all' 
              ? 'No queries have been raised yet by bankers for this case.' 
              : `No ${filter.toLowerCase()} queries found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((q, idx) => {
            const isResolved = q.status === 'Resolved';
            return (
              <div 
                key={q._id || idx}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-4 ${
                  isResolved ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/15'
                }`}
              >
                {/* Top Info Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        isResolved 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : q.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {q.status || 'Pending'}
                      </span>

                      {q.priority && q.priority !== 'Normal' && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          q.priority === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {q.priority} Priority
                        </span>
                      )}

                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FileText className="w-3 h-3 text-gray-400" /> {q.documentTitle || 'General Case'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3 h-3" /> Raised on {new Date(q.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Banker Details Badges */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 flex-wrap">
                    {q.bankerName && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <User className="w-3.5 h-3.5 text-gray-500" /> {q.bankerName} {q.bankerDesignation ? `(${q.bankerDesignation})` : ''}
                      </span>
                    )}
                    {q.bankName && (
                      <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Building className="w-3.5 h-3.5 text-gray-500" /> {q.bankName}
                      </span>
                    )}
                    {q.bankerMobile && (
                      <a 
                        href={`tel:${q.bankerMobile}`}
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> {q.bankerMobile}
                      </a>
                    )}
                  </div>
                </div>

                {/* Query Message Body */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100 text-xs sm:text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {q.queryText}
                </div>

                {/* Staff Response section if answered */}
                {q.staffResponse && (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Staff Response ({q.respondedByName || 'Staff'})
                      </p>
                      {q.respondedAt && (
                        <span className="text-[10px] text-emerald-700 font-medium">
                          {new Date(q.respondedAt).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed whitespace-pre-wrap">
                      {q.staffResponse}
                    </p>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRespond(q)}
                      className="px-3 py-1.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>{q.staffResponse ? 'Edit Response' : 'Respond to Query'}</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppToBanker(q)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Send WhatsApp Update to Banker"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Update</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteQuery(q._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Query"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setSelectedQuery(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black text-[#081326]">Respond to Banker Query</h3>
                <p className="text-xs text-gray-400">Document: {selectedQuery.documentTitle || 'General Case'}</p>
              </div>
              <button 
                onClick={() => setSelectedQuery(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-xs font-medium text-gray-700">
              <span className="font-bold text-[#081326] block mb-1">Banker Query:</span>
              {selectedQuery.queryText}
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#081326] focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Staff Response / Clarification Note
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter response, explanation, or resolution details for the banker..."
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#081326] placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{submitting ? 'Saving...' : 'Save & Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
