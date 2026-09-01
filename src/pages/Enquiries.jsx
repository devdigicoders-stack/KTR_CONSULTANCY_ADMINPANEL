import { useState, useEffect } from 'react';
import { RefreshCcw, Eye, Trash2, X, MessageSquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    'Unread': 'text-orange-600 bg-orange-50 border border-orange-100',
    'Read': 'text-blue-500 bg-blue-50 border border-blue-100',
    'Replied': 'text-green-600 bg-green-50 border border-green-100',
  };
  const dot = {
    'Unread': 'bg-orange-500',
    'Read': 'bg-blue-500',
    'Replied': 'bg-green-500',
  };
  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit text-[11px]`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`}></span>
      {status}
    </span>
  );
};

const Enquiries = () => {
  const { role } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEnq, setSelectedEnq] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enqToDelete, setEnqToDelete] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkLoading, setRemarkLoading] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enquiries');
      if (res.data.success) setEnquiries(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    const interval = setInterval(fetchEnquiries, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedEnq) setRemark(selectedEnq.remark || '');
  }, [selectedEnq]);

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoading(true);
      const res = await api.patch(`/enquiries/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setEnquiries(enquiries.map(e => e._id === id ? { ...e, status: newStatus } : e));
        if (selectedEnq?._id === id) setSelectedEnq({ ...selectedEnq, status: newStatus });
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const saveRemark = async () => {
    if (!selectedEnq) return;
    try {
      setRemarkLoading(true);
      const res = await api.patch(`/enquiries/${selectedEnq._id}/remark`, { remark });
      if (res.data.success) {
        const updated = res.data.data;
        setEnquiries(enquiries.map(e => e._id === updated._id ? updated : e));
        setSelectedEnq(updated);
        toast.success('Remark saved!');
      }
    } catch (error) {
      toast.error('Failed to save remark');
    } finally {
      setRemarkLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!enqToDelete) return;
    try {
      const res = await api.delete(`/enquiries/${enqToDelete}`);
      if (res.data.success) {
        setEnquiries(enquiries.filter(e => e._id !== enqToDelete));
        setShowDeleteModal(false);
        setEnqToDelete(null);
        if (selectedEnq?._id === enqToDelete) { setShowPreview(false); setSelectedEnq(null); }
        toast.success('Enquiry deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const tabs = ['All', 'Unread', 'Read', 'Replied'];

  const filtered = enquiries.filter(e => {
    const matchesTab = activeTab === 'All' || e.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      e.fullName?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.subject?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  if (role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <div className="flex flex-col space-y-6 transition-all duration-300 w-full min-w-0">

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Enquiries</p>
            <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none">{enquiries.length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Unread</p>
            <h4 className="text-xl sm:text-2xl font-black text-orange-500 leading-none">{enquiries.filter(e => e.status === 'Unread').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Read</p>
            <h4 className="text-xl sm:text-2xl font-black text-blue-500 leading-none">{enquiries.filter(e => e.status === 'Read').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Replied</p>
            <h4 className="text-xl sm:text-2xl font-black text-green-500 leading-none">{enquiries.filter(e => e.status === 'Replied').length}</h4>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Search Row */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, phone, email, subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-blue-300 bg-gray-50/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs Row */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 bg-gray-50/30">
            <div className="flex gap-2 p-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {tab !== 'All' && (
                    <span className="ml-1.5 text-[10px] text-gray-400">({enquiries.filter(e => e.status === tab).length})</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              <span className="text-[11px] text-gray-400 font-bold">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              <button onClick={fetchEnquiries} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
                <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">Sender</th>
                  <th className="px-5 py-4 whitespace-nowrap">Subject</th>
                  <th className="px-5 py-4 whitespace-nowrap">Service Interested</th>
                  <th className="px-5 py-4 whitespace-nowrap">Message Preview</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading enquiries...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No enquiries found.</td></tr>
                ) : (
                  filtered.map(enq => (
                    <tr
                      key={enq._id}
                      className={`hover:bg-gray-50/80 transition-colors group ${enq.status === 'Unread' ? 'bg-orange-50/30' : ''}`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-bold ${enq.status === 'Unread' ? 'text-[#081326]' : 'text-gray-700'}`}>{enq.fullName}</span>
                          <span className="text-gray-400 text-[11px]">{enq.phone}</span>
                          {enq.email && <span className="text-gray-400 text-[11px]">{enq.email}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`font-bold text-[12px] ${enq.status === 'Unread' ? 'text-[#081326]' : 'text-gray-600'}`}>{enq.subject}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] text-blue-600 font-bold">{enq.serviceInterested || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <span className="text-[11px] text-gray-500 line-clamp-2">{enq.message}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={enq.status} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-medium text-gray-500">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedEnq(enq); setShowPreview(true); if (enq.status === 'Unread') updateStatus(enq._id, 'Read'); }}
                            className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEnqToDelete(enq._id); setShowDeleteModal(true); }}
                            className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Preview Drawer */}
      {showPreview && selectedEnq && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-[#081326]/60 backdrop-blur-xs transition-opacity" 
            onClick={() => { setShowPreview(false); setSelectedEnq(null); }}
          ></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/80">
              <div>
                <h3 className="font-black text-[#081326] text-[15px]">{selectedEnq.fullName}</h3>
                <p className="text-gray-400 text-[12px] font-medium mt-0.5">{selectedEnq.phone}{selectedEnq.email && ` · ${selectedEnq.email}`}</p>
              </div>
              <button onClick={() => { setShowPreview(false); setSelectedEnq(null); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4">
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-sm font-black text-[#081326]">{selectedEnq.subject}</p>
                  </div>
                  <StatusBadge status={selectedEnq.status} />
                </div>
                {selectedEnq.serviceInterested && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Service Interested</p>
                    <p className="text-sm font-bold text-blue-600">{selectedEnq.serviceInterested}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(selectedEnq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Message</p>
                <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEnq.message}</p>
              </div>

              {/* Existing remark */}
              {selectedEnq.remark && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Previous Remark</p>
                  <p className="text-[12px] text-gray-700 italic">{selectedEnq.remark}</p>
                </div>
              )}
            </div>

            {/* Footer: Remark + Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Admin Remark</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="Add internal remark or reply notes..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-blue-300 resize-none bg-white placeholder-gray-400"
                />
                <button
                  onClick={saveRemark}
                  disabled={remarkLoading}
                  className="w-full mt-2 py-2 bg-[#081326] hover:bg-[#0f2040] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {remarkLoading ? 'Saving...' : '✓ Save Remark'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedEnq.status !== 'Read' && (
                  <button onClick={() => updateStatus(selectedEnq._id, 'Read')} disabled={statusLoading} className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-blue-700 transition-colors">
                    <Clock className="w-3.5 h-3.5" /> Mark Read
                  </button>
                )}
                {selectedEnq.status !== 'Replied' && (
                  <button onClick={() => updateStatus(selectedEnq._id, 'Replied')} disabled={statusLoading} className="py-2.5 bg-green-500 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-green-600 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Replied
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
