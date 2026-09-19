import React, { useState, useRef } from 'react';
import { 
  FileText, Download, Eye, Upload, CheckCircle2, AlertCircle, 
  ExternalLink, Search, ChevronRight, ShieldCheck, FileSpreadsheet,
  Building, CreditCard, Image, FileCheck, Layers, PlusCircle, X, Trash2
} from 'lucide-react';
import { getAssetUrl } from '../../utils/url';
import api from '../../api/axios';

const STANDARD_DOCS = [
  { key: 'panCardUrl', id: 'doc-pan', label: 'PAN Card', category: 'Identity', icon: CreditCard, description: 'Permanent Account Number Card' },
  { key: 'aadhaarUrl', id: 'doc-aadhaar', label: 'Aadhaar Card', category: 'Identity', icon: ShieldCheck, description: '12-digit Unique Identification Card' },
  { key: 'salarySlipUrl', id: 'doc-salary', label: 'Salary Slips', category: 'Income', icon: FileSpreadsheet, description: 'Latest 3 to 6 months payslips' },
  { key: 'itrUrl', id: 'doc-itr', label: 'Income Tax Return (ITR)', category: 'Income', icon: FileCheck, description: 'ITR acknowledgement & computation' },
  { key: 'form16Url', id: 'doc-form16', label: 'Form 16', category: 'Income', icon: FileText, description: 'Employer TDS Certificate Form 16' },
  { key: 'bankStatementUrl', id: 'doc-bank', label: 'Bank Statements', category: 'Banking', icon: Building, description: 'Last 6 to 12 months operating account statement' },
  { key: 'propertyDocUrl', id: 'doc-property', label: 'Property Papers', category: 'Collateral', icon: Layers, description: 'Title Deed, Chain Deed, Registry, Tax Receipts, Map' },
  { key: 'idProofUrl', id: 'doc-idproof', label: 'ID Proof', category: 'Identity', icon: CreditCard, description: 'Passport / Voter ID / Driving License' },
  { key: 'addressProofUrl', id: 'doc-address', label: 'Address Proof', category: 'Identity', icon: FileText, description: 'Electricity Bill, Rent Agreement, Utility Bill' },
  { key: 'photoUrl', id: 'doc-photo', label: 'Photograph', category: 'Identity', icon: Image, description: 'Passport size client photo' },
  { key: 'otherDocUrl', id: 'doc-other', label: 'Other Document (Primary)', category: 'Additional', icon: FileText, description: 'Supporting legal or business document' },
];

