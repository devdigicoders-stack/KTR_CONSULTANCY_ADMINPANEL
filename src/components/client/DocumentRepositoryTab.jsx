import { useState, useRef } from 'react';
import { 
  FileText, Download, Eye, Upload, CheckCircle2, 
  ExternalLink, Search, ChevronRight, ShieldCheck, FileSpreadsheet,
  Building, CreditCard, Image, FileCheck, Layers, PlusCircle, X, Trash2,
  Copy, Check, ArrowUp, ArrowDown
} from 'lucide-react';
import { getAssetUrl, getPublicShareDocsUrl } from '../../utils/url';
import api from '../../api/axios';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

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

const PRIMARY_DOCS = STANDARD_DOCS.slice(0, 6);
const SECONDARY_DOCS = STANDARD_DOCS.slice(6);

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

  // WhatsApp Share States
  const [shareDocTarget, setShareDocTarget] = useState(null); // { title, url }
  const [showShareBundleModal, setShowShareBundleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);

  // Document Serial Order State
  const [localOrder, setLocalOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const docRefs = useRef({});
  const fileInputRef = useRef(null);

  // Additional custom docs and folder docs
  const otherDocs = client?.otherDocs || [];
  const customDocuments = client?.customDocuments || [];
  const customFolders = client?.customFolders || [];

  const cleanMobile = (client?.mobileNumber || client?.phone || '').replace(/\D/g, '').slice(-10);
  const shareBundleUrl = client?._id ? getPublicShareDocsUrl(client._id) : '';

  const activeOrder = localOrder || client?.documentOrder || [];

  // Helper to gather all files for any standard document category
  const getDocFiles = (docKey, docLabel) => {
    const files = [];
    const seenUrls = new Set();

    // 1. Direct field on client (e.g. client.propertyDocUrl)
    if (client?.[docKey]) {
      files.push({
        id: `primary_${docKey}`,
        name: docLabel || 'Document',
        fileUrl: client[docKey],
        isPrimary: true,
        category: docLabel
      });
      seenUrls.add(client[docKey]);
    }

    // 2. Matching files from client.customDocuments
    customDocuments.forEach((cd, idx) => {
      if (!cd.fileUrl || seenUrls.has(cd.fileUrl)) return;

      const matchesDocType = cd.docType === docKey;
      const matchesCategory = cd.category === docKey || cd.category?.toLowerCase() === docLabel?.toLowerCase();

      // Heuristics for legacy uploads
      const isSpecialProperty = docKey === 'propertyDocUrl' && (
        cd.category === 'propertyDocUrl' ||
        cd.category === 'Property Papers' ||
        (cd.name && cd.name.toLowerCase().includes('property')) ||
        (cd.name && cd.name.toLowerCase().includes('registry')) ||
        (cd.fileUrl && cd.fileUrl.toLowerCase().includes('property'))
      );
      const isSpecialBank = docKey === 'bankStatementUrl' && (
        cd.category === 'bankStatementUrl' ||
        cd.category === 'Bank Statements' ||
        (cd.fileUrl && cd.fileUrl.toLowerCase().includes('bankstatement'))
      );
      const isSpecialSalary = docKey === 'salarySlipUrl' && (
        cd.category === 'salarySlipUrl' ||
        cd.category === 'Salary Slips' ||
        (cd.fileUrl && cd.fileUrl.toLowerCase().includes('salaryslip'))
      );
      const isSpecialPan = docKey === 'panCardUrl' && (
        cd.category === 'panCardUrl' ||
        cd.category === 'PAN Card' ||
        (cd.fileUrl && cd.fileUrl.toLowerCase().includes('pancard'))
      );
      const isSpecialAadhaar = docKey === 'aadhaarUrl' && (
        cd.category === 'aadhaarUrl' ||
        cd.category === 'Aadhaar Card' ||
        (cd.fileUrl && cd.fileUrl.toLowerCase().includes('aadhaar'))
      );

      if (matchesDocType || matchesCategory || isSpecialProperty || isSpecialBank || isSpecialSalary || isSpecialPan || isSpecialAadhaar) {
        files.push({
          id: `custom_${cd._id || idx}`,
          docId: cd._id,
          name: cd.name || docLabel,
          fileUrl: cd.fileUrl,
          uploadedAt: cd.uploadedAt,
          uploadedByName: cd.uploadedByName,
          isCustomDoc: true,
          category: docLabel,
          rawDoc: cd
        });
        seenUrls.add(cd.fileUrl);
      }
    });

    return files;
  };

  // Check if a custom document belongs to a standard document category
  const isDocClaimedByStandard = (cd) => {
    if (!cd || !cd.fileUrl) return false;
    for (const doc of STANDARD_DOCS) {
      if (cd.docType === doc.key) return true;
      if (cd.category === doc.key) return true;
      if (cd.category?.toLowerCase() === doc.label.toLowerCase()) return true;
    }
    const cat = (cd.category || '').toLowerCase();
    const name = (cd.name || '').toLowerCase();
    const url = (cd.fileUrl || '').toLowerCase();
    if (cat.includes('property') || name.includes('property') || name.includes('registry') || url.includes('property')) return true;
    if (cat.includes('bank statement') || url.includes('bankstatement')) return true;
    if (cat.includes('salary slip') || url.includes('salaryslip')) return true;
    if (cat.includes('pan card') || url.includes('pancard')) return true;
    if (cat.includes('aadhaar') || url.includes('aadhaar')) return true;
    return false;
  };

  // Only show custom docs that don't belong to a standard card
  const standaloneCustomDocs = customDocuments.filter(cd => !isDocClaimedByStandard(cd));

  // Build complete list of items in the repository
  const allDocItems = [
    // Primary Standard Docs
    ...PRIMARY_DOCS.map(doc => {
      const docFiles = getDocFiles(doc.key, doc.label);
      return {
        id: doc.key,
        anchorId: doc.id,
        itemType: 'standard',
        key: doc.key,
        label: doc.label,
        category: doc.category,
        description: doc.description,
        icon: doc.icon,
        files: docFiles,
        fileUrl: docFiles[0]?.fileUrl || null,
        hasFile: docFiles.length > 0
      };
    }),
    // Custom Named Docs (only standalone ones)
    ...standaloneCustomDocs.map((doc, idx) => ({
      id: `custom_${doc._id || idx}`,
      anchorId: `custom-doc-${doc._id || idx}`,
      itemType: 'custom',
      docId: doc._id,
      label: doc.name,
      category: doc.category || 'Uploaded Document',
      description: doc.notes ? `${doc.notes} • ` : (doc.uploadedAt ? `Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}` : 'Additional case document'),
      fileUrl: doc.fileUrl,
      files: [{ id: `custom_${doc._id || idx}`, name: doc.name, fileUrl: doc.fileUrl, docId: doc._id }],
      hasFile: !!doc.fileUrl,
      rawDoc: doc
    })),
    // Secondary Standard Docs
    ...SECONDARY_DOCS.map(doc => {
      const docFiles = getDocFiles(doc.key, doc.label);
      return {
        id: doc.key,
        anchorId: doc.id,
        itemType: 'standard',
        key: doc.key,
        label: doc.label,
        category: doc.category,
        description: doc.description,
        icon: doc.icon,
        files: docFiles,
        fileUrl: docFiles[0]?.fileUrl || null,
        hasFile: docFiles.length > 0
      };
    }),
    // Custom Folders
    ...customFolders.map(folder => ({
      id: `folder_${folder._id}`,
      anchorId: `folder-${folder._id}`,
      itemType: 'folder',
      folderId: folder._id,
      label: folder.folderName || folder.name || 'Folder',
      category: 'Custom Folder',
      rawFolder: folder
    })),
    // Other Docs (legacy)
    ...otherDocs.map((docUrl, idx) => ({
      id: `other_${idx}`,
      anchorId: `other-doc-${idx}`,
      itemType: 'other',
      label: `Additional Document ${idx + 1}`,
      category: 'Additional Document',
      description: docUrl.split('/').pop(),
      fileUrl: docUrl,
      files: [{ id: `other_${idx}`, name: `Additional Document ${idx + 1}`, fileUrl: docUrl }],
      hasFile: true,
      docIndex: idx
    }))
  ];

  // Sort by activeOrder if present
  const sortedDocItems = [...allDocItems].sort((a, b) => {
    const indexA = activeOrder.indexOf(a.id);
    const indexB = activeOrder.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedDocItems.length) return;

    const newItems = [...sortedDocItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const newOrderKeys = newItems.map(item => item.id);
    setLocalOrder(newOrderKeys);

    try {
      setSavingOrder(true);
      await api.put(`/clients/${client._id}/document-order`, {
        documentOrder: newOrderKeys
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to save document order:', err);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResetOrder = async () => {
    if (!window.confirm('Reset document sequence to default order?')) return;
    setLocalOrder([]);
    try {
      setSavingOrder(true);
      await api.put(`/clients/${client._id}/document-order`, {
        documentOrder: []
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to reset order:', err);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDownloadFile = async (e, fileUrl, customFileName) => {
    if (e) e.preventDefault();
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const fileName = customFileName || fileUrl.split('/').pop() || 'document';

    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file via blob fetch:', error);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async (text, setSuccessState) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setSuccessState(true);
      setTimeout(() => setSuccessState(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleShareDocOnWhatsApp = (docTitle, fileUrl, targetMobile = null) => {
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const clientName = client?.fullName || 'Client';
    const appId = client?.applicationId ? ` (${client.applicationId})` : '';
    const caseType = client?.caseType ? `\n📋 *Case Type:* ${client.caseType}` : '';
    
    const message = `📄 *Document:* ${docTitle}\n👤 *Client:* ${clientName}${appId}${caseType}\n\n📎 *Direct Document Link (Open to View / Download):*\n${fullUrl}\n\n_Sent via KTR Consultants Case Portal_`;
    
    if (targetMobile) {
      window.open(`https://wa.me/91${targetMobile}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleShareCompleteBundleOnWhatsApp = (targetMobile = null) => {
    if (!shareBundleUrl) return;
    const clientName = client?.fullName || 'Client';
    const appId = client?.applicationId ? `\n🆔 *Application ID:* ${client.applicationId}` : '';
    const caseType = client?.caseType ? `\n📋 *Case / Loan Type:* ${client.caseType}` : '';
    const totalFiles = PRIMARY_DOCS.concat(SECONDARY_DOCS).reduce((acc, d) => acc + getDocFiles(d.key, d.label).length, 0) + standaloneCustomDocs.length + otherDocs.length + customFolders.reduce((acc, f) => acc + (f.documents?.length || 0), 0);
    
    // Serial list of available documents in exact ordered sequence
    const availableItems = sortedDocItems.filter(
      item => item.hasFile || (item.itemType === 'folder' && item.rawFolder?.documents?.length > 0)
    );
    const uploadedDocsList = availableItems
      .map((item, idx) => {
        if (item.itemType === 'standard' && item.files?.length > 1) {
          return `${idx + 1}. 📄 *${item.label}* (${item.files.length} files - ${item.category})`;
        }
        return `${idx + 1}. 📄 *${item.label}* (${item.category})`;
      })
      .join('\n');

    const serialSection = uploadedDocsList ? `\n\n📋 *Documents Serial Order:*\n${uploadedDocsList}` : '';

    const message = `📂 *Case Documents: ${clientName}*${appId}${caseType}\n📊 *Total Documents:* ${totalFiles} available${serialSection}\n\n👉 *Open this link to view, preview, download or save all documents in this exact order:*\n${shareBundleUrl}\n\n_KTR Consultants - Financial & Legal Services_`;
    
    if (targetMobile) {
      window.open(`https://wa.me/91${targetMobile}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

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

      if (uploadCategory && uploadCategory.startsWith('folder_')) {
        const fId = uploadCategory.replace('folder_', '');
        const targetF = customFolders.find(f => f._id === fId || (f._id && f._id.toString() === fId.toString()));
        formData.append('folderId', fId);
        formData.append('docName', customDocTitle.trim() || '');
        formData.append('documentName', customDocTitle.trim() || '');
        formData.append('category', targetF?.folderName || targetF?.name || 'Folder Document');
      } else {
        formData.append('docType', uploadCategory);
        formData.append('docName', customDocTitle.trim() || '');
        formData.append('documentName', customDocTitle.trim() || '');
      }

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setCustomDocTitle('');
        setSelectedFiles([]);
        if (onRefresh) await onRefresh();
      }
    } catch (err) {
      console.error('Upload document error:', err);
      setUploadError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}_${f.size}_${f.lastModified}`));
      const fresh = incoming.filter(f => !existing.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...fresh];
    });

    // Clear input so selecting more files or re-selecting works every time
    e.target.value = '';
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDeleteDocItem = async (fileObj, docTypeKey) => {
    const fileName = fileObj.name || fileObj.title || 'Document';
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      const res = await api.delete(`/clients/${client._id}/documents`, {
        data: {
          docType: docTypeKey || fileObj.docType,
          docId: fileObj.docId || fileObj._id,
          fileUrl: fileObj.fileUrl,
          docName: fileName,
          reason: 'Deleted by staff'
        }
      });
      if (res.data.success && onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

  // Filtered list based on searchIndexQuery
  const displayedDocItems = sortedDocItems.filter(item => {
    if (!searchIndexQuery) return true;
    const q = searchIndexQuery.toLowerCase();
    return (
      (item.label || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
    );
  });

  const totalUploaded = PRIMARY_DOCS.concat(SECONDARY_DOCS).reduce((acc, d) => acc + getDocFiles(d.key, d.label).length, 0) + standaloneCustomDocs.length + otherDocs.length + customFolders.reduce((acc, f) => acc + (f.documents?.length || 0), 0);

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
              Organized case documents. Use <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">▲ ▼</span> buttons to reorder documents as needed.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            {activeOrder && activeOrder.length > 0 && (
              <button
                type="button"
                onClick={handleResetOrder}
                disabled={savingOrder}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Reset document sequence to default"
              >
                ↺ Reset Order
              </button>
            )}
            {savingOrder && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl animate-pulse">
                Saving order...
              </span>
            )}
            <div className="bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{totalUploaded} Available</span>
            </div>
            <button
              type="button"
              onClick={() => setShowShareBundleModal(true)}
              className="px-3.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              title="Share Complete Case Documents on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Share Complete Docs</span>
            </button>
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
          {displayedDocItems.map((item) => {
            const itemIndex = sortedDocItems.findIndex(i => i.id === item.id);
            const isFirst = itemIndex === 0;
            const isLast = itemIndex === sortedDocItems.length - 1;
            const isHighlighted = activeHighlight === item.anchorId;

            // 1. Standard Document (PAN, Aadhaar, Salary Slips, Property Papers, etc.)
            if (item.itemType === 'standard') {
              const files = item.files || [];
              const hasFile = files.length > 0;
              const isMultiFile = files.length > 1;
              const singleFile = files[0] || null;
              const IconComponent = item.icon || FileText;

              return (
                <div
                  key={item.id}
                  id={item.anchorId}
                  ref={(el) => (docRefs.current[item.anchorId] = el)}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-4 sm:p-5 shadow-xs ${
                    isHighlighted 
                      ? 'border-[#f59e0b] ring-4 ring-[#f59e0b]/20 bg-amber-50/10' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3 w-full sm:w-auto">
                      {/* Reorder control & Serial Badge */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          disabled={isFirst || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'up')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Up in sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="text-[10px] font-black text-amber-700 font-mono py-0.5" title={`Position #${itemIndex + 1}`}>
                          #{itemIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'down')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Down in sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        hasFile 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#081326] truncate">{item.label}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hasFile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {hasFile ? (isMultiFile ? `Uploaded (${files.length} files)` : 'Uploaded') : 'Not Uploaded'}
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
                            type="button"
                            onClick={() => {
                              setUploadCategory(item.key);
                              setCustomDocTitle('');
                              setSelectedFiles([]);
                              setShowUploadModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title="Add more files to this category"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-600" /> + Add More
                          </button>

                          {!isMultiFile && singleFile && (
                            <>
                              <button
                                onClick={() => setPreviewFile({ url: singleFile.fileUrl, title: singleFile.name || item.label })}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Preview
                              </button>
                              <button
                                onClick={(e) => handleDownloadFile(e, singleFile.fileUrl, singleFile.name || item.label)}
                                className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                              <button
                                type="button"
                                onClick={() => setShareDocTarget({ title: singleFile.name || item.label, url: singleFile.fileUrl })}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                title="Share on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocItem(singleFile, item.key)}
                                className="px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setUploadCategory(item.key);
                            setCustomDocTitle('');
                            setSelectedFiles([]);
                            setShowUploadModal(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#081326] text-white hover:bg-[#11203d] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#f59e0b]" /> Upload File(s)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Single File Inline Preview */}
                  {hasFile && !isMultiFile && singleFile && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600 truncate max-w-full">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-gray-900 truncate">{singleFile.name || item.label}</span>
                          <span className="text-gray-400 text-[11px] font-mono truncate">({singleFile.fileUrl.split('/').pop()})</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewFile({ url: singleFile.fileUrl, title: singleFile.name || item.label })}
                            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> Open Fullscreen View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multiple Files List */}
                  {hasFile && isMultiFile && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Attached Documents ({files.length} Files)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadCategory(item.key);
                            setCustomDocTitle('');
                            setSelectedFiles([]);
                            setShowUploadModal(true);
                          }}
                          className="text-amber-700 hover:underline cursor-pointer font-bold text-xs flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-600" /> + Add Another File
                        </button>
                      </div>
                      <div className="space-y-2">
                        {files.map((fileObj, fIdx) => (
                          <div key={fileObj.id || fIdx} className="bg-gray-50 hover:bg-gray-100/80 rounded-xl p-3 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                            <div className="flex items-center gap-2.5 text-xs text-gray-700 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                                #{fIdx + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">{fileObj.name || item.label}</p>
                                <p className="text-[11px] text-gray-400 font-mono truncate">{fileObj.fileUrl.split('/').pop()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => setPreviewFile({ url: fileObj.fileUrl, title: fileObj.name || item.label })}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title="Preview File"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDownloadFile(e, fileObj.fileUrl, fileObj.name || item.label)}
                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShareDocTarget({ title: fileObj.name || item.label, url: fileObj.fileUrl })}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                title="Share on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocItem(fileObj, item.key)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Delete File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Custom Uploaded Document
            if (item.itemType === 'custom') {
              const doc = item.rawDoc;
              return (
                <div
                  key={item.id}
                  id={item.anchorId}
                  ref={(el) => (docRefs.current[item.anchorId] = el)}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-4 sm:p-5 shadow-xs ${
                    isHighlighted 
                      ? 'border-[#f59e0b] ring-4 ring-[#f59e0b]/20 bg-amber-50/10' 
                      : 'border-amber-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3 w-full sm:w-auto">
                      {/* Reorder control & Serial Badge */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          disabled={isFirst || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'up')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Up in sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="text-[10px] font-black text-amber-700 font-mono py-0.5" title={`Position #${itemIndex + 1}`}>
                          #{itemIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'down')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Down in sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border bg-green-50 text-green-700 border-green-200">
                        <FileText className="w-5 h-5 stroke-[2]" />
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#081326] truncate">{doc.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Uploaded
                          </span>
                          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {doc.category || 'Uploaded Document'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {doc.notes ? `${doc.notes} • ` : ''}
                          {doc.uploadedAt ? `Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}` : 'Additional case document'}
                          {doc.uploadedByName ? ` • By ${doc.uploadedByName}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      <button
                        onClick={() => setPreviewFile({ url: doc.fileUrl, title: doc.name })}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={(e) => handleDownloadFile(e, doc.fileUrl, doc.name)}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareDocTarget({ title: doc.name, url: doc.fileUrl })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleDeleteDocItem(doc, 'customDocument')}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Preview / Filename with Open Fullscreen View */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600 truncate max-w-full">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-semibold text-gray-900">{doc.name}</span>
                        <span className="text-gray-400 text-[11px] truncate">({doc.fileUrl.split('/').pop()})</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setPreviewFile({ url: doc.fileUrl, title: doc.name })}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Fullscreen View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Custom Folder
            if (item.itemType === 'folder') {
              const folder = item.rawFolder;
              const fTitle = folder.folderName || folder.name || 'Folder';
              const docCount = folder.documents?.length || 0;

              return (
                <div
                  key={item.id}
                  id={item.anchorId}
                  ref={(el) => (docRefs.current[item.anchorId] = el)}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-4 sm:p-5 shadow-xs space-y-4 ${
                    isHighlighted 
                      ? 'border-[#f59e0b] ring-4 ring-[#f59e0b]/20 bg-amber-50/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* Reorder control & Serial Badge */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          disabled={isFirst || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'up')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Up in sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="text-[10px] font-black text-amber-700 font-mono py-0.5" title={`Position #${itemIndex + 1}`}>
                          #{itemIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'down')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Down in sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      <span className="text-xl">📁</span>
                      <div>
                        <h5 className="text-sm font-black text-[#081326] flex items-center gap-2">
                          {fTitle}
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                            {docCount} file{docCount === 1 ? '' : 's'}
                          </span>
                        </h5>
                        <p className="text-xs text-gray-400">Custom case folder</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadCategory(`folder_${folder._id}`);
                        setCustomDocTitle('');
                        setShowUploadModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#f59e0b]" /> + Add Document
                    </button>
                  </div>

                  {docCount === 0 ? (
                    <div className="py-3 text-center text-xs text-gray-400 font-medium">
                      No files in this folder yet. Click <strong>+ Add Document</strong> to upload files with a Document Name.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(folder.documents || []).map((fDoc, dIdx) => (
                        <div key={dIdx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:border-blue-200 transition-colors">
                          <span className="font-bold text-gray-800 truncate pr-2">{fDoc.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewFile({ url: fDoc.fileUrl, title: fDoc.name })}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              title="Preview File"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDownloadFile(e, fDoc.fileUrl, fDoc.name)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShareDocTarget({ title: fDoc.name, url: fDoc.fileUrl })}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Share on WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // 4. Legacy Other Document
            if (item.itemType === 'other') {
              const docUrl = item.fileUrl;
              return (
                <div
                  key={item.id}
                  id={item.anchorId}
                  ref={(el) => (docRefs.current[item.anchorId] = el)}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-4 sm:p-5 shadow-xs ${
                    isHighlighted 
                      ? 'border-[#f59e0b] ring-4 ring-[#f59e0b]/20 bg-amber-50/10' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Reorder control & Serial Badge */}
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 shadow-2xs">
                        <button
                          type="button"
                          disabled={isFirst || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'up')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Up in sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="text-[10px] font-black text-amber-700 font-mono py-0.5" title={`Position #${itemIndex + 1}`}>
                          #{itemIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast || savingOrder}
                          onClick={() => handleMoveItem(itemIndex, 'down')}
                          className="p-1 rounded text-gray-500 hover:text-amber-600 hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Move Down in sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-800">{item.label}</h5>
                        <p className="text-[11px] text-gray-400 font-mono truncate">{docUrl.split('/').pop()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewFile({ url: docUrl, title: item.label })}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDownloadFile(e, docUrl, item.label)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareDocTarget({ title: item.label, url: docUrl })}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
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

          {/* Jump List in exact serial sequence */}
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {displayedDocItems.map((item) => {
              const isSelected = activeHighlight === item.anchorId;
              const isPresent = item.hasFile || (item.itemType === 'folder' && (item.rawFolder?.documents?.length > 0));
              const originalIndex = sortedDocItems.findIndex(i => i.id === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToDoc(item.anchorId)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 text-amber-950 shadow-xs'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-mono font-bold text-amber-700 w-5 shrink-0">
                      #{originalIndex + 1}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isPresent ? 'bg-green-500' : 'bg-gray-300'
                    }`}></span>
                    <span className="truncate group-hover:text-[#f59e0b] transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#f59e0b] shrink-0" />
                </button>
              );
            })}
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
                  {customFolders.length > 0 && (
                    <optgroup label="📁 Custom Folders">
                      {customFolders.map(f => (
                        <option key={f._id} value={`folder_${f._id}`}>📁 {f.folderName || f.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Title / Note (Optional - if blank, original file name will be used)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registry Deed 130 & 131, Naksha / Map, HDFC Statement"
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Select Files (Single or Multiple) *
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-600" /> + Add More Files
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                />

                {selectedFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/60 p-5 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-gray-800">
                      Click to choose files (Multiple Supported)
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Select multiple files at once, or add more files one by one. Supports PDF, JPG, PNG, DOC, Excel.
                    </p>
                    <span className="mt-1 px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-bold shadow-2xs">
                      Browse Files
                    </span>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2 max-h-52 overflow-y-auto">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase px-1">
                      <span>Selected Files ({selectedFiles.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-amber-700 font-bold hover:underline cursor-pointer lowercase first-letter:uppercase"
                        >
                          + Add More
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles([])}
                          className="text-red-500 font-bold hover:underline cursor-pointer lowercase first-letter:uppercase"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-gray-200 gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate font-semibold text-gray-800 max-w-[220px]" title={f.name}>
                              {f.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-gray-400 font-mono font-medium">
                              {(f.size / 1024).toFixed(0)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(i)}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-[#f59e0b]" />
                  <span>
                    {uploading ? 'Uploading...' : (selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload Document')}
                  </span>
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
                <button
                  onClick={(e) => handleDownloadFile(e, previewFile.url, previewFile.title)}
                  className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setShareDocTarget({ title: previewFile.title, url: previewFile.url })}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-white" /> WhatsApp
                </button>
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

      {/* Individual Document WhatsApp Share Modal */}
      {shareDocTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#081326]">Share Document on WhatsApp</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Send direct paper link to client or banker</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShareDocTarget(null)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Document:</span>
                <span className="font-bold text-[#081326] truncate max-w-[220px]">{shareDocTarget.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Client:</span>
                <span className="font-bold text-[#081326]">{client?.fullName || 'Client'}</span>
              </div>
              {client?.applicationId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Application ID:</span>
                  <span className="font-mono text-gray-700 font-semibold">{client.applicationId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Share to any WhatsApp contact/group */}
              <button
                type="button"
                onClick={() => {
                  handleShareDocOnWhatsApp(shareDocTarget.title, shareDocTarget.url);
                  setShareDocTarget(null);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Share with Any Contact / Banker / Group</span>
              </button>

              {/* Option 2: Send directly to client if mobile exists */}
              {cleanMobile && (
                <button
                  type="button"
                  onClick={() => {
                    handleShareDocOnWhatsApp(shareDocTarget.title, shareDocTarget.url, cleanMobile);
                    setShareDocTarget(null);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send to Client directly ({cleanMobile})</span>
                </button>
              )}

              {/* Option 3: Copy direct URL & Open in tab */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(getAssetUrl(shareDocTarget.url), setCopiedDocUrl)}
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                >
                  {copiedDocUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  <span>{copiedDocUrl ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>
                <a
                  href={getAssetUrl(shareDocTarget.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                  title="Open file in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Case Documents Share Modal */}
      {showShareBundleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#081326]">Share Complete Documents</h3>
                  <p className="text-xs text-gray-500 font-medium">All case files in one secure shareable link</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowShareBundleModal(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Client:</span>
                <span>{client?.fullName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Application ID:</span>
                <span className="font-mono font-semibold">{client?.applicationId || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Documents Available:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{totalUploaded} Files</span>
              </div>
              <p className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-200/60 font-medium">
                Jise bhi ye link share karenge wo bina login kiye saare documents dekh sakte hain, preview kar sakte hain, aur download ya save kar sakte hain.
              </p>
            </div>

            {/* Ordered Documents Serial Sequence Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 max-h-40 overflow-y-auto space-y-1.5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Documents Serial Sequence</span>
                <span className="text-amber-700 font-mono">Current Order</span>
              </div>
              {sortedDocItems
                .filter(item => item.hasFile || (item.itemType === 'folder' && (item.rawFolder?.documents?.length > 0)))
                .map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 px-2.5 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold text-amber-700 text-[11px] w-5 shrink-0">#{idx + 1}</span>
                      <span className="font-semibold text-gray-800 truncate">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium">{item.category}</span>
                  </div>
                ))
              }
            </div>

            {/* Shareable Link Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Public Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareBundleUrl}
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareBundleUrl, setCopiedLink)}
                  className="px-3.5 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  handleShareCompleteBundleOnWhatsApp();
                  setShowShareBundleModal(false);
                }}
                className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Share Complete Docs on WhatsApp (Pick contact / group)</span>
              </button>

              {cleanMobile && (
                <button
                  type="button"
                  onClick={() => {
                    handleShareCompleteBundleOnWhatsApp(cleanMobile);
                    setShowShareBundleModal(false);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send Complete Docs to Client ({cleanMobile})</span>
                </button>
              )}

              <div className="flex gap-2 pt-1">
                <a
                  href={shareBundleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200 text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  <span>Open Link in New Tab (Preview Portal)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRepositoryTab;
