import { useState, useEffect } from 'react';
import { RefreshCcw, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    'New': 'text-orange-600 bg-orange-50 border border-orange-100',
    'Processing': 'text-blue-500 bg-blue-50 border border-blue-100',
    'Completed': 'text-green-600 bg-green-50 border border-green-100',
    'Rejected': 'text-red-500 bg-red-50 border border-red-100',
  };
  const dot = {
    'New': 'bg-orange-500',
    'Processing': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Rejected': 'bg-red-500',
  };
  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit text-[11px]`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`}></span>
      {status}
    </span>
  );
};

const ChainDeeds = () => {
  const { role } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkLoading, setRemarkLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chain-deeds');
      if (res.data.success) setApplications(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedApp) setRemark(selectedApp.remark || '');
  }, [selectedApp]);

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoading(true);
      const res = await api.patch(`/chain-deeds/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications(applications.map(a => a._id === id ? { ...a, status: newStatus } : a));
        if (selectedApp?._id === id) setSelectedApp({ ...selectedApp, status: newStatus });
        toast.success(`Marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const saveRemark = async () => {
    if (!selectedApp) return;
    try {
      setRemarkLoading(true);
      const res = await api.patch(`/chain-deeds/${selectedApp._id}/remark`, { remark });
      if (res.data.success) {
        const updated = res.data.data;
        setApplications(applications.map(a => a._id === updated._id ? updated : a));
        setSelectedApp(updated);
        toast.success('Remark saved!');
      }
    } catch (error) {
      toast.error('Failed to save remark');
    } finally {
      setRemarkLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      const res = await api.delete(`/chain-deeds/${appToDelete}`);
      if (res.data.success) {
        setApplications(applications.filter(a => a._id !== appToDelete));
        setShowDeleteModal(false);
        setAppToDelete(null);
        if (selectedApp?._id === appToDelete) { setShowPreview(false); setSelectedApp(null); }
        toast.success('Application deleted');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getDeedTypeLabel = (type) => {
    if (type === 'after2016') return 'Deeds after 2016';
    if (type === 'before2016') return 'Deeds before 2016';
    if (type === 'recordRoom') return 'Deeds from Record Room';
    return type;
  };

  const tabs = ['All', 'New', 'Processing', 'Completed', 'Rejected'];

  const filtered = applications.filter(a => {
    const matchesTab = activeTab === 'All' || a.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      a.name?.toLowerCase().includes(q) ||
      a.mobile?.includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.applicationId?.toLowerCase().includes(q) ||
      a.paymentId?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  if (role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;

  const BACKEND_URL = 'http://localhost:5000';

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      <Toaster position="top-right" />

      {/* Main Content */}
      <div className="flex flex-col space-y-6 transition-all duration-300 w-full min-w-0">

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Applications</p>
            <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none">{applications.length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">New</p>
            <h4 className="text-xl sm:text-2xl font-black text-orange-500 leading-none">{applications.filter(a => a.status === 'New').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Processing</p>
            <h4 className="text-xl sm:text-2xl font-black text-blue-500 leading-none">{applications.filter(a => a.status === 'Processing').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Completed</p>
            <h4 className="text-xl sm:text-2xl font-black text-green-500 leading-none">{applications.filter(a => a.status === 'Completed').length}</h4>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, name, mobile, email..."
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

          {/* Tabs */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 bg-gray-50/30">
            <div className="flex gap-2 p-2 flex-wrap">
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
                    <span className="ml-1.5 text-[10px] text-gray-400">({applications.filter(a => a.status === tab).length})</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              <span className="text-[11px] text-gray-400 font-bold">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              <button onClick={fetchApplications} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
                <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">App ID</th>
                  <th className="px-5 py-4 whitespace-nowrap">Applicant</th>
                  <th className="px-5 py-4 whitespace-nowrap">Deed Type</th>
                  <th className="px-5 py-4 whitespace-nowrap">Amount Paid</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading applications...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No applications found.</td></tr>
                ) : (
                  filtered.map(a => (
                    <tr key={a._id} className={`hover:bg-gray-50/80 transition-colors group ${a.status === 'New' ? 'bg-orange-50/20' : ''}`}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-black text-[#081326] text-[11px]">{a.applicationId}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-bold ${a.status === 'New' ? 'text-[#081326]' : 'text-gray-700'}`}>{a.name}</span>
                          <span className="text-gray-400 text-[11px]">{a.mobile}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] text-blue-600 font-bold">{getDeedTypeLabel(a.deedType)}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-green-600">₹{a.amountPaid?.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-medium text-gray-500">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedApp(a); setShowPreview(true); }}
                            className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setAppToDelete(a._id); setShowDeleteModal(true); }}
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
      {showPreview && selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-[#081326]/60 backdrop-blur-xs transition-opacity" 
            onClick={() => { setShowPreview(false); setSelectedApp(null); }}
          ></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/80">
              <div>
                <h3 className="font-black text-[#081326] text-[15px]">{selectedApp.name}</h3>
                <p className="text-gray-400 text-[12px] font-medium mt-0.5">{selectedApp.applicationId}</p>
              </div>
              <button onClick={() => { setShowPreview(false); setSelectedApp(null); }} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4">
              
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Mobile</p>
                    <p className="text-sm font-bold text-[#081326]">{selectedApp.mobile}</p>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>
                {selectedApp.email && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-700">{selectedApp.email}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Deed Type</p>
                    <p className="text-[12px] font-bold text-blue-600">{getDeedTypeLabel(selectedApp.deedType)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="text-sm font-bold text-green-600">₹{selectedApp.amountPaid?.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Payment ID</p>
                    <p className="text-[11px] font-mono font-bold text-gray-600">{selectedApp.paymentId}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Submitted On</p>
                  <p className="text-[12px] font-bold text-gray-700">
                    {new Date(selectedApp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Uploaded Document */}
              {selectedApp.documentUrl && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">Registry Document</p>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-700 truncate">{selectedApp.documentName}</p>
                    </div>
                    <a
                      href={`${BACKEND_URL}${selectedApp.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 flex-shrink-0 shadow-sm"
                    >
                      View / Download
                    </a>
                  </div>
                </div>
              )}

              {/* Existing Remark */}
              {selectedApp.remark && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Admin Remark</p>
                  <p className="text-[12px] text-gray-700 italic">{selectedApp.remark}</p>
                </div>
              )}
            </div>

            {/* Footer: Remark + Status Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Admin Remark</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
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
                {selectedApp.status === 'New' && (
                  <button onClick={() => updateStatus(selectedApp._id, 'Processing')} disabled={statusLoading} className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-blue-700 transition-colors col-span-2">
                    <Clock className="w-3.5 h-3.5" /> Mark Processing
                  </button>
                )}
                {selectedApp.status !== 'Completed' && (
                  <button onClick={() => updateStatus(selectedApp._id, 'Completed')} disabled={statusLoading} className="py-2.5 bg-green-500 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-green-600 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </button>
                )}
                {selectedApp.status !== 'Rejected' && (
                  <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} disabled={statusLoading} className="py-2.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 hover:bg-red-200 transition-colors">
                    <X className="w-3.5 h-3.5" /> Reject
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
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Application?</h3>
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

export default ChainDeeds;
