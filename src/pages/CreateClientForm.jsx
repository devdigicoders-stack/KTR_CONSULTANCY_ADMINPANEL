import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Link as LinkIcon, Share2, Copy, Check, 
  User, Phone, Sparkles, CheckCircle2, Clock, Eye, AlertCircle, RefreshCw, X, ChevronRight, Layers, UploadCloud
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const standardFieldTemplates = [
  { id: 'fullName', label: 'Full Name', type: 'text', required: true, mappedField: 'fullName' },
  { id: 'mobile', label: 'Mobile Number', type: 'text', required: true, mappedField: 'mobile' },
  { id: 'fatherName', label: "Father's / Husband's Name", type: 'text', required: false, mappedField: 'fatherName' },
  { id: 'motherName', label: "Mother's Name", type: 'text', required: false, mappedField: 'motherName' },
  { id: 'dob', label: 'Date of Birth (DOB)', type: 'date', required: false, mappedField: 'dob' },
  { id: 'occupation', label: 'Occupation / Business Details', type: 'text', required: false, mappedField: 'occupation' },
  { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: false, mappedField: 'loanAmount' },
  { id: 'caseType', label: 'Loan / Case Type', type: 'text', required: false, mappedField: 'caseType' },
  { id: 'address', label: 'Complete Residential Address', type: 'textarea', required: false, mappedField: 'addressLine1' },
  { id: 'panNumber', label: 'PAN Card Number', type: 'text', required: false, mappedField: 'panNumber' },
  { id: 'aadhaarNumber', label: 'Aadhaar Number', type: 'text', required: false, mappedField: 'aadhaarNumber' },
  { id: 'photo', label: 'Passport Size Photo', type: 'file', required: false, mappedDocType: 'photo' },
  { id: 'panCard', label: 'Upload PAN Card', type: 'file', required: false, mappedDocType: 'panCard' },
  { id: 'aadhaar', label: 'Upload Aadhaar Card', type: 'file', required: false, mappedDocType: 'aadhaar' }
];

