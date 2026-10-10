import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Plus, Trash2, Link as LinkIcon, Share2, Copy, Check, 
  User, Phone, Sparkles, CheckCircle2, Clock, Eye, AlertCircle, RefreshCw, X, ChevronRight, UploadCloud, Layers, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const standardDocChecklist = [
  { name: 'PAN Card', docType: 'panCard', description: 'Clear photo or PDF copy of PAN card' },
  { name: 'Aadhaar Card (Front & Back)', docType: 'aadhaar', description: 'Clear copy showing full address and DOB' },
  { name: 'Latest 3 Months Salary Slips', docType: 'salarySlip', description: 'Official signed / stamped salary slips' },
  { name: 'Latest 6 Months Bank Statement', docType: 'bankStatement', description: 'Original bank PDF with transaction details' },
  { name: 'Last 3 Years ITR / Form 16', docType: 'itr', description: 'ITR acknowledgement with computation of income' },
  { name: 'GST Registration Certificate & 3B Returns', docType: 'gst', description: 'For business owners and proprietors' },
  { name: 'Property Documents (Registry / Chain Deed / Map)', docType: 'propertyDoc', description: 'Clear title deed copies or approved map' },
  { name: 'Electricity Bill / Proof of Residence', docType: 'addressProof', description: 'Latest paid utility bill not older than 2 months' },
  { name: 'Passport Size Photograph', docType: 'photo', description: 'Recent passport photo of applicant' }
];

