import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Download, Eye, ShieldCheck, Copy, Check, ArrowLeft,
  Building, CreditCard, FileSpreadsheet, Image as ImageIcon, AlertCircle, 
  StickyNote, MoreVertical, Share2, Printer, ExternalLink, X, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssetUrl } from '../utils/url';
import api from '../api/axios';

const PRIMARY_DOC_META = [
  { key: 'panCardUrl', label: 'PAN Card', icon: CreditCard },
  { key: 'aadhaarUrl', label: 'Aadhaar Card', icon: ShieldCheck },
  { key: 'salarySlipUrl', label: 'Salary Slips', icon: FileSpreadsheet },
  { key: 'bankStatementUrl', label: 'Bank Statement', icon: Building },
  { key: 'propertyDocUrl', label: 'Property Papers', icon: FileText },
  { key: 'itrUrl', label: 'ITR Returns', icon: FileSpreadsheet },
  { key: 'form16Url', label: 'Form 16', icon: FileText },
  { key: 'idProofUrl', label: 'ID Proof', icon: ShieldCheck },
  { key: 'addressProofUrl', label: 'Address Proof', icon: Building },
  { key: 'photoUrl', label: 'Photograph', icon: ImageIcon }
];

const SharedDocuments = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // View mode: 'list' or 'continuous'
  const [viewMode, setViewMode] = useState('list');
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Active modal/action sheet for 3-dots
  const [menuDoc, setMenuDoc] = useState(null);
  const [shareDocModal, setShareDocModal] = useState(null);

  const docRefs = useRef({});

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

  // Handle browser / mobile back button navigation seamlessly
  useEffect(() => {
    const handlePopState = (event) => {
      if (viewMode === 'continuous') {
        setViewMode('list');
      }
      setMenuDoc(null);
      setShareDocModal(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewMode]);

  const openContinuousView = useCallback((index = 0) => {
    try {
      window.history.pushState({ ktrView: 'continuous' }, '');
    } catch (e) {}
    setViewMode('continuous');
    setActiveDocIndex(index);
    setMenuDoc(null);

    setTimeout(() => {
      const el = docRefs.current[index];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  }, []);

  const closeContinuousView = useCallback(() => {
    if (window.history.state?.ktrView === 'continuous') {
      window.history.back();
    } else {
      setViewMode('list');
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Top header native share (App Chooser: WhatsApp, WA Business, Email, Telegram, Drive...)
  const handleTopShare = async () => {
    const shareUrl = window.location.href;
    const clientName = data?.fullName || 'Client';
    const caseType = data?.caseType || data?.loanType || 'Loan Case';
    const title = `${clientName} - Documents Portal | KTR Finance`;
    const text = `📂 KTR Consultants - Client Documents Portal\nClient: ${clientName}\nCase Type: ${caseType}\n\nReview verified case documents here:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share dismissed or fallback needed', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Copy link & direct WhatsApp chooser intent
    handleCopyLink();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const downloadName = fileName || fileUrl.split('/').pop() || 'document';

    toast.loading('Preparing download...', { id: 'download-toast' });
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started!', { id: 'download-toast' });
    } catch (err) {
      console.error('Download error:', err);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', downloadName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Opening file download...', { id: 'download-toast' });
    }
  };

  // Share individual document link via native chooser
  const handleShareDocLink = async (docItem) => {
    const shareUrl = window.location.href;
    const clientName = data?.fullName || 'Client';
    const text = `📄 Document: ${docItem.title}\nClient: ${clientName}\n\n🔗 View securely on KTR Portal:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${docItem.title} - ${clientName}`,
          text: text,
          url: shareUrl
        });
        setShareDocModal(null);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.log('Share dismissed', err);
        else return;
      }
    }

    navigator.clipboard.writeText(`${text}`);
    toast.success('Document link copied to clipboard!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setShareDocModal(null);
  };

  // Share actual document file via native chooser (WhatsApp, WA Business, Email, Telegram, etc.)
  const handleShareDocFile = async (docItem) => {
    const fileUrl = docItem.fileUrl;
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const fileName = docItem.title.replace(/[^a-zA-Z0-9_-]/g, '_') + (fileUrl.toLowerCase().endsWith('.pdf') ? '.pdf' : '.jpg');

    toast.loading('Preparing file for sharing...', { id: 'share-file-toast' });

    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        toast.dismiss('share-file-toast');
        await navigator.share({
          files: [file],
          title: docItem.title,
          text: `${docItem.title} - ${data?.fullName || 'Client'}`
        });
        setShareDocModal(null);
        return;
      }
    } catch (err) {
      console.log('Native file share not supported or cancelled', err);
    }

    toast.dismiss('share-file-toast');
    // Fallback if native file share isn't supported on device
    handleShareDocLink(docItem);
  };

  // Print document
  const handlePrintDoc = (fileUrl, title) => {
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const isPdf = fileUrl.toLowerCase().split('?')[0].endsWith('.pdf');

    if (isPdf) {
      const printWin = window.open(fullUrl, '_blank');
      if (printWin) {
        printWin.focus();
      }
    } else {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title || 'Print Document'}</title>
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                @media print { body { margin: 0; } img { width: 100%; height: auto; } }
              </style>
            </head>
            <body>
              <img src="${fullUrl}" onload="window.print();" />
            </body>
          </html>
        `);
        printWin.document.close();
      }
    }
  };

  const isPdf = (url) => url && url.toLowerCase().split('?')[0].endsWith('.pdf');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-[#081326]">Loading Documents...</p>
          <p className="text-xs text-gray-500">Preparing high-resolution file preview</p>
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
        </div>
      </div>
    );
  }

  // Assemble all available documents in exact clean sequence
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
        notes: (data.documentNotes ? data.documentNotes[meta.label] : '') || '',
        category: meta.label,
        files: files,
        fileUrl: files[0].fileUrl,
        icon: meta.icon
      });
    }
  });

  // Custom standalone documents
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
      const docNote = doc.notes || (data.documentNotes ? data.documentNotes[docName] : '') || '';
      customGroups.set(docName, {
        id: `custom_${doc._id || idx}`,
        docId: doc._id,
        docType: 'custom',
        title: docName,
        notes: docNote,
        category: doc.category || 'Document',
        files: [{ title: doc.name, fileUrl: doc.fileUrl, docId: doc._id }],
        fileUrl: doc.fileUrl,
        icon: FileText
      });
    }
  });

  customGroups.forEach(groupDoc => {
    allAvailableDocs.push(groupDoc);
  });

  // Custom Folders (unroll files into flat list for easy banker review)
  (data.customFolders || []).forEach(folder => {
    (folder.documents || []).forEach(doc => {
      if (claimedUrls.has(doc.fileUrl)) return;
      claimedUrls.add(doc.fileUrl);
      allAvailableDocs.push({
        id: `folder_doc_${doc._id || Math.random()}`,
        title: doc.name || folder.folderName || 'Document',
        notes: doc.notes || '',
        category: folder.folderName || 'Folder File',
        files: [{ title: doc.name, fileUrl: doc.fileUrl }],
        fileUrl: doc.fileUrl,
        icon: FileText
      });
    });
  });

  // Other docs (if any unmapped)
  (data.otherDocs || []).forEach((url, idx) => {
    if (claimedUrls.has(url)) return;
    claimedUrls.add(url);
    allAvailableDocs.push({
      id: `other_${idx}`,
      title: `Additional Document ${idx + 1}`,
      notes: '',
      category: 'Document',
      files: [{ title: `Additional Document ${idx + 1}`, fileUrl: url }],
      fileUrl: url,
      icon: FileText
    });
  });

  // Respect sort order
  const docOrder = data.documentOrder || [];
  const sortedDocs = [...allAvailableDocs].sort((a, b) => {
    if (docOrder.length === 0) return 0;
    const indexA = docOrder.indexOf(a.id);
    const indexB = docOrder.indexOf(b.id);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const caseNotesText = data.caseNotes || data.notes || '';
  const formattedLoanAmount = data.loanAmount 
    ? Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#081326] font-sans pb-16">
      
      {/* 1. Clean Sticky Top Navigation Bar */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#081326] flex items-center justify-center text-amber-400 font-black text-sm">
              KTR
            </div>
            <div>
              <h1 className="text-xs font-black text-[#081326] tracking-tight flex items-center gap-1">
                KTR Consultants
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 inline" />
              </h1>
              <p className="text-[10px] text-gray-400 font-medium">Banker Document Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleTopShare}
              className="px-3 py-1.5 rounded-xl bg-[#081326] hover:bg-[#11203d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Share with Apps"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        
        {/* 2. Banker Case Summary (Only: Client Name, Profession, Loan Amount, Case Type, Case Notes) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Client Name */}
            <div className="col-span-2 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Client Name
              </span>
              <p className="text-base font-black text-[#081326] leading-tight truncate">
                {data.fullName || 'N/A'}
              </p>
            </div>

            {/* Profession */}
            <div className="col-span-1 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Profession
              </span>
              <p className="text-xs font-bold text-gray-800 truncate">
                {data.occupation || 'N/A'}
              </p>
            </div>

            {/* Loan Amount */}
            <div className="col-span-1 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Loan Amount
              </span>
              <p className="text-xs font-black text-emerald-700">
                {formattedLoanAmount}
              </p>
            </div>

            {/* Case Type */}
            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-100 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0">
                Case Type:
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate">
                {data.caseType || data.loanType || 'General Case'}
              </span>
            </div>
          </div>

          {/* Case Notes (if available) */}
          {caseNotesText && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1 mb-1">
                <StickyNote className="w-3 h-3 text-amber-600" /> Case Notes
              </span>
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                {caseNotesText}
              </div>
            </div>
          )}
        </div>

        {/* 3. Simple Clean Document List */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-[#081326] uppercase tracking-wider">
                Case Documents ({sortedDocs.length})
              </h2>
              <button
                onClick={() => openContinuousView(0)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Open Continuous Review
              </button>
            </div>

            {sortedDocs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-400">
                No documents uploaded yet for this case.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden shadow-xs">
                {sortedDocs.map((doc, idx) => {
                  const IconComp = doc.icon || FileText;
                  const hasMulti = doc.files && doc.files.length > 1;

                  return (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-amber-50/40 transition-colors group cursor-pointer select-none"
                      onClick={() => openContinuousView(idx)}
                    >
                      {/* Left: Document Icon & Clean Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#081326] group-hover:bg-[#081326] group-hover:text-amber-400 flex items-center justify-center shrink-0 transition-colors">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-bold text-[#081326] truncate">
                              {doc.title}
                            </h3>
                            {hasMulti && (
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                {doc.files.length} Pages
                              </span>
                            )}
                          </div>
                          {doc.notes && (
                            <p className="text-[11px] text-amber-700 font-medium truncate mt-0.5">
                              Note: {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Direct Arrow + Three-Dots Menu Button */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openContinuousView(idx)}
                          className="p-2 text-gray-400 hover:text-[#081326] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                          title="View Document"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuDoc({ ...doc, docIndex: idx });
                          }}
                          className="p-2 text-gray-500 hover:text-[#081326] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                          title="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. Continuous Document Viewing Feed (PAN → Aadhaar → MSME → ITR → Bank Statement...) */}
        {viewMode === 'continuous' && (
          <div className="space-y-4">
            {/* Sticky Viewer Navigation Bar */}
            <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeContinuousView}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>

              <span className="text-xs font-bold text-gray-500 truncate">
                Continuous Review ({sortedDocs.length} Docs)
              </span>

              <button
                type="button"
                onClick={handleTopShare}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                title="Share Full File"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-700" />
              </button>
            </div>

            {/* Continuous Vertical Feed of All Documents */}
            <div className="space-y-6">
              {sortedDocs.map((doc, idx) => {
                const IconComp = doc.icon || FileText;
                const docFiles = doc.files || [{ title: doc.title, fileUrl: doc.fileUrl }];

                return (
                  <div
                    key={doc.id || idx}
                    ref={(el) => (docRefs.current[idx] = el)}
                    id={`doc-section-${idx}`}
                    className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden scroll-mt-32"
                  >
                    {/* Document Section Header */}
                    <div className="p-3.5 sm:p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-black text-[#081326] truncate">
                            {doc.title}
                          </h3>
                          {doc.notes && (
                            <p className="text-[11px] text-amber-700 font-medium truncate">
                              Note: {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions for this doc */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(doc.fileUrl, doc.title)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareDocModal(doc)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintDoc(doc.fileUrl, doc.title)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                          title="Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Render Document Files / Pages */}
                    <div className="p-3 sm:p-4 bg-slate-100/50 space-y-4">
                      {docFiles.map((fileObj, fIdx) => (
                        <div key={fIdx} className="space-y-2">
                          {docFiles.length > 1 && (
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                              <span>Page / Attachment {fIdx + 1} of {docFiles.length}</span>
                              <a
                                href={getAssetUrl(fileObj.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Full View
                              </a>
                            </div>
                          )}

                          {isPdf(fileObj.fileUrl) ? (
                            <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                              <div className="w-full bg-[#081326] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold">
                                <span className="truncate">{fileObj.title || doc.title} (PDF)</span>
                                <a
                                  href={getAssetUrl(fileObj.fileUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-[#081326] rounded text-[10px] font-black flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" /> Open Tab
                                </a>
                              </div>
                              <iframe
                                src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(getAssetUrl(fileObj.fileUrl))}`}
                                title={fileObj.title || doc.title}
                                className="w-full h-[500px] sm:h-[650px] border-0 bg-white"
                              />
                            </div>
                          ) : (
                            <div className="w-full bg-white rounded-xl p-2 border border-gray-200 shadow-2xs flex justify-center items-center">
                              <img
                                src={getAssetUrl(fileObj.fileUrl)}
                                alt={fileObj.title || doc.title}
                                loading="lazy"
                                className="w-full max-h-[85vh] object-contain rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Back Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={closeContinuousView}
                className="px-5 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all cursor-pointer shadow-sm"
              >
                ← Back to Document List
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 5. Three-Dot Action Sheet / Bottom Modal */}
      {menuDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="absolute inset-0"
            onClick={() => setMenuDoc(null)}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#081326] truncate">{menuDoc.title}</h3>
                <p className="text-[11px] text-gray-400">Select an action</p>
              </div>
              <button
                onClick={() => setMenuDoc(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  openContinuousView(menuDoc.docIndex || 0);
                  setMenuDoc(null);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-amber-50 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#f59e0b]" />
                <div>
                  <p className="text-xs font-bold text-[#081326]">Open & View Document</p>
                  <p className="text-[10px] text-gray-400 font-normal">Review document in continuous feed</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetDoc = menuDoc;
                  setMenuDoc(null);
                  setShareDocModal(targetDoc);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-[#081326]">Share Document</p>
                  <p className="text-[10px] text-gray-400 font-normal">Share File or Share Link via Phone Apps</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDownloadFile(menuDoc.fileUrl, menuDoc.title);
                  setMenuDoc(null);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-[#081326]">Download Document</p>
                  <p className="text-[10px] text-gray-400 font-normal">Save original file to device</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePrintDoc(menuDoc.fileUrl, menuDoc.title);
                  setMenuDoc(null);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-purple-50 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-bold text-[#081326]">Print Document</p>
                  <p className="text-[10px] text-gray-400 font-normal">Send to connected printer</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Share Options Modal (Share File vs Share Link) */}
      {shareDocModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="absolute inset-0"
            onClick={() => setShareDocModal(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#081326] truncate">Share {shareDocModal.title}</h3>
                <p className="text-[11px] text-gray-400">Select sharing method</p>
              </div>
              <button
                onClick={() => setShareDocModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleShareDocFile(shareDocModal)}
                className="w-full p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left text-xs font-black text-amber-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share File</p>
                  <p className="text-[10px] text-gray-500 font-medium">Send actual document file (WhatsApp, Email, Drive...)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleShareDocLink(shareDocModal)}
                className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left text-xs font-black text-blue-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share Link</p>
                  <p className="text-[10px] text-gray-500 font-medium">Share secure viewing link</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedDocuments;
