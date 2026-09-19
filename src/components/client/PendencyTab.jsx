import React, { useState } from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, PlusCircle, Check, X, 
  RotateCcw, Trash2, Calendar, User, FileText, ArrowRight, Filter
} from 'lucide-react';
import api from '../../api/axios';

const PendencyTab = ({ client, onRefresh }) => {
  const pendencies = client?.pendencies || [];
  
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Resolved'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedPendency, setSelectedPendency] = useState(null);

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

  const filteredPendencies = pendencies.filter(p => {
    if (filter === 'Pending') return p.status !== 'Resolved';
    if (filter === 'Resolved') return p.status === 'Resolved';
    return true;
  });

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
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error adding pendency:', err);
      alert('Failed to add pendency: ' + (err.response?.data?.message || err.message));
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
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error updating pendency:', err);
      alert('Failed to update pendency: ' + (err.response?.data?.message || err.message));
    } finally {
      setResolving(false);
    }
  };

  const handleDeletePendency = async (pendencyId) => {
    if (!window.confirm('Are you sure you want to remove this pendency?')) return;
    try {
      const res = await api.delete(`/clients/${client._id}/pendencies/${pendencyId}`);
      if (res.data.success) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting pendency:', err);
      alert('Failed to delete pendency');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#f59e0b]" /> Continuous Pendency Tracking
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track missing documents, requirements, and full resolution history across the entire case lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Active Pendency</p>
              <p className="text-sm font-black text-amber-900 leading-none">{pendingList.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Resolved History</p>
              <p className="text-sm font-black text-green-900 leading-none">{resolvedList.length}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto md:ml-0 px-4 py-2.5 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> + Add Pendency
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {[
            { key: 'All', label: `All Pendencies (${pendencies.length})` },
            { key: 'Pending', label: `Open / Active (${pendingList.length})` },
            { key: 'Resolved', label: `Resolved History (${resolvedList.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-white text-[#081326] shadow-xs'
                  : 'text-gray-500 hover:text-[#081326]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pendency Timeline List */}
      <div className="space-y-4">
        {filteredPendencies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#f59e0b] flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-[#081326] mb-1">No pendencies in this view</h4>
            <p className="text-xs text-gray-400 font-medium mb-4">
              {filter === 'Pending' 
                ? 'All documents and requirements have been resolved for this client!' 
                : 'No pendency records have been logged yet.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> Add New Pendency
            </button>
          </div>
        ) : (
          filteredPendencies.slice().reverse().map((item, idx) => {
            const isResolved = item.status === 'Resolved';
            return (
              <div 
                key={item._id || idx}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col gap-4 ${
                  isResolved 
                    ? 'border-green-100 bg-green-50/10' 
                    : 'border-amber-200 bg-white hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isResolved 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#081326]">{item.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isResolved 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status || 'Pending'}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenResolve(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isResolved
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <RotateCcw className="w-3 h-3" /> Update / Reopen
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Mark Resolved
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePendency(item._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata Tracking Row */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-gray-50/50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Date Added</span>
                      <span className="font-bold text-gray-700">
                        {item.addedAt ? new Date(item.addedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Added By</span>
                      <span className="font-bold text-gray-700">{item.addedByName || 'Staff / Admin'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isResolved ? 'text-green-600' : 'text-gray-300'}`} />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Date Resolved</span>
                      <span className={`font-bold ${isResolved ? 'text-green-700' : 'text-gray-400 italic'}`}>
                        {item.resolvedAt 
                          ? new Date(item.resolvedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : 'Pending resolution'}
                      </span>
                    </div>
                  </div>

                  {item.resolutionNotes && (
                    <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-gray-200/50 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-green-900 font-medium">
                        <strong className="font-bold">Resolution Note:</strong> {item.resolutionNotes}
                        {item.resolvedByName && <span className="text-green-700 ml-1 font-normal">({item.resolvedByName})</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Pendency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#f59e0b]" /> Add New Pendency Requirement
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pendency Requirement / Document *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months Salary Slips, 2 Years ITR, Electricity Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Details / Instructions (Optional)
                </label>
                <textarea
                  placeholder="Specify details (e.g. Needs password for PDF or signed copy with computation)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                ⚡ This pendency will be continuously logged with the current timestamp and staff signature in the client case record.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Save Pendency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve / Update Pendency Modal */}
      {showResolveModal && selectedPendency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowResolveModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Update Pendency Status
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Pendency Item</span>
                <p className="font-bold text-[#081326]">{selectedPendency.title}</p>
                {selectedPendency.description && (
                  <p className="text-gray-500 text-[11px] mt-1">{selectedPendency.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-bold cursor-pointer"
                >
                  <option value="Resolved">✅ Resolved (Document Received / Requirement Met)</option>
                  <option value="In Progress">🔄 In Progress (Document Awaited from Client)</option>
                  <option value="Pending">⏳ Pending (Open Requirement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Resolution Remarks / Notes
                </label>
                <textarea
                  placeholder="e.g. Received 3 months salary slips via WhatsApp and uploaded to Documents section."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {resolving ? 'Updating...' : 'Save Resolution'}
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
