import { useState, useEffect } from 'react';
import { RefreshCcw, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
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

const PropertyAssessments = () => {
  const { role } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeTab, setActiveTab] = useState('All'); // Status
  const [serviceFilter, setServiceFilter] = useState('All'); // Service Type
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI State
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
      const res = await api.get('/property-assessments');
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
      const res = await api.patch(`/property-assessments/${id}/status`, { status: newStatus });
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
      const res = await api.patch(`/property-assessments/${selectedApp._id}/remark`, { remark });
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
      const res = await api.delete(`/property-assessments/${appToDelete}`);
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

  const getServiceLabel = (type) => {
    if (type === 'nagar-nigam') return 'Nagar Nigam Property Assessment';
    if (type === 'lda-map') return 'LDA Map Submission';
    if (type === 'map-estimate') return 'Map Estimate Layout';
    return type;
  };

  const getServiceShort = (type) => {
    if (type === 'nagar-nigam') return 'Nagar Nigam';
    if (type === 'lda-map') return 'LDA Map';
    if (type === 'map-estimate') return 'Map Estimate';
    return type;
  };

  const statusTabs = ['All', 'New', 'Processing', 'Completed', 'Rejected'];
  const serviceTabs = ['All', 'nagar-nigam', 'lda-map', 'map-estimate'];

  const filtered = applications.filter(a => {
    const matchesStatus = activeTab === 'All' || a.status === activeTab;
    const matchesService = serviceFilter === 'All' || a.serviceType === serviceFilter;
    const q = searchQuery.toLowerCase();
    const details = a.customerDetails || {};
    const matchesSearch = !q ||
      details.name?.toLowerCase().includes(q) ||
      details.mobile?.includes(q) ||
      details.email?.toLowerCase().includes(q) ||
      a.applicationId?.toLowerCase().includes(q);
    return matchesStatus && matchesService && matchesSearch;
  });

  if (role !== 'admin') return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;

  const BACKEND_URL = 'http://localhost:5000';

  const DocumentBox = ({ title, doc, isImage }) => {
    if (!doc || (!doc.url && (!Array.isArray(doc) || doc.length === 0))) return null;
    
    if (Array.isArray(doc)) {
      return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">{title} ({doc.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {doc.map((f, i) => (
              <a key={i} href={`${BACKEND_URL}${f.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-blue-100 hover:border-blue-300 transition-colors">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] text-gray-700 truncate font-semibold">Photo {i+1}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-3">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{title}</p>
          <p className="text-[11px] font-semibold text-gray-700 truncate">{doc.name}</p>
        </div>
        <a href={`${BACKEND_URL}${doc.url}`} target="_blank" rel="noopener noreferrer" className="shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm">
          <Eye className="w-4 h-4" />
        </a>
      </div>
    );
  };

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
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Nagar Nigam</p>
            <h4 className="text-xl sm:text-2xl font-black text-indigo-500 leading-none">{applications.filter(a => a.serviceType === 'nagar-nigam').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">LDA Map</p>
            <h4 className="text-xl sm:text-2xl font-black text-teal-500 leading-none">{applications.filter(a => a.serviceType === 'lda-map').length}</h4>
          </div>
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Map Estimate</p>
            <h4 className="text-xl sm:text-2xl font-black text-amber-500 leading-none">{applications.filter(a => a.serviceType === 'map-estimate').length}</h4>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Top Filters (Service & Search) */}
          <div className="px-4 py-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex bg-gray-100/50 p-1 rounded-lg">
              {serviceTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setServiceFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    serviceFilter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'All' ? 'All Services' : getServiceShort(tab)}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-[300px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search ID, name, mobile..."
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

          {/* Status Tabs */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 bg-gray-50/30">
            <div className="flex gap-2 p-2 flex-wrap">
              {statusTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {tab !== 'All' && (
                    <span className="ml-1.5 text-[10px] text-gray-400">
                      ({applications.filter(a => a.status === tab && (serviceFilter === 'All' || a.serviceType === serviceFilter)).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              <span className="text-[11px] text-gray-400 font-bold">{filtered.length} results</span>
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
                  <th className="px-5 py-4 whitespace-nowrap">Service</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading applications...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No applications found.</td></tr>
                ) : (
                  filtered.map(a => (
                    <tr key={a._id} className={`hover:bg-gray-50/80 transition-colors group ${a.status === 'New' ? 'bg-orange-50/20' : ''}`}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-black text-[#081326] text-[11px]">{a.applicationId}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-bold ${a.status === 'New' ? 'text-[#081326]' : 'text-gray-700'}`}>{a.customerDetails?.name || 'N/A'}</span>
                          <span className="text-gray-400 text-[11px] font-mono">{a.customerDetails?.mobile}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-100">{getServiceShort(a.serviceType)}</span>
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
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between bg-[#081326] text-white">
              <div>
                <h3 className="font-black text-[15px]">{selectedApp.customerDetails?.name || 'Customer'}</h3>
                <p className="text-gray-400 text-[12px] font-medium mt-0.5">{selectedApp.applicationId}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-blue-300">
                   {getServiceLabel(selectedApp.serviceType)}
                </div>
              </div>
              <button onClick={() => { setShowPreview(false); setSelectedApp(null); }} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-5">
              
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-[13px] font-bold text-[#081326]">{selectedApp.customerDetails?.mobile}</p>
                </div>
                {selectedApp.customerDetails?.email && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                    <p className="text-[12px] font-medium text-gray-700 truncate" title={selectedApp.customerDetails.email}>
                      {selectedApp.customerDetails.email}
                    </p>
                  </div>
                )}
                {selectedApp.customerDetails?.dimensions && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Property Dimensions</p>
                    <p className="text-[13px] font-bold text-teal-700">{selectedApp.customerDetails.dimensions}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="text-[12px] font-bold text-gray-700">
                    {new Date(selectedApp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="text-[12px] font-black text-[#081326] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Uploaded Documents
                </h4>
                <div className="space-y-2.5">
                  <DocumentBox title="Property Papers" doc={selectedApp.documents?.propertyPapers} />
                  <DocumentBox title="PAN Card" doc={selectedApp.documents?.panCard} />
                  <DocumentBox title="Aadhaar Card" doc={selectedApp.documents?.aadhaarCard} />
                  <DocumentBox title="Electricity Bill" doc={selectedApp.documents?.electricityBill} />
                  <DocumentBox title="Owner Photograph" doc={selectedApp.documents?.ownerPhoto} />
                  <DocumentBox title="Property Photograph" doc={selectedApp.documents?.propertyPhoto} />
                  
                  {selectedApp.documents?.gpsPhotos?.length > 0 && (
                    <DocumentBox title="GPS Property Photos" doc={selectedApp.documents.gpsPhotos} />
                  )}
                  
                  {(!selectedApp.documents || Object.keys(selectedApp.documents).length === 0) && (
                     <p className="text-xs text-gray-400 italic">No documents uploaded.</p>
                  )}
                </div>
              </div>

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
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Update Remark</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="Internal notes..."
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

export default PropertyAssessments;