const RequestDocumentsForm = () => {
  const { user, role } = useAuth();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Request Setup State
  const [clientType, setClientType] = useState('new'); // 'new' | 'existing'
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [requestTitle, setRequestTitle] = useState('Required Documents Upload Request');
  const [requestDescription, setRequestDescription] = useState('Please upload the following verified clear documents to expedite your case processing.');

  // Selected Documents List
  const [selectedDocs, setSelectedDocs] = useState([
    { name: 'PAN Card', docType: 'panCard', required: true, description: 'Clear photo or PDF copy of PAN card' },
    { name: 'Aadhaar Card (Front & Back)', docType: 'aadhaar', required: true, description: 'Clear copy showing full address and DOB' },
    { name: 'Latest 6 Months Bank Statement', docType: 'bankStatement', required: true, description: 'Original bank PDF with transaction details' }
  ]);

  const [customDocName, setCustomDocName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/forms/my-forms?type=doc_request');
      if (res.data.success) {
        setMyRequests(res.data.forms || []);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchMyRequests();
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

  const handleToggleDoc = (doc) => {
    const exists = selectedDocs.find(d => d.name.toLowerCase() === doc.name.toLowerCase());
    if (exists) {
      setSelectedDocs(prev => prev.filter(d => d !== exists));
    } else {
      setSelectedDocs(prev => [...prev, { ...doc, required: true }]);
    }
  };

  const handleAddCustomDoc = () => {
    if (!customDocName.trim()) {
      toast.error('Please enter a document name');
      return;
    }
    const clean = customDocName.trim();
    setSelectedDocs(prev => [...prev, { name: clean, docType: 'custom', required: true, description: 'Client uploaded document' }]);
    setCustomDocName('');
    toast.success(`Added "${clean}"`);
  };

  const handleRemoveDoc = (index) => {
    setSelectedDocs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleRequired = (index) => {
    setSelectedDocs(prev => prev.map((d, idx) => idx === index ? { ...d, required: !d.required } : d));
  };

  const handleGenerateDocLink = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Please enter or select Client Name');
      return;
    }
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to request');
      return;
    }

    try {
      setIsGenerating(true);
      const payload = {
        type: 'doc_request',
        title: requestTitle.trim() || 'Required Documents Upload Link',
        description: requestDescription.trim(),
        clientType,
        clientId: clientType === 'existing' ? selectedClientId : undefined,
        clientName: clientName.trim(),
        clientMobile: clientMobile.trim(),
        requestedDocs: selectedDocs
      };

      const res = await api.post('/forms/create', payload);
      if (res.data.success) {
        setGeneratedLink(res.data.data);
        toast.success('Document upload link generated successfully!');
        fetchMyRequests();
      }
    } catch (err) {
      console.error('Create doc request error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate upload link');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullPublicUrl = (linkId) => {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return `${origin}/u/${linkId}`;
    }
    return `https://ktrconsultants.in/u/${linkId}`;
  };

  const handleCopyLink = (linkId) => {
    const url = getFullPublicUrl(linkId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Upload link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = (request) => {
    const url = getFullPublicUrl(request.linkId);
    const text = `📁 KTR Consultants – Document Upload Request\n\nClient: ${request.clientName || 'Client'}\n\n🔗 Upload Documents Here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this document request link?')) return;
    try {
      const res = await api.delete(`/forms/${id}`);
      if (res.data.success) {
        toast.success('Request link deleted');
        fetchMyRequests();
      }
    } catch (err) {
      toast.error('Failed to delete request link');
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#f59e0b]" /> Request Documents / Generate Upload Link
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Send a direct document upload link to the client for PAN, Aadhaar, ITR, Bank Statements, etc. Uploaded files automatically sync into the client's Document section.
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span>2. Create Form Link</span>
          </Link>

          <Link
            to="/doc-requests"
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#081326] text-white shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#f59e0b]" />
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
        {/* Left: Request Builder Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-black text-[#081326] flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="w-4 h-4 text-[#f59e0b]" /> 1. Client & Document Checklist
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
              <span className="text-[10px] text-gray-400 font-medium">Auto-creates new client profile</span>
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
              <span className="text-[10px] text-gray-400 font-medium">Auto-adds to client's Documents</span>
            </button>
          </div>

          {/* Client Selection */}
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
                  placeholder="e.g. Sanjay Verma"
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

          {/* Checklist of Standard Documents */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-600 mb-2.5">Click to add/remove required documents:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardDocChecklist.map(doc => {
                const isSelected = selectedDocs.some(d => d.name.toLowerCase() === doc.name.toLowerCase());
                return (
                  <button
                    key={doc.name}
                    type="button"
                    onClick={() => handleToggleDoc(doc)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#f59e0b] bg-amber-50/50 text-[#081326]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-[#081326] border-[#081326] text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-[#f59e0b] stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{doc.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Document Adder */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 flex gap-2 items-center">
            <input
              type="text"
              placeholder="+ Add Custom Document Requirement (e.g. Partnership Deed, Rent Agreement)"
              value={customDocName}
              onChange={(e) => setCustomDocName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-[#f59e0b]"
            />
            <button
              type="button"
              onClick={handleAddCustomDoc}
              className="px-4 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] shrink-0 cursor-pointer"
            >
              Add Doc
            </button>
          </div>

          {/* Active Requested Documents Preview */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <h4 className="text-xs font-black text-[#081326] flex items-center justify-between">
              <span>Selected Documents for this Link ({selectedDocs.length}):</span>
              <span className="text-[10px] text-gray-400 font-normal">All selected items have file-upload buttons for client</span>
            </h4>

            <div className="space-y-2">
              {selectedDocs.map((d, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black text-[#081326]">{d.name}</p>
                      {d.description && <p className="text-[10px] text-gray-400">{d.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(idx)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        d.required
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-gray-200/80 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {d.required ? 'Mandatory' : 'Optional'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleGenerateDocLink}
              disabled={isGenerating}
              className="w-full py-3 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4 text-[#f59e0b]" />}
              <span>{isGenerating ? 'Generating Upload Link...' : 'Generate Document Upload Link'}</span>
            </button>
          </div>
        </div>

        {/* Right: Generated Result & Recent Requests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Generated Link Card */}
          {generatedLink && (
            <div className="bg-white rounded-2xl border-2 border-[#f59e0b] shadow-md p-5 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-wider">Upload Link Ready!</h4>
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

          {/* Recent Document Requests List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#f59e0b]" /> Recent Document Requests
              </h3>
              <span className="text-xs font-bold text-gray-400">{myRequests.length} links</span>
            </div>

            {loadingRequests ? (
              <p className="text-xs text-gray-400 text-center py-6">Loading requests...</p>
            ) : myRequests.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6 italic">No document requests created yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myRequests.map(reqItem => (
                  <div key={reqItem._id} className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-100 flex flex-col gap-2 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-[#081326]">{reqItem.title}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Client: <span className="font-bold text-[#081326]">{reqItem.clientName}</span> ({reqItem.requestedDocs?.length || 0} Docs)
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        reqItem.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {reqItem.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[10px] text-gray-400 font-medium">
                      <span>{new Date(reqItem.createdAt).toLocaleDateString('en-IN')}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(reqItem.linkId)}
                          className="p-1 hover:bg-white text-gray-600 rounded"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(reqItem)}
                          className="p-1 hover:bg-white text-emerald-600 rounded"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(reqItem._id)}
                          className="p-1 hover:bg-white text-red-500 rounded"
                          title="Delete Request"
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

export default RequestDocumentsForm;
