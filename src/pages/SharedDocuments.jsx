import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, Download, Share2, Printer, 
  ExternalLink, ChevronRight, Copy, Check, AlertCircle, 
  Loader2, ArrowLeft, MoreVertical, X, Eye, FileSpreadsheet, 
  Image as ImageIcon, Building, User, Phone, CheckSquare, Square,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { getAssetUrl } from '../utils/url';
import PdfViewer from '../components/common/PdfViewer';
import ImageViewer from '../components/common/ImageViewer';

const SharedDocuments = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // 'list' or 'continuous'
  const [viewMode, setViewMode] = useState('list');
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [visibleDocTitle, setVisibleDocTitle] = useState('');
  const [visibleDocIndex, setVisibleDocIndex] = useState(0);

  // Selection for bulk actions
  const [selectedDocIds, setSelectedDocIds] = useState(new Set());

  // Action Modals
  const [shareDocModal, setShareDocModal] = useState(null);
  const [topShareModal, setTopShareModal] = useState(false);
  const [menuDoc, setMenuDoc] = useState(null);

  // Print progress state
  const [printingProgress, setPrintingProgress] = useState({
    active: false,
    current: 0,
    total: 0,
    status: ''
  });

  const docRefs = useRef([]);

  // Age calculation helper (Formula: Current Year - Year of Birth)
  const calculateAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const birthYear = d.getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return age >= 0 ? age : null;
  };

  useEffect(() => {
    const fetchSharedDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/clients/shared/${id}`);
        if (res.data.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || 'This document share link is invalid or has expired.');
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

  // Handle browser back button
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

  // Clean Short Share URL (e.g. origin/s/:id)
  const getShortShareUrl = useCallback(() => {
    const origin = window.location.origin;
    const targetId = id || data?._id || '';
    return `${origin}/s/${targetId}`;
  }, [id, data]);

  // Professional WhatsApp Share Message
  const getWhatsAppShareText = useCallback(() => {
    const clientName = data?.fullName || 'Client';
    const primaryAge = data?.age || calculateAge(data?.dob);
    const ageDisplay = primaryAge ? ` (${primaryAge} Yrs)` : '';
    const formattedLoan = data?.loanAmount 
      ? Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
      : '₹0';
    const caseType = data?.caseType || data?.loanType || 'Loan Case';
    const profession = data?.occupation || 'Salaried';
    const shortUrl = getShortShareUrl();

    return `KTR Consultants – Client Documents\n\nClient: ${clientName}${ageDisplay}\nLoan Amount: ${formattedLoan}\nCase Type: ${caseType}\nProfession: ${profession}\n\nReview documents here:\n${shortUrl}`;
  }, [data, getShortShareUrl]);

  const handleCopyLink = () => {
    const shortUrl = getShortShareUrl();
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Clean share link copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Share handler
  const handleShareWhatsApp = () => {
    const message = getWhatsAppShareText();
    navigator.clipboard.writeText(message);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    setTopShareModal(false);
  };

  // Native share handler
  const handleSharePortalLink = async () => {
    const shareUrl = getShortShareUrl();
    const text = getWhatsAppShareText();
    const title = `${data?.fullName || 'Client'} - Documents Portal | KTR Consultants`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        setTopShareModal(false);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.log('Share error', err);
        else {
          setTopShareModal(false);
          return;
        }
      }
    }

    handleShareWhatsApp();
  };

  // Helper to normalize document titles
  const getNormalizedDocName = (rawName) => {
    if (!rawName || typeof rawName !== 'string') return 'Document';
    let clean = rawName.trim();
    clean = clean.replace(/\s*\(\s*\d+\s*[\/of]\s*\d+[^)]*\)/gi, '');
    clean = clean.replace(/\s*\(\s*(?:page|part|file)\s*\d+[^)]*\)/gi, '');
    clean = clean.replace(/\s*-\s*page\s*\d+/gi, '');
    clean = clean.replace(/\s*-\s*part\s*\d+/gi, '');
    clean = clean.replace(/\s*-\s*file\s*\d+/gi, '');
    clean = clean.replace(/\s*_\s*page\s*\d+/gi, '');
    return clean.trim() || rawName.trim();
  };

  // Assemble all case documents
  const groupedDocsMap = new Map();
  const seenUrls = new Set();

  const getNoteForDoc = (title, docObj) => {
    if (docObj?.notes) return docObj.notes;
    if (data?.documentNotes) {
      if (data.documentNotes[title]) return data.documentNotes[title];
      if (docObj?.name && data.documentNotes[docObj.name]) return data.documentNotes[docObj.name];
      if (docObj?.category && data.documentNotes[docObj.category]) return data.documentNotes[docObj.category];
    }
    return '';
  };

  // 1. Custom Documents
  (data?.customDocuments || []).forEach((cd, idx) => {
    if (!cd.fileUrl || seenUrls.has(cd.fileUrl)) return;
    seenUrls.add(cd.fileUrl);

    const rawName = (cd.name || 'Document').trim();
    const groupKey = getNormalizedDocName(rawName);
    const docNotes = getNoteForDoc(groupKey, cd) || getNoteForDoc(rawName, cd);
    const docEntry = {
      id: `cd_${cd._id || idx}`,
      docId: cd._id,
      name: groupKey,
      title: groupKey,
      fileTitle: rawName,
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
  (data?.customFolders || []).forEach(f => {
    (f.documents || []).forEach((fDoc, fIdx) => {
      if (!fDoc.fileUrl || seenUrls.has(fDoc.fileUrl)) return;
      seenUrls.add(fDoc.fileUrl);

      const rawName = (fDoc.name || 'Document').trim();
      const groupKey = getNormalizedDocName(rawName);
      const docNotes = getNoteForDoc(groupKey, fDoc) || getNoteForDoc(rawName, fDoc);
      const docEntry = {
        id: `f_${f._id}_${fDoc._id || fIdx}`,
        docId: fDoc._id,
        name: groupKey,
        title: groupKey,
        fileTitle: rawName,
        fileUrl: fDoc.fileUrl,
        docType: 'customFolderFile',
        category: f.folderName || 'Folder File',
        notes: docNotes
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
        if (docNotes && !groupedDocsMap.get(groupKey).notes) {
          groupedDocsMap.get(groupKey).notes = docNotes;
        }
      } else {
        groupedDocsMap.set(groupKey, {
          id: `f_${f._id}_${fDoc._id || fIdx}`,
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

  // 3. Legacy Fixed Standard Fields
  const legacyFixedMap = [
    { key: 'propertyDocUrl', label: 'Property Papers', icon: Building },
    { key: 'bankStatementUrl', label: 'Bank Statements', icon: FileSpreadsheet },
    { key: 'salarySlipUrl', label: 'Salary Slips', icon: FileText },
    { key: 'itrUrl', label: 'Income Tax Return (ITR)', icon: FileText },
    { key: 'panCardUrl', label: 'PAN Card', icon: FileText },
    { key: 'aadhaarUrl', label: 'Aadhaar Card', icon: FileText },
    { key: 'form16Url', label: 'Form 16', icon: FileText },
    { key: 'idProofUrl', label: 'ID Proof', icon: ShieldCheck },
    { key: 'addressProofUrl', label: 'Address Proof', icon: Building },
    { key: 'photoUrl', label: 'Photograph', icon: ImageIcon },
    { key: 'otherDocUrl', label: 'Other Document', icon: FileText }
  ];

  legacyFixedMap.forEach(item => {
    if (data?.[item.key] && !seenUrls.has(data[item.key])) {
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

  const allAvailableDocs = Array.from(groupedDocsMap.values());

  // Respect exact sort order
  const docOrder = data?.documentOrder || [];
  const sortedDocs = [...allAvailableDocs].sort((a, b) => {
    if (docOrder.length === 0) return 0;
    const findIndex = (item) => {
      return docOrder.findIndex(key => 
        key === item.id ||
        key === item.groupId ||
        key === item.title ||
        key === item.name ||
        key === item.docType ||
        (item.files && item.files.some(f => f.id === key || f.fileUrl === key || f.name === key))
      );
    };

    const indexA = findIndex(a);
    const indexB = findIndex(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  // Open Continuous View at exact Document index
  const openContinuousView = useCallback((targetIndex = 0) => {
    try {
      window.history.pushState({ ktrView: 'continuous' }, '');
    } catch (e) {}
    setViewMode('continuous');
    setActiveDocIndex(targetIndex);
    setMenuDoc(null);

    const docTarget = sortedDocs[targetIndex];
    if (docTarget) {
      setVisibleDocTitle(docTarget.title);
      setVisibleDocIndex(targetIndex);
    }

    const scrollToTarget = () => {
      const el = document.getElementById(`doc-section-${targetIndex}`) || docRefs.current[targetIndex];
      if (el) {
        const headerHeight = 65;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = Math.max(elementPosition - headerHeight, 0);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    // Trigger dual scroll to guarantee precision after layout renders
    requestAnimationFrame(scrollToTarget);
    setTimeout(scrollToTarget, 80);
    setTimeout(scrollToTarget, 220);
  }, [sortedDocs]);

  const closeContinuousView = useCallback(() => {
    if (window.history.state?.ktrView === 'continuous') {
      window.history.back();
    } else {
      setViewMode('list');
    }
  }, []);

  // Track active visible document on scroll for the top safe bar
  useEffect(() => {
    if (viewMode !== 'continuous') return;

    const handleScroll = () => {
      const headerOffset = 90;
      let currentVisible = 0;

      for (let i = 0; i < sortedDocs.length; i++) {
        const el = document.getElementById(`doc-section-${i}`) || docRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset + 50 && rect.bottom > headerOffset) {
            currentVisible = i;
            break;
          } else if (rect.top > headerOffset) {
            if (i === 0) currentVisible = 0;
            break;
          }
        }
      }

      setVisibleDocIndex(currentVisible);
      if (sortedDocs[currentVisible]) {
        setVisibleDocTitle(sortedDocs[currentVisible].title);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, sortedDocs]);

  // Bulk Selection Handlers
  const handleToggleSelectDoc = (docId) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDocIds.size === sortedDocs.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(sortedDocs.map(d => d.id)));
    }
  };

  // Download Handler
  const handleDownloadFile = (fileUrl, title) => {
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const ext = fileUrl.toLowerCase().endsWith('.pdf') ? '.pdf' : '.jpg';
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${title || 'document'}${ext}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Smart Print Engine
  const handleSmartPrint = async (docsToPrint, printTitle = 'Client Documents') => {
    if (!docsToPrint || docsToPrint.length === 0) {
      toast.error('No documents selected to print.');
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
      toast.error('No printable files found.');
      return;
    }

    setPrintingProgress({
      active: true,
      current: 0,
      total: allFiles.length,
      status: 'Rendering documents for high-resolution print...'
    });

    try {
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
            <title>${printTitle}</title>
            <style>
              @page { size: A4 portrait; margin: 8mm; }
              body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; }
              .print-page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 96vh; }
              .page-hdr { width: 100%; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; font-size: 11px; font-weight: bold; color: #333; display: flex; justify-content: space-between; }
              .page-img { max-width: 100%; max-height: 88vh; object-fit: contain; }
            </style>
          </head>
          <body>
            ${allFiles.map((f, i) => `
              <div class="print-page">
                <div class="page-hdr">
                  <span>📂 KTR Consultants | ${f.docTitle} ${f.pageLabel}</span>
                  <span>${i + 1} / ${allFiles.length}</span>
                </div>
                <img class="page-img" src="${getAssetUrl(f.fileUrl)}" alt="${f.docTitle}" />
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
          if (document.body.contains(printFrame)) document.body.removeChild(printFrame);
        }, 15000);
      }, 800);
    } catch (e) {
      console.error('Print failed', e);
      setPrintingProgress({ active: false, current: 0, total: 0, status: '' });
      toast.error('Print failed.');
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

  // Primary Applicant & Additional Applicants
  const primaryAge = data.age || calculateAge(data.dob);
  const applicantsList = data.applicants && data.applicants.length > 0 
    ? data.applicants 
    : [{
        fullName: data.fullName,
        dob: data.dob,
        age: primaryAge,
        occupation: data.occupation,
        mobile: data.mobile,
        panNumber: data.panNumber,
        aadhaarNumber: data.aadhaarNumber,
        relationship: 'Primary Applicant'
      }];

  const caseNotesText = data.caseNotes || data.notes || '';
  const formattedLoanAmount = data.loanAmount 
    ? Number(data.loanAmount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#081326] font-sans pb-16">
      
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          
          {/* Left: Branding or Back to List when in Continuous View */}
          <div className="flex items-center gap-2 min-w-0">
            {viewMode === 'continuous' ? (
              <button
                type="button"
                onClick={closeContinuousView}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>List View</span>
              </button>
            ) : (
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
            )}
          </div>

          {/* Center: When in Continuous View -> SAFE TOP BADGE showing ONLY current document name being viewed */}
          {viewMode === 'continuous' && (
            <div className="flex items-center justify-center min-w-0 flex-1 px-2">
              <div className="px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full flex items-center gap-1.5 shadow-2xs max-w-full">
                <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded shrink-0">
                  #{visibleDocIndex + 1}
                </span>
                <span className="text-xs font-black text-[#081326] truncate">
                  {visibleDocTitle || sortedDocs[visibleDocIndex]?.title || 'Document'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline shrink-0">
                  ({visibleDocIndex + 1} of {sortedDocs.length})
                </span>
              </div>
            </div>
          )}

          {/* Right: Actions (Copy Short Link | Share WhatsApp | Print All) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Copy Short Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span className="text-[11px] hidden xs:inline">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTopShareModal(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#081326] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border border-gray-200"
              title="Share Portal or Documents"
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
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        
        {/* 2. CASE & APPLICANTS SUMMARY (Shows Multiple Applicants with Auto-Calculated Age) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <h2 className="text-xs font-black text-[#081326] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" /> Case Summary & Applicants ({applicantsList.length})
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              {data.caseType || data.loanType || 'General Case'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Render Each Applicant */}
            {applicantsList.map((app, appIdx) => {
              const appAge = app.age || calculateAge(app.dob);
              return (
                <div key={appIdx} className="p-3 bg-slate-50/70 rounded-xl border border-gray-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/60 px-1.5 py-0.2 rounded">
                      {app.relationship || `Applicant ${appIdx + 1}`}
                    </span>
                    {appAge && (
                      <span className="text-xs font-black text-amber-700">
                        {appAge} Yrs
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-[#081326] truncate">
                    {app.fullName} {appAge ? `(${appAge})` : ''}
                  </p>
                  <p className="text-xs text-gray-600 font-medium truncate">
                    Profession: <strong className="text-gray-900">{app.occupation || data.occupation || 'N/A'}</strong>
                  </p>
                  {app.mobile && (
                    <p className="text-xs text-gray-500 font-medium truncate">
                      Mobile: {app.mobile}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Loan Amount Card */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Loan Amount
              </span>
              <p className="text-base font-black text-emerald-700">
                {formattedLoanAmount}
              </p>
              <p className="text-[11px] text-gray-500 font-medium truncate">
                Case Type: {data.caseType || data.loanType || 'N/A'}
              </p>
            </div>
          </div>

          {caseNotesText && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1 mb-1">
                Note: Case Observations
              </span>
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                {caseNotesText}
              </div>
            </div>
          )}
        </div>

        {/* 3. DOCUMENT LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {/* Header & Bulk Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-black text-[#081326] uppercase tracking-wider">
                  Case Documents ({sortedDocs.length})
                </h2>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-gray-600 hover:text-[#081326] flex items-center gap-1 cursor-pointer"
                >
                  {selectedDocIds.size === sortedDocs.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span>{selectedDocIds.size === sortedDocs.length ? 'Deselect All' : 'Select All'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedDocIds.size > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedDocs = sortedDocs.filter(d => selectedDocIds.has(d.id));
                        handleSmartPrint(selectedDocs, `Selected Documents (${selectedDocIds.size})`);
                      }}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Selected ({selectedDocIds.size})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedDocs = sortedDocs.filter(d => selectedDocIds.has(d.id));
                        selectedDocs.forEach(d => handleDownloadFile(d.fileUrl, d.title));
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Selected
                    </button>
                  </>
                )}
                <button
                  onClick={() => openContinuousView(0)}
                  className="px-3 py-1.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Open Continuous Review
                </button>
              </div>
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
                  const isSelected = selectedDocIds.has(doc.id);

                  return (
                    <div
                      key={doc.id || idx}
                      className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-amber-50/40 transition-colors group cursor-pointer select-none ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                      onClick={() => openContinuousView(idx)}
                    >
                      {/* Left: Checkbox, Serial & Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectDoc(doc.id);
                          }}
                          className="text-gray-400 hover:text-amber-600 cursor-pointer p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>

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
                                {doc.files.length} Files
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

        {/* 4. CONTINUOUS DOCUMENT VIEWING FEED (No intrusive middle bar, clean document stream) */}
        {viewMode === 'continuous' && (
          <div className="space-y-6">
            {sortedDocs.map((doc, idx) => {
              const docFiles = doc.files || [{ title: doc.title, fileUrl: doc.fileUrl }];

              return (
                <div
                  key={doc.id || idx}
                  ref={(el) => (docRefs.current[idx] = el)}
                  id={`doc-section-${idx}`}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden scroll-mt-20"
                >
                  {/* Clean Document Section Header */}
                  <div className="p-3 sm:p-4 bg-gray-50/95 border-b border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                        #{idx + 1}
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

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(doc.fileUrl, doc.title)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareDocModal(doc)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                        title="Share Document"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSmartPrint([doc], `${doc.title} - ${data?.fullName || 'Client'}`)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                        title="Print This Document"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Render Document Files */}
                  <div className="p-3 sm:p-4 bg-slate-100/40 space-y-4">
                    {docFiles.map((fileObj, fIdx) => (
                      <div key={fIdx} className="space-y-2">
                        {docFiles.length > 1 && (
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                            <span>Attachment {fIdx + 1} of {docFiles.length} ({fileObj.fileTitle || fileObj.title})</span>
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
                          <PdfViewer
                            url={getAssetUrl(fileObj.fileUrl)}
                            title={fileObj.fileTitle || fileObj.title || doc.title}
                          />
                        ) : (
                          <ImageViewer
                            src={getAssetUrl(fileObj.fileUrl)}
                            alt={fileObj.fileTitle || fileObj.title || doc.title}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Bottom Back Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={closeContinuousView}
                className="px-6 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all cursor-pointer shadow-sm"
              >
                ← Back to Document List
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Action Sheet Modal */}
      {menuDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setMenuDoc(null)} />
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
                  <p className="text-[10px] text-gray-400 font-normal">Review in continuous document feed</p>
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
                  <p className="text-[10px] text-gray-400 font-normal">Share file or direct link</p>
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

      {/* Individual Document Share Modal */}
      {shareDocModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setShareDocModal(null)} />
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
                onClick={() => {
                  const url = getAssetUrl(shareDocModal.fileUrl);
                  window.open(url, '_blank');
                  setShareDocModal(null);
                }}
                className="w-full p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left text-xs font-black text-amber-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Open / Direct File Link</p>
                  <p className="text-[10px] text-gray-500 font-medium">Access direct document file</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `📄 Document: ${shareDocModal.title}\nClient: ${data?.fullName || 'Client'}\n\nReview securely here:\n${getShortShareUrl()}`;
                  navigator.clipboard.writeText(text);
                  toast.success('Share text copied!');
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  setShareDocModal(null);
                }}
                className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left text-xs font-black text-emerald-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share on WhatsApp</p>
                  <p className="text-[10px] text-gray-500 font-medium">Send formatted WhatsApp message</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Share Modal */}
      {topShareModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setTopShareModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#081326] truncate">Share Case Documents</h3>
                <p className="text-[11px] text-gray-400">Professional banker / client sharing</p>
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
                onClick={handleShareWhatsApp}
                className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left text-xs font-black text-emerald-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share on WhatsApp</p>
                  <p className="text-[10px] text-gray-500 font-medium">Auto-formatted professional message with short link</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSharePortalLink}
                className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left text-xs font-black text-blue-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Copy className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Copy Short Link</p>
                  <p className="text-[10px] text-gray-500 font-medium">{getShortShareUrl()}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Printing Progress Overlay */}
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
            <p className="text-[10px] text-gray-400 font-medium">Auto-detecting orientation & fit per page</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedDocuments;