const DocumentRepositoryTab = ({ client, onRefresh }) => {
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchIndexQuery, setSearchIndexQuery] = useState('');

  // Multi-file Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('propertyDocUrl');
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const docRefs = useRef({});

  // Additional custom docs and folder docs
  const otherDocs = client?.otherDocs || [];
  const customDocuments = client?.customDocuments || [];
  const customFolders = client?.customFolders || [];

  const scrollToDoc = (docId) => {
    setActiveHighlight(docId);
    const element = document.getElementById(docId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setActiveHighlight(null);
    }, 2500);
  };

  const handleMultiFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || !client?._id) {
      alert('Please select at least one file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      formData.append('docType', uploadCategory);
      formData.append('docName', customDocTitle.trim() || '');

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setCustomDocTitle('');
        setSelectedFiles([]);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Upload document error:', err);
      setUploadError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCustomDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    try {
      const res = await api.delete(`/clients/${client._id}/documents`, {
        data: {
          docId: doc._id,
          fileUrl: doc.fileUrl,
          docName: doc.name,
          reason: 'Deleted by staff'
        }
      });
      if (res.data.success && onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

  // Filter Index items
  const filteredStandardDocs = STANDARD_DOCS.filter(d => 
    d.label.toLowerCase().includes(searchIndexQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchIndexQuery.toLowerCase())
  );

  const filteredCustomDocs = customDocuments.filter(d =>
    (d.name || '').toLowerCase().includes(searchIndexQuery.toLowerCase())
  );

  const totalUploaded = STANDARD_DOCS.filter(d => !!client?.[d.key]).length + customDocuments.length + otherDocs.length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative items-start">
      {/* Main Document Repository Section (Left Area) */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {uploadError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs font-bold">
            Upload Error: {uploadError}
          </div>
        )}

        {/* Section Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#f59e0b]" /> Document Repository
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Organized case documents. Upload single or multiple files with clear names.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{totalUploaded} Available</span>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0 ml-auto sm:ml-0"
            >
              <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> + Add Document(s)
            </button>
          </div>
        </div>

        {/* Document Cards List */}
        <div className="grid grid-cols-1 gap-5">
          {STANDARD_DOCS.map((item) => {
            const fileUrl = client?.[item.key];
            const hasFile = !!fileUrl;
            const IconComponent = item.icon;
            const isHighlighted = activeHighlight === item.id;

            return (
              <div
                key={item.id}
                id={item.id}
                ref={(el) => (docRefs.current[item.id] = el)}
                className={`bg-white rounded-2xl border transition-all duration-300 p-5 shadow-xs ${
                  isHighlighted 
                    ? 'border-[#f59e0b] ring-4 ring-[#f59e0b]/20 bg-amber-50/10' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      hasFile 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#081326]">{item.label}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasFile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {hasFile ? 'Uploaded' : 'Not Uploaded'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {hasFile ? (
                      <>
                        <button
                          onClick={() => setPreviewFile({ url: fileUrl, title: item.label })}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <a
                          href={getAssetUrl(fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setUploadCategory(item.key);
                          setCustomDocTitle(item.label);
                          setShowUploadModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#081326] text-white hover:bg-[#11203d] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#f59e0b]" /> Upload File(s)
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Preview if available */}
                {hasFile && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600 truncate max-w-full">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold truncate">{fileUrl.split('/').pop()}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewFile({ url: fileUrl, title: item.label })}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Fullscreen View
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Standalone Named Custom Uploaded Documents */}
          {customDocuments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#f59e0b]" /> Custom Uploaded Documents ({customDocuments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customDocuments.map((doc, idx) => {
                  const docId = `custom-doc-${doc._id || idx}`;
                  const isHighlighted = activeHighlight === docId;

                  return (
                    <div
                      key={doc._id || idx}
                      id={docId}
                      className={`p-3.5 bg-gray-50 border rounded-xl flex items-center justify-between gap-2 transition-all ${
                        isHighlighted ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-300' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate text-xs">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-gray-900 block truncate">{doc.name}</span>
                          <span className="text-[10px] text-gray-400">{doc.category || 'Document'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewFile({ url: doc.fileUrl, title: doc.name })}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getAssetUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteCustomDoc(doc)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional / Legacy Uploads Section */}
          {otherDocs.length > 0 && customDocuments.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#f59e0b]" /> Additional Documents ({otherDocs.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherDocs.map((docUrl, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate text-xs">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-gray-800 truncate">Doc {idx + 1}: {docUrl.split('/').pop()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewFile({ url: docUrl, title: `Document ${idx + 1}` })}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={getAssetUrl(docUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Folders Section */}
          {customFolders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#f59e0b]" /> Custom Folder Documents
              </h4>
              <div className="space-y-3">
                {customFolders.map(folder => (
                  <div key={folder._id} className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-2">
                    <h5 className="text-xs font-black text-[#081326]">📁 {folder.name || folder.folderName} ({folder.documents?.length || 0} files)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(folder.documents || []).map((doc, dIdx) => (
                        <div key={dIdx} className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-700 truncate">{doc.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setPreviewFile({ url: doc.fileUrl, title: doc.name })}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={getAssetUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Right-side Document Index */}
      <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h4 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f59e0b]" /> Document Index
            </h4>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Quick Jump
            </span>
          </div>

          {/* Search Index */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter index..."
              value={searchIndexQuery}
              onChange={(e) => setSearchIndexQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Jump List */}
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {filteredStandardDocs.map(doc => {
              const isPresent = !!client?.[doc.key];
              const isSelected = activeHighlight === doc.id;

              return (
                <button
                  key={doc.id}
                  onClick={() => scrollToDoc(doc.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 text-amber-950 shadow-xs'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isPresent ? 'bg-green-500' : 'bg-gray-300'
                    }`}></span>
                    <span className="truncate group-hover:text-[#f59e0b] transition-colors">{doc.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#f59e0b] shrink-0" />
                </button>
              );
            })}

            {filteredCustomDocs.map((doc, idx) => {
              const docId = `custom-doc-${doc._id || idx}`;
              const isSelected = activeHighlight === docId;

              return (
                <button
                  key={docId}
                  onClick={() => scrollToDoc(docId)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected ? 'bg-amber-100 text-amber-950 shadow-xs' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <span className="truncate group-hover:text-[#f59e0b] transition-colors">{doc.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#f59e0b] shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Pending / Missing</span>
          </div>
        </div>
      </div>

      {/* Multi-file Upload Modal with Document Name */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#f59e0b]" /> Upload Documents (Single / Multiple)
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMultiFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-500 font-bold cursor-pointer"
                >
                  <option value="propertyDocUrl">Property Papers / Documents</option>
                  <option value="bankStatementUrl">Bank Statements</option>
                  <option value="salarySlipUrl">Salary Slips</option>
                  <option value="itrUrl">Income Tax Return (ITR)</option>
                  <option value="form16Url">Form 16</option>
                  <option value="panCardUrl">PAN Card</option>
                  <option value="aadhaarUrl">Aadhaar Card</option>
                  <option value="idProofUrl">ID Proof</option>
                  <option value="addressProofUrl">Address Proof</option>
                  <option value="photoUrl">Photograph</option>
                  <option value="customDocument">Custom Named Document</option>
                  <option value="otherDocs">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Name / Title (Mention Name for easy identification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Property Registry Paper, HDFC 1 Year Statement, ITR 2024"
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Files (Multiple files supported: PDF / Images / Docs) *
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  required
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5 max-h-36 overflow-y-auto">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                    <span>Selected Files ({selectedFiles.length})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100">
                      <span className="truncate font-medium text-gray-700 max-w-[240px]">{f.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'Document'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-sm font-black text-[#081326] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#f59e0b]" /> {previewFile.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(previewFile.url)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-gray-900/5 p-4 flex items-center justify-center overflow-auto">
              {isPdf(previewFile.url) ? (
                <iframe
                  src={`${getAssetUrl(previewFile.url)}#toolbar=0`}
                  title={previewFile.title}
                  className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white"
                />
              ) : (
                <img
                  src={getAssetUrl(previewFile.url)}
                  alt={previewFile.title}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-gray-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRepositoryTab;
