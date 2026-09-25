import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Download, Eye, ShieldCheck, CheckCircle2, 
  Folder, Copy, Check, ChevronLeft, ChevronRight, ArrowLeft,
  Building, CreditCard, FileSpreadsheet, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { getAssetUrl } from '../utils/url';
import api from '../api/axios';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

const PRIMARY_DOC_META = [
  { key: 'panCardUrl', label: 'PAN Card', icon: CreditCard, subtitle: 'Permanent Account Number Card' },
  { key: 'aadhaarUrl', label: 'Aadhaar Card', icon: ShieldCheck, subtitle: '12-digit Unique Identification Card' },
  { key: 'salarySlipUrl', label: 'Salary Slips', icon: FileSpreadsheet, subtitle: 'Latest payslips / proof of income' },
  { key: 'bankStatementUrl', label: 'Bank Statement', icon: Building, subtitle: 'Operating bank statements' },
  { key: 'propertyDocUrl', label: 'Property Papers', icon: FileText, subtitle: 'Property title, map or registry docs' },
  { key: 'itrUrl', label: 'ITR Returns', icon: FileSpreadsheet, subtitle: 'Income Tax Return Acknowledgement' },
  { key: 'form16Url', label: 'Form 16', icon: FileText, subtitle: 'Annual tax certificate' },
  { key: 'idProofUrl', label: 'ID Proof', icon: ShieldCheck, subtitle: 'Official identity proof document' },
  { key: 'addressProofUrl', label: 'Address Proof', icon: Building, subtitle: 'Residential address proof' },
  { key: 'photoUrl', label: 'Photograph', icon: ImageIcon, subtitle: 'Passport size photograph' }
];

