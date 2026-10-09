import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserMinus, FileWarning, Search, Eye, X, RefreshCcw, Download, 
  CheckCircle, Trash2, Edit, AlertTriangle, History, Clock, Phone, Mail, FileText, 
  Briefcase, IndianRupee, FileCheck, AlertCircle, CheckCircle2, Upload, FileUp, Folder, UserPlus,
  Share2, Copy, Check, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import OverviewTab from '../components/client/OverviewTab';
import DocumentRepositoryTab from '../components/client/DocumentRepositoryTab';
import PendencyTab from '../components/client/PendencyTab';

const StatusBadge = ({ status, isDoc }) => {
  const styles = {
    Approved: "text-green-600 bg-green-50 border border-green-100",
    Rejected: "text-red-500 bg-red-50 border border-red-100",
    Pending: "text-orange-500 bg-orange-50 border border-orange-100",
  };
  const dotColor = {
    Approved: "bg-green-500",
    Rejected: "bg-red-500",
    Pending: "bg-orange-500"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      {!isDoc && dotColor[status] && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></span>}
      {status || 'Pending'}
    </span>
  );
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 0';
  return Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });
};

const calculateAge = (dobString) => {
  if (!dobString) return '';
  try {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '';
    const birthYear = dob.getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return age >= 0 ? age : '';
  } catch (e) {
    return '';
  }
};

