import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, Download, Eye, ShieldCheck, Copy, Check, ArrowLeft,
  Building, CreditCard, FileSpreadsheet, Image as ImageIcon, AlertCircle, 
  StickyNote, MoreVertical, Share2, Printer, ExternalLink, X, ChevronRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { getAssetUrl } from '../utils/url';
import api from '../api/axios';
import PdfViewer from '../components/common/PdfViewer';
import ImageViewer from '../components/common/ImageViewer';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SharedDocuments = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // View mode: 'list' or 'continuous'
  const [viewMode, setViewMode] = useState('list');
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Active modals
  const [menuDoc, setMenuDoc] = useState(null);
  const [shareDocModal, setShareDocModal] = useState(null);
  const [topShareModal, setTopShareModal] = useState(false);

  // Printing progress state
  const [printingProgress, setPrintingProgress] = useState({ active: false, current: 0, total: 0, status: '' });

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
    const handlePopState = () => {
      if (viewMode === 'continuous') {
        setViewMode('list');
      }
      setMenuDoc(null);
      setShareDocModal(null);
      setTopShareModal(false);
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

  // Top header native share: Link option
  const handleSharePortalLink = async () => {
    const shareUrl = window.location.href;
    const clientName = data?.fullName || 'Client';
    const caseType = data?.caseType || data?.loanType || 'Loan Case';
    const title = `${clientName} - Documents Portal | KTR Finance`;
    const text = `📂 KTR Consultants - Client Documents Portal\nClient: ${clientName}\nCase Type: ${caseType}\n\nReview verified case documents here:\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        setTopShareModal(false);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.log('Share dismissed', err);
        else {
          setTopShareModal(false);
          return;
        }
      }
    }

    navigator.clipboard.writeText(text);
    toast.success('Portal link copied to clipboard!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setTopShareModal(false);
  };

  // Top header native share: Files option (all documents in case)
  const handleShareAllFiles = async (docsToShare) => {
    const allFiles = [];
    docsToShare.forEach(doc => {
      const files = doc.files || [{ title: doc.title, fileUrl: doc.fileUrl }];
      files.forEach(f => {
        if (f.fileUrl) {
          allFiles.push({ title: f.title || doc.title, fileUrl: f.fileUrl });
        }
      });
    });

    if (allFiles.length === 0) {
      toast.error('No files available to share.');
      setTopShareModal(false);
      return;
    }

    toast.loading('Preparing files for sharing...', { id: 'share-all-toast' });

    try {
      const fileObjects = [];
      for (const item of allFiles.slice(0, 10)) { // limit to 10 files max per intent for mobile stability
        const fullUrl = getAssetUrl(item.fileUrl);
        const fileName = (item.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_') + (item.fileUrl.toLowerCase().endsWith('.pdf') ? '.pdf' : '.jpg');
        const res = await fetch(fullUrl);
        const blob = await res.blob();
        fileObjects.push(new File([blob], fileName, { type: blob.type || 'application/octet-stream' }));
      }

      if (navigator.canShare && navigator.canShare({ files: fileObjects })) {
        toast.dismiss('share-all-toast');
        await navigator.share({
          files: fileObjects,
          title: `${data?.fullName || 'Client'} - Documents`,
          text: `Verified Case Documents for ${data?.fullName || 'Client'}`
        });
        setTopShareModal(false);
        return;
      }
    } catch (err) {
      console.log('Native all-files share not supported or dismissed', err);
    }

    toast.dismiss('share-all-toast');
    handleSharePortalLink();
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
        else {
          setShareDocModal(null);
          return;
        }
      }
    }

    navigator.clipboard.writeText(text);
    toast.success('Document link copied to clipboard!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setShareDocModal(null);
  };

  // Share individual document file via native chooser
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
    handleShareDocLink(docItem);
  };

  // SMART PRINTING SYSTEM: Auto Orientation (Portrait / Landscape) & Perfect Page Fit
  const handleSmartPrint = async (docsToPrint, printTitle = 'Client Documents') => {
    if (!docsToPrint || docsToPrint.length === 0) {
      toast.error('No documents available to print.');
      return;
    }

    const allFiles = [];
    docsToPrint.forEach(doc => {
      const files = doc.files || [{ title: doc.title, fileUrl: doc.fileUrl }];
      files.forEach((f, idx) => {
        if (f.fileUrl) {
          allFiles.push({
            docTitle: doc.title,
            fileTitle: f.title || doc.title,
            fileUrl: f.fileUrl,
            pageLabel: files.length > 1 ? `Page ${idx + 1} of ${files.length}` : ''
          });
        }
      });
    });

    if (allFiles.length === 0) {
      toast.error('No document files found.');
      return;
    }

    setPrintingProgress({
      active: true,
      current: 0,
      total: allFiles.length,
      status: `Initializing print engine for ${allFiles.length} file(s)...`
    });

    try {
      const renderedPages = [];

      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        const fullUrl = getAssetUrl(file.fileUrl);
        const isFilePdf = isPdf(file.fileUrl);

        setPrintingProgress({
          active: true,
          current: i + 1,
          total: allFiles.length,
          status: `Processing ${file.fileTitle} (${i + 1}/${allFiles.length})...`
        });

        if (isFilePdf) {
          try {
            const loadingTask = pdfjsLib.getDocument({ url: fullUrl, withCredentials: false });
            const pdf = await loadingTask.promise;
            for (let pNum = 1; pNum <= pdf.numPages; pNum++) {
              const page = await pdf.getPage(pNum);
              const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for 300dpi print clarity
              const canvas = document.createElement('canvas');
              canvas.width = Math.floor(viewport.width);
              canvas.height = Math.floor(viewport.height);
              const ctx = canvas.getContext('2d');
              await page.render({ canvasContext: ctx, viewport }).promise;

              const isLandscape = viewport.width > viewport.height * 1.05;
              renderedPages.push({
                dataUrl: canvas.toDataURL('image/png'),
                title: `${file.docTitle} ${pdf.numPages > 1 ? `(Page ${pNum}/${pdf.numPages})` : ''}`,
                isLandscape
              });
            }
          } catch (pdfErr) {
            console.error('PDF print processing error:', pdfErr);
            renderedPages.push({
              imgUrl: fullUrl,
              title: file.fileTitle,
              isLandscape: false
            });
          }
        } else {
          // Image document processing
          await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const isLandscape = img.naturalWidth > img.naturalHeight * 1.05;
              renderedPages.push({
                imgUrl: fullUrl,
                title: file.fileTitle,
                isLandscape
              });
              resolve();
            };
            img.onerror = () => {
              renderedPages.push({
                imgUrl: fullUrl,
                title: file.fileTitle,
                isLandscape: false
              });
              resolve();
            };
            img.src = fullUrl;
          });
        }
      }

      setPrintingProgress({
        active: true,
        current: allFiles.length,
        total: allFiles.length,
        status: 'Finalizing layout for printer...'
      });

      // Construct print iframe
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${printTitle} - KTR Consultants</title>
            <style>
              @page {
                margin: 6mm;
                size: auto;
              }
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              html, body {
                margin: 0;
                padding: 0;
                background: #fff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
              .page-container {
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 4mm 2mm;
                box-sizing: border-box;
              }
              .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 3px;
                margin-bottom: 4px;
                font-size: 8pt;
                font-weight: 700;
                color: #334155;
              }
              .page-body {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
              .page-body img {
                max-width: 100%;
                max-height: calc(100vh - 20mm);
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
                margin: auto;
              }
              .landscape-page .page-body img {
                max-width: 100%;
                max-height: calc(100vh - 20mm);
              }
            </style>
          </head>
          <body>
            ${renderedPages.map((pg, idx) => `
              <div class="page-container ${pg.isLandscape ? 'landscape-page' : ''}">
                <div class="page-header">
                  <span>📂 KTR Consultants | ${pg.title}</span>
                  <span>Doc ${idx + 1} of ${renderedPages.length}</span>
                </div>
                <div class="page-body">
                  <img src="${pg.dataUrl || pg.imgUrl}" alt="${pg.title}" />
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        setPrintingProgress({ active: false, current: 0, total: 0, status: '' });
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 15000);
      }, 700);

    } catch (err) {
      console.error('Smart Print execution error:', err);
      toast.error('Print generation failed.');
      setPrintingProgress({ active: false, current: 0, total: 0, status: '' });
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

  // Assemble all available documents matching the main Documents repository
  const groupedDocsMap = new Map();
  const seenUrls = new Set();

  const getNoteForDoc = (title, docObj) => {
    if (docObj?.notes) return docObj.notes;
    if (data.documentNotes) {
      if (data.documentNotes[title]) return data.documentNotes[title];
      if (docObj?.name && data.documentNotes[docObj.name]) return data.documentNotes[docObj.name];
      if (docObj?.category && data.documentNotes[docObj.category]) return data.documentNotes[docObj.category];
    }
    return '';
  };

  // 1. Custom Documents
  (data.customDocuments || []).forEach((cd, idx) => {
    if (!cd.fileUrl || seenUrls.has(cd.fileUrl)) return;
    seenUrls.add(cd.fileUrl);

    const groupKey = (cd.name || 'Document').trim();
    const docNotes = getNoteForDoc(groupKey, cd);
    const docEntry = {
      id: `cd_${cd._id || idx}`,
      docId: cd._id,
      name: groupKey,
      title: groupKey,
      fileUrl: cd.fileUrl,
      docType: cd.docType || 'customDocument',
      category: cd.category || 'Uploaded File',
      notes: docNotes
    };

    if (groupedDocsMap.has(groupKey)) {
      groupedDocsMap.get(groupKey).files.push(docEntry);
      if (docNotes && !groupedDocsMap.get(groupKey).notes) {
        groupedDocsMap.get(groupKey).notes = docNotes;
      }
    } else {
      groupedDocsMap.set(groupKey, {
        id: `cd_${cd._id || idx}`,
        groupId: `group_${docEntry.id}`,
        title: groupKey,
        name: groupKey,
        docType: docEntry.docType,
        category: docEntry.category,
        notes: docNotes,
        files: [docEntry],
        fileUrl: docEntry.fileUrl,
        icon: FileText
      });
    }
  });

  // 2. Custom Folders Documents
  (data.customFolders || []).forEach(f => {
    (f.documents || []).forEach((fDoc, fIdx) => {
      if (!fDoc.fileUrl || seenUrls.has(fDoc.fileUrl)) return;
      seenUrls.add(fDoc.fileUrl);

      const groupKey = (fDoc.name || 'Folder Document').trim();
      const docNotes = getNoteForDoc(groupKey, fDoc);
      const docEntry = {
        id: `folderdoc_${f._id}_${fDoc._id || fIdx}`,
        docId: fDoc._id,
        name: groupKey,
        title: groupKey,
        fileUrl: fDoc.fileUrl,
        docType: 'folderDocument',
        category: `Folder: ${f.folderName || f.name}`,
        notes: docNotes
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
        if (docNotes && !groupedDocsMap.get(groupKey).notes) {
          groupedDocsMap.get(groupKey).notes = docNotes;
        }
      } else {
        groupedDocsMap.set(groupKey, {
          id: docEntry.id,
          groupId: `group_${docEntry.id}`,
          title: groupKey,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          notes: docNotes,
          files: [docEntry],
          fileUrl: docEntry.fileUrl,
          icon: FileText
        });
      }
    });
  });

  // 3. Primary Standard Fixed Fields
  const legacyFixedMap = [
    { key: 'propertyDocUrl', label: 'Property Papers', icon: FileText },
    { key: 'bankStatementUrl', label: 'Bank Statement', icon: Building },
    { key: 'salarySlipUrl', label: 'Salary Slip', icon: FileSpreadsheet },
    { key: 'panCardUrl', label: 'PAN Card', icon: CreditCard },
    { key: 'aadhaarUrl', label: 'Aadhaar Card', icon: ShieldCheck },
    { key: 'itrUrl', label: 'ITR Return', icon: FileSpreadsheet },
    { key: 'form16Url', label: 'Form 16', icon: FileText },
    { key: 'idProofUrl', label: 'ID Proof', icon: ShieldCheck },
    { key: 'addressProofUrl', label: 'Address Proof', icon: Building },
    { key: 'photoUrl', label: 'Photograph', icon: ImageIcon },
    { key: 'otherDocUrl', label: 'Other Document', icon: FileText }
  ];

  legacyFixedMap.forEach(item => {
    if (data[item.key] && !seenUrls.has(data[item.key])) {
      seenUrls.add(data[item.key]);
      const groupKey = item.label;
      const docNotes = getNoteForDoc(groupKey, null);
      const docEntry = {
        id: `legacy_${item.key}`,
        name: groupKey,
        title: groupKey,
        fileUrl: data[item.key],
        docType: item.key,
        category: 'Client Document',
        notes: docNotes
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
        if (docNotes && !groupedDocsMap.get(groupKey).notes) {
          groupedDocsMap.get(groupKey).notes = docNotes;
        }
      } else {
        groupedDocsMap.set(groupKey, {
          id: `legacy_${item.key}`,
          groupId: `group_${docEntry.id}`,
          title: groupKey,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          notes: docNotes,
          files: [docEntry],
          fileUrl: docEntry.fileUrl,
          icon: item.icon
        });
      }
    }
  });

  // 4. Other Docs Array
  (data.otherDocs || []).forEach((url, idx) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const groupKey = `Document ${idx + 1}`;
      const docNotes = getNoteForDoc(groupKey, null);
      const docEntry = {
        id: `other_${idx}`,
        name: groupKey,
        title: groupKey,
        fileUrl: url,
        docType: 'other',
        category: 'Client Document',
        notes: docNotes
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
        if (docNotes && !groupedDocsMap.get(groupKey).notes) {
          groupedDocsMap.get(groupKey).notes = docNotes;
        }
      } else {
        groupedDocsMap.set(groupKey, {
          id: `other_${idx}`,
          groupId: `group_${docEntry.id}`,
          title: groupKey,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          notes: docNotes,
          files: [docEntry],
          fileUrl: docEntry.fileUrl,
          icon: FileText
        });
      }
    }
  });

  const allAvailableDocs = Array.from(groupedDocsMap.values());

  // Respect exact sort order set in Documents section
  const docOrder = data.documentOrder || [];
  const sortedDocs = [...allAvailableDocs].sort((a, b) => {
    if (docOrder.length === 0) return 0;
    const findIndex = (item) => {
      return docOrder.findIndex(key => 
        key === item.id ||
        key === item.groupId ||
        key === item.title ||
        key === item.name ||
        key === item.docType ||
        key === `legacy_${item.docType}` ||
        (item.files && item.files.some(f => 
          f.id === key || 
          f.docId === key || 
          `cd_${f.docId}` === key ||
          `custom_${f.docId}` === key ||
          f.fileUrl === key ||
          f.name === key ||
          f.title === key
        ))
      );
    };

    const indexA = findIndex(a);
    const indexB = findIndex(b);
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
      
      {/* 1. Clean Sticky Top Navigation Bar: Copy | Share | Print All */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#081326] flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
              KTR
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black text-[#081326] tracking-tight flex items-center gap-1 truncate">
                KTR Consultants
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 inline shrink-0" />
              </h1>
              <p className="text-[10px] text-gray-400 font-medium truncate">Banker Document Portal</p>
            </div>
          </div>

          {/* Top Actions: Copy | Share | Print All */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span className="text-[11px] hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTopShareModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#081326] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border border-gray-200"
              title="Share Portal or Files"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">Share</span>
            </button>

            <button
              type="button"
              onClick={() => handleSmartPrint(sortedDocs, `${data?.fullName || 'Client'} - Complete Case File`)}
              disabled={printingProgress.active}
              className="px-3 py-1.5 rounded-xl bg-[#081326] hover:bg-[#11203d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Print All Case Documents"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">{printingProgress.active ? 'Preparing...' : 'Print All'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        
        {/* 2. Banker Case Summary */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="col-span-2 sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Client Name
              </span>
              <p className="text-base font-black text-[#081326] leading-tight truncate">
                {data.fullName || 'N/A'}
              </p>
            </div>

            <div className="col-span-1 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Profession
              </span>
              <p className="text-xs font-bold text-gray-800 truncate">
                {data.occupation || 'N/A'}
              </p>
            </div>

            <div className="col-span-1 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">
                Loan Amount
              </span>
              <p className="text-xs font-black text-emerald-700">
                {formattedLoanAmount}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-100 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0">
                Case Type:
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate">
                {data.caseType || data.loanType || 'General Case'}
              </span>
            </div>
          </div>

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
                      {/* Left: Document Serial & Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#081326] group-hover:bg-[#081326] group-hover:text-amber-400 flex items-center justify-center shrink-0 transition-colors">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              #{idx + 1}
                            </span>
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

                      {/* Right: Actions */}
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

        {/* 4. Continuous Document Viewing Feed */}
        {viewMode === 'continuous' && (
          <div className="space-y-4">
            {/* Sticky Viewer Navigation Bar */}
            <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={closeContinuousView}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </button>

              <span className="text-xs font-bold text-gray-600 truncate">
                Continuous Review ({sortedDocs.length} Docs)
              </span>

              <button
                type="button"
                onClick={() => setTopShareModal(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                title="Share Documents"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-700" />
              </button>
            </div>

            {/* Continuous Vertical Feed of All Documents */}
            <div className="space-y-6">
              {sortedDocs.map((doc, idx) => {
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
                          onClick={() => handleSmartPrint([doc], `${doc.title} - ${data?.fullName || 'Client'}`)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                          title="Smart Print This Document"
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
                              <PdfViewer
                                url={getAssetUrl(fileObj.fileUrl)}
                                title={fileObj.title || doc.title}
                              />
                            </div>
                          ) : (
                            <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                              <div className="w-full bg-[#081326] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold">
                                <span className="truncate">{fileObj.title || doc.title} (Image)</span>
                                <a
                                  href={getAssetUrl(fileObj.fileUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-[#081326] rounded text-[10px] font-black flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" /> Open Tab
                                </a>
                              </div>
                              <ImageViewer
                                src={getAssetUrl(fileObj.fileUrl)}
                                alt={fileObj.title || doc.title}
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
                  handleSmartPrint([menuDoc], `${menuDoc.title} - ${data?.fullName || 'Client'}`);
                  setMenuDoc(null);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-purple-50 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-bold text-[#081326]">Print Document</p>
                  <p className="text-[10px] text-gray-400 font-normal">Auto-fit orientation & send to printer</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Individual Document Share Modal (Share File vs Share Link) */}
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

      {/* 7. Top Header Share Modal (Share Case Files vs Share Case Link) */}
      {topShareModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="absolute inset-0"
            onClick={() => setTopShareModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#081326] truncate">Share Case Documents</h3>
                <p className="text-[11px] text-gray-400">Select sharing method</p>
              </div>
              <button
                onClick={() => setTopShareModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleShareAllFiles(sortedDocs)}
                className="w-full p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left text-xs font-black text-amber-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share File</p>
                  <p className="text-[10px] text-gray-500 font-medium">Send actual document files to banker (WhatsApp, Email...)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSharePortalLink}
                className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left text-xs font-black text-blue-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share Link</p>
                  <p className="text-[10px] text-gray-500 font-medium">Share secure banker portal link</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Smart Printing Progress Overlay */}
      {printingProgress.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 border border-amber-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#081326]">Smart Print in Progress</h4>
              <p className="text-xs text-gray-500 mt-1">{printingProgress.status}</p>
            </div>
            {printingProgress.total > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round((printingProgress.current / printingProgress.total) * 100)}%` }}
                />
              </div>
            )}
            <p className="text-[10px] text-gray-400 font-medium">Auto-detecting Portrait / Landscape per page</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedDocuments;