const SharedDocuments = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedDocs = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/clients/shared/${id}`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || 'Unable to load client documents.');
        }
      } catch (err) {
        console.error('Fetch shared docs error:', err);
        setError(err.response?.data?.message || 'This document share link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSharedDocs();
  }, [id]);

  const closePreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  const openPreview = useCallback((title, files, startIndex = 0) => {
    if (!files || files.length === 0) return;
    const formattedFiles = files.map(f => typeof f === 'string' ? { fileUrl: f, title } : f);
    try {
      window.history.pushState({ ktrSharedPreview: true }, '');
    } catch (e) {}

    setPreviewData({
      title,
      files: formattedFiles,
      activeIndex: Math.max(0, Math.min(startIndex, formattedFiles.length - 1))
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (previewData) {
        setPreviewData(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [previewData]);

  useEffect(() => {
    if (!previewData) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePreview();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPreviewData(prev => {
          if (!prev || prev.activeIndex >= prev.files.length - 1) return prev;
          return { ...prev, activeIndex: prev.activeIndex + 1 };
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPreviewData(prev => {
          if (!prev || prev.activeIndex <= 0) return prev;
          return { ...prev, activeIndex: prev.activeIndex - 1 };
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewData, closePreview]);

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
    } catch (err) {
      console.error('Error downloading file via blob fetch:', err);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareDocOnWhatsApp = (e, docTitle, fileUrl) => {
    if (e) e.preventDefault();
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const clientName = data?.fullName || 'Client';
    const message = `📄 *Document from KTR Consultants*\n\n*Client:* ${clientName}\n*Document:* ${docTitle}\n\n📎 *View / Download File:*\n${fullUrl}\n\n_KTR Consultants - Financial & Legal Services_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareCompleteOnWhatsApp = () => {
    const currentUrl = window.location.href;
    const clientName = data?.fullName || 'Client';
    const totalDocs = (data?.documentsList || []).length;
    const message = `📂 *KTR Consultants - Client Documents Portal*\n\n*Client:* ${clientName}\n*Ref ID:* ${data?.applicationId || 'N/A'}\n*Total Documents:* ${totalDocs} Files Available\n\n🔗 *Open Link to View & Download Complete Documents:*\n${currentUrl}\n\n_Click the link above to view, download, or save all case documents._\n\n*KTR Consultants*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isPdf = (url) => url && url.toLowerCase().split('?')[0].endsWith('.pdf');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-[#081326]">Loading Client Documents...</p>
          <p className="text-xs text-gray-500">Preparing high-resolution documents for secure viewing</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 flex flex-col items-center gap-4 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#081326]">Link Expired or Not Found</h3>
          <p className="text-xs text-gray-500">{error || 'The document link requested does not exist or has been removed.'}</p>
          <a 
            href="https://ktrconsultants.in" 
            className="mt-2 px-5 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all"
          >
            Visit KTR Consultants
          </a>
        </div>
      </div>
    );
  }

  // Assemble all available documents in exact ordered sequence
  const allAvailableDocs = [];
  const claimedUrls = new Set();

  // Primary standard docs
  PRIMARY_DOC_META.forEach(meta => {
    const files = [];
    if (data[meta.key]) {
      files.push({
        title: meta.label,
        fileUrl: data[meta.key]
      });
      claimedUrls.add(data[meta.key]);
    }

    (data.customDocuments || []).forEach(cd => {
      if (!cd.fileUrl || claimedUrls.has(cd.fileUrl)) return;
      const isMatch = cd.docType === meta.key || cd.category === meta.key || cd.category === meta.label ||
        (meta.key === 'propertyDocUrl' && (cd.category === 'Property Papers' || (cd.name && cd.name.toLowerCase().includes('property')) || (cd.name && cd.name.toLowerCase().includes('registry')) || (cd.fileUrl && cd.fileUrl.toLowerCase().includes('property')))) ||
        (meta.key === 'bankStatementUrl' && (cd.category === 'Bank Statements' || (cd.fileUrl && cd.fileUrl.toLowerCase().includes('bankstatement')))) ||
        (meta.key === 'salarySlipUrl' && (cd.category === 'Salary Slips' || (cd.fileUrl && cd.fileUrl.toLowerCase().includes('salaryslip'))));

      if (isMatch) {
        files.push({
          title: cd.name || meta.label,
          fileUrl: cd.fileUrl
        });
        claimedUrls.add(cd.fileUrl);
      }
    });

    if (files.length > 0) {
      allAvailableDocs.push({
        id: meta.key,
        docType: meta.key,
        title: meta.label,
        subtitle: files.length > 1 ? `${files.length} attached documents` : meta.subtitle,
        category: meta.label,
        files: files,
        fileUrl: files[0].fileUrl,
        icon: meta.icon,
        type: 'standard'
      });
    }
  });

  // Custom documents (group by title / name)
  const customGroups = new Map();
  (data.customDocuments || []).forEach((doc, idx) => {
    if (claimedUrls.has(doc.fileUrl)) return;
    claimedUrls.add(doc.fileUrl);

    const docName = (doc.name || 'Document').trim();
    if (customGroups.has(docName)) {
      customGroups.get(docName).files.push({
        title: doc.name,
        fileUrl: doc.fileUrl,
        docId: doc._id
      });
    } else {
      customGroups.set(docName, {
        id: `custom_${doc._id || idx}`,
        docId: doc._id,
        docType: 'custom',
        title: docName,
        subtitle: doc.notes || (doc.uploadedAt ? `Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}` : 'Client Document'),
        category: doc.category || 'Uploaded File',
        files: [{ title: doc.name, fileUrl: doc.fileUrl, docId: doc._id }],
        fileUrl: doc.fileUrl,
        icon: FileText,
        type: 'custom'
      });
    }
  });

  customGroups.forEach(groupDoc => {
    if (groupDoc.files.length > 1) {
      groupDoc.subtitle = `${groupDoc.files.length} attached files`;
    }
    allAvailableDocs.push(groupDoc);
  });

  // Custom Folders
  (data.customFolders || []).forEach(folder => {
    if (folder.documents && folder.documents.length > 0) {
      allAvailableDocs.push({
        id: `folder_${folder._id}`,
        docType: 'folder',
        title: folder.folderName || folder.name || 'Folder',
        subtitle: `${folder.documents.length} document(s)`,
        category: 'Custom Folder',
        folder: folder,
        type: 'folder'
      });
    }
  });

  // Other docs
  (data.otherDocs || []).forEach((url, idx) => {
    allAvailableDocs.push({
      id: `other_${idx}`,
      docType: 'other',
      title: `Additional Document ${idx + 1}`,
      subtitle: url.split('/').pop(),
      category: 'Additional Document',
      files: [{ title: `Additional Document ${idx + 1}`, fileUrl: url }],
      fileUrl: url,
      icon: FileText,
      type: 'other'
    });
  });

  // Sort by data.documentOrder if present
  const docOrder = data.documentOrder || [];
  const sortedAvailableDocs = [...allAvailableDocs].sort((a, b) => {
    if (docOrder.length === 0) return 0;
    const indexA = docOrder.indexOf(a.id);
    const indexB = docOrder.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const totalCount = sortedAvailableDocs.length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-[#081326] font-sans pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#081326] to-[#1e293b] flex items-center justify-center shadow-xs">
              <span className="text-amber-400 font-black text-lg tracking-tighter">KTR</span>
            </div>
            <div>
              <h1 className="text-sm font-black text-[#081326] tracking-tight flex items-center gap-1.5">
                KTR Consultants
                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-600" /> Verified Portal
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 font-medium">Official Client Documents Showcase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Copy Share Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleShareCompleteOnWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Client Hero Banner */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
                  Ref ID: {data.applicationId}
                </span>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                  {data.caseType}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#081326] tracking-tight">
                {data.fullName}
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-xl leading-relaxed">
                All case documents have been compiled and verified by KTR Consultants. You can review each document in full resolution, download to your device, or forward via WhatsApp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-left md:text-right w-full sm:w-auto">
                <p className="text-[10px] uppercase font-bold text-gray-400">Total Documents</p>
                <p className="text-2xl font-black text-[#081326]">{totalCount} Available</p>
                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 md:justify-end mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Ready to View & Save
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Case Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#081326] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f59e0b]" /> Case Documents ({sortedAvailableDocs.length})
            </h3>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
              Exact Serial Order
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAvailableDocs.map((item, idx) => {
              if (item.type === 'folder') {
                const folder = item.folder;
                const fDocs = folder.documents || [];
                const fTitle = folder.folderName || folder.name || 'Folder';

                return (
                  <div key={item.id} className="md:col-span-2 bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-black shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <Folder className="w-5 h-5 fill-amber-400 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#081326] flex items-center gap-2">
                            {fTitle}
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                              {fDocs.length} file{fDocs.length === 1 ? '' : 's'}
                            </span>
                          </h4>
                          {folder.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{folder.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {fDocs.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400">
                        No documents stored inside this folder yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fDocs.map((doc, dIdx) => (
                          <div 
                            key={dIdx}
                            className="p-3.5 bg-gray-50/80 border border-gray-200/70 rounded-2xl flex items-center justify-between gap-3 hover:bg-white hover:border-blue-200 transition-all"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-bold text-xs text-gray-800 truncate">{doc.name}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setPreviewFile({ url: doc.fileUrl, title: doc.name })}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDownloadFile(e, doc.fileUrl, doc.name)}
                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleShareDocOnWhatsApp(e, doc.name, doc.fileUrl)}
                                className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
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

              const IconComponent = item.icon || FileText;
              const hasMultipleFiles = item.files && item.files.length > 1;

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-black shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="w-11 h-11 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap sm:flex-nowrap">
                          <h4 className="font-bold text-sm text-[#081326] break-words whitespace-normal leading-snug">{item.title}</h4>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 shrink-0">
                            {hasMultipleFiles ? `${item.files.length} Files Available` : 'Available'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 break-words whitespace-normal mt-0.5">{item.subtitle || item.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* If multiple files exist for this category, list each file with its own actions */}
                  {hasMultipleFiles ? (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Attached Files ({item.files.length})
                        </p>
                        <button
                          onClick={() => openPreview(item.title, item.files, 0)}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Preview All ({item.files.length})
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.files.map((fileObj, fIdx) => (
                          <div 
                            key={fIdx}
                            className="p-3 bg-gray-50/90 border border-gray-200/70 rounded-xl flex items-center justify-between gap-2.5 hover:bg-white hover:border-blue-200 transition-all"
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                                {fIdx + 1}
                              </span>
                              <span className="font-bold text-xs text-gray-800 truncate" title={fileObj.title}>
                                {fileObj.title || fileObj.fileUrl.split('/').pop()}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openPreview(item.title, item.files, fIdx)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                                title="Preview File"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDownloadFile(e, fileObj.fileUrl, fileObj.title)}
                                className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleShareDocOnWhatsApp(e, fileObj.title, fileObj.fileUrl)}
                                className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                title="Share on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => openPreview(item.title, item.files || [{ fileUrl: item.fileUrl, title: item.title }], 0)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={(e) => handleDownloadFile(e, item.fileUrl, item.title)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={(e) => handleShareDocOnWhatsApp(e, item.title, item.fileUrl)}
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Send Document via WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info banner */}
        <footer className="pt-8 border-t border-gray-200/60 text-center space-y-2">
          <p className="text-xs font-bold text-[#081326]">KTR Consultants • Secure Financial & Legal Documentation</p>
          <p className="text-[11px] text-gray-400">
            For assistance, reach out via WhatsApp at +91 98380 94100 or visit{' '}
            <a href="https://ktrconsultants.in" className="text-blue-600 underline font-medium">ktrconsultants.in</a>
          </p>
        </footer>
      </main>

      {/* Fullscreen Multi-File Preview Modal with Next/Previous navigation & Back button */}
      {previewData && activePreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#081326]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/90 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={closePreview}
                  className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-700 flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors shrink-0"
                  title="Back to Documents"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#081326] flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <span className="truncate">{previewData.title}</span>
                  </h3>
                  {previewData.files.length > 1 && (
                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      File {previewData.activeIndex + 1} of {previewData.files.length}: <span className="font-mono text-gray-700">{activePreviewFile.fileUrl.split('/').pop()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Next/Prev */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {previewData.files.length > 1 && (
                  <div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200 mr-1">
                    <button
                      type="button"
                      disabled={previewData.activeIndex <= 0}
                      onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex - 1 }))}
                      className="p-1.5 hover:bg-white text-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Previous File (← Arrow Key)"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 text-gray-700">
                      {previewData.activeIndex + 1}/{previewData.files.length}
                    </span>
                    <button
                      type="button"
                      disabled={previewData.activeIndex >= previewData.files.length - 1}
                      onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex + 1 }))}
                      className="p-1.5 hover:bg-white text-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                      title="Next File (→ Arrow Key)"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                <button
                  onClick={(e) => handleDownloadFile(e, activePreviewFile.fileUrl, `${previewData.title}_${previewData.activeIndex + 1}`)}
                  className="px-3 py-1.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={(e) => handleShareDocOnWhatsApp(e, `${previewData.title} (Part ${previewData.activeIndex + 1})`, activePreviewFile.fileUrl)}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Share Document via WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={closePreview}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-gray-900/5 p-2 sm:p-4 flex items-center justify-center overflow-auto relative group">
              {/* Prev Floating Arrow */}
              {previewData.files.length > 1 && previewData.activeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex - 1 }))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-xl border border-gray-200 text-[#081326] flex items-center justify-center transition-all z-20 cursor-pointer hover:scale-105"
                  title="Previous File"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
              )}

              {/* Next Floating Arrow */}
              {previewData.files.length > 1 && previewData.activeIndex < previewData.files.length - 1 && (
                <button
                  type="button"
                  onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex + 1 }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white shadow-xl border border-gray-200 text-[#081326] flex items-center justify-center transition-all z-20 cursor-pointer hover:scale-105"
                  title="Next File"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              )}

              {isPdf(activePreviewFile.fileUrl) ? (
                <iframe
                  key={activePreviewFile.fileUrl}
                  src={`${getAssetUrl(activePreviewFile.fileUrl)}#toolbar=0`}
                  title={previewData.title}
                  className="w-full h-full rounded-2xl border border-gray-200 shadow-inner bg-white"
                />
              ) : (
                <img
                  key={activePreviewFile.fileUrl}
                  src={getAssetUrl(activePreviewFile.fileUrl)}
                  alt={previewData.title}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-lg border border-gray-200 bg-white"
                />
              )}
            </div>

            {/* Bottom thumbnail strip for multi-files */}
            {previewData.files.length > 1 && (
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-gray-500 uppercase shrink-0">Switch File:</span>
                {previewData.files.map((f, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: fIdx }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewData.activeIndex === fIdx
                        ? 'bg-[#081326] text-white shadow-sm ring-2 ring-[#081326]/20'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>File {fIdx + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedDocuments;
