import { useState, useEffect } from 'react';
import { 
  RefreshCcw, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    'Completed': "text-green-600 bg-green-50 border border-green-100",
    'Rejected': "text-red-500 bg-red-50 border border-red-100",
    'In Progress': "text-blue-500 bg-blue-50 border border-blue-100",
    'Pending': "text-orange-500 bg-orange-50 border border-orange-100",
  };
  const dotColor = {
    'Completed': "bg-green-500",
    'Rejected': "bg-red-500",
    'In Progress': "bg-blue-500",
    'Pending': "bg-orange-500"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></span>
      {status}
    </span>
  );
};

const OnlineApplications = () => {
  const { role } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [remark, setRemark] = useState('');
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // Real-time polling every 15 seconds
    const interval = setInterval(fetchApplications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync remark field when selectedApp changes
  useEffect(() => {
    if (selectedApp) setRemark(selectedApp.remark || '');
  }, [selectedApp]);

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoading(true);
      const res = await api.patch(`/applications/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications(applications.map(app => 
          app._id === id ? { ...app, status: newStatus } : app
        ));
        if (selectedApp && selectedApp._id === id) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
        toast.success(`Application marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      const res = await api.delete(`/applications/${appToDelete}`);
      if (res.data.success) {
        setApplications(applications.filter(app => app._id !== appToDelete));
        setShowDeleteModal(false);
        setAppToDelete(null);
        if (selectedApp && selectedApp._id === appToDelete) {
          setShowPreview(false);
          setSelectedApp(null);
        }
        toast.success('Application deleted');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const saveRemark = async () => {
    if (!selectedApp) return;
    try {
      setRemarkLoading(true);
      const res = await api.patch(`/applications/${selectedApp._id}/remark`, { remark });
      if (res.data.success) {
        const updated = res.data.data;
        setApplications(applications.map(app => app._id === updated._id ? updated : app));
        setSelectedApp(updated);
        toast.success('Remark saved!');
      }
    } catch (error) {
      toast.error('Failed to save remark');
    } finally {
      setRemarkLoading(false);
    }
  };

  const tabs = ['All', 'Pending', 'In Progress', 'Completed', 'Rejected'];

  // Get unique service types for filter dropdown
  const serviceTypes = ['All', ...Array.from(new Set(applications.map(a => a.serviceType).filter(Boolean)))];

  const filteredApps = applications.filter(app => {
    const matchesTab = activeTab === 'All' || app.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      app.fullName?.toLowerCase().includes(q) ||
      app.mobile?.includes(q) ||
      app.applicationId?.toLowerCase().includes(q) ||
      app.serviceType?.toLowerCase().includes(q) ||
      app.purpose?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q);
    const matchesService = serviceFilter === 'All' || app.serviceType === serviceFilter;
    return matchesTab && matchesSearch && matchesService;
  });

  if (role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
  }

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      <Toaster position="top-right" />
      {/* Main Content */}
      <div className={`flex flex-col space-y-6 transition-all duration-300 ${showPreview ? 'w-[calc(100%-400px)]' : 'w-full'}`}>
        
        {/* Header Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 mb-1">Total Submissions</p>
            <h4 className="text-2xl font-black text-[#081326]">{applications.length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 mb-1">Pending</p>
            <h4 className="text-2xl font-black text-orange-500">{applications.filter(a => a.status === 'Pending').length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 mb-1">In Progress</p>
            <h4 className="text-2xl font-black text-blue-500">{applications.filter(a => a.status === 'In Progress').length}</h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 mb-1">Completed</p>
            <h4 className="text-2xl font-black text-green-500">{applications.filter(a => a.status === 'Completed').length}</h4>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Search + Filter Row */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, mobile, ref ID, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-blue-300 placeholder-gray-400 bg-gray-50/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-9 px-3 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-blue-300 bg-gray-50/50 min-w-[180px]"
            >
              {serviceTypes.map(s => <option key={s} value={s}>{s === 'All' ? 'All Services' : s}</option>)}
            </select>
          </div>

          {/* Tabs + Refresh Row */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 flex-wrap gap-4 bg-gray-50/30">
            <div className="flex gap-2 p-2">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {tab !== 'All' && (
                    <span className="ml-1.5 text-[10px] text-gray-400">
                      ({applications.filter(a => a.status === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              {(searchQuery || serviceFilter !== 'All') && (
                <button
                  onClick={() => { setSearchQuery(''); setServiceFilter('All'); setActiveTab('All'); }}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  Clear Filters
                </button>
              )}
              <span className="text-[11px] text-gray-400 font-bold">{filteredApps.length} result{filteredApps.length !== 1 ? 's' : ''}</span>
              <button 
                onClick={fetchApplications}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">ID</th>
                  <th className="px-5 py-4 whitespace-nowrap">Applicant Details</th>
                  <th className="px-5 py-4 whitespace-nowrap">Service / Purpose</th>
                  <th className="px-5 py-4 whitespace-nowrap">Remark</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Submitted On</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading applications...</td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No applications found.</td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap text-blue-600 font-bold">{app.applicationId || app._id.substring(app._id.length - 6)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[#081326]">{app.fullName}</span>
                          <span className="text-gray-400 font-bold">{app.mobile}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-blue-600">{app.serviceType}</span>
                          <span className="text-gray-400 font-bold">{app.purpose}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[160px]">
                        {app.remark ? (
                          <span className="text-[11px] text-gray-600 font-medium line-clamp-2 italic">{app.remark}</span>
                        ) : (
                          <span className="text-[11px] text-gray-300 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={app.status} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedApp(app);
                              setShowPreview(true);
                            }}
                            className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setAppToDelete(app._id);
                              setShowDeleteModal(true);
                            }}
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

      {/* Slide-over Preview */}
      {showPreview && selectedApp && (
        <div className="w-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[calc(100vh-120px)] sticky top-6 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-[#081326]">Application Details</h3>
            <button 
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <div className="space-y-6">
              
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Service Requested</p>
                       <p className="text-sm font-black text-blue-600">
                          {selectedApp.serviceType}
                          {selectedApp.serviceType === 'Other' && selectedApp.otherServiceType && (
                            <span className="block mt-1 text-xs font-bold text-gray-600">
                              ({selectedApp.otherServiceType})
                            </span>
                          )}
                       </p>
                    </div>
                    <StatusBadge status={selectedApp.status} />
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Submitted On</p>
                       <p className="text-xs font-bold text-[#081326]">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-800 mb-3 border-b border-gray-100 pb-2">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Full Name</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Mobile</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Email</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Gender</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Date of Birth</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Marital Status</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.maritalStatus || 'N/A'}</p>
                  </div>

                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-800 mb-3 border-b border-gray-100 pb-2">Service Requirement</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className={selectedApp.purpose === 'Other' ? 'col-span-2' : ''}>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Purpose</p>
                    <p className="text-xs font-bold text-[#081326]">
                      {selectedApp.purpose}
                      {selectedApp.purpose === 'Other' && selectedApp.otherPurpose && (
                        <span className="block mt-1 p-2 bg-gray-50 border border-gray-100 rounded text-gray-700 italic">
                          "{selectedApp.otherPurpose}"
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Employment Type</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.employmentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Loan Amount</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.loanAmount ? `₹ ${selectedApp.loanAmount}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Source</p>
                    <p className="text-xs font-bold text-[#081326]">{selectedApp.source || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Additional Message</p>
                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed font-medium">
                      {selectedApp.message || 'No additional message provided.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
            {/* Remark Field */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Admin Remark</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add internal remark or notes..."
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
                {selectedApp.status === 'Pending' && (
                  <>
                     <button onClick={() => updateStatus(selectedApp._id, 'In Progress')} disabled={statusLoading} className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm flex justify-center items-center gap-1.5 hover:bg-blue-700 transition-colors">
                       <Clock className="w-3.5 h-3.5" /> Mark In Progress
                     </button>
                     <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} disabled={statusLoading} className="py-2.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold shadow-sm flex justify-center items-center gap-1.5 hover:bg-red-200 transition-colors">
                       <X className="w-3.5 h-3.5" /> Reject
                     </button>
                  </>
                )}
                {selectedApp.status === 'In Progress' && (
                  <>
                     <button onClick={() => updateStatus(selectedApp._id, 'Completed')} disabled={statusLoading} className="py-2.5 bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm flex justify-center items-center gap-1.5 hover:bg-green-600 transition-colors">
                       <CheckCircle className="w-3.5 h-3.5" /> Complete
                     </button>
                     <button onClick={() => updateStatus(selectedApp._id, 'Rejected')} disabled={statusLoading} className="py-2.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold shadow-sm flex justify-center items-center gap-1.5 hover:bg-red-200 transition-colors">
                       <X className="w-3.5 h-3.5" /> Reject
                     </button>
                  </>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Application?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete this online application? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineApplications;
