import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, PlusCircle, Check, X, 
  RotateCcw, Trash2, Calendar, User, FileText, ChevronDown, ChevronUp, Share2, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const PendencyTab = ({ client, onRefresh }) => {
  const pendencies = client?.pendencies || [];
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedPendency, setSelectedPendency] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [showResolvedSection, setShowResolvedSection] = useState(false);

  // Add Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resolve Form State
  const [resolveStatus, setResolveStatus] = useState('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const pendingList = pendencies.filter(p => p.status !== 'Resolved');
  const resolvedList = pendencies.filter(p => p.status === 'Resolved');

  const toggleDetails = (id) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !client?._id) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/clients/${client._id}/pendencies`, {
        title: title.trim(),
        description: description.trim()
      });
      if (res.data.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        toast.success('Pendency added');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error adding pendency:', err);
      toast.error('Failed to add pendency');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResolve = (pendency) => {
    setSelectedPendency(pendency);
    setResolveStatus(pendency.status === 'Resolved' ? 'Pending' : 'Resolved');
    setResolutionNotes(pendency.resolutionNotes || '');
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPendency || !client?._id) return;

    try {
      setResolving(true);
      const res = await api.patch(`/clients/${client._id}/pendencies/${selectedPendency._id}`, {
        status: resolveStatus,
        resolutionNotes: resolutionNotes.trim()
      });
      if (res.data.success) {
        setShowResolveModal(false);
        setSelectedPendency(null);
        setResolutionNotes('');
        toast.success(`Pendency marked as ${resolveStatus}`);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error updating pendency:', err);
      toast.error('Failed to update pendency');
    } finally {
      setResolving(false);
    }
  };

  const handleDeletePendency = async (pendencyId) => {
    if (!window.confirm('Are you sure you want to remove this pendency?')) return;
    try {
      const res = await api.delete(`/clients/${client._id}/pendencies/${pendencyId}`);
      if (res.data.success) {
        toast.success('Pendency removed');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting pendency:', err);
      toast.error('Failed to delete pendency');
    }
  };

  const handleCopyPendingList = () => {
    if (pendingList.length === 0) {
      toast.error('No pending items to copy');
      return;
    }
    const lines = pendingList.map((p, i) => `${i + 1}. ${p.title}${p.description ? ` (${p.description})` : ''}`).join('\n');
    const text = `📋 Pending Requirements for: ${client?.fullName || 'Client'}\n\n${lines}\n\nPlease submit the required documents/details at earliest.\n- KTR Consultants`;
    navigator.clipboard.writeText(text);
    toast.success('Pending list copied to clipboard!');
  };

  const handleSharePendingWhatsApp = () => {
    if (pendingList.length === 0) return;
    const lines = pendingList.map((p, i) => `${i + 1}. ${p.title}${p.description ? ` (${p.description})` : ''}`).join('\n');
    const text = `📋 *Pending Requirements for:* ${client?.fullName || 'Client'}\n\n${lines}\n\nPlease submit at earliest.\n- KTR Consultants`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#081326] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#f59e0b]" /> Continuous Pendency Tracking
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            Pending requirements stay at the top. Resolved items move below.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {pendingList.length > 0 && (
            <>
              <button
                onClick={handleCopyPendingList}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Copy formatted list for WhatsApp/Email"
              >
                <Copy className="w-3.5 h-3.5" /> Copy List
              </button>
              <button
                onClick={handleSharePendingWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> + Add Requirement
          </button>
        </div>
      </div>

      {/* 1. TOP SECTION: ACTIVE PENDING REQUIREMENTS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Requirements ({pendingList.length})</span>
          </h4>
        </div>

        {pendingList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 p-6 text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h5 className="text-xs font-black text-green-900">Zero Pending Items</h5>
            <p className="text-[11px] text-gray-500 mt-0.5">All case documents and requirements are currently cleared.</p>
          </div>
        ) : (
          pendingList.map((item, idx) => {
            const hasDetails = showDetails[item._id];

            return (
              <div 
                key={item._id || idx}
                className="bg-white rounded-xl border border-amber-200/90 hover:border-amber-300 p-3.5 shadow-xs flex flex-col gap-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-black text-[#081326] leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-gray-600 font-medium mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenResolve(item)}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Mark as Resolved"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Mark Resolved
                    </button>
                    <button
                      onClick={() => handleDeletePendency(item._id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                  <span>Added: {item.addedAt ? new Date(item.addedAt).toLocaleDateString('en-IN') : 'Recent'}</span>
                  <button
                    onClick={() => toggleDetails(item._id)}
                    className="text-[10px] font-bold text-gray-500 hover:text-[#081326] flex items-center gap-0.5 cursor-pointer"
                  >
                    {hasDetails ? <>Hide Details <ChevronUp className="w-3 h-3" /></> : <>Details / History <ChevronDown className="w-3 h-3" /></>}
                  </button>
                </div>

                {hasDetails && (
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] bg-gray-50/70 p-2 rounded-lg">
                    <div>
                      <span className="font-bold text-gray-400 block">Added By</span>
                      <span className="font-bold text-gray-700">{item.addedByName || 'Staff / Admin'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block">Timestamp</span>
                      <span className="font-bold text-gray-700">
                        {item.addedAt ? new Date(item.addedAt).toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 2. BOTTOM SECTION: COMPACT RESOLVED / RECEIVED HISTORY */}
      {resolvedList.length > 0 && (
        <div className="mt-3 space-y-2">
          <button
            onClick={() => setShowResolvedSection(prev => !prev)}
            className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-xl border border-gray-200/70 flex items-center justify-between text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Received / Resolved Requirements ({resolvedList.length})</span>
            </span>
            {showResolvedSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showResolvedSection && (
            <div className="space-y-2 pl-2">
              {resolvedList.slice().reverse().map((item, idx) => (
                <div key={item._id || idx} className="bg-white rounded-xl border border-green-100 p-3 shadow-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-xs font-bold text-[#081326] truncate">{item.title}</span>
                    {item.resolutionNotes && (
                      <span className="text-[10px] text-gray-400 truncate italic">({item.resolutionNotes})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-400">
                      {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('en-IN') : ''}
                    </span>
                    <button
                      onClick={() => handleOpenResolve(item)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold cursor-pointer"
                      title="Reopen as pending"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Pendency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> Add Case Pendency / Requirement
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Requirement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 6 Months Bank Statement Required"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Detailed Description / Instructions (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Needs password-free PDF with latest salary credit transactions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-60"
                >
                  {submitting ? 'Adding...' : 'Save Pendency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve / Status Modal */}
      {showResolveModal && selectedPendency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Update Pendency Status
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-black text-[#081326]">{selectedPendency.title}</p>
                {selectedPendency.description && <p className="text-[11px] text-gray-500 mt-0.5">{selectedPendency.description}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Change Status</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                >
                  <option value="Resolved">Resolved / Received ✓</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending / Open</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Resolution Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Document received via email / verified"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-60"
                >
                  {resolving ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendencyTab;
