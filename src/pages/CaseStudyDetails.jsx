import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, ArrowLeft, Plus, Edit3, Trash2, Eye, Share2, 
  Upload, Download, FileText, CheckCircle2, AlertCircle, 
  MessageSquare, Sparkles, RefreshCw, X, Copy, Lock, MapPin, 
  IndianRupee, ChevronUp, ChevronDown, Check, Send, PhoneCall, 
  Printer, ShieldAlert, CheckSquare, Layers, Clock, History,
  FileCheck, ShieldCheck, Mail, Users, Filter, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import PdfViewer from '../components/common/PdfViewer';
import ImageViewer from '../components/common/ImageViewer';
import { getCaseStatusBadge, getCaseTypeBadge } from './CaseStudies';
import caseStudyService, { CASE_TYPES, CASE_STATUSES } from '../utils/caseStudyStore';

const CaseStudyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Fields' | 'Documents' | 'Queries' | 'History' | 'AI Intelligence'
  const [saving, setSaving] = useState(false);

  // Phone Back Button interception: Return to Case Studies list
  useEffect(() => {
    try {
      window.history.pushState({ ktrCaseDetails: true }, '');
    } catch (e) {}

    const handlePopState = () => {
      if (window.history.state?.ktrPreviewModal || window.history.state?.ktrShareModal) {
        return;
      }
      navigate('/case-studies', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadConfidential, setUploadConfidential] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Replace Document Modal State
  const [replacingDoc, setReplacingDoc] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Rename Document Modal State
  const [editingDoc, setEditingDoc] = useState(null);
  const [editDocForm, setEditDocForm] = useState({ name: '', category: '', notes: '', isConfidential: false });

  // Add / Edit Custom Field Modal State
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    id: '',
    label: '',
    fieldType: 'text',
    value: '',
    options: '',
    isRequired: false,
    isConfidential: false
  });

  // Discussions & Queries State
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryForm, setQueryForm] = useState({
    authorName: '',
    authorRole: 'banker',
    source: 'phone', // 'phone' | 'email' | 'meeting' | 'portal'
    bankName: '',
    authorPhone: '',
    authorEmail: '',
    queryText: '',
    status: 'Open',
    staffReply: ''
  });
  const [replyingQueryId, setReplyingQueryId] = useState(null);
  const [staffReplyText, setStaffReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Answered');

  // AI Intelligence State
  const [analyzingAi, setAnalyzingAi] = useState(false);

  // Secure Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    recipientType: 'Banker',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    passcode: '',
    expiresInDays: 30,
    visibleFieldIds: [],
    visibleDocumentIds: [],
    allowQueries: true
  });
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  // Close Case Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');

  const fetchCaseStudy = async () => {
    try {
      setLoading(true);
      const res = await caseStudyService.getById(id);
      if (res.success && res.data) {
        setCaseStudy(res.data);
      }
    } catch (err) {
      console.error('Fetch Case Study Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudy();
  }, [id]);

  // Handle Basic Field Updates
  const handleUpdateBasic = async (key, val) => {
    try {
      setSaving(true);
      const res = await caseStudyService.update(id, { [key]: val }, user?.name || 'Staff');
      if (res.success && res.data) {
        setCaseStudy(res.data);
        toast.success('Updated successfully', { duration: 1500 });
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Close Case with Resolution
  const handleCloseCase = async (e) => {
    e.preventDefault();
    try {
      const res = await caseStudyService.update(id, {
        status: 'Closed',
        resolutionSummary: resolutionSummary.trim()
      }, user?.name || 'Staff');
      if (res.success) {
        toast.success('Case marked as Closed with resolution summary.');
        setCaseStudy(res.data);
        setShowCloseModal(false);
      }
    } catch (err) {
      toast.error('Failed to close case');
    }
  };

  // Reopen Case
  const handleReopenCase = async () => {
    if (!window.confirm('Reopen this case for continued discussion?')) return;
    try {
      const res = await caseStudyService.update(id, {
        status: 'Under Discussion'
      }, user?.name || 'Staff');
      if (res.success) {
        toast.success('Case reopened successfully!');
        setCaseStudy(res.data);
      }
    } catch (err) {
      toast.error('Failed to reopen case');
    }
  };

  // ----------------------------------------------------
  // CUSTOM FIELDS MANAGEMENT & ORDERING
  // ----------------------------------------------------
  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!fieldForm.label.trim()) {
      toast.error('Field label is required');
      return;
    }

    const currentFields = [...(caseStudy.customFields || [])];
    const opts = fieldForm.options.split(',').map(s => s.trim()).filter(Boolean);

    if (fieldForm.id) {
      // Edit existing field
      const idx = currentFields.findIndex(f => f.id === fieldForm.id);
      if (idx !== -1) {
        currentFields[idx] = {
          ...currentFields[idx],
          label: fieldForm.label.trim(),
          fieldType: fieldForm.fieldType,
          options: opts,
          isRequired: fieldForm.isRequired,
          isConfidential: fieldForm.isConfidential
        };
      }
    } else {
      // Add new field
      currentFields.push({
        id: `fld_${Date.now()}`,
        label: fieldForm.label.trim(),
        value: fieldForm.value || '',
        fieldType: fieldForm.fieldType,
        options: opts,
        isRequired: fieldForm.isRequired,
        isConfidential: fieldForm.isConfidential,
        order: currentFields.length + 1
      });
    }

    try {
      const res = await caseStudyService.updateFields(id, currentFields, user?.name || 'Staff');
      if (res.success) {
        setCaseStudy(prev => ({ ...prev, customFields: res.customFields }));
        toast.success(fieldForm.id ? 'Field updated' : 'Field added');
        setShowFieldModal(false);
        setFieldForm({ id: '', label: '', fieldType: 'text', value: '', options: '', isRequired: false, isConfidential: false });
      }
    } catch (err) {
      toast.error('Failed to save field');
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Delete this field? Past history for this field will be preserved in audit logs.')) return;
    const updated = (caseStudy.customFields || []).filter(f => f.id !== fieldId);
    try {
      const res = await caseStudyService.updateFields(id, updated, user?.name || 'Staff');
      if (res.success) {
        setCaseStudy(prev => ({ ...prev, customFields: res.customFields }));
        toast.success('Field deleted');
      }
    } catch (err) {
      toast.error('Failed to delete field');
    }
  };

  const handleMoveField = async (fromIdx, toIdx) => {
    const list = [...(caseStudy.customFields || [])];
    if (toIdx < 0 || toIdx >= list.length) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);

    const ordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setCaseStudy(prev => ({ ...prev, customFields: ordered }));

    try {
      await caseStudyService.updateFields(id, ordered, user?.name || 'Staff');
    } catch (err) {
      toast.error('Failed to update field order');
    }
  };

  const handleFieldValueChange = (fieldId, val) => {
    setCaseStudy(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === fieldId ? { ...f, value: val } : f)
    }));
  };

  const handleSaveAllFieldValues = async () => {
    try {
      setSaving(true);
      const res = await caseStudyService.updateFields(id, caseStudy.customFields, user?.name || 'Staff');
      if (res.success) {
        toast.success('All field values saved!');
      }
    } catch (err) {
      toast.error('Failed to save field values');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // MULTI-DOCUMENT UPLOADING & MANAGEMENT
  // ----------------------------------------------------
  const handleFileSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}_${f.size}_${f.lastModified}`));
      const fresh = incoming.filter(f => !existing.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...fresh];
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast.error('Please select at least one document');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('category', uploadCategory);
      if (uploadDocName.trim()) formData.append('name', uploadDocName.trim());
      if (uploadNotes.trim()) formData.append('notes', uploadNotes.trim());
      formData.append('isConfidential', uploadConfidential);

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      const res = await caseStudyService.uploadDocuments(id, formData, selectedFiles, user?.name || 'Staff');

      if (res.success) {
        toast.success(`${selectedFiles.length} document(s) uploaded!`);
        setCaseStudy(prev => ({ ...prev, documents: res.documents }));
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadDocName('');
        setUploadNotes('');
        setUploadConfidential(false);
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replacementFile || !replacingDoc) {
      toast.error('Please select replacement file');
      return;
    }

    try {
      setIsReplacing(true);
      const res = await caseStudyService.replaceDocument(id, replacingDoc.id, replacementFile, user?.name || 'Staff');
      if (res.success) {
        toast.success(`Document "${replacingDoc.name}" replaced successfully!`);
        setCaseStudy(prev => ({ ...prev, documents: res.documents }));
        setReplacingDoc(null);
        setReplacementFile(null);
      }
    } catch (err) {
      toast.error('Replacement failed');
    } finally {
      setIsReplacing(false);
    }
  };

  const handleEditDocSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      const res = await caseStudyService.renameDocument(id, editingDoc.id, editDocForm, user?.name || 'Staff');
      if (res.success) {
        toast.success('Document details updated');
        setCaseStudy(prev => ({ ...prev, documents: res.documents }));
        setEditingDoc(null);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDeleteDocument = async (docId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await caseStudyService.deleteDocument(id, docId, user?.name || 'Staff');
      if (res.success) {
        toast.success('Document deleted');
        setCaseStudy(prev => ({ ...prev, documents: res.documents }));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleMoveDocument = async (fromIdx, toIdx) => {
    const docs = [...(caseStudy.documents || [])];
    if (toIdx < 0 || toIdx >= docs.length) return;
    const [moved] = docs.splice(fromIdx, 1);
    docs.splice(toIdx, 0, moved);

    setCaseStudy(prev => ({ ...prev, documents: docs }));
    try {
      const docIds = docs.map(d => d.id);
      const res = await caseStudyService.reorderDocuments(id, docIds);
      if (res.success) {
        setCaseStudy(prev => ({ ...prev, documents: res.documents }));
      }
    } catch (err) {
      toast.error('Reorder failed');
    }
  };

  // ----------------------------------------------------
  // CASE DISCUSSIONS & QUERIES MANAGEMENT
  // ----------------------------------------------------
  const handleAddQuerySubmit = async (e) => {
    e.preventDefault();
    if (!queryForm.queryText.trim()) {
      toast.error('Query description is required');
      return;
    }

    try {
      const res = await caseStudyService.addQuery(id, queryForm, user?.name || 'Staff');
      if (res.success) {
        toast.success('Discussion query recorded!');
        setCaseStudy(prev => ({ ...prev, bankerQueries: res.queries }));
        setShowQueryModal(false);
        setQueryForm({
          authorName: '',
          authorRole: 'banker',
          source: 'phone',
          bankName: '',
          authorPhone: '',
          authorEmail: '',
          queryText: '',
          status: 'Open',
          staffReply: ''
        });
      }
    } catch (err) {
      toast.error('Failed to add query');
    }
  };

  const handleReplySubmit = async (queryId) => {
    if (!staffReplyText.trim()) return;
    try {
      const res = await caseStudyService.replyQuery(
        id,
        queryId,
        staffReplyText,
        user?.name || 'Staff',
        replyStatus
      );
      if (res.success) {
        toast.success('Reply submitted and logged to history!');
        setCaseStudy(prev => ({ ...prev, bankerQueries: res.queries }));
        setReplyingQueryId(null);
        setStaffReplyText('');
      }
    } catch (err) {
      toast.error('Failed to submit reply');
    }
  };

  const handleUpdateQueryStatus = async (queryId, newStatus) => {
    try {
      const res = await caseStudyService.updateQueryStatus(id, queryId, newStatus, user?.name || 'Staff');
      if (res.success) {
        toast.success(`Query status updated to ${newStatus}`);
        setCaseStudy(prev => ({ ...prev, bankerQueries: res.queries }));
      }
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  // ----------------------------------------------------
  // AI CASE INTELLIGENCE & RECOMMENDATIONS
  // ----------------------------------------------------
  const handleRunAiAnalysis = async () => {
    try {
      setAnalyzingAi(true);
      const res = await caseStudyService.runAiAnalysis(id);
      if (res.success) {
        toast.success('AI Case Analysis complete!');
        setCaseStudy(prev => ({ ...prev, aiIntelligence: res.data }));
      }
    } catch (err) {
      toast.error('AI Analysis failed');
    } finally {
      setAnalyzingAi(false);
    }
  };

  // ----------------------------------------------------
  // SECURE GRANULAR SHARING
  // ----------------------------------------------------
  const handleOpenShareConfig = () => {
    // Pre-populate with all non-confidential field & doc IDs
    const fieldIds = (caseStudy.customFields || []).filter(f => !f.isConfidential).map(f => f.id);
    const docIds = (caseStudy.documents || []).filter(d => !d.isConfidential).map(d => d.id);

    setShareForm({
      recipientType: 'Banker',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      passcode: '',
      expiresInDays: 30,
      visibleFieldIds: fieldIds,
      visibleDocumentIds: docIds,
      allowQueries: true
    });
    setGeneratedShareUrl('');
    setShowShareModal(true);
  };

  const handleCreateShareLink = async (e) => {
    e.preventDefault();
    try {
      setIsGeneratingShare(true);
      const res = await caseStudyService.generateShareLink(id, shareForm, user?.name || 'Staff');
      if (res.success) {
        setGeneratedShareUrl(res.shortUrl);
        toast.success('Secure share link generated!');
        fetchCaseStudy(); // reload share list
      }
    } catch (err) {
      toast.error('Failed to generate link');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-400 bg-white rounded-2xl border border-gray-100">
        Loading case discussion details...
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 space-y-3">
        <p className="text-sm font-bold text-red-600">Case Discussion Not Found</p>
        <button
          onClick={() => navigate('/case-studies')}
          className="px-4 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold"
        >
          Back to Case Studies
        </button>
      </div>
    );
  }

  const sortedFields = (caseStudy.customFields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedDocs = (caseStudy.documents || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const pendingQueries = (caseStudy.bankerQueries || []).filter(q => q.status !== 'Resolved' && q.status !== 'Closed').length;

  return (
    <div className="flex flex-col space-y-5 max-w-[1600px] mx-auto pb-16">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/case-studies')}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-[#081326] rounded-xl transition-colors cursor-pointer border border-gray-200 shrink-0"
            title="Back to Case Studies"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-[#081326] text-amber-400 rounded-lg text-xs font-mono font-bold shrink-0">
                {caseStudy.caseNumber}
              </span>
              <span className={`${getCaseTypeBadge(caseStudy.caseType)} px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0`}>
                {caseStudy.caseType || 'Property Legal Issues'}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[#081326] truncate">
                {caseStudy.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-1 flex-wrap">
              <Link to="/case-studies" className="hover:text-amber-600">Case Discussions</Link>
              <span>•</span>
              <span className="text-gray-700 font-bold">{caseStudy.clientName || 'General Discussion'}</span>
              {caseStudy.propertyLocation && (
                <>
                  <span>•</span>
                  <span>{caseStudy.propertyLocation}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {caseStudy.status === 'Closed' ? (
            <button
              onClick={handleReopenCase}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Case</span>
            </button>
          ) : (
            <select
              value={caseStudy.status}
              onChange={(e) => {
                if (e.target.value === 'Closed') {
                  setShowCloseModal(true);
                } else {
                  handleUpdateBasic('status', e.target.value);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${getCaseStatusBadge(caseStudy.status)}`}
            >
              {CASE_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleOpenShareConfig}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Secure Share Link</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 px-4 sm:px-6 flex gap-6 overflow-x-auto scrollbar-hide">
        {[
          { id: 'Overview', label: 'Case Overview' },
          { id: 'Fields', label: `Custom Fields (${sortedFields.length})` },
          { id: 'Documents', label: `Documents (${sortedDocs.length})` },
          { id: 'Queries', label: `Discussion & Queries ${pendingQueries > 0 ? `(${pendingQueries})` : ''}` },
          { id: 'History', label: `Edit History (${(caseStudy.editHistory || []).length})` },
          { id: 'AI Intelligence', label: 'AI Intelligence', highlight: true }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-xs font-black whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-[#f59e0b]'
                : tab.highlight
                ? 'text-purple-600 hover:text-purple-700'
                : 'text-gray-400 hover:text-[#081326]'
            }`}
          >
            {tab.highlight && <Sparkles className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f59e0b] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Resolution Banner if Closed */}
            {caseStudy.status === 'Closed' && caseStudy.resolutionSummary && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Final Case Resolution</h4>
                  <p className="text-xs text-emerald-900 font-medium mt-1">{caseStudy.resolutionSummary}</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">Closed on {new Date(caseStudy.closedAt || caseStudy.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Core Issue Box */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
              <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Core Case Issue & Problem Statement
              </h3>
              <textarea
                rows="3"
                value={caseStudy.caseIssue || ''}
                onChange={(e) => setCaseStudy({ ...caseStudy, caseIssue: e.target.value })}
                onBlur={(e) => handleUpdateBasic('caseIssue', e.target.value)}
                placeholder="Describe the problem, eligibility gap, or property issue being discussed..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white"
              />
            </div>

            {/* Complications / Nuances Box */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
              <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" /> Technical Nuances & Complications
              </h3>
              <textarea
                rows="3"
                value={caseStudy.legalComplications || ''}
                onChange={(e) => setCaseStudy({ ...caseStudy, legalComplications: e.target.value })}
                onBlur={(e) => handleUpdateBasic('legalComplications', e.target.value)}
                placeholder="Detail prior title gaps, banking audit exceptions, or regulatory hurdles..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white"
              />
            </div>

            {/* Confidential Internal Notes */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-amber-200 bg-amber-50/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-700" /> Internal Staff Discussion Notes
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Confidential • Strictly Hidden from External Links
                </span>
              </div>
              <textarea
                rows="3"
                value={caseStudy.discussionNotes || ''}
                onChange={(e) => setCaseStudy({ ...caseStudy, discussionNotes: e.target.value })}
                onBlur={(e) => handleUpdateBasic('discussionNotes', e.target.value)}
                placeholder="Internal tactic, partner banker tolerances, phone notes..."
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Right Column: Case Summary */}
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
              <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider">Case Attributes</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Case Category</p>
                  <p className="text-gray-800 font-bold">{caseStudy.caseType || 'Property Legal Issues'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Reference Client / Entity</p>
                  <p className="text-gray-800 font-bold">{caseStudy.clientName || 'General Discussion'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Estimated Value / Loan</p>
                  <p className="text-emerald-700 font-black">
                    {caseStudy.estimatedLoanAmount ? `₹ ${Number(caseStudy.estimatedLoanAmount).toLocaleString('en-IN')}` : 'Flexible'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Location / Context</p>
                  <p className="text-gray-800 font-bold">{caseStudy.propertyLocation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Date</p>
                  <p className="text-gray-600 font-bold">{new Date(caseStudy.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Quick Share Callout */}
            <div className="bg-[#081326] text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase">
                <Share2 className="w-4 h-4" /> Secure Case Sharing
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Generate tailored shareable links for Bankers, Advocates, Valuers, or CAs. Customize exactly which fields and documents each person can access.
              </p>
              <button
                onClick={handleOpenShareConfig}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-[#081326] rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Configure Share Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZABLE CASE FIELDS */}
      {activeTab === 'Fields' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-sm font-black text-[#081326]">Custom Case Fields & Serial Order</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Add, rename, reorder, and configure field types for this case. Recipients will view them in this exact serial order.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAllFieldValues}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save All Values</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFieldForm({ id: '', label: '', fieldType: 'text', value: '', options: '', isRequired: false, isConfidential: false });
                  setShowFieldModal(true);
                }}
                className="px-3.5 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Custom Field</span>
              </button>
            </div>
          </div>

          {/* Fields List in configured serial order */}
          {sortedFields.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400">
              No fields configured yet. Click "Add Custom Field" to create fields for this case.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs font-black text-[#081326] truncate">
                        {field.label}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.2 rounded border">
                        {field.fieldType}
                      </span>
                      {field.isConfidential && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Staff Only
                        </span>
                      )}
                      {field.isRequired && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      )}
                    </div>

                    {/* Reorder and Edit Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveField(idx, idx - 1)}
                        className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedFields.length - 1}
                        onClick={() => handleMoveField(idx, idx + 1)}
                        className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFieldForm({
                            id: field.id,
                            label: field.label,
                            fieldType: field.fieldType,
                            value: field.value || '',
                            options: (field.options || []).join(', '),
                            isRequired: field.isRequired || false,
                            isConfidential: field.isConfidential || false
                          });
                          setShowFieldModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Edit Field Label & Options"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Field Input */}
                  <div>
                    {field.fieldType === 'textarea' ? (
                      <textarea
                        rows="2"
                        value={field.value || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.label}...`}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white"
                      />
                    ) : field.fieldType === 'select' ? (
                      <select
                        value={field.value || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                      >
                        <option value="">-- Select Option --</option>
                        {(field.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.fieldType === 'boolean' ? (
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                          <input
                            type="checkbox"
                            checked={Boolean(field.value)}
                            onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span>{field.value ? 'Yes / Confirmed' : 'No / Pending'}</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.fieldType === 'number' || field.fieldType === 'currency' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                        value={field.value || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.label}...`}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS & FILE MANAGEMENT */}
      {activeTab === 'Documents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-sm font-black text-[#081326]">Case Documents & Evidence</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Upload multiple documents, preview, rename, reorder, replace files, and configure recipient visibility.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setUploadDocName('');
                setUploadNotes('');
                setUploadConfidential(false);
                setShowUploadModal(true);
              }}
              className="px-4 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#f59e0b]" />
              <span>Upload Documents</span>
            </button>
          </div>

          {sortedDocs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 space-y-2">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-400">No documents uploaded for this case yet.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3.5 py-1.5 bg-[#081326] text-white rounded-xl text-xs font-bold mt-2"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedDocs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 transition-all shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-[#081326] truncate">
                          {doc.name}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.2 rounded border">
                          {doc.fileType}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                          {doc.category}
                        </span>
                        {doc.isConfidential && (
                          <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Confidential
                          </span>
                        )}
                        {doc.replacedAt && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                            Replaced
                          </span>
                        )}
                      </div>
                      {doc.notes && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                          Note: {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Move, Preview, Replace, Rename, Download, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveDocument(idx, idx - 1)}
                      className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedDocs.length - 1}
                      onClick={() => handleMoveDocument(idx, idx + 1)}
                      className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingDoc(doc);
                        setReplacementFile(null);
                      }}
                      className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      title="Replace Document File"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDoc(doc);
                        setEditDocForm({
                          name: doc.name,
                          category: doc.category || 'General',
                          notes: doc.notes || '',
                          isConfidential: Boolean(doc.isConfidential)
                        });
                      }}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <a
                      href={getAssetUrl(doc.fileUrl)}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CASE-SPECIFIC DISCUSSION & QUERIES */}
      {activeTab === 'Queries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-sm font-black text-[#081326]">Case Queries & Discussion Threads</h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Record phone, email, or meeting queries manually or review questions submitted from external links.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQueryModal(true)}
              className="px-4 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#f59e0b]" />
              <span>Record Offline Query</span>
            </button>
          </div>

          {(caseStudy.bankerQueries || []).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-400">No queries or discussion threads recorded yet.</p>
              <p className="text-[11px] text-gray-400">
                Authorized external recipients can raise queries through their link, or you can record phone/meeting conversations above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(caseStudy.bankerQueries || []).map((q, idx) => (
                <div
                  key={q._id || idx}
                  className="bg-white border border-gray-200 rounded-2xl p-5 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xs text-[#081326]">
                        {q.authorName} {q.bankName ? `(${q.bankName})` : ''}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border">
                        {q.authorRole || 'Expert'}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full border border-amber-200">
                        Via {q.source || (q.isPhoneQuery ? 'phone' : 'portal')}
                      </span>
                      
                      {/* Status Selector */}
                      <select
                        value={q.status}
                        onChange={(e) => handleUpdateQueryStatus(q._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                          q.status === 'Resolved' || q.status === 'Answered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Awaiting Documents">Awaiting Documents</option>
                        <option value="Answered">Answered</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(q.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Query Text Box */}
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs font-medium text-gray-700">
                    <p className="font-bold text-[10px] text-gray-400 uppercase mb-1">Query / Requirement:</p>
                    {q.queryText}
                  </div>

                  {/* Threaded Replies */}
                  {q.replies && q.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                      {q.replies.map((rep, rIdx) => (
                        <div key={rep._id || rIdx} className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[11px] text-blue-900">
                              {rep.repliedByName || 'Staff'} ({rep.repliedByRole || 'Staff'})
                            </span>
                            <span className="text-[10px] text-blue-500 font-medium">
                              {new Date(rep.repliedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-blue-950 font-medium">{rep.replyText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback legacy staffReply */}
                  {(!q.replies || q.replies.length === 0) && q.staffReply && (
                    <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-950">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[10px] text-blue-700 uppercase">Staff Reply / Resolution:</span>
                        <span className="text-[10px] text-blue-500 font-medium">
                          {q.repliedByName || 'Staff'} • {q.repliedAt ? new Date(q.repliedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="font-medium">{q.staffReply}</p>
                    </div>
                  )}

                  {/* Reply Input Form */}
                  {replyingQueryId === q._id ? (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <textarea
                        rows="2"
                        placeholder="Type reply to query..."
                        value={staffReplyText}
                        onChange={(e) => setStaffReplyText(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-gray-500">Update Status:</label>
                          <select
                            value={replyStatus}
                            onChange={(e) => setReplyStatus(e.target.value)}
                            className="text-xs font-bold px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                          >
                            <option value="Answered">Answered</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Awaiting Documents">Awaiting Documents</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setReplyingQueryId(null); setStaffReplyText(''); }}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(q._id)}
                            className="px-4 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3 text-amber-400" />
                            <span>Submit Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setReplyingQueryId(q._id); setStaffReplyText(''); }}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Add Reply / Resolution
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EDIT HISTORY & AUDIT LOG */}
      {activeTab === 'History' && (
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" /> Complete Activity & Edit History
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Chronological record of field edits, document uploads, replacements, status updates, and links generated.
              </p>
            </div>
          </div>

          {(caseStudy.editHistory || []).length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center font-bold">No history entries recorded yet.</p>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-100 pl-8">
              {caseStudy.editHistory.map((item, hIdx) => (
                <div key={hIdx} className="relative group">
                  <div className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-xs"></div>
                  <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-[#081326]">{item.action}</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{item.details}</p>
                    <p className="text-[10px] text-gray-400">By {item.userName || 'Staff'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AI CASE INTELLIGENCE */}
      {activeTab === 'AI Intelligence' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-purple-900 to-[#081326] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h2 className="text-base font-black">AI Case Intelligence & Strategic Guidance</h2>
              </div>
              <p className="text-xs text-purple-200 font-medium max-w-2xl">
                AI scans comparable resolved cases and lending criteria to suggest mitigation strategies, anticipated queries, and missing documents.
              </p>
              <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider pt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confidential Internal Staff Tool • Never Exposed to External Participants
              </p>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={analyzingAi}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#081326] rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${analyzingAi ? 'animate-spin' : ''}`} />
              <span>{analyzingAi ? 'Analyzing Cases...' : 'Run AI Analysis'}</span>
            </button>
          </div>

          {!caseStudy.aiIntelligence?.lastAnalyzedAt ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 space-y-3">
              <Sparkles className="w-10 h-10 text-purple-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">AI Intelligence Not Generated Yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click "Run AI Analysis" to synthesize case context against past precedents and bank criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Summary & Risk Rating */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase">Case Summary & Risk Profile</h3>
                  <p className="text-sm font-bold text-gray-800 mt-1">{caseStudy.aiIntelligence.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-gray-500">Risk Rating:</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                    caseStudy.aiIntelligence.riskRating === 'High'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : caseStudy.aiIntelligence.riskRating === 'Moderate'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {caseStudy.aiIntelligence.riskRating} Risk
                  </span>
                </div>
              </div>

              {/* Grid: Suggested Banks & Anticipated Queries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Banks & Institutions
                  </h3>
                  <div className="space-y-2.5">
                    {(caseStudy.aiIntelligence.suggestedBanks || []).map((bank, bIdx) => (
                      <div key={bIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-gray-800">{bank.bankName}</span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {bank.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-gray-500 font-medium">{bank.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Anticipated Queries & Objections
                  </h3>
                  <div className="space-y-2">
                    {(caseStudy.aiIntelligence.anticipatedQueries || []).map((q, qIdx) => (
                      <div key={qIdx} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-950 font-medium flex items-start gap-2">
                        <span className="font-mono font-bold text-amber-700 shrink-0">#{qIdx + 1}</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Similar Past Cases & Outcomes */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Historical Precedents & Verified Outcomes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(caseStudy.aiIntelligence.similarPastCases || []).map((sc, sIdx) => (
                    <div key={sIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-700">{sc.caseNumber}</span>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {sc.outcome}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">{sc.title}</h4>
                      <p className="text-gray-600 font-medium text-[11px]">
                        <span className="font-bold text-gray-700">Executed Solution: </span>
                        {sc.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents & Recommended Solutions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600" /> Missing Documents Checklist
                  </h3>
                  <div className="space-y-2">
                    {(caseStudy.aiIntelligence.missingDocuments || []).map((md, mdIdx) => (
                      <div key={mdIdx} className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                        <span>{md}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" /> Recommended Action Steps
                  </h3>
                  <div className="space-y-2">
                    {(caseStudy.aiIntelligence.recommendedSolutions || []).map((sol, solIdx) => (
                      <div key={solIdx} className="p-2.5 bg-purple-50/40 rounded-xl border border-purple-100 text-xs text-purple-950 font-medium flex items-start gap-2">
                        <span className="font-bold text-purple-700 shrink-0">{solIdx + 1}.</span>
                        <span>{sol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="font-black text-sm text-[#081326] truncate">{previewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(previewDoc.fileUrl)}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2 bg-gray-100 overflow-hidden flex items-center justify-center">
              {previewDoc.fileType === 'pdf' || previewDoc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <PdfViewer url={getAssetUrl(previewDoc.fileUrl)} title={previewDoc.name} className="h-full" />
              ) : (
                <ImageViewer src={getAssetUrl(previewDoc.fileUrl)} alt={previewDoc.name} className="max-h-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPLACE DOCUMENT MODAL */}
      {replacingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-600" /> Replace Document File
              </h3>
              <button onClick={() => setReplacingDoc(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Target Document</p>
                <p className="font-bold text-gray-800">{replacingDoc.name}</p>
                <p className="text-gray-500 font-medium text-[11px]">The document ID, serial order, and access links remain unchanged.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select New Replacement File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReplacingDoc(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplacing || !replacementFile}
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50"
                >
                  {isReplacing ? 'Replacing...' : 'Replace File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCUMENT DETAILS MODAL */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326]">Edit Document Details</h3>
              <button onClick={() => setEditingDoc(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditDocSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={editDocForm.name}
                  onChange={(e) => setEditDocForm({ ...editDocForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editDocForm.category}
                  onChange={(e) => setEditDocForm({ ...editDocForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editDocForm.notes}
                  onChange={(e) => setEditDocForm({ ...editDocForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confidentialDocToggle"
                  checked={editDocForm.isConfidential}
                  onChange={(e) => setEditDocForm({ ...editDocForm, isConfidential: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="confidentialDocToggle" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Confidential (Internal staff only • Hidden from shared link)
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOM FIELD MODAL */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326]">
                {fieldForm.id ? 'Edit Custom Field' : 'Add Custom Field'}
              </h3>
              <button onClick={() => setShowFieldModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-Registrar Volume Verification / Assessed FOIR"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Field Type</label>
                <select
                  value={fieldForm.fieldType}
                  onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                >
                  <option value="text">Single Line Text</option>
                  <option value="textarea">Paragraph / Multi-line Text</option>
                  <option value="number">Numeric</option>
                  <option value="currency">Currency (₹)</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown Selection</option>
                  <option value="boolean">Yes / No Toggle</option>
                </select>
              </div>

              {fieldForm.fieldType === 'select' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Dropdown Options (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={fieldForm.options}
                    onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
              )}

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequiredField"
                    checked={fieldForm.isRequired}
                    onChange={(e) => setFieldForm({ ...fieldForm, isRequired: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="isRequiredField" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Mandatory field
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isConfidentialField"
                    checked={fieldForm.isConfidential}
                    onChange={(e) => setFieldForm({ ...fieldForm, isConfidential: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="isConfidentialField" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Internal staff only (Hidden from external share links)
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d]"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-DOCUMENT UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#f59e0b]" /> Upload Documents
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Category</label>
                <input
                  type="text"
                  placeholder="e.g. Legal Deeds, Revenue Records, Valuation, Banking"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 30-Year Encumbrance Certificate"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Highlights (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Certified stamp visible on page 3"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uploadConfidentialCheck"
                  checked={uploadConfidential}
                  onChange={(e) => setUploadConfidential(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="uploadConfidentialCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Confidential (Internal staff only • Exclude from external link)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Files</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer"
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                      <span>Queue ({selectedFiles.length} files staged):</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    {selectedFiles.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg text-xs border border-gray-200">
                        <span className="truncate max-w-[260px] font-medium text-gray-700">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== fIdx))}
                          className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" /> + Add More Files
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {uploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' File(s)' : ''}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD OFFLINE QUERY MODAL */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#f59e0b]" /> Record Phone / Offline Query
              </h3>
              <button onClick={() => setShowQueryModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuerySubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Source</label>
                  <select
                    value={queryForm.source}
                    onChange={(e) => setQueryForm({ ...queryForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Physical Meeting</option>
                    <option value="internal">Internal Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Author Role</label>
                  <select
                    value={queryForm.authorRole}
                    onChange={(e) => setQueryForm({ ...queryForm, authorRole: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="banker">Banker</option>
                    <option value="advocate">Advocate / Legal</option>
                    <option value="valuer">Valuer / Technical</option>
                    <option value="ca">Chartered Accountant</option>
                    <option value="client">Client</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Verma"
                    value={queryForm.authorName}
                    onChange={(e) => setQueryForm({ ...queryForm, authorName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Organization / Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. PNB Credit Desk"
                    value={queryForm.bankName}
                    onChange={(e) => setQueryForm({ ...queryForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={queryForm.authorPhone}
                  onChange={(e) => setQueryForm({ ...queryForm, authorPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Query Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="What document, calculation, or legal clarification was requested?"
                  value={queryForm.queryText}
                  onChange={(e) => setQueryForm({ ...queryForm, queryText: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Initial Staff Reply / Action Taken (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Immediate clarification given or proposed next step..."
                  value={queryForm.staffReply}
                  onChange={(e) => setQueryForm({ ...queryForm, staffReply: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] cursor-pointer"
                >
                  Save Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE CASE MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Close Case Discussion
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseCase} className="space-y-4">
              <p className="text-xs text-gray-600 font-medium">
                Closing this case marks the discussion as concluded. You can reopen it at any time.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Final Outcome & Resolution Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Sanction approved by Bank with registered indemnity bond. Case resolved."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm & Close Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE GRANULAR SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#f59e0b]">
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#081326]">Configure Secure Case Share Link</h3>
                  <p className="text-[11px] text-gray-500 font-medium">{caseStudy.caseNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedShareUrl ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Share link ready with configured permissions!</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Shareable Link</label>
                  <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <input
                      type="text"
                      readOnly
                      value={generatedShareUrl}
                      className="flex-1 px-2.5 py-1.5 bg-transparent text-xs font-mono font-bold text-gray-800 outline-none select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedShareUrl);
                        toast.success('Share link copied!');
                      }}
                      className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `📁 KTR Consultants – Case Discussion\n\nCase: ${caseStudy.caseNumber} - ${caseStudy.title}\nPrepared for: ${shareForm.recipientName || shareForm.recipientType}\n${shareForm.passcode ? `🔑 Passcode: ${shareForm.passcode}\n` : ''}🔗 Review Case & Documents:\n${generatedShareUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: caseStudy.title,
                            url: generatedShareUrl
                          });
                          return;
                        } catch (e) {}
                      }
                      navigator.clipboard.writeText(generatedShareUrl);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share via Device</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratedShareUrl('')}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold mt-2"
                >
                  Generate Another Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateShareLink} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Role</label>
                    <select
                      value={shareForm.recipientType}
                      onChange={(e) => setShareForm({ ...shareForm, recipientType: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Banker">Banker / Credit Desk</option>
                      <option value="Advocate">Panel Advocate / Legal</option>
                      <option value="Valuer">Valuer / Technical Surveyor</option>
                      <option value="Chartered Accountant">Chartered Accountant</option>
                      <option value="Client">Client</option>
                      <option value="Other">Other Stakeholder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={shareForm.recipientName}
                      onChange={(e) => setShareForm({ ...shareForm, recipientName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Passcode / PIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 4821 (Leave blank if open)"
                      value={shareForm.passcode}
                      onChange={(e) => setShareForm({ ...shareForm, passcode: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Link Expiry (Days)</label>
                    <input
                      type="number"
                      placeholder="e.g. 30"
                      value={shareForm.expiresInDays}
                      onChange={(e) => setShareForm({ ...shareForm, expiresInDays: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                    />
                  </div>
                </div>

                {/* Visible Fields Checklist */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">Authorized Fields to Include:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = (caseStudy.customFields || []).filter(f => !f.isConfidential).map(f => f.id);
                        setShareForm(prev => ({
                          ...prev,
                          visibleFieldIds: prev.visibleFieldIds.length === allIds.length ? [] : allIds
                        }));
                      }}
                      className="text-[10px] text-amber-700 font-bold hover:underline"
                    >
                      {shareForm.visibleFieldIds.length === (caseStudy.customFields || []).filter(f => !f.isConfidential).length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    {(caseStudy.customFields || []).filter(f => !f.isConfidential).map((f) => {
                      const isChecked = shareForm.visibleFieldIds.includes(f.id);
                      return (
                        <label key={f.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...shareForm.visibleFieldIds, f.id]
                                : shareForm.visibleFieldIds.filter(id => id !== f.id);
                              setShareForm({ ...shareForm, visibleFieldIds: next });
                            }}
                            className="w-3.5 h-3.5 rounded text-amber-500"
                          />
                          <span className="truncate">{f.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Visible Documents Checklist */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">Authorized Documents to Include:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allDocIds = (caseStudy.documents || []).filter(d => !d.isConfidential).map(d => d.id);
                        setShareForm(prev => ({
                          ...prev,
                          visibleDocumentIds: prev.visibleDocumentIds.length === allDocIds.length ? [] : allDocIds
                        }));
                      }}
                      className="text-[10px] text-amber-700 font-bold hover:underline"
                    >
                      {shareForm.visibleDocumentIds.length === (caseStudy.documents || []).filter(d => !d.isConfidential).length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    {(caseStudy.documents || []).filter(d => !d.isConfidential).map((doc) => {
                      const isChecked = shareForm.visibleDocumentIds.includes(doc.id);
                      return (
                        <label key={doc.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...shareForm.visibleDocumentIds, doc.id]
                                : shareForm.visibleDocumentIds.filter(id => id !== doc.id);
                              setShareForm({ ...shareForm, visibleDocumentIds: next });
                            }}
                            className="w-3.5 h-3.5 rounded text-amber-500"
                          />
                          <span className="truncate">{doc.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowQueriesCheckbox"
                    checked={shareForm.allowQueries}
                    onChange={(e) => setShareForm({ ...shareForm, allowQueries: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="allowQueriesCheckbox" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Allow recipient to raise queries against this case
                  </label>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 font-medium">
                  <Lock className="w-3 h-3 inline mr-1 text-amber-700" />
                  Internal notes, confidential documents, and AI prompts are strictly excluded from this external view.
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingShare}
                    className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingShare ? 'Generating...' : 'Generate Share Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CaseStudyDetails;