const CreateClientForm = () => {
  const { user, role } = useAuth();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [myForms, setMyForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);

  // Form Creation State
  const [clientType, setClientType] = useState('new'); // 'new' | 'existing'
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [formTitle, setFormTitle] = useState('Client Data Collection Form');
  const [formDescription, setFormDescription] = useState('Please fill out the following basic details and verify your information.');
  
  // Custom Fields Builder State
  const [fields, setFields] = useState([
    { id: 'fullName', label: 'Full Name', type: 'text', required: true, mappedField: 'fullName' },
    { id: 'mobile', label: 'Mobile Number', type: 'text', required: true, mappedField: 'mobile' },
    { id: 'fatherName', label: "Father's / Mother's Name", type: 'text', required: false, mappedField: 'fatherName' },
    { id: 'dob', label: 'Date of Birth (DOB)', type: 'date', required: false, mappedField: 'dob' },
    { id: 'occupation', label: 'Occupation / Business Details', type: 'text', required: false, mappedField: 'occupation' },
    { id: 'address', label: 'Complete Address', type: 'textarea', required: false, mappedField: 'addressLine1' }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Quick Add Field Modal / Row
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

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

  const fetchMyForms = async () => {
    try {
      setLoadingForms(true);
      const res = await api.get('/forms/my-forms?type=data_form');
      if (res.data.success) {
        setMyForms(res.data.forms || []);
      }
    } catch (err) {
      console.error('Fetch forms error:', err);
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchMyForms();
  }, [role]);

  const handleSelectExistingClient = (e) => {
    const cId = e.target.value;
    setSelectedClientId(cId);
    const found = clients.find(c => c._id === cId);
    if (found) {
      setClientName(found.fullName);
      setClientMobile(found.mobile || '');
    }
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) {
      toast.error('Please enter a field label');
      return;
    }
    const newField = {
      id: 'custom_' + Date.now(),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired
    };
    setFields(prev => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    toast.success('Field added');
  };

  const handleToggleTemplateField = (tmpl) => {
    const exists = fields.find(f => f.id === tmpl.id || f.label.toLowerCase() === tmpl.label.toLowerCase());
    if (exists) {
      setFields(prev => prev.filter(f => f !== exists));
    } else {
      setFields(prev => [...prev, { ...tmpl }]);
    }
  };

  const handleRemoveField = (index) => {
    setFields(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleRequired = (index) => {
    setFields(prev => prev.map((f, idx) => idx === index ? { ...f, required: !f.required } : f));
  };

  const handleGenerateFormLink = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Please enter or select a Client Name');
      return;
    }
    if (fields.length === 0) {
      toast.error('Please add at least one field to the form');
      return;
    }

    try {
      setIsGenerating(true);
      const payload = {
        type: 'data_form',
        title: formTitle.trim() || 'Client Data Collection Form',
        description: formDescription.trim(),
        clientType,
        clientId: clientType === 'existing' ? selectedClientId : undefined,
        clientName: clientName.trim(),
        clientMobile: clientMobile.trim(),
        fields
      };

      const res = await api.post('/forms/create', payload);
      if (res.data.success) {
        setGeneratedLink(res.data.data);
        toast.success('Form link generated successfully!');
        fetchMyForms();
      }
    } catch (err) {
      console.error('Create form error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate form link');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullPublicUrl = (linkId) => {
    const origin = window.location.origin;
    return `${origin}/form/${linkId}`;
  };

  const handleCopyLink = (linkId) => {
    const url = getFullPublicUrl(linkId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = (form) => {
    const url = getFullPublicUrl(form.linkId);
    const text = `Dear ${form.clientName},\n\nPlease fill out your information form on KTR Consultants Secure Portal:\n${url}\n\nThank you!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteForm = async (id) => {
    if (!window.confirm('Delete this form link?')) return;
    try {
      const res = await api.delete(`/forms/${id}`);
      if (res.data.success) {
        toast.success('Form link deleted');
        fetchMyForms();
      }
    } catch (err) {
      toast.error('Failed to delete form link');
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#f59e0b]" /> Create Form & Generate Link
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Build custom data collection forms with required/optional fields and file uploads. Client submissions automatically update or register clients in My Applications.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <Link
            to="/template-forms"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>1. Template Forms</span>
          </Link>

          <Link
            to="/client-forms"
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#081326] text-white shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#f59e0b]" />
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Form Builder Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-black text-[#081326] flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="w-4 h-4 text-[#f59e0b]" /> 1. Client & Form Setup
          </h3>

          {/* Client Type Choice */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setClientType('new'); setSelectedClientId(''); }}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                clientType === 'new'
                  ? 'border-[#f59e0b] bg-amber-50/40 text-[#081326] shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-black">+ New Client</span>
              <span className="text-[10px] text-gray-400 font-medium">Auto-creates new client on submit</span>
            </button>

            <button
              type="button"
              onClick={() => setClientType('existing')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                clientType === 'existing'
                  ? 'border-[#f59e0b] bg-amber-50/40 text-[#081326] shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-black">Existing Client</span>
              <span className="text-[10px] text-gray-400 font-medium">Select from My Applications</span>
            </button>
          </div>

          {/* Client Details Inputs */}
          {clientType === 'existing' ? (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Select Existing Client</label>
              <select
                value={selectedClientId}
                onChange={handleSelectExistingClient}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
              >
                <option value="">-- Choose a client from My Applications --</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} ({c.mobile || 'No mobile'} - {c.applicationId || 'Case'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Client Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Client Mobile (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={clientMobile}
                  onChange={(e) => setClientMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Brief Note / Instructions</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          {/* Quick Template Fields Checklist */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-600 mb-2">Quick Standard Fields:</h4>
            <div className="flex flex-wrap gap-1.5">
              {standardFieldTemplates.map(tmpl => {
                const isSelected = fields.some(f => f.id === tmpl.id || f.label.toLowerCase() === tmpl.label.toLowerCase());
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleToggleTemplateField(tmpl)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#081326] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-[#f59e0b]" /> : <Plus className="w-3 h-3" />}
                    <span>{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Fields List */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-black text-[#081326] flex items-center justify-between">
              <span>Form Fields in this Link ({fields.length}):</span>
              <span className="text-[10px] text-gray-400 font-normal">Toggle Required / Optional per field</span>
            </h4>

            <div className="space-y-2">
              {fields.map((f, idx) => (
                <div key={f.id || idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black text-[#081326]">{f.label}</p>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">{f.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(idx)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        f.required
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {f.required ? 'Required *' : 'Optional'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Field Adder Row */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="+ Custom Field Name"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#f59e0b] w-full"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
              >
                <option value="text">Text Input</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea (Long text)</option>
                <option value="file">File Upload</option>
              </select>
              <button
                type="button"
                onClick={handleAddField}
                className="px-4 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] shrink-0 cursor-pointer w-full sm:w-auto"
              >
                Add Field
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleGenerateFormLink}
              disabled={isGenerating}
              className="w-full py-3 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4 text-[#f59e0b]" />}
              <span>{isGenerating ? 'Generating Link...' : 'Generate Form & Link'}</span>
            </button>
          </div>
        </div>

        {/* Right: Generated Link Result & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Generated Link Card */}
          {generatedLink && (
            <div className="bg-white rounded-2xl border-2 border-[#f59e0b] shadow-md p-5 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-wider">Form Link Ready!</h4>
              </div>

              <p className="text-sm font-black text-[#081326] mb-1">{generatedLink.title}</p>
              <p className="text-xs text-gray-500 font-medium mb-3">For: <span className="font-bold text-[#081326]">{generatedLink.clientName}</span> ({generatedLink.clientType})</p>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 break-all mb-4 select-all">
                {getFullPublicUrl(generatedLink.linkId)}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyLink(generatedLink.linkId)}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(generatedLink)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Created Forms List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#f59e0b]" /> Recent Created Forms
              </h3>
              <span className="text-xs font-bold text-gray-400">{myForms.length} links</span>
            </div>

            {loadingForms ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading forms...</p>
            ) : myForms.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 italic">No form links created yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myForms.map(form => (
                  <div key={form._id} className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-100 flex flex-col gap-2 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-[#081326]">{form.title}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Client: <span className="font-bold text-[#081326]">{form.clientName}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        form.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {form.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                      <span>{new Date(form.createdAt).toLocaleDateString('en-IN')}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(form.linkId)}
                          className="p-1 hover:bg-white text-gray-600 rounded"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(form)}
                          className="p-1 hover:bg-white text-emerald-600 rounded"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form._id)}
                          className="p-1 hover:bg-white text-red-500 rounded"
                          title="Delete Form"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClientForm;