const Clients = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Clients');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [previewTab, setPreviewTab] = useState('Overview');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Quick Edit Contact Info Modal State
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({ fullName: '', mobile: '', email: '' });
  const [updatingContact, setUpdatingContact] = useState(false);

  // Front Quick Add Documents Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingForClient, setUploadingForClient] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    docName: '',
    category: 'General Documents',
    notes: ''
  });
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Co-Applicant Modal State
  const [showCoApplicantModal, setShowCoApplicantModal] = useState(false);
  const [coApplicantClient, setCoApplicantClient] = useState(null);
  const [isSavingCoApplicant, setIsSavingCoApplicant] = useState(false);
  const [coApplicantError, setCoApplicantError] = useState('');
  const [coApplicantForm, setCoApplicantForm] = useState({
    fullName: '', mobile: '', occupation: '', panNumber: '',
    aadhaarNumber: '', motherName: '', addressLine1: '', city: '', state: '', pincode: ''
  });

  // Pendency Popup Modal State
  const [showPendencyModal, setShowPendencyModal] = useState(false);
  const [pendencyModalClient, setPendencyModalClient] = useState(null);
  const [copiedPendencyId, setCopiedPendencyId] = useState(null);

  const handleOpenPendencyModal = (client, e) => {
    if (e) e.stopPropagation();
    setPendencyModalClient(client);
    setShowPendencyModal(true);
  };

  const handleCopyPendencies = (client) => {
    const active = (client?.pendencies || []).filter(p => p.status !== 'Resolved');
    if (active.length === 0) {
      toast.error('No active pendency to copy');
      return;
    }
    const lines = active.map((p, i) => `${i + 1}. ${p.title}${p.description ? ` (${p.description})` : ''}`).join('\n');
    const text = `📋 Pending Requirements for: ${client?.fullName || 'Client'}\n\n${lines}\n\nPlease submit the required documents at earliest.\n- KTR Consultants`;
    navigator.clipboard.writeText(text);
    setCopiedPendencyId(client._id);
    toast.success('Pending list copied to clipboard!');
    setTimeout(() => setCopiedPendencyId(null), 3000);
  };

  const handleSharePendencies = (client) => {
    const active = (client?.pendencies || []).filter(p => p.status !== 'Resolved');
    if (active.length === 0) return;
    const lines = active.map((p, i) => `${i + 1}. ${p.title}${p.description ? ` (${p.description})` : ''}`).join('\n');
    const text = `📋 *Pending Requirements for:* ${client?.fullName || 'Client'}\n\n${lines}\n\nPlease submit at earliest.\n- KTR Consultants`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get(role === 'admin' ? '/clients' : '/clients/my-clients');
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [role]);

  const openPreview = async (client) => {
    try {
      const res = await api.get(`/clients/${client._id}`);
      if (res.data.success) {
        setSelectedClient(res.data.data);
      } else {
        setSelectedClient(client);
      }
    } catch (err) {
      console.error('Error fetching single client detail:', err);
      setSelectedClient(client);
    }
    setPreviewTab('Overview');
    setShowPreview(true);
  };

  const refreshSelectedClient = async () => {
    if (!selectedClient?._id) return;
    try {
      const res = await api.get(`/clients/${selectedClient._id}`);
      if (res.data.success) {
        setSelectedClient(res.data.data);
      }
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoading(true);
      const res = await api.patch(`/clients/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setSelectedClient(res.data.data);
        fetchClients();
      }
    } catch (error) {
      alert('Error updating status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const res = await api.delete(`/clients/${clientToDelete}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        setClientToDelete(null);
        fetchClients();
      }
    } catch (error) {
      alert('Error deleting client');
    }
  };

  const handleOpenEditContact = () => {
    if (!selectedClient) return;
    setContactFormData({
      fullName: selectedClient.fullName || '',
      mobile: selectedClient.mobile || '',
      email: selectedClient.email || '',
      panNumber: selectedClient.panNumber || selectedClient.pan || '',
      loanAmount: selectedClient.loanAmount || '',
      caseType: selectedClient.caseType || selectedClient.loanType || '',
      occupation: selectedClient.occupation || '',
      addressLine1: selectedClient.addressLine1 || selectedClient.address || '',
      notes: selectedClient.notes || selectedClient.caseNotes || '',
      status: selectedClient.status || 'Pending'
    });
    setShowEditContactModal(true);
  };

  const handleOpenUploadModal = (client, e) => {
    if (e) e.stopPropagation();
    setUploadingForClient(client);
    setUploadFormData({
      docName: '',
      category: 'General Documents',
      notes: ''
    });
    setSelectedUploadFiles([]);
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleOpenCoApplicantModal = (client, e) => {
    e?.stopPropagation();
    setCoApplicantClient(client);
    // Pre-fill if co-applicant already exists
    setCoApplicantForm({
      fullName: client.coApplicant?.fullName || '',
      mobile: client.coApplicant?.mobile || '',
      occupation: client.coApplicant?.occupation || '',
      panNumber: client.coApplicant?.panNumber || '',
      aadhaarNumber: client.coApplicant?.aadhaarNumber || '',
      motherName: client.coApplicant?.motherName || '',
      addressLine1: client.coApplicant?.addressLine1 || '',
      city: client.coApplicant?.city || '',
      state: client.coApplicant?.state || '',
      pincode: client.coApplicant?.pincode || ''
    });
    setCoApplicantError('');
    setShowCoApplicantModal(true);
  };

  const handleSaveCoApplicant = async (e) => {
    e.preventDefault();
    if (!coApplicantClient?._id) return;
    if (!coApplicantForm.fullName.trim() || !coApplicantForm.mobile.trim()) {
      setCoApplicantError('Co-applicant ka naam aur mobile number zaroori hai.');
      return;
    }
    try {
      setIsSavingCoApplicant(true);
      setCoApplicantError('');
      const res = await api.put(`/clients/${coApplicantClient._id}`, {
        hasCoApplicant: true,
        coApplicant: coApplicantForm
      });
      if (res.data.success) {
        setShowCoApplicantModal(false);
        setCoApplicantClient(null);
        fetchClients();
        if (selectedClient?._id === coApplicantClient._id) {
          refreshSelectedClient();
        }
      }
    } catch (err) {
      setCoApplicantError(err.response?.data?.message || 'Co-applicant save nahi ho saka.');
    } finally {
      setIsSavingCoApplicant(false);
    }
  };

  const handleUploadDocumentsSubmit = async (e) => {
    e.preventDefault();
    if (!uploadingForClient?._id) return;
    if (selectedUploadFiles.length === 0) {
      setUploadError('Please select at least one document file.');
      return;
    }
    if (!uploadFormData.docName.trim()) {
      setUploadError('Please specify a document name / title so it can be easily identified.');
      return;
    }

    // File size check — allow up to 1GB per file (1024MB)
    const MAX_FILE_MB = 1024;
    const oversized = selectedUploadFiles.filter(f => f.size > MAX_FILE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      const names = oversized.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`).join(', ');
      setUploadError(`File too large (max ${MAX_FILE_MB}MB each): ${names}. Please compress or split the file.`);
      return;
    }

    try {
      setIsUploadingDocs(true);
      setUploadProgress(0);
      setUploadError('');
      setUploadStatusText('Preparing files for upload...');

      // Upload files sequentially with progress tracking (supports 50-100+ files easily)
      const total = selectedUploadFiles.length;
      for (let i = 0; i < total; i++) {
        const file = selectedUploadFiles[i];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const fileNameTruncated = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;

        setUploadStatusText(`Uploading file ${i + 1} of ${total}: ${fileNameTruncated} (${fileSizeMB} MB)...`);

        const formData = new FormData();
        const baseName = uploadFormData.docName.trim();
        formData.append('docName', baseName);
        formData.append('documentName', baseName);
        formData.append('category', uploadFormData.category);
        if (uploadFormData.notes.trim()) {
          formData.append('notes', uploadFormData.notes.trim());
        }
        formData.append('files', file);

        await api.post(`/clients/${uploadingForClient._id}/documents`, formData, {
          timeout: 600000, // 10 minutes per file (for large 100MB-500MB+ files)
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const filePercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              const overallPercent = Math.round(((i * 100) + filePercent) / total);
              setUploadProgress(overallPercent);
              setUploadStatusText(`Uploading file ${i + 1} of ${total}: ${fileNameTruncated} (${fileSizeMB} MB) - ${filePercent}%`);
            }
          }
        });
      }

      setUploadStatusText('Upload completed successfully!');
      setShowUploadModal(false);
      setUploadingForClient(null);
      setSelectedUploadFiles([]);
      fetchClients();
      if (selectedClient?._id === uploadingForClient._id) {
        refreshSelectedClient();
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      let msg = 'Failed to upload documents.';
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        msg = 'Network Error: Server connection toot gaya ya Nginx body size limit (client_max_body_size) reach ho gaya. Server config me Nginx limit check karein.';
      } else if (err.code === 'ECONNABORTED') {
        msg = 'Upload timeout: File transfer me 10 minute se zyada samay laga. Network speed verify karein.';
      } else if (err.response?.status === 413) {
        msg = 'File Too Large (413): Web server ne badi file reject kar di. Server / Nginx client_max_body_size badhayein.';
      } else {
        msg = err.response?.data?.message || err.message || 'Failed to upload documents.';
      }
      setUploadError(msg);
    } finally {
      setIsUploadingDocs(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  const handleSaveContactInfo = async (e) => {
    e.preventDefault();
    if (!selectedClient?._id) return;

    try {
      setUpdatingContact(true);
      const res = await api.put(`/clients/${selectedClient._id}`, contactFormData);
      if (res.data.success) {
        setShowEditContactModal(false);
        fetchClients();
        refreshSelectedClient();
      }
    } catch (err) {
      console.error('Error updating client info:', err);
      alert('Failed to update contact info: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingContact(false);
    }
  };

  const tabs = ['All Clients', 'Approved Clients', 'Pending Clients', 'Rejected Clients'];

  // Filtering
  const filteredClients = clients.filter(c => {
    if (activeTab === 'Approved Clients') return c.status === 'Approved';
    if (activeTab === 'Pending Clients') return c.status === 'Pending';
    if (activeTab === 'Rejected Clients') return c.status === 'Rejected';
    return true;
  });

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      
      {/* Main Content Area */}
      <div className="flex flex-col space-y-6 transition-all duration-300 flex-1 min-w-0 w-full">
        
        {/* Stat Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Clients</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Approved</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Approved').length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                  <UserMinus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Pending</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Pending').length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                  <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Rejected</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Rejected').length}</h4>
              </div>
            </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col overflow-hidden">
          {/* Tabs & Top Actions */}
          <div className="border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-2 sm:px-4 gap-3 bg-gray-50/30">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab 
                    ? 'bg-white text-[#f59e0b] shadow-xs border border-gray-200' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button 
                onClick={() => navigate('/clients/new')}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-xs text-center cursor-pointer"
              >
                + Add Client
              </button>
              <button 
                onClick={() => fetchClients()}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Mobile Cards View (Visible on phones for easy tap & navigation) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-gray-500">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-gray-500">No client cases found.</div>
            ) : (
              filteredClients.map((client) => {
                const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');

                return (
                  <div 
                    key={client._id}
                    onClick={() => openPreview(client)}
                    className="p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors flex flex-col gap-3 cursor-pointer"
                  >
                    {/* Top Row: Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {client.photoUrl ? (
                          <img src={getAssetUrl(client.photoUrl)} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100 shrink-0" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {client.fullName ? client.fullName.substring(0, 2).toUpperCase() : 'CL'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-[#081326] truncate flex items-center gap-1.5 flex-wrap">
                            <span>{client.fullName}</span>
                            {(client.age || client.dob) && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                ({client.age || calculateAge(client.dob)} Yrs)
                              </span>
                            )}
                            {client.applicants && client.applicants.length > 1 && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {client.applicants.length} Applicants
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                          </h4>
                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                            {client.mobile || 'No Mobile'} • <span className="font-bold text-gray-700">{client.occupation || 'General'}</span>
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={client.status} isDoc={false} />
                    </div>

                    {/* Middle Row: Case Type + Loan Amount */}
                    <div className="flex items-center justify-between bg-gray-50/80 p-2.5 rounded-xl text-xs border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Case Type</span>
                        <span className="font-bold text-[#081326]">{client.caseType || client.loanType || 'General Loan'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Loan Amount</span>
                        <span className="font-black text-emerald-700">{formatCurrency(client.loanAmount)}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Pendency Badge + Quick Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {activePendencies.length === 0 ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> No Pendency
                        </span>
                      ) : activePendencies.length === 1 ? (
                        <button
                          onClick={(e) => handleOpenPendencyModal(client, e)}
                          className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 truncate max-w-[170px]"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{activePendencies[0].title}</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleOpenPendencyModal(client, e)}
                          className="text-[11px] font-black text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{activePendencies.length} Pending → View</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenUploadModal(client, e)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1"
                          title="Add Docs"
                        >
                          <FileUp className="w-3 h-3" /> Add Docs
                        </button>
                        <button
                          onClick={(e) => handleOpenCoApplicantModal(client, e)}
                          className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold"
                          title="Co-Applicant"
                        >
                          {client.coApplicant?.fullName ? 'Co-App ✓' : 'Co-App'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table: Hidden on small mobile screens */}
          <div className="hidden md:block overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Mobile No.</th>
                  <th className="px-5 py-4 whitespace-nowrap">Profession</th>
                  <th className="px-5 py-4 whitespace-nowrap">Loan Amount</th>
                  <th className="px-5 py-4 whitespace-nowrap">Case Type</th>
                  <th className="px-5 py-4 whitespace-nowrap">Current Pendency</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No client cases found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');

                    return (
                      <tr key={client._id} className="hover:bg-gray-50/80 transition-colors group">
                        {/* 1. Client Name (Clickable) */}
                        <td 
                          onClick={() => openPreview(client)}
                          className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap flex items-center gap-3 cursor-pointer hover:text-[#f59e0b] transition-colors"
                          title="Click to view complete client case details"
                        >
                          {client.photoUrl ? (
                            <img src={getAssetUrl(client.photoUrl)} className="w-8 h-8 rounded-full object-cover shadow-sm" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-[10px]">
                              {client.fullName ? client.fullName.substring(0,2).toUpperCase() : 'CL'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#081326] group-hover:underline">{client.fullName}</span>
                              {(client.age || client.dob) && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  ({client.age || calculateAge(client.dob)} Yrs)
                                </span>
                              )}
                              {client.applicants && client.applicants.length > 1 && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  {client.applicants.length} Applicants
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Mobile No. */}
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-gray-700">
                          {client.mobile || 'N/A'}
                        </td>

                        {/* 3. Profession */}
                        <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-700">
                          <span className="bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 text-xs font-semibold">
                            {client.occupation || 'N/A'}
                          </span>
                        </td>

                        {/* 4. Loan Amount */}
                        <td className="px-5 py-3.5 whitespace-nowrap font-bold text-emerald-700">
                          {formatCurrency(client.loanAmount)}
                        </td>

                        {/* 5. Case Type */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                            {client.caseType || client.loanType || 'General Loan'}
                          </span>
                        </td>

                        {/* 6. Current Pendency (Simplified + Clickable Popup) */}
                        <td className="px-5 py-3.5 min-w-[180px]">
                          {activePendencies.length === 0 ? (
                            <div className="flex items-center gap-1 text-green-700 bg-green-50/70 border border-green-100 px-2.5 py-1 rounded-md text-[11px] font-bold w-fit">
                              <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" /> No Pendency
                            </div>
                          ) : activePendencies.length === 1 ? (
                            <div 
                              onClick={(e) => handleOpenPendencyModal(client, e)}
                              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold w-fit cursor-pointer hover:bg-amber-100 transition-colors"
                              title="Click to view/share requirements"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{activePendencies[0].title}</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleOpenPendencyModal(client, e)}
                              className="flex items-center gap-1.5 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-lg text-xs font-black w-fit cursor-pointer transition-colors shadow-xs"
                              title="Click to view all requirements"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{activePendencies.length} Pending → View</span>
                            </button>
                          )}
                        </td>

                        {/* 7. Action: Add Docs + View + Edit/Delete */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button 
                              onClick={(e) => handleOpenUploadModal(client, e)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 flex items-center gap-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              title="Upload / Add Documents for this Client"
                            >
                              <FileUp className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add Docs</span>
                            </button>

                            <button 
                              onClick={(e) => handleOpenCoApplicantModal(client, e)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 hover:border-purple-600 flex items-center gap-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              title={client.coApplicant?.fullName ? `Co-Applicant: ${client.coApplicant.fullName}` : 'Add Co-Applicant'}
                            >
                              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{client.coApplicant?.fullName ? 'Co-App ✓' : 'Co-App'}</span>
                            </button>

                            <button 
                              onClick={() => openPreview(client)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                              title="Review Case"
                            >
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            {role === 'admin' && (
                              <>
                                <button 
                                  onClick={() => navigate(`/clients/edit/${client._id}`)}
                                  className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                                  title="Edit Profile"
                                >
                                  <Edit className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button 
                                  onClick={() => { setClientToDelete(client._id); setShowDeleteModal(true); }}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                        {/* 8. Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <StatusBadge status={client.status} isDoc={false} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer Modal */}
      {showPreview && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm transition-opacity"
            onClick={closePreview}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h2 className="text-base sm:text-lg font-black text-[#081326] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#f59e0b] stroke-[2.5]" /> Client Case Review
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/clients/${selectedClient._id}`)}
                  className="px-3.5 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-xs cursor-pointer"
                >
                  Full Page
                </button>
                <button 
                  onClick={closePreview} 
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Profile Info Header with Quick Edit Button */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-5 bg-white">
              {selectedClient.photoUrl ? (
                 <img src={getAssetUrl(selectedClient.photoUrl)} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white" />
              ) : (
                 <div className="w-20 h-20 rounded-full bg-[#081326] text-white flex items-center justify-center text-2xl font-black shadow-lg border-4 border-white">
                   {selectedClient.fullName ? selectedClient.fullName.substring(0, 2).toUpperCase() : 'CL'}
                 </div>
              )}
              
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#081326]">{selectedClient.fullName}</h2>
                  <StatusBadge status={selectedClient.status} isDoc={false} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-600 items-center">
                   <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1">
                     <Phone className="w-3.5 h-3.5 text-green-600" /> {selectedClient.mobile || 'No Mobile'}
                   </span>
                   <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1">
                     <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" /> {selectedClient.occupation || 'N/A'}
                   </span>
                   <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 flex items-center gap-1 text-emerald-700">
                     <IndianRupee className="w-3.5 h-3.5" /> {formatCurrency(selectedClient.loanAmount)}
                   </span>
                   <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                     <FileCheck className="w-3.5 h-3.5" /> {selectedClient.caseType || selectedClient.loanType || 'General Loan'}
                   </span>
                   <button 
                      onClick={handleOpenEditContact}
                      className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-black transition-colors cursor-pointer shadow-xs"
                      title="Edit Case Details (Loan Amount, Case Type, Name, Mobile, Status, etc.)"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-600" /> Edit Case Details
                    </button>
                </div>
              </div>
            </div>

            {/* Standardized 4 Tabs: Overview | Documents | Pendency | Edit History */}
            <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 bg-white overflow-x-auto scrollbar-hide">
               {['Overview', 'Documents', 'Pendency', 'Edit History'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      previewTab === tab 
                      ? 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/5 rounded-t-lg' 
                      : 'text-gray-400 border-transparent hover:text-[#081326]'
                    }`}
                  >
                    {tab}
                  </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
               {previewTab === 'Overview' && (
                  <OverviewTab client={selectedClient} onEditClick={handleOpenEditContact} />
               )}

               {previewTab === 'Documents' && (
                  <DocumentRepositoryTab client={selectedClient} onRefresh={refreshSelectedClient} />
               )}

               {previewTab === 'Pendency' && (
                  <PendencyTab client={selectedClient} onRefresh={refreshSelectedClient} />
               )}

               {previewTab === 'Edit History' && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                     <h4 className="text-xs font-black text-[#081326] uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                       <History className="w-4 h-4 text-blue-600" /> Edit Audit History Log
                     </h4>
                     {selectedClient.editHistory && selectedClient.editHistory.length > 0 ? (
                       <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                         {selectedClient.editHistory.slice().reverse().map((item, idx) => (
                           <div key={idx} className="relative group">
                             <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-bold text-[#081326]">{item.action}</span>
                                 <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                                 </span>
                               </div>
                               <p className="text-[11px] text-gray-600 font-medium mb-1">{item.details}</p>
                               <p className="text-[10px] text-gray-400 font-bold">
                                 Edited By: <span className="text-gray-700">{item.editorName || 'Staff/Admin'}</span> ({item.editorRole || 'staff'})
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-xs text-gray-400 text-center py-8 font-medium">
                         No edit history recorded yet for this client.
                       </p>
                     )}
                  </div>
               )}
            </div>
            
            {/* Action Footer (Admin Only) */}
            {role === 'admin' && (
              <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
                 {selectedClient.status !== 'Approved' && (
                    <button 
                      onClick={() => updateStatus(selectedClient._id, 'Approved')} 
                      disabled={statusLoading}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-black hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Approve Application
                    </button>
                 )}
                 {selectedClient.status !== 'Rejected' && (
                    <button 
                      onClick={() => updateStatus(selectedClient._id, 'Rejected')} 
                      disabled={statusLoading}
                      className="flex-1 py-3 border-2 border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-black hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" /> Reject
                    </button>
                 )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Client Info & Case Details Modal */}
      {showEditContactModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowEditContactModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#f59e0b]" /> Edit Client Case Details
              </h3>
              <button onClick={() => setShowEditContactModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={contactFormData.fullName}
                    onChange={(e) => setContactFormData({ ...contactFormData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={contactFormData.mobile}
                    onChange={(e) => setContactFormData({ ...contactFormData, mobile: e.target.value })}
                    required
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    placeholder="Client email address"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PAN Number</label>
                  <input 
                    type="text" 
                    value={contactFormData.panNumber}
                    onChange={(e) => setContactFormData({ ...contactFormData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">Required Loan Amount (₹)</label>
                  <input 
                    type="number" 
                    value={contactFormData.loanAmount}
                    onChange={(e) => setContactFormData({ ...contactFormData, loanAmount: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 text-xs border border-emerald-200 bg-emerald-50/40 rounded-lg outline-none focus:border-emerald-500 font-bold text-emerald-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Case Type / Service</label>
                  <input 
                    type="text" 
                    value={contactFormData.caseType}
                    onChange={(e) => setContactFormData({ ...contactFormData, caseType: e.target.value })}
                    placeholder="e.g. Fake Loan Removal, Property Legal, MSME Loan"
                    className="w-full px-3 py-2 text-xs border border-blue-200 bg-blue-50/40 rounded-lg outline-none focus:border-blue-500 font-bold text-blue-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Occupation / Profession</label>
                  <input 
                    type="text" 
                    value={contactFormData.occupation}
                    onChange={(e) => setContactFormData({ ...contactFormData, occupation: e.target.value })}
                    placeholder="e.g. Salaried, Businessman, Professional"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Case Status</label>
                  <select 
                    value={contactFormData.status}
                    onChange={(e) => setContactFormData({ ...contactFormData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-bold cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  value={contactFormData.addressLine1}
                  onChange={(e) => setContactFormData({ ...contactFormData, addressLine1: e.target.value })}
                  placeholder="Client full street address"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Case Notes / Remarks</label>
                <textarea 
                  rows={3}
                  value={contactFormData.notes || ''}
                  onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value, caseNotes: e.target.value })}
                  placeholder="Important details about the case for easy understanding..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium resize-y"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditContactModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingContact}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {updatingContact ? 'Saving Changes...' : 'Save Case Details'}
                </button>
              </div>
            </form>
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
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Client?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete this client? This action cannot be undone and all associated records will be removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClient}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-200 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Documents Modal on Front Page */}
      {showUploadModal && uploadingForClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-[#f59e0b]" /> Add Documents
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Client: <span className="text-[#081326] font-bold">{uploadingForClient.fullName}</span> ({uploadingForClient.mobile})
                </p>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Form - Simple Document Upload (Only Name + Files) */}
            <form onSubmit={handleUploadDocumentsSubmit} className="space-y-4 pt-4">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                  {uploadError}
                </div>
              )}

              {/* 1. Document Name / Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Name / Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. 6 Months Bank Statement, Registry Copy, 2024 ITR, etc."
                  value={uploadFormData.docName}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, docName: e.target.value })}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-[#f59e0b] focus:bg-white"
                />
              </div>

              {/* 2. Notes / Remarks / Credentials (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Notes / Remarks / Password <span className="text-gray-400 font-normal">(Optional - can be copied later)</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Password: KTR@2026, Netbanking User ID, Registry Book No. 4"
                  value={uploadFormData.notes || ''}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-[#f59e0b] focus:bg-white"
                />
              </div>

              {/* 3. Select Files (Multiple allowed) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select File(s) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 hover:border-[#f59e0b] rounded-xl p-5 text-center bg-gray-50/50 transition-colors">
                  <input 
                    type="file" 
                    id="front-doc-multi-file-input"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedUploadFiles(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <label 
                    htmlFor="front-doc-multi-file-input"
                    className="cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Upload className="w-8 h-8 text-[#f59e0b]" />
                    <span className="text-xs font-bold text-[#081326]">
                      Click to choose files from device
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Supports PDFs, Images (JPG, PNG), Excel, Word docs (Multiple files allowed)
                    </span>
                  </label>
                </div>

                {selectedUploadFiles.length > 0 && (
                  <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-900 mb-1.5">
                      Selected {selectedUploadFiles.length} file{selectedUploadFiles.length > 1 ? 's' : ''}:
                    </p>
                    <ul className="space-y-1 max-h-32 overflow-y-auto text-[11px] text-gray-700 font-medium pr-1">
                      {selectedUploadFiles.map((file, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-amber-100">
                          <span className="truncate max-w-[280px] font-bold text-[#081326]">{file.name}</span>
                          <span className="text-gray-400 shrink-0 ml-2 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {isUploadingDocs && (
                <div className="pt-2 pb-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold text-[#081326] truncate max-w-[340px]">
                      {uploadStatusText || (selectedUploadFiles.length > 1
                        ? `Uploading files (${uploadProgress}%)...`
                        : 'Uploading file...'
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-[#f59e0b] shrink-0 ml-2">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {uploadProgress < 100 ? 'Please wait, do not close this window while files are uploading...' : 'Saving to server database...'}
                  </p>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploadingDocs}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploadingDocs || selectedUploadFiles.length === 0}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isUploadingDocs
                    ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        {uploadProgress < 100 ? `${uploadProgress}% Uploading...` : 'Saving...'}
                      </span>
                    )
                    : `Upload ${selectedUploadFiles.length > 0 ? selectedUploadFiles.length + ' File(s)' : 'Documents'}`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Co-Applicant Modal */}
      {showCoApplicantModal && coApplicantClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowCoApplicantModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#081326]">
                    {coApplicantClient.coApplicant?.fullName ? 'Edit Co-Applicant' : 'Add Co-Applicant'}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">Client: {coApplicantClient.fullName} ({coApplicantClient.mobile})</p>
                </div>
              </div>
              <button onClick={() => setShowCoApplicantModal(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveCoApplicant} className="p-6 space-y-4">
              {coApplicantError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">{coApplicantError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={coApplicantForm.fullName} onChange={e => setCoApplicantForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Co-applicant ka poora naam" required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile <span className="text-red-500">*</span></label>
                  <input type="tel" value={coApplicantForm.mobile} onChange={e => setCoApplicantForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10 digit number" maxLength={10} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Occupation</label>
                  <input type="text" value={coApplicantForm.occupation} onChange={e => setCoApplicantForm(p => ({ ...p, occupation: e.target.value }))} placeholder="e.g. Salaried, Business" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mother's Name</label>
                  <input type="text" value={coApplicantForm.motherName} onChange={e => setCoApplicantForm(p => ({ ...p, motherName: e.target.value }))} placeholder="Mother ka naam" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PAN Number</label>
                  <input type="text" value={coApplicantForm.panNumber} onChange={e => setCoApplicantForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Aadhaar Number</label>
                  <input type="text" value={coApplicantForm.aadhaarNumber} onChange={e => setCoApplicantForm(p => ({ ...p, aadhaarNumber: e.target.value }))} placeholder="12 digit Aadhaar" maxLength={12} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                  <input type="text" value={coApplicantForm.addressLine1} onChange={e => setCoApplicantForm(p => ({ ...p, addressLine1: e.target.value }))} placeholder="Ghar/flat, colony, street" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input type="text" value={coApplicantForm.city} onChange={e => setCoApplicantForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input type="text" value={coApplicantForm.state} onChange={e => setCoApplicantForm(p => ({ ...p, state: e.target.value }))} placeholder="State" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input type="text" value={coApplicantForm.pincode} onChange={e => setCoApplicantForm(p => ({ ...p, pincode: e.target.value }))} placeholder="6 digit pincode" maxLength={6} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-400 focus:bg-white transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowCoApplicantModal(false)} disabled={isSavingCoApplicant} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer disabled:opacity-40">Cancel</button>
                <button type="submit" disabled={isSavingCoApplicant} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {isSavingCoApplicant ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      {coApplicantClient.coApplicant?.fullName ? 'Update Co-Applicant' : 'Save Co-Applicant'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Pendency Details Popup Modal with Copy & Share */}
      {showPendencyModal && pendencyModalClient && (() => {
        const active = (pendencyModalClient.pendencies || []).filter(p => p.status !== 'Resolved');
        const resolved = (pendencyModalClient.pendencies || []).filter(p => p.status === 'Resolved');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Pending Case Requirements
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">
                    Client: <span className="text-[#081326]">{pendencyModalClient.fullName}</span> ({pendencyModalClient.mobile || 'No Mobile'})
                  </p>
                </div>
                <button 
                  onClick={() => { setShowPendencyModal(false); setPendencyModalClient(null); }} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Requirements List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                  Pending Items ({active.length}):
                </h4>
                {active.length === 0 ? (
                  <div className="p-3 bg-green-50 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>No pending requirements. All items cleared!</span>
                  </div>
                ) : (
                  active.map((p, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-black text-amber-950">{p.title}</p>
                        {p.description && <p className="text-[11px] text-amber-800 font-medium mt-0.5">{p.description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Received / Resolved Section Below */}
              {resolved.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <h4 className="text-[10px] font-black text-green-800 uppercase tracking-wider">
                    Received / Resolved Items ({resolved.length}):
                  </h4>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {resolved.map((r, idx) => (
                      <div key={idx} className="p-2 bg-green-50/60 border border-green-100 rounded-lg flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span className="text-green-950 font-bold truncate">{r.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Copy, Share, View Case */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleCopyPendencies(pendencyModalClient)}
                  disabled={active.length === 0}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {copiedPendencyId === pendencyModalClient._id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPendencyId === pendencyModalClient._id ? 'Copied!' : 'Copy List'}</span>
                </button>

                <button
                  onClick={() => handleSharePendencies(pendencyModalClient)}
                  disabled={active.length === 0}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setShowPendencyModal(false);
                    openPreview(pendencyModalClient);
                  }}
                  className="py-2.5 px-4 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#f59e0b]" />
                  <span>Open Case</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Clients;
