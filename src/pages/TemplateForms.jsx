import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Plus, Copy, Share2, Check, CheckCircle2, 
  ArrowRight, Search, Filter, Layers, Clock, AlertCircle, RefreshCw,
  Trash2, Edit3, Eye, X, UploadCloud, User, Phone, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const standardCategories = ['All', 'Salaried Loans', 'Business Loans', 'Home & Property', 'Balance Transfer & Top-Up', 'KYC & Verification', 'Custom'];

const TemplateForms = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Use Template Modal State
  const [useModalTemplate, setUseModalTemplate] = useState(null);
  const [clientType, setClientType] = useState('existing'); // 'existing' | 'new'
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientMobile, setNewClientMobile] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Template Preview / Edit / Create Modal State
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Custom');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('data_form');
  const [newTemplateFields, setNewTemplateFields] = useState([
    { id: 'fullName', label: 'Full Name', type: 'text', required: true, mappedField: 'fullName' },
    { id: 'mobile', label: 'Mobile Number', type: 'text', required: true, mappedField: 'mobile' },
    { id: 'dob', label: 'Date of Birth (DOB)', type: 'date', required: false, mappedField: 'dob' },
    { id: 'occupation', label: 'Occupation / Business', type: 'text', required: false, mappedField: 'occupation' }
  ]);
  const [newCustomFieldLabel, setNewCustomFieldLabel] = useState('');
  const [newCustomFieldType, setNewCustomFieldType] = useState('text');
  const [newCustomFieldRequired, setNewCustomFieldRequired] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forms/templates');
      if (res.data.success) {
        setTemplates(res.data.templates || []);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
      toast.error('Failed to load master templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await api.get(role === 'admin' ? '/clients' : '/clients/my-clients');
      if (res.data.success) {
        setClients(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchClients();
  }, [role]);

  // Open "Use Template" modal
  const handleOpenUseModal = (tmpl) => {
    setUseModalTemplate(tmpl);
    setClientType('existing');
    setSelectedClientId('');
    setClientSearchTerm('');
    setNewClientName('');
    setNewClientMobile('');
    setCustomNote(tmpl.description || '');
    setGeneratedLinkData(null);
    setCopied(false);
  };

  // Close "Use Template" modal
  const handleCloseUseModal = () => {
    setUseModalTemplate(null);
    setGeneratedLinkData(null);
  };

  // Execute "Use Template"
  const handleExecuteUseTemplate = async (e) => {
    e.preventDefault();
    if (!useModalTemplate) return;

    if (clientType === 'existing' && !selectedClientId) {
      toast.error('Please select an existing client from the list');
      return;
    }
    if (clientType === 'new' && !newClientName.trim()) {
      toast.error('Please enter the client full name');
      return;
    }

    try {
      setIsGenerating(true);
      const payload = {
        clientType,
        clientId: clientType === 'existing' ? selectedClientId : undefined,
        clientName: clientType === 'new' ? newClientName.trim() : undefined,
        clientMobile: clientType === 'new' ? newClientMobile.trim() : undefined,
        customNote: customNote.trim()
      };

      const res = await api.post(`/forms/templates/${useModalTemplate._id}/use`, payload);
      if (res.data.success) {
        setGeneratedLinkData(res.data.data);
        toast.success(`Form link generated from "${useModalTemplate.title}"!`);
      }
    } catch (err) {
      console.error('Use template error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullPublicUrl = (linkId, type = 'data_form') => {
    const origin = window.location.origin;
    if (type === 'doc_request') {
      return `${origin}/u/${linkId}`;
    }
    return `${origin}/f/${linkId}`;
  };

  const handleCopyLink = (linkId, type) => {
    const url = getFullPublicUrl(linkId, type);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = (formData) => {
    const url = getFullPublicUrl(formData.linkId, formData.type);
    const text = `Dear ${formData.clientName},\n\nPlease fill out your information & verify documents on KTR Consultants Secure Portal:\n${url}\n\nThank you!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Create Custom Master Template
  const handleAddTemplateField = () => {
    if (!newCustomFieldLabel.trim()) {
      toast.error('Please enter a field label');
      return;
    }
    setNewTemplateFields(prev => [
      ...prev,
      {
        id: 'field_' + Date.now(),
        label: newCustomFieldLabel.trim(),
        type: newCustomFieldType,
        required: newCustomFieldRequired
      }
    ]);
    setNewCustomFieldLabel('');
    setNewCustomFieldType('text');
    setNewCustomFieldRequired(false);
  };

  const handleSaveNewTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplateTitle.trim()) {
      toast.error('Template title is required');
      return;
    }
    if (newTemplateFields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    try {
      setSavingTemplate(true);
      const payload = {
        title: newTemplateTitle.trim(),
        description: newTemplateDescription.trim(),
        category: newTemplateCategory,
        type: newTemplateType,
        fields: newTemplateFields
      };

      const res = await api.post('/forms/templates', payload);
      if (res.data.success) {
        toast.success('Master template created!');
        setShowCreateModal(false);
        setNewTemplateTitle('');
        setNewTemplateDescription('');
        fetchTemplates();
      }
    } catch (err) {
      console.error('Save template error:', err);
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      const res = await api.delete(`/forms/templates/${templateId}`);
      if (res.data.success) {
        toast.success('Template deleted');
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter existing clients for search in modal
  const filteredClients = clients.filter(c => {
    if (!clientSearchTerm) return true;
    const term = clientSearchTerm.toLowerCase();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(term)) ||
      (c.mobile && c.mobile.includes(term)) ||
      (c.applicationId && c.applicationId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Navigation Tabs Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#f59e0b]" /> Template Forms & Master Library
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Reusable master forms for Salaried, Business, Home Loan, BT, and KYC. Select <span className="font-bold text-[#081326]">"Use Template"</span> to instantly generate a secure link for an Existing or New Client.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#f59e0b]" />
              <span>+ Create Master Template</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <Link
            to="/template-forms"
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#081326] text-white shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>1. Template Forms</span>
          </Link>

          <Link
            to="/client-forms"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>2. Create Form Link</span>
          </Link>

          <Link
            to="/doc-requests"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-gray-400" />
            <span>3. Request Documents</span>
          </Link>

          <Link
            to="/filled-forms"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Filled Forms (Submissions)</span>
          </Link>
        </div>
      </div>

      {/* Categories & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {standardCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#081326] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <RefreshCw className="w-8 h-8 animate-spin text-[#f59e0b] mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-500">Loading master templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-3">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-black text-[#081326]">No templates found</h3>
          <p className="text-xs text-gray-400">Try changing the category filter or create a new master template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map(tmpl => {
            const fieldCount = tmpl.type === 'doc_request' ? (tmpl.requestedDocs?.length || 0) : (tmpl.fields?.length || 0);

            return (
              <div
                key={tmpl._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                      {tmpl.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      tmpl.type === 'doc_request' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {tmpl.type === 'doc_request' ? 'Doc Upload' : 'Data Form'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#081326] leading-snug">{tmpl.title}</h3>
                    {tmpl.description && (
                      <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 pt-1">
                    <span>{fieldCount} {tmpl.type === 'doc_request' ? 'Documents' : 'Fields'}</span>
                    {tmpl.isDefault && <span className="text-amber-600 font-semibold">• Master Default</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewTemplate(tmpl)}
                    className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!tmpl.isDefault && (
                      <button
                        onClick={() => handleDeleteTemplate(tmpl._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenUseModal(tmpl)}
                      className="px-4 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* "USE TEMPLATE" MODAL (Existing Client vs New Client Flow) */}
      {/* ========================================================================= */}
      {useModalTemplate && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#f59e0b] tracking-wider">Use Master Template</span>
                <h3 className="text-base font-black text-[#081326] mt-0.5">{useModalTemplate.title}</h3>
              </div>
              <button
                onClick={handleCloseUseModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedLinkData ? (
              <form onSubmit={handleExecuteUseTemplate} className="space-y-4">
                {/* Client Type Choice */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Select Client Target:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setClientType('existing'); setSelectedClientId(''); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        clientType === 'existing'
                          ? 'border-[#f59e0b] bg-amber-50/50 text-[#081326] shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-black">Existing Client</span>
                      <span className="text-[10px] text-gray-400">Select from My Applications</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setClientType('new'); setSelectedClientId(''); }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        clientType === 'new'
                          ? 'border-[#f59e0b] bg-amber-50/50 text-[#081326] shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-black">+ New Client</span>
                      <span className="text-[10px] text-gray-400">Auto-registers on submit</span>
                    </button>
                  </div>
                </div>

                {/* Existing Client Dropdown / Search */}
                {clientType === 'existing' ? (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-500">Choose Client from Applications:</label>
                    <input
                      type="text"
                      placeholder="Type name or mobile to filter..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#f59e0b]"
                    />
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                    >
                      <option value="">-- Select Client ({filteredClients.length} found) --</option>
                      {filteredClients.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.fullName} ({c.mobile || 'No mobile'} - {c.applicationId || 'Case'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Client Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Siddharth Singh"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Mobile Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={newClientMobile}
                        onChange={(e) => setNewClientMobile(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Custom Note / Client Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Instructions visible to client..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#f59e0b]" />}
                    <span>{isGenerating ? 'Generating Link...' : 'Generate & Share Link'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Generated Link Output */
              <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Form Link Ready!</h4>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 break-all select-all">
                  {getFullPublicUrl(generatedLinkData.linkId, generatedLinkData.type)}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(generatedLinkData.linkId, generatedLinkData.type)}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(generatedLinkData)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp Share</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleCloseUseModal}
                    className="text-xs text-gray-500 hover:text-gray-800 font-bold"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW TEMPLATE MODAL */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-[#f59e0b] tracking-wider">Template Preview</span>
                <h3 className="text-base font-black text-[#081326] mt-0.5">{previewTemplate.title}</h3>
                {previewTemplate.description && (
                  <p className="text-xs text-gray-500 mt-1">{previewTemplate.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-black text-gray-600">Included Fields / Documents:</h4>
              {(previewTemplate.type === 'doc_request' ? previewTemplate.requestedDocs : previewTemplate.fields || []).map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold flex items-center justify-center text-gray-600">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[#081326]">{item.label || item.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    item.required ? 'bg-red-50 text-red-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.required ? 'Required *' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tmpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleOpenUseModal(tmpl);
                }}
                className="px-5 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-black flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Use Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE MASTER TEMPLATE MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-[#081326]">Create Master Reusable Template</h3>
                <p className="text-xs text-gray-400">Save a reusable form that staff can use repeatedly for clients.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Template Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. LAP Mortgage Application Form"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Category</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  >
                    {standardCategories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Description / Instructions</label>
                <input
                  type="text"
                  placeholder="Short note about what this template is for..."
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              {/* Template Fields List */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-[#081326]">Fields in this Template ({newTemplateFields.length}):</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {newTemplateFields.map((f, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#081326]">{f.label} ({f.type})</span>
                      <button
                        type="button"
                        onClick={() => setNewTemplateFields(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Field Row */}
                <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="+ Field Label (e.g. Monthly Income)"
                    value={newCustomFieldLabel}
                    onChange={(e) => setNewCustomFieldLabel(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
                  />
                  <select
                    value={newCustomFieldType}
                    onChange={(e) => setNewCustomFieldType(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                    <option value="file">File</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTemplateField}
                    className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-5 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {savingTemplate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-[#f59e0b]" />}
                  <span>{savingTemplate ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateForms;
