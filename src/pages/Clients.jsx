import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserMinus, FileWarning, Search, Eye, EyeOff, X, RefreshCcw, Download, 
  CheckCircle, Trash2, Edit, Edit3, AlertTriangle, History, Clock, Phone, Mail, FileText, 
  Briefcase, IndianRupee, FileCheck, AlertCircle, CheckCircle2, Upload, FileUp, Folder, UserPlus,
  Share2, Copy, Check, ChevronDown, ChevronUp, ArrowRight, Lock, Plus, Tag, Calendar, CreditCard, ShieldCheck,
  GripVertical, ArrowUp, ArrowDown, Archive, BarChart2, StickyNote, MoreVertical, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import OverviewTab from '../components/client/OverviewTab';
import DocumentRepositoryTab from '../components/client/DocumentRepositoryTab';
import PendencyTab from '../components/client/PendencyTab';
import RichTextEditor from '../components/common/RichTextEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const CASE_STATUS_OPTIONS = [
  'Documents Pending',
  'Bank Side Pending',
  'Client Side Pending',
  'Case Sanctioned',
  'Disbursement Pendency',
  'Case Disbursed'
];

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Documents Pending':
      return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'Bank Side Pending':
      return 'text-indigo-800 bg-indigo-50 border-indigo-200';
    case 'Client Side Pending':
      return 'text-sky-800 bg-sky-50 border-sky-200';
    case 'Case Sanctioned':
      return 'text-teal-800 bg-teal-50 border-teal-200';
    case 'Disbursement Pendency':
      return 'text-rose-800 bg-rose-50 border-rose-200';
    case 'Case Disbursed':
      return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    case 'Approved':
      return 'text-green-800 bg-green-50 border-green-200';
    case 'Rejected':
      return 'text-red-800 bg-red-50 border-red-200';
    case 'Pending':
      return 'text-orange-800 bg-orange-50 border-orange-200';
    default:
      // Custom Staff Status style: prominent purple badge with clean border
      return 'text-purple-900 bg-purple-50 border-purple-300 shadow-2xs';
  }
};

export const getStatusDotColor = (status) => {
  switch (status) {
    case 'Documents Pending':
      return 'bg-amber-500';
    case 'Bank Side Pending':
      return 'bg-indigo-500';
    case 'Client Side Pending':
      return 'bg-sky-500';
    case 'Case Sanctioned':
      return 'bg-teal-500';
    case 'Disbursement Pendency':
      return 'bg-rose-500';
    case 'Case Disbursed':
      return 'bg-emerald-500';
    case 'Approved':
      return 'bg-green-500';
    case 'Rejected':
      return 'bg-red-500';
    case 'Pending':
      return 'bg-orange-500';
    default:
      return 'bg-purple-600';
  }
};

const StatusBadge = ({ status, isDoc }) => {
  const currentStatus = status || 'Documents Pending';
  return (
    <span className={`${getStatusBadgeStyle(currentStatus)} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px] border`}>
      {!isDoc && <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(currentStatus)}`}></span>}
      {currentStatus}
    </span>
  );
};

export const StatusSelectDropdown = ({ client, onChange, isUpdating, className = '' }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const currentStatus = client?.status || 'Documents Pending';
  const isCustom = !CASE_STATUS_OPTIONS.includes(currentStatus);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setCustomInput(isCustom ? currentStatus : '');
      setShowCustomModal(true);
    } else {
      onChange(client._id, val);
    }
  };

  const handleSaveCustom = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = customInput.trim();
    if (!trimmed) {
      toast.error('Please enter a custom status');
      return;
    }
    onChange(client._id, trimmed);
    setShowCustomModal(false);
  };

  const QUICK_SUGGESTIONS = [
    'Login in Bank',
    'Valuation in Progress',
    'Legal Search Pending',
    'Credit Query Awaited',
    'Sanction Letter Awaited',
    'Disbursement in Progress',
    'Cheque Handover Pending'
  ];

  return (
    <>
      <div className={`relative inline-block text-left ${className}`} onClick={(e) => e.stopPropagation()}>
        <select
          value={isCustom ? '__current_custom__' : currentStatus}
          onChange={handleSelectChange}
          disabled={isUpdating}
          title="Click to select or write custom status"
          className={`appearance-none text-[11px] font-bold px-2.5 py-1.5 pr-6 rounded-lg border cursor-pointer outline-none transition-all shadow-xs ${getStatusBadgeStyle(currentStatus)} ${isUpdating ? 'opacity-50 pointer-events-none' : 'hover:brightness-95'}`}
        >
          {/* Active Custom Status */}
          {isCustom && (
            <option value="__current_custom__" className="bg-purple-50 text-purple-950 font-black">
              ★ {currentStatus} (Custom)
            </option>
          )}

          {/* Predefined Standard Options */}
          {CASE_STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-gray-800 font-bold">
              {opt}
            </option>
          ))}

          {/* Option for Staff to Type Custom Status */}
          <option value="__custom__" className="bg-amber-100 text-amber-950 font-black">
            ✏️ + Custom Status (Write your own)...
          </option>
        </select>
        <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Modal Dialog for Writing Custom Status */}
      {showCustomModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowCustomModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-5 sm:p-6 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#081326]">Write Custom Status</h3>
                  <p className="text-[11px] text-gray-500 font-medium truncate max-w-[240px]">
                    {client?.fullName || 'Client Case'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Custom Status Text
                </label>
                <input
                  type="text"
                  autoFocus
                  maxLength={60}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. Login in HDFC / Valuation Pending"
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-[#081326] bg-gray-50 focus:bg-white border border-gray-200 focus:border-purple-600 rounded-xl outline-none transition-all shadow-2xs"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Enter the exact status for this client</span>
                  <span>{customInput.length}/60</span>
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Quick Suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCustomInput(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        customInput === s
                          ? 'bg-purple-100 text-purple-950 border-purple-400 shadow-2xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
  const [activeTab, setActiveTab] = useState('Active Clients');
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedClientId, setDraggedClientId] = useState(null);
  const [dragOverClientId, setDragOverClientId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [previewTab, setPreviewTab] = useState('Overview');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // Quick Edit Contact Info Modal State
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({ fullName: '', mobile: '', email: '' });
  const [editCustomFields, setEditCustomFields] = useState([]);
  const [editNewFieldName, setEditNewFieldName] = useState('');
  const [editNewFieldValue, setEditNewFieldValue] = useState('');
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
  const uploadFileInputRef = useRef(null);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Multi-Applicant & Co-Borrower Modal State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicantsModalClient, setApplicantsModalClient] = useState(null);
  const [modalApplicantsList, setModalApplicantsList] = useState([]);
  const [isSavingApplicants, setIsSavingApplicants] = useState(false);
  const [applicantsModalError, setApplicantsModalError] = useState('');

  // Pendency Popup Modal State
  const [showPendencyModal, setShowPendencyModal] = useState(false);
  const [pendencyModalClient, setPendencyModalClient] = useState(null);
  const [copiedPendencyId, setCopiedPendencyId] = useState(null);

  // Close 3-dot dropdown menu on outside click
  useEffect(() => {
    const handleCloseMenu = () => setOpenActionMenuId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  // Phone back button closes open drawer / modals first
  useEffect(() => {
    const handlePopState = () => {
      if (showPreview) {
        setShowPreview(false);
      } else if (showUploadModal) {
        setShowUploadModal(false);
      } else if (showDeleteModal) {
        setShowDeleteModal(false);
      } else if (showEditContactModal) {
        setShowEditContactModal(false);
      } else if (showApplicantsModal) {
        setShowApplicantsModal(false);
      } else if (showPendencyModal) {
        setShowPendencyModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showPreview, showUploadModal, showDeleteModal, showEditContactModal, showApplicantsModal, showPendencyModal]);

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
    const text = `📁 KTR Consultants – Pending Requirements\n\nClient: ${client?.fullName || 'Client'}\n\nRequired Items:\n${lines}\n\nPlease submit the required documents at earliest.`;
    navigator.clipboard.writeText(text);
    setCopiedPendencyId(client._id);
    toast.success('Pending list copied to clipboard!');
    setTimeout(() => setCopiedPendencyId(null), 3000);
  };

  const handleSharePendencies = (client) => {
    const active = (client?.pendencies || []).filter(p => p.status !== 'Resolved');
    if (active.length === 0) return;
    const lines = active.map((p, i) => `${i + 1}. ${p.title}${p.description ? ` (${p.description})` : ''}`).join('\n');
    const text = `📁 KTR Consultants – Pending Requirements\n\nClient: ${client?.fullName || 'Client'}\n\nRequired Items:\n${lines}\n\nPlease submit the required documents at earliest.`;
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
      setStatusUpdatingId(id);
      const res = await api.patch(`/clients/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setClients(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        if (selectedClient && selectedClient._id === id) {
          setSelectedClient(prev => ({ ...prev, status: newStatus }));
        }
        toast.success(`Case status updated to "${newStatus}"`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update case status');
    } finally {
      setStatusLoading(false);
      setStatusUpdatingId(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus(id, newStatus);
  };

  const handleToggleHide = async (clientId, targetHidden) => {
    try {
      const res = await api.patch(`/clients/${clientId}/toggle-hide`, { isHidden: targetHidden });
      if (res.data.success) {
        setClients(prev => prev.map(c => c._id === clientId ? { ...c, isHidden: targetHidden } : c));
        if (selectedClient && selectedClient._id === clientId) {
          setSelectedClient(prev => ({ ...prev, isHidden: targetHidden }));
        }
        toast.success(targetHidden ? 'Client hidden from active list' : 'Client unhidden and restored to active list');
      }
    } catch (error) {
      console.error('Error toggling hide client:', error);
      toast.error('Failed to update client visibility');
    }
  };

  const handleReorder = async (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const currentFiltered = [...filteredClients];
    const srcIdx = currentFiltered.findIndex(c => c._id === sourceId);
    const tgtIdx = currentFiltered.findIndex(c => c._id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    // Move source item to target position in filtered list
    const [movedItem] = currentFiltered.splice(srcIdx, 1);
    currentFiltered.splice(tgtIdx, 0, movedItem);

    // Reconstruct full clients list preserving order of filtered items
    const filteredSet = new Set(currentFiltered.map(c => c._id));
    const nextClients = [];
    let fIdx = 0;
    for (const c of clients) {
      if (filteredSet.has(c._id)) {
        nextClients.push(currentFiltered[fIdx++]);
      } else {
        nextClients.push(c);
      }
    }

    setClients(nextClients);

    try {
      const orderedIds = nextClients.map(c => c._id);
      await api.post('/clients/reorder', { orderedIds });
      toast.success('Custom client order saved', { id: 'client-order-toast', duration: 1500 });
    } catch (err) {
      console.error('Failed to save client order:', err);
      toast.error('Failed to save client order');
      fetchClients();
    }
  };

  const handleMoveStep = (clientId, direction) => {
    const idx = filteredClients.findIndex(c => c._id === clientId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= filteredClients.length) return;
    handleReorder(clientId, filteredClients[targetIdx]._id);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    const clientId = typeof clientToDelete === 'object' ? clientToDelete._id : clientToDelete;
    const clientName = typeof clientToDelete === 'object' ? (clientToDelete.fullName || 'Client') : 'Client';

    try {
      setIsDeleting(true);
      const res = await api.delete(`/clients/${clientId}`, {
        data: { reason: deleteReason.trim() || 'Deleted via Staff Portal' }
      });
      if (res.data.success) {
        toast.success(`Client "${clientName}" removed from active list. All data securely backed up for Super Admin.`);
        setShowDeleteModal(false);
        setClientToDelete(null);
        setDeleteReason('');
        if (selectedClient && selectedClient._id === clientId) {
          setShowPreview(false);
          setSelectedClient(null);
        }
        fetchClients();
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.message || 'Error deleting client');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditContact = () => {
    if (!selectedClient) return;
    const primaryApp = selectedClient.applicants?.[0];
    setContactFormData({
      fullName: primaryApp?.fullName || selectedClient.fullName || '',
      dob: primaryApp?.dob ? primaryApp.dob.split('T')[0] : (selectedClient.dob ? selectedClient.dob.split('T')[0] : ''),
      occupation: primaryApp?.occupation || selectedClient.occupation || '',
      loanAmount: selectedClient.loanAmount || '',
      caseType: selectedClient.caseType || selectedClient.loanType || '',
      panNumber: primaryApp?.panNumber || selectedClient.panNumber || selectedClient.pan || '',
      aadhaarNumber: primaryApp?.aadhaarNumber || selectedClient.aadhaarNumber || '',
      mobile: primaryApp?.mobile || selectedClient.mobile || '',
      email: primaryApp?.email || selectedClient.email || '',
      addressLine1: selectedClient.addressLine1 || selectedClient.address || '',
      notes: selectedClient.notes || selectedClient.caseNotes || '',
      caseNotes: selectedClient.caseNotes || selectedClient.notes || '',
      internalNotes: selectedClient.internalNotes || '',
      status: selectedClient.status || 'Pending'
    });
    setEditCustomFields(
      selectedClient.customFields && Array.isArray(selectedClient.customFields)
        ? selectedClient.customFields.map(cf => ({ fieldName: cf.fieldName || '', fieldValue: cf.fieldValue || '' }))
        : []
    );
    setEditNewFieldName('');
    setEditNewFieldValue('');
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

  const handleDocMultiFileSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    setSelectedUploadFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}_${f.size}_${f.lastModified}`));
      const fresh = incoming.filter(f => !existing.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...fresh];
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDocMultiFileDrop = (e) => {
    e.preventDefault();
    const incoming = Array.from(e.dataTransfer.files || []);
    if (incoming.length === 0) return;

    setSelectedUploadFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}_${f.size}_${f.lastModified}`));
      const fresh = incoming.filter(f => !existing.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...fresh];
    });
  };

  const handleRemoveSelectedUploadFile = (idx) => {
    setSelectedUploadFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOpenApplicantsModal = (client, e) => {
    e?.stopPropagation();
    setApplicantsModalClient(client);
    setApplicantsModalError('');

    let apps = [];
    if (client.applicants && client.applicants.length > 0) {
      apps = client.applicants.map((a, idx) => ({
        fullName: a.fullName || (idx === 0 ? client.fullName || '' : ''),
        dob: a.dob ? a.dob.split('T')[0] : (idx === 0 && client.dob ? client.dob.split('T')[0] : ''),
        occupation: a.occupation || (idx === 0 ? client.occupation || '' : ''),
        mobile: a.mobile || (idx === 0 ? client.mobile || '' : ''),
        panNumber: a.panNumber || (idx === 0 ? client.panNumber || '' : ''),
        aadhaarNumber: a.aadhaarNumber || (idx === 0 ? client.aadhaarNumber || '' : ''),
        relationship: a.relationship || (idx === 0 ? 'Primary Applicant' : `Co-Applicant ${idx}`),
        customFields: a.customFields && Array.isArray(a.customFields)
          ? a.customFields.map(cf => ({ fieldName: cf.fieldName || '', fieldValue: cf.fieldValue || '' }))
          : []
      }));
    } else {
      // Primary applicant from root
      apps.push({
        fullName: client.fullName || '',
        dob: client.dob ? client.dob.split('T')[0] : '',
        occupation: client.occupation || '',
        mobile: client.mobile || '',
        panNumber: client.panNumber || '',
        aadhaarNumber: client.aadhaarNumber || '',
        relationship: 'Primary Applicant',
        customFields: client.customFields && Array.isArray(client.customFields)
          ? client.customFields.map(cf => ({ fieldName: cf.fieldName || '', fieldValue: cf.fieldValue || '' }))
          : []
      });

      // Legacy co-applicant if any
      if (client.hasCoApplicant && client.coApplicant && client.coApplicant.fullName) {
        apps.push({
          fullName: client.coApplicant.fullName || '',
          dob: client.coApplicant.dob ? client.coApplicant.dob.split('T')[0] : '',
          occupation: client.coApplicant.occupation || '',
          mobile: client.coApplicant.mobile || '',
          panNumber: client.coApplicant.panNumber || '',
          aadhaarNumber: client.coApplicant.aadhaarNumber || '',
          relationship: client.coApplicant.relationship || 'Co-Applicant 1',
          customFields: client.coApplicant.customFields && Array.isArray(client.coApplicant.customFields)
            ? client.coApplicant.customFields.map(cf => ({ fieldName: cf.fieldName || '', fieldValue: cf.fieldValue || '' }))
            : []
        });
      }
    }

    setModalApplicantsList(apps);
    setShowApplicantsModal(true);
  };

  const handleOpenCoApplicantModal = handleOpenApplicantsModal;

  const handleModalAddApplicant = (role = 'Co-Applicant') => {
    setModalApplicantsList(prev => [
      ...prev,
      {
        fullName: '',
        dob: '',
        occupation: '',
        mobile: '',
        panNumber: '',
        aadhaarNumber: '',
        relationship: `${role} ${prev.length}`,
        customFields: []
      }
    ]);
  };

  const handleModalRemoveApplicant = (idx) => {
    if (idx === 0) {
      alert('Primary applicant cannot be removed. You can edit their details.');
      return;
    }
    setModalApplicantsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleModalApplicantChange = (idx, field, value) => {
    setModalApplicantsList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleModalAddCustomField = (appIdx, fieldName, fieldValue) => {
    if (!fieldName.trim()) return;
    setModalApplicantsList(prev => {
      const updated = [...prev];
      const curFields = updated[appIdx].customFields || [];
      updated[appIdx] = {
        ...updated[appIdx],
        customFields: [...curFields, { fieldName: fieldName.trim(), fieldValue: fieldValue.trim() }]
      };
      return updated;
    });
  };

  const handleModalRemoveCustomField = (appIdx, fieldIdx) => {
    setModalApplicantsList(prev => {
      const updated = [...prev];
      const curFields = updated[appIdx].customFields || [];
      updated[appIdx] = {
        ...updated[appIdx],
        customFields: curFields.filter((_, i) => i !== fieldIdx)
      };
      return updated;
    });
  };

  const handleSaveModalApplicants = async (e) => {
    e.preventDefault();
    if (!applicantsModalClient?._id) return;
    if (modalApplicantsList.length === 0 || !modalApplicantsList[0].fullName.trim()) {
      setApplicantsModalError('Primary applicant full name is required.');
      return;
    }

    try {
      setIsSavingApplicants(true);
      setApplicantsModalError('');

      const processedApplicants = modalApplicantsList.map((app, idx) => {
        const appDob = app.dob ? new Date(app.dob) : undefined;
        return {
          fullName: app.fullName.trim(),
          dob: appDob,
          age: appDob ? calculateAge(appDob) : null,
          occupation: (app.occupation || 'Salaried').trim(),
          mobile: (app.mobile || '').trim(),
          panNumber: (app.panNumber || '').trim().toUpperCase(),
          aadhaarNumber: (app.aadhaarNumber || '').trim(),
          relationship: (app.relationship || (idx === 0 ? 'Primary Applicant' : `Co-Applicant ${idx}`)).trim(),
          customFields: app.customFields || []
        };
      });

      const res = await api.put(`/clients/${applicantsModalClient._id}`, {
        applicants: processedApplicants,
        fullName: processedApplicants[0].fullName,
        mobile: processedApplicants[0].mobile || applicantsModalClient.mobile,
        occupation: processedApplicants[0].occupation || applicantsModalClient.occupation,
        panNumber: processedApplicants[0].panNumber || applicantsModalClient.panNumber,
        aadhaarNumber: processedApplicants[0].aadhaarNumber || applicantsModalClient.aadhaarNumber,
        dob: processedApplicants[0].dob || applicantsModalClient.dob
      });

      if (res.data.success) {
        toast.success('Applicant and co-applicant details updated successfully!');
        setShowApplicantsModal(false);
        setApplicantsModalClient(null);
        fetchClients();
        if (selectedClient?._id === applicantsModalClient._id) {
          refreshSelectedClient();
        }
      }
    } catch (err) {
      setApplicantsModalError(err.response?.data?.message || 'Failed to save applicants.');
    } finally {
      setIsSavingApplicants(false);
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
      const res = await api.put(`/clients/${selectedClient._id}`, {
        ...contactFormData,
        customFields: editCustomFields
      });
      if (res.data.success) {
        setShowEditContactModal(false);
        if (res.data.data) {
          setSelectedClient(res.data.data);
        }
        toast.success('Case details updated successfully!');
        fetchClients();
        refreshSelectedClient();
      }
    } catch (err) {
      console.error('Error updating client info:', err);
      toast.error('Failed to update case info: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingContact(false);
    }
  };

  const tabs = [
    { id: 'Active Clients', label: 'Active Clients', count: clients.filter(c => !c.isHidden).length },
    { id: 'Hidden Clients', label: 'Hidden Clients', count: clients.filter(c => !!c.isHidden).length },
    { id: 'All Clients', label: 'All Clients', count: clients.length }
  ];

  // Filtering
  const filteredClients = clients.filter(c => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.fullName || '').toLowerCase().includes(q);
      const matchMobile = (c.mobile || '').includes(q);
      const matchStatus = (c.status || '').toLowerCase().includes(q);
      const matchCase = (c.caseType || c.loanType || '').toLowerCase().includes(q);
      if (!matchName && !matchMobile && !matchStatus && !matchCase) {
        return false;
      }
    }

    if (activeTab === 'Active Clients') return !c.isHidden;
    if (activeTab === 'Hidden Clients') return !!c.isHidden;
    if (activeTab === 'All Clients') return true;
    return true;
  });

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      
      {/* Main Content Area */}
      <div className="flex flex-col space-y-6 transition-all duration-300 flex-1 min-w-0 w-full">
        
        {/* Collapsible Client Statistics Bar (Compact on Mobile & Desktop) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200/60">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-xs font-black text-[#081326]">Client Statistics</span>
                <span className="text-[11px] text-gray-500 font-semibold ml-2">
                  ({clients.filter(c => !c.isHidden).length} Active • {clients.filter(c => ['Case Sanctioned', 'Case Disbursed', 'Approved'].includes(c.status)).length} Sanctioned)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-[11px] font-bold text-gray-500 hidden xs:inline">
                {showStats ? 'Hide Stats' : 'View Stats'}
              </span>
              <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          </button>

          {/* Collapsible Statistics Grid */}
          {showStats && (
            <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {/* Total Clients */}
                <div 
                  onClick={() => setActiveTab('All Clients')}
                  className={`p-2.5 bg-white rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'All Clients' ? 'border-[#081326] ring-1 ring-[#081326]' : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                    <Users className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="text-base font-black text-[#081326]">{clients.length}</div>
                </div>

                {/* Active Clients */}
                <div 
                  onClick={() => setActiveTab('Active Clients')}
                  className={`p-2.5 bg-white rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'Active Clients' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Active</span>
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="text-base font-black text-emerald-700">
                    {clients.filter(c => !c.isHidden).length}
                  </div>
                </div>

                {/* Sanctioned / Disbursed */}
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Sanctioned</span>
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="text-base font-black text-emerald-700">
                    {clients.filter(c => ['Case Sanctioned', 'Case Disbursed', 'Approved'].includes(c.status)).length}
                  </div>
                </div>

                {/* Pending Cases */}
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Pending</span>
                    <Clock className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="text-base font-black text-amber-800">
                    {clients.filter(c => ['Documents Pending', 'Bank Side Pending', 'Client Side Pending', 'Disbursement Pendency', 'Pending'].includes(c.status)).length}
                  </div>
                </div>

                {/* Rejected Cases */}
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-red-700 uppercase">Rejected</span>
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="text-base font-black text-red-700">
                    {clients.filter(c => c.status === 'Rejected').length}
                  </div>
                </div>

                {/* Hidden Clients */}
                <div 
                  onClick={() => setActiveTab('Hidden Clients')}
                  className={`p-2.5 bg-white rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'Hidden Clients' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-gray-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Hidden</span>
                    <EyeOff className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="text-base font-black text-gray-700">
                    {clients.filter(c => !!c.isHidden).length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col overflow-hidden">
          {/* Tabs & Top Actions */}
          <div className="border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center p-2.5 sm:px-4 gap-3 bg-gray-50/40">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id 
                    ? 'bg-white text-[#081326] shadow-xs border border-gray-200' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === tab.id 
                      ? (tab.id === 'Hidden Clients' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, mobile..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#f59e0b] shadow-xs placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {role === 'admin' && (
                <button 
                  onClick={() => navigate('/deleted-clients')}
                  className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors shadow-xs text-center cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  title="Super Admin Deleted Clients Backup Archive"
                >
                  <Archive className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                  <span className="hidden sm:inline">Deleted Clients Backup</span>
                  <span className="sm:hidden">Backup</span>
                </button>
              )}
              <button 
                onClick={() => navigate('/clients/new')}
                className="px-3.5 py-2 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-xs text-center cursor-pointer whitespace-nowrap"
              >
                + Add Client
              </button>
              <button 
                onClick={() => fetchClients()}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Refresh Clients"
              >
                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Mobile Cards View (Clean, Compact Banker Portal Layout) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-gray-500">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-gray-500">No client cases found.</div>
            ) : (
              filteredClients.map((client, index) => {
                const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');
                const clientAge = client.age || calculateAge(client.dob);

                return (
                  <div 
                    key={client._id}
                    onClick={() => openPreview(client)}
                    className={`p-3 bg-white hover:bg-gray-50/90 active:bg-gray-100 transition-colors flex flex-col gap-2 cursor-pointer ${client.isHidden ? 'bg-gray-50/70 opacity-90' : ''}`}
                  >
                    {/* Row 1: Serial + Name + Age + Status Dropdown (Banker Portal Style) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[10px] font-mono font-bold shrink-0">
                          #{index + 1}
                        </span>
                        <h4 className="text-sm font-black text-[#081326] truncate tracking-tight">
                          {client.fullName}
                        </h4>
                        {clientAge && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 shrink-0">
                            ({clientAge} Yrs)
                          </span>
                        )}
                        {client.isHidden && (
                          <span className="text-[9px] font-black uppercase text-gray-500 bg-gray-100 px-1 py-0.2 rounded border border-gray-200 shrink-0">
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* Staff-Controlled Case Status Dropdown (Top Right) */}
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <StatusSelectDropdown
                          client={client}
                          onChange={handleStatusChange}
                          isUpdating={statusUpdatingId === client._id}
                        />
                      </div>
                    </div>

                    {/* Row 2: Metadata (Mobile No • Profession • Case Type • Loan Amount) */}
                    <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap text-gray-500 font-medium">
                        {client.mobile ? (
                          <a 
                            href={`tel:${client.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                            title="Call client"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{client.mobile}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400">No Mobile</span>
                        )}
                        {client.occupation && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-700 font-bold flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[130px]">{client.occupation}</span>
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Case Type Tag */}
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-100">
                          {client.caseType || client.loanType || 'General Loan'}
                        </span>
                        {/* Loan Amount */}
                        <span className="font-black text-emerald-800 text-xs sm:text-sm tracking-tight">
                          {formatCurrency(client.loanAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Co-Applicant summary (if any) */}
                    {client.applicants && client.applicants.length > 1 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-purple-50/60 border border-purple-100 px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3 text-purple-700 shrink-0" />
                        <span className="truncate">
                          Co-Applicant: <span className="font-bold text-purple-950">{client.applicants[1].fullName}</span>
                          {(client.applicants[1].age || calculateAge(client.applicants[1].dob)) ? ` (${client.applicants[1].age || calculateAge(client.applicants[1].dob)} Yrs)` : ''}
                          {client.applicants[1].occupation ? ` • ${client.applicants[1].occupation}` : ''}
                        </span>
                        {client.applicants.length > 2 && (
                          <span className="text-[10px] font-black text-purple-700 ml-auto shrink-0">
                            +{client.applicants.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Row 4: Pendency Badge + Quick Actions Toolbar */}
                    <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
                      {/* Pendency Indicator */}
                      <div className="flex items-center shrink-0">
                        {activePendencies.length === 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Pendency
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleOpenPendencyModal(client, e)}
                            className="text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 max-w-[170px] truncate cursor-pointer transition-colors"
                            title="Click to view & share pendency items"
                          >
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">
                              {activePendencies.length === 1 ? activePendencies[0].title : `${activePendencies.length} Pending Items`}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Compact Banker-Style Controls: Chevron & 3-Dot Menu */}
                      <div className="flex items-center gap-1 ml-auto relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openPreview(client)}
                          className="p-1.5 text-gray-400 hover:text-[#081326] hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="Review Case"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === client._id ? null : client._id);
                          }}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            openActionMenuId === client._id ? 'bg-amber-100 text-[#081326]' : 'text-gray-400 hover:text-[#081326] hover:bg-gray-100'
                          }`}
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* 3-Dot Dropdown Menu */}
                        {openActionMenuId === client._id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs font-bold text-gray-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuId(null);
                                navigate(`/clients/${client._id}`);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Client Case</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                setOpenActionMenuId(null);
                                handleOpenUploadModal(client, e);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FileUp className="w-3.5 h-3.5 text-amber-600" />
                              <span>Add Documents</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                setOpenActionMenuId(null);
                                handleOpenApplicantsModal(client, e);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-purple-600" />
                              <span>Manage Applicants ({client.applicants?.length || 1})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuId(null);
                                handleToggleHide(client._id, !client.isHidden);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              {client.isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Unhide Client</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                                  <span>Hide from Active List</span>
                                </>
                              )}
                            </button>

                            {role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  navigate(`/clients/edit/${client._id}`);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-orange-600" />
                                <span>Edit Profile</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-gray-100"></div>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenuId(null);
                                setClientToDelete(client);
                                setDeleteReason('');
                                setShowDeleteModal(true);
                              }}
                              className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete Client</span>
                            </button>
                          </div>
                        )}
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
                  <th className="w-12 px-3 py-4 text-center select-none" title="Drag and drop rows to reorder">
                    <span className="text-[10px] text-gray-400">Order</span>
                  </th>
                  <th className="px-5 py-4 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Mobile No.</th>
                  <th className="px-5 py-4 whitespace-nowrap">Profession</th>
                  <th className="px-5 py-4 whitespace-nowrap">Loan Amount</th>
                  <th className="px-5 py-4 whitespace-nowrap">Case Type</th>
                  <th className="px-5 py-4 whitespace-nowrap">Current Pendency</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Case Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No client cases found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');
                    const isDragging = draggedClientId === client._id;
                    const isOver = dragOverClientId === client._id && !isDragging;

                    return (
                      <tr 
                        key={client._id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', client._id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedClientId(client._id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={() => {
                          if (draggedClientId && draggedClientId !== client._id) {
                            setDragOverClientId(client._id);
                          }
                        }}
                        onDragLeave={(e) => {
                          if (e.currentTarget.contains(e.relatedTarget)) return;
                          setDragOverClientId(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const sourceId = e.dataTransfer.getData('text/plain') || draggedClientId;
                          setDragOverClientId(null);
                          setDraggedClientId(null);
                          handleReorder(sourceId, client._id);
                        }}
                        onDragEnd={() => {
                          setDraggedClientId(null);
                          setDragOverClientId(null);
                        }}
                        className={`transition-all group ${
                          isDragging ? 'opacity-30 bg-amber-50/50' : ''
                        } ${
                          isOver ? 'border-t-2 border-[#f59e0b] bg-amber-50/60 shadow-xs' : 'hover:bg-gray-50/80'
                        } ${
                          client.isHidden ? 'bg-gray-50/40 opacity-75 hover:opacity-100' : ''
                        }`}
                      >
                        {/* 0. Drag Handle */}
                        <td 
                          className="w-12 px-3 py-3.5 text-center cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-600 select-none transition-colors"
                          title="Drag up or down to reorder"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </td>

                        {/* 1. Client Name Directly (Initials circle removed) */}
                        <td 
                          onClick={() => openPreview(client)}
                          className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap cursor-pointer hover:text-[#f59e0b] transition-colors"
                          title="Click to view complete client case details"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#081326] group-hover:underline text-[13px]">{client.fullName}</span>
                            {client.isHidden && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                                Hidden
                              </span>
                            )}
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

                        {/* 7. Action: 3-Dot Action Menu + Review */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-1.5 relative" onClick={(e) => e.stopPropagation()}>
                            <button 
                              type="button"
                              onClick={() => openPreview(client)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
                              title="Review Case"
                            >
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === client._id ? null : client._id);
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                                openActionMenuId === client._id
                                  ? 'bg-amber-100 text-[#081326]'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
                              }`}
                              title="More Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* 3-Dot Dropdown Menu */}
                            {openActionMenuId === client._id && (
                              <div 
                                className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs font-bold text-gray-700 text-left"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    navigate(`/clients/${client._id}`);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setOpenActionMenuId(null);
                                    handleOpenUploadModal(client, e);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <FileUp className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Add Documents</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setOpenActionMenuId(null);
                                    handleOpenApplicantsModal(client, e);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Users className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Co-Applicants ({client.applicants?.length || 1})</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    handleToggleHide(client._id, !client.isHidden);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  {client.isHidden ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Unhide Client</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Hide Client</span>
                                    </>
                                  )}
                                </button>

                                {role === 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      navigate(`/clients/edit/${client._id}`);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Edit Profile</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-gray-100"></div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setClientToDelete(client);
                                    setDeleteReason('');
                                    setShowDeleteModal(true);
                                  }}
                                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  <span>Delete Client</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 8. Staff-Controlled Case Status Dropdown */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                          <StatusSelectDropdown 
                            client={client}
                            onChange={handleStatusChange}
                            isUpdating={statusUpdatingId === client._id}
                          />
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#081326]">{selectedClient.fullName}</h2>
                    {selectedClient.isHidden && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusSelectDropdown
                      client={selectedClient}
                      onChange={handleStatusChange}
                      isUpdating={statusUpdatingId === selectedClient._id}
                    />
                    <button
                      onClick={() => handleToggleHide(selectedClient._id, !selectedClient.isHidden)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title={selectedClient.isHidden ? "Unhide Client" : "Hide Client"}
                    >
                      {selectedClient.isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                      <span>{selectedClient.isHidden ? 'Unhide' : 'Hide'}</span>
                    </button>
                    <button
                      onClick={() => { setClientToDelete(selectedClient); setDeleteReason(''); setShowDeleteModal(true); }}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Delete Client (Backed up for Super Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
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
              <ErrorBoundary title="Error loading client preview tab">
               {previewTab === 'Overview' && (
                  <OverviewTab 
                    client={selectedClient} 
                    onEditClick={handleOpenEditContact} 
                    onManageApplicants={() => handleOpenApplicantsModal(selectedClient)}
                  />
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
              </ErrorBoundary>
            </div>
            
            {/* Action Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Case Status:</span>
                <StatusSelectDropdown
                  client={selectedClient}
                  onChange={handleStatusChange}
                  isUpdating={statusUpdatingId === selectedClient._id}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleHide(selectedClient._id, !selectedClient.isHidden)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedClient.isHidden
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {selectedClient.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{selectedClient.isHidden ? 'Unhide Client' : 'Hide Client'}</span>
                </button>
                <button
                  onClick={() => navigate(`/clients/${selectedClient._id}`)}
                  className="px-3.5 py-2 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
              
              {/* Reorganized Form: Name, DOB, Profession, Loan Amount, Case Type, PAN, Aadhaar, Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Applicant Full Name *</label>
                  <input 
                    type="text" 
                    value={contactFormData.fullName}
                    onChange={(e) => setContactFormData({ ...contactFormData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-bold text-[#081326]"
                  />
                </div>

                {/* 2. Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth (DOB)</label>
                  <input 
                    type="date" 
                    value={contactFormData.dob || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-bold"
                  />
                </div>

                {/* 3. Profession / Occupation */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Profession / Occupation</label>
                  <input 
                    type="text" 
                    value={contactFormData.occupation || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, occupation: e.target.value })}
                    placeholder="e.g. Salaried, Business, Doctor"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

                {/* 4. Loan Amount */}
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">Required Loan Amount (₹) *</label>
                  <input 
                    type="number" 
                    value={contactFormData.loanAmount || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, loanAmount: e.target.value })}
                    placeholder="e.g. 3500000"
                    className="w-full px-3 py-2 text-xs border border-emerald-200 bg-emerald-50/40 rounded-lg outline-none focus:border-emerald-500 font-bold text-emerald-950"
                  />
                </div>

                {/* 5. Case Type */}
                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">Case Type / Service *</label>
                  <input 
                    type="text" 
                    value={contactFormData.caseType || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, caseType: e.target.value })}
                    placeholder="e.g. Home Loan, LAP, BT from PNB Housing"
                    className="w-full px-3 py-2 text-xs border border-blue-200 bg-blue-50/40 rounded-lg outline-none focus:border-blue-500 font-bold text-blue-950"
                  />
                </div>

                {/* 6. PAN Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PAN Number</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={contactFormData.panNumber || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-mono uppercase"
                  />
                </div>

                {/* 7. Aadhaar Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Aadhaar Number</label>
                  <input 
                    type="text" 
                    maxLength={12}
                    value={contactFormData.aadhaarNumber || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-mono"
                  />
                </div>

                {/* 8. Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    value={contactFormData.mobile || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, mobile: e.target.value })}
                    required
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-mono"
                  />
                </div>

                {/* Case Status */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">Case Status</label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = contactFormData.status || '';
                        const next = prompt('Enter custom status for this case:', current);
                        if (next && next.trim()) {
                          setContactFormData({ ...contactFormData, status: next.trim().substring(0, 60) });
                        }
                      }}
                      className="text-[10px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                    >
                      + Write Custom
                    </button>
                  </div>
                  <select 
                    value={!CASE_STATUS_OPTIONS.includes(contactFormData.status) ? '__custom__' : (contactFormData.status || 'Documents Pending')}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        const current = !CASE_STATUS_OPTIONS.includes(contactFormData.status) ? contactFormData.status : '';
                        const next = prompt('Enter custom status for this case:', current);
                        if (next && next.trim()) {
                          setContactFormData({ ...contactFormData, status: next.trim().substring(0, 60) });
                        }
                      } else {
                        setContactFormData({ ...contactFormData, status: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-bold cursor-pointer bg-white"
                  >
                    {!CASE_STATUS_OPTIONS.includes(contactFormData.status) && contactFormData.status && (
                      <option value="__custom__">★ {contactFormData.status} (Custom)</option>
                    )}
                    {CASE_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="__custom__">✏️ + Write Custom Status...</option>
                  </select>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={contactFormData.email || ''}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#f59e0b] font-medium"
                  />
                </div>

              </div>

              {/* Custom Fields Editor */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="block text-xs font-black text-[#081326] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" /> Custom Fields
                </label>
                
                {editCustomFields.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {editCustomFields.map((cf, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50/50 border border-purple-100 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-purple-800 uppercase block truncate">{cf.fieldName}</span>
                          <input 
                            type="text"
                            value={cf.fieldValue}
                            onChange={(e) => {
                              const updated = [...editCustomFields];
                              updated[idx].fieldValue = e.target.value;
                              setEditCustomFields(updated);
                            }}
                            className="w-full text-xs font-bold text-[#081326] bg-transparent outline-none border-b border-purple-200 py-0.5"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => setEditCustomFields(editCustomFields.filter((_, i) => i !== idx))}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input 
                    type="text" 
                    placeholder="Field Name (e.g. CIBIL, Valuation)"
                    value={editNewFieldName}
                    onChange={(e) => setEditNewFieldName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Field Value"
                    value={editNewFieldValue}
                    onChange={(e) => setEditNewFieldValue(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (!editNewFieldName.trim()) return;
                      setEditCustomFields([...editCustomFields, { fieldName: editNewFieldName.trim(), fieldValue: editNewFieldValue.trim() }]);
                      setEditNewFieldName('');
                      setEditNewFieldValue('');
                    }}
                    disabled={!editNewFieldName.trim()}
                    className="px-3 py-1.5 bg-[#081326] text-white rounded-md text-xs font-bold disabled:opacity-40"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Notes: Case Notes & Internal Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <StickyNote className="w-3.5 h-3.5 text-amber-500" /> Case Notes / Remarks
                  </label>
                  <RichTextEditor 
                    value={contactFormData.caseNotes || contactFormData.notes || ''}
                    onChange={(val) => setContactFormData(prev => ({ ...prev, notes: val, caseNotes: val }))}
                    placeholder="General observations about the case..."
                    minHeight="100px"
                  />
                </div>

                <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/80">
                  <label className="block text-xs font-black text-amber-950 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" /> Internal Notes (Team Only)
                  </label>
                  <RichTextEditor 
                    value={contactFormData.internalNotes || ''}
                    onChange={(val) => setContactFormData(prev => ({ ...prev, internalNotes: val }))}
                    placeholder="🔒 Confidential internal team notes (Never shared with bankers)..."
                    minHeight="100px"
                  />
                </div>
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

      {/* Delete Confirmation Modal (Zero Data Loss - Super Admin Backup) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-1">
              Delete Client from Active List?
            </h3>
            
            {clientToDelete && typeof clientToDelete === 'object' && (
              <p className="text-xs text-gray-500 text-center mb-3 font-semibold">
                Client: <span className="font-bold text-[#081326]">{clientToDelete.fullName}</span>
                {clientToDelete.mobile && ` (${clientToDelete.mobile})`}
              </p>
            )}

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4 leading-relaxed">
              <span className="font-bold block mb-1">🛡️ Data Security & Complete Backup:</span>
              Deleting will remove this client from the active staff list. No data will be lost: all client details, documents, form submissions, pendencies, and edit history are securely archived and preserved for Super Admin recovery.
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-gray-700">
                Reason for Deletion (Optional)
              </label>
              <textarea
                rows="2"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Lead cancelled, duplicate entry, loan rejected by banks..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteClient}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-red-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting & Backing Up...' : 'Yes, Delete Client'}
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
                <div 
                  onClick={() => uploadFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDocMultiFileDrop}
                  className="border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all space-y-2"
                >
                  <Upload className="w-8 h-8 text-[#f59e0b] mx-auto" />
                  <p className="text-xs font-bold text-gray-700">Click to browse or drag & drop files</p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG, WEBP (Selecting more files will append to list)</p>
                  <input 
                    ref={uploadFileInputRef}
                    type="file" 
                    id="front-doc-multi-file-input"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                    onChange={handleDocMultiFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Selected Files List with Remove/Delete Option */}
              {selectedUploadFiles.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <div className="text-[10px] font-bold text-gray-500 flex justify-between items-center px-1">
                    <span>Queue ({selectedUploadFiles.length} file{selectedUploadFiles.length > 1 ? 's' : ''} selected):</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUploadFiles([])}
                      className="text-red-500 hover:underline cursor-pointer font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                  {selectedUploadFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 bg-gray-50 hover:bg-red-50/30 rounded-xl text-xs border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[280px]">
                        <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate font-medium text-gray-700">{file.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveSelectedUploadFile(idx);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-lg font-bold ml-2 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                        title={`Remove "${file.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-xs font-bold">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
      {/* Multi-Applicant & Co-Borrower Modal */}
      {showApplicantsModal && applicantsModalClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowApplicantsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#081326]">
                    Applicants, Co-Borrowers & Guarantors
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Case: <span className="font-bold text-gray-800">{applicantsModalClient.fullName}</span> • {modalApplicantsList.length} Person(s) Registered
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowApplicantsModal(false)} 
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSaveModalApplicants} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {applicantsModalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                  {applicantsModalError}
                </div>
              )}

              {/* Each Person's Section */}
              <div className="space-y-4">
                {modalApplicantsList.map((app, idx) => {
                  const calculatedAge = calculateAge(app.dob);
                  const isPrimary = idx === 0;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isPrimary 
                          ? 'bg-amber-50/30 border-amber-200/90' 
                          : 'bg-slate-50/70 border-gray-200'
                      }`}
                    >
                      {/* Person Card Header */}
                      <div className="flex items-center justify-between border-b border-gray-200/70 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPrimary 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {isPrimary ? 'Primary Applicant' : (app.relationship || `Co-Applicant ${idx}`)}
                          </span>

                          <span className="text-xs font-black text-[#081326] truncate max-w-[180px]">
                            {app.fullName.trim() || `Person ${idx + 1}`}
                          </span>

                          {calculatedAge && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-300">
                              Age: {calculatedAge} Yrs
                            </span>
                          )}
                        </div>

                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleModalRemoveApplicant(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Remove this applicant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Full Legal Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={app.fullName}
                            onChange={(e) => handleModalApplicantChange(idx, 'fullName', e.target.value)}
                            placeholder="Full name"
                            required={isPrimary}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-gray-700">Date of Birth</label>
                            {calculatedAge && <span className="text-[10px] text-amber-700 font-bold">{calculatedAge} Yrs</span>}
                          </div>
                          <input
                            type="date"
                            value={app.dob}
                            onChange={(e) => handleModalApplicantChange(idx, 'dob', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Profession / Profile
                          </label>
                          <input
                            type="text"
                            value={app.occupation}
                            onChange={(e) => handleModalApplicantChange(idx, 'occupation', e.target.value)}
                            placeholder="e.g. Salaried, Business, Doctor"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Mobile Number {isPrimary && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={app.mobile}
                            onChange={(e) => handleModalApplicantChange(idx, 'mobile', e.target.value)}
                            placeholder="10-digit mobile"
                            required={isPrimary}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            PAN Number
                          </label>
                          <input
                            type="text"
                            maxLength={10}
                            value={app.panNumber}
                            onChange={(e) => handleModalApplicantChange(idx, 'panNumber', e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono uppercase font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Aadhaar Number
                          </label>
                          <input
                            type="text"
                            maxLength={12}
                            value={app.aadhaarNumber}
                            onChange={(e) => handleModalApplicantChange(idx, 'aadhaarNumber', e.target.value)}
                            placeholder="12-digit Aadhaar"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Relationship / Role
                          </label>
                          <input
                            type="text"
                            value={app.relationship}
                            onChange={(e) => handleModalApplicantChange(idx, 'relationship', e.target.value)}
                            placeholder={isPrimary ? 'Primary Applicant' : 'e.g. Co-Borrower, Guarantor, Spouse'}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-purple-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Custom Fields for this Applicant */}
                      <div className="pt-2.5 mt-2.5 border-t border-gray-200/60">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Person Custom Fields (e.g. CIBIL, Share %, Employer)
                        </span>

                        {app.customFields && app.customFields.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {app.customFields.map((cf, cIdx) => (
                              <span key={cIdx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 rounded text-[11px] font-bold">
                                <span>{cf.fieldName}: {cf.fieldValue}</span>
                                <button 
                                  type="button" 
                                  onClick={() => handleModalRemoveCustomField(idx, cIdx)} 
                                  className="text-purple-600 hover:text-red-600 font-black cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            id={`modal-app-fn-${idx}`}
                            placeholder="Field Name (e.g. CIBIL Score)"
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                          />
                          <input
                            type="text"
                            id={`modal-app-fv-${idx}`}
                            placeholder="Value (e.g. 780)"
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const fn = document.getElementById(`modal-app-fn-${idx}`)?.value || '';
                              const fv = document.getElementById(`modal-app-fv-${idx}`)?.value || '';
                              if (fn.trim()) {
                                handleModalAddCustomField(idx, fn, fv);
                                document.getElementById(`modal-app-fn-${idx}`).value = '';
                                document.getElementById(`modal-app-fv-${idx}`).value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer shrink-0"
                          >
                            + Add Field
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Persistent Add Another Applicant Button (ALWAYS Available) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleModalAddApplicant('Co-Applicant')}
                  className="w-full py-3 bg-purple-50/70 hover:bg-purple-100/90 text-purple-800 border-2 border-dashed border-purple-300 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Another Applicant / Co-Applicant / Guarantor</span>
                </button>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 sticky bottom-0 bg-white py-2">
                <button 
                  type="button" 
                  onClick={() => setShowApplicantsModal(false)} 
                  disabled={isSavingApplicants} 
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingApplicants} 
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-black hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  {isSavingApplicants ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Saving Applicants...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Save All Applicants ({modalApplicantsList.length})
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
