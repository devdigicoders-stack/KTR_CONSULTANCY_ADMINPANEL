import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, Download, Eye, Upload, CheckCircle2, 
  ExternalLink, Search, PlusCircle, X, Trash2,
  Copy, Check, ArrowUp, ArrowDown, GripVertical,
  CheckSquare, Square, Share2, ChevronLeft, ChevronRight,
  Layers, ArrowLeft, Edit3, StickyNote, Loader2, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { getAssetUrl, getPublicShareDocsUrl } from '../../utils/url';
import api from '../../api/axios';
import PdfViewer from '../common/PdfViewer';
import ImageViewer from '../common/ImageViewer';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

const DocumentRepositoryTab = ({ client, onRefresh }) => {
  // View Mode: 'list' (default repository table) | 'continuous' (continuous vertical feed)
  const [viewMode, setViewMode] = useState('list');
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const docRefs = useRef([]);

  // Preview File State: { title, files: [{ fileUrl, title, docId, docType }], activeIndex: 0 }
  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-file Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocNotes, setCustomDocNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Document Notes State
  const [editingNoteDoc, setEditingNoteDoc] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [copiedNoteKey, setCopiedNoteKey] = useState(null);
  const [localNotesMap, setLocalNotesMap] = useState({});

  // Multi-Select for Batch Sharing
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  // Share Modals (Share File vs Share Link)
  const [shareDocModal, setShareDocModal] = useState(null);
  const [topShareModal, setTopShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);

  // Printing Progress State
  const [printingProgress, setPrintingProgress] = useState({ active: false, current: 0, total: 0, status: '' });

  // Document Serial Order State & Dragging
  const [localOrder, setLocalOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const fileInputRef = useRef(null);

  const cleanMobile = (client?.mobile || client?.mobileNumber || client?.phone || '').replace(/\D/g, '').slice(-10);
  const shareBundleUrl = client?._id ? getPublicShareDocsUrl(client._id) : '';

  // ----------------------------------------------------
  // CONTINUOUS VIEW & BACK BUTTON HANDLING
  // ----------------------------------------------------
  const openContinuousView = useCallback((index = 0) => {
    try {
      window.history.pushState({ ktrStaffDocView: 'continuous' }, '');
    } catch (e) {}
    setViewMode('continuous');
    setActiveDocIndex(index);
    setPreviewData(null);

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
    if (window.history.state?.ktrStaffDocView === 'continuous') {
      window.history.back();
    } else {
      setViewMode('list');
    }
  }, []);

  const closePreview = useCallback(() => {
    if (window.history.state?.ktrPreviewModal) {
      window.history.back();
    } else {
      setPreviewData(null);
    }
  }, []);

  const openPreview = useCallback((title, files, startIndex = 0) => {
    if (!files || files.length === 0) return;
    const formattedFiles = files.map(f => typeof f === 'string' ? { fileUrl: f, title } : f);
    
    try {
      window.history.pushState({ ktrPreviewModal: true }, '');
    } catch (e) {}

    setPreviewData({
      title,
      files: formattedFiles,
      activeIndex: Math.max(0, Math.min(startIndex, formattedFiles.length - 1))
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setViewMode('list');
      setPreviewData(null);
      setShareDocModal(null);
      setTopShareModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard navigation for preview modal (ArrowLeft, ArrowRight, Escape)
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

  // Document Notes Helper
  const getNoteForDoc = (groupKey, cd) => {
    if (localNotesMap[groupKey] !== undefined) return localNotesMap[groupKey];
    if (cd?.notes) return cd.notes;
    if (client?.documentNotes) {
      if (typeof client.documentNotes.get === 'function') {
        const val = client.documentNotes.get(groupKey);
        if (val) return val;
      } else if (typeof client.documentNotes === 'object') {
        const val = client.documentNotes[groupKey];
        if (val) return val;
      }
    }
    return '';
  };

  const handleCopyDocNote = (noteText, docKey) => {
    if (!noteText) return;
    navigator.clipboard.writeText(noteText);
    setCopiedNoteKey(docKey);
    toast.success('Note copied to clipboard!');
    setTimeout(() => setCopiedNoteKey(null), 2000);
  };

  const handleSaveDocNote = async (docName, doc) => {
    if (!client?._id || !docName) return;
    setSavingNote(true);
    const newNote = (editingNoteDoc?.text || '').trim();
    try {
      await api.put(`/clients/${client._id}/document-notes`, {
        docName,
        notes: newNote,
        docId: doc?.files?.[0]?.docId,
        docType: doc?.docType
      });

      setLocalNotesMap(prev => ({ ...prev, [docName]: newNote }));
      setEditingNoteDoc(null);
      toast.success('Note saved successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save doc note error:', err);
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  // Helper to normalize document titles and strip auto-increment suffixes like (1/6), (1 of 6), (1/2 - filename), - Page 1
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

  // ----------------------------------------------------
  // ASSEMBLE ALL DOCUMENTS INTO GROUPS
  // ----------------------------------------------------
  const groupedDocsMap = new Map();
  const seenUrls = new Set();

  // 1. Custom Documents
  (client?.customDocuments || []).forEach((cd, idx) => {
    if (!cd.fileUrl || seenUrls.has(cd.fileUrl)) return;
    seenUrls.add(cd.fileUrl);

    const rawName = (cd.name || 'Document').trim();
    const groupKey = getNormalizedDocName(rawName);
    const docNotes = getNoteForDoc(groupKey, cd) || getNoteForDoc(rawName, cd);
    const docEntry = {
      id: `cd_${cd._id || idx}`,
      docId: cd._id,
      name: groupKey,
      fileTitle: rawName,
      fileUrl: cd.fileUrl,
      docType: cd.docType || 'customDocument',
      category: cd.category || 'Uploaded File',
      uploadedAt: cd.uploadedAt,
      uploadedByName: cd.uploadedByName,
      notes: docNotes,
      rawDoc: cd
    };

    if (groupedDocsMap.has(groupKey)) {
      groupedDocsMap.get(groupKey).files.push(docEntry);
      if (docNotes && !groupedDocsMap.get(groupKey).notes) {
        groupedDocsMap.get(groupKey).notes = docNotes;
      }
    } else {
      groupedDocsMap.set(groupKey, {
        id: `group_${docEntry.id}`,
        name: groupKey,
        docType: docEntry.docType,
        category: docEntry.category,
        uploadedAt: docEntry.uploadedAt,
        uploadedByName: docEntry.uploadedByName,
        notes: docNotes,
        files: [docEntry]
      });
    }
  });

  // 2. Custom Folders Documents
  (client?.customFolders || []).forEach(f => {
    (f.documents || []).forEach((fDoc, fIdx) => {
      if (!fDoc.fileUrl || seenUrls.has(fDoc.fileUrl)) return;
      seenUrls.add(fDoc.fileUrl);

      const rawName = (fDoc.name || 'Folder Document').trim();
      const groupKey = getNormalizedDocName(rawName);
      const docNotes = getNoteForDoc(groupKey, fDoc) || getNoteForDoc(rawName, fDoc);
      const docEntry = {
        id: `folderdoc_${f._id}_${fDoc._id || fIdx}`,
        docId: fDoc._id,
        name: groupKey,
        fileTitle: rawName,
        fileUrl: fDoc.fileUrl,
        docType: 'folderDocument',
        category: `Folder: ${f.folderName || f.name}`,
        uploadedAt: fDoc.uploadedAt,
        uploadedByName: fDoc.uploadedByName,
        notes: docNotes
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
        if (docNotes && !groupedDocsMap.get(groupKey).notes) {
          groupedDocsMap.get(groupKey).notes = docNotes;
        }
      } else {
        groupedDocsMap.set(groupKey, {
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          uploadedAt: docEntry.uploadedAt,
          uploadedByName: docEntry.uploadedByName,
          notes: docNotes,
          files: [docEntry]
        });
      }
    });
  });

  // 3. Primary Standard Fixed Fields
  const legacyFixedMap = [
    { key: 'propertyDocUrl', label: 'Property Papers' },
    { key: 'bankStatementUrl', label: 'Bank Statement' },
    { key: 'salarySlipUrl', label: 'Salary Slip' },
    { key: 'panCardUrl', label: 'PAN Card' },
    { key: 'aadhaarUrl', label: 'Aadhaar Card' },
    { key: 'itrUrl', label: 'ITR Return' },
    { key: 'form16Url', label: 'Form 16' },
    { key: 'idProofUrl', label: 'ID Proof' },
    { key: 'addressProofUrl', label: 'Address Proof' },
    { key: 'photoUrl', label: 'Photograph' },
    { key: 'otherDocUrl', label: 'Other Document' }
  ];

  legacyFixedMap.forEach(item => {
    if (client?.[item.key] && !seenUrls.has(client[item.key])) {
      seenUrls.add(client[item.key]);
      const groupKey = item.label;
      const docNotes = getNoteForDoc(groupKey, null);
      const docEntry = {
        id: `legacy_${item.key}`,
        name: groupKey,
        fileUrl: client[item.key],
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
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          notes: docNotes,
          files: [docEntry]
        });
      }
    }
  });

  // 4. Other Docs Array
  (client?.otherDocs || []).forEach((url, idx) => {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const groupKey = `Document ${idx + 1}`;
      const docNotes = getNoteForDoc(groupKey, null);
      const docEntry = {
        id: `other_${idx}`,
        name: groupKey,
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
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          notes: docNotes,
          files: [docEntry]
        });
      }
    }
  });

  const rawDocs = Array.from(groupedDocsMap.values());

  // Sort by saved serial order
  const activeOrder = localOrder || client?.documentOrder || [];
  const sortedDocItems = [...rawDocs].sort((a, b) => {
    const indexA = activeOrder.findIndex(key => key === a.id || key === a.name || a.files.some(f => f.id === key || f.docId === key || f.fileUrl === key));
    const indexB = activeOrder.findIndex(key => key === b.id || key === b.name || b.files.some(f => f.id === key || f.docId === key || f.fileUrl === key));
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  // Reorder Handler (Arrows)
  const handleMoveItem = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedDocItems.length) return;

    const newItems = [...sortedDocItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const newOrderKeys = newItems.flatMap(item => [
      item.id,
      item.name,
      item.docType,
      `legacy_${item.docType}`,
      ...item.files.map(f => f.id),
      ...item.files.map(f => f.docId).filter(Boolean),
      ...item.files.map(f => f.fileUrl).filter(Boolean)
    ]);
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

  // Drag & Drop Reordering
  const touchStartYRef = useRef(null);
  const touchStartIndexRef = useRef(null);
  const [touchHoverIndex, setTouchHoverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const executeReorder = async (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;

    const newItems = [...sortedDocItems];
    const draggedItem = newItems[fromIndex];
    newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, draggedItem);

    const newOrderKeys = newItems.flatMap(item => [
      item.id,
      item.name,
      item.docType,
      `legacy_${item.docType}`,
      ...item.files.map(f => f.id),
      ...item.files.map(f => f.docId).filter(Boolean),
      ...item.files.map(f => f.fileUrl).filter(Boolean)
    ]);
    setLocalOrder(newOrderKeys);
    setDraggedIndex(null);
    setTouchHoverIndex(null);

    try {
      setSavingOrder(true);
      await api.put(`/clients/${client._id}/document-order`, {
        documentOrder: newOrderKeys
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to save drag order:', err);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    await executeReorder(draggedIndex, targetIndex);
  };

  const handleTouchStart = (e, index) => {
    touchStartIndexRef.current = index;
    setDraggedIndex(index);
    setTouchHoverIndex(index);
    const touch = e.touches[0];
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartIndexRef.current === null) return;
    const touch = e.touches[0];
    const clientY = touch.clientY;
    const clientX = touch.clientX;

    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return;
    const itemCard = element.closest('[data-doc-index]');
    if (itemCard) {
      const targetIdx = parseInt(itemCard.getAttribute('data-doc-index'), 10);
      if (!isNaN(targetIdx) && targetIdx !== touchHoverIndex) {
        setTouchHoverIndex(targetIdx);
      }
    }
  };

  const handleTouchEnd = async () => {
    const fromIdx = touchStartIndexRef.current;
    const toIdx = touchHoverIndex;
    touchStartIndexRef.current = null;
    touchStartYRef.current = null;
    setDraggedIndex(null);
    setTouchHoverIndex(null);

    if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
      await executeReorder(fromIdx, toIdx);
    }
  };

  // Upload handler
  const handleSimpleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || !client?._id) {
      alert('Please choose at least one file to upload.');
      return;
    }
    if (!customDocTitle.trim()) {
      alert('Please enter a Document Name / Title.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      formData.append('docName', customDocTitle.trim());
      formData.append('documentName', customDocTitle.trim());
      formData.append('category', 'Case Document');
      if (customDocNotes.trim()) {
        formData.append('notes', customDocNotes.trim());
      }

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setCustomDocTitle('');
        setCustomDocNotes('');
        setSelectedFiles([]);
        toast.success('Document uploaded successfully!');
        if (onRefresh) await onRefresh();
      }
    } catch (err) {
      console.error('Upload document error:', err);
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload document.');
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
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteGroup = async (groupDoc) => {
    if (!window.confirm(`Are you sure you want to delete "${groupDoc.name}"? This action cannot be undone.`)) return;

    try {
      for (const fileObj of groupDoc.files) {
        await api.delete(`/clients/${client._id}/documents`, {
          data: {
            docType: fileObj.docType || groupDoc.docType,
            docId: fileObj.docId || fileObj._id,
            fileUrl: fileObj.fileUrl,
            docName: groupDoc.name,
            reason: 'Deleted by staff'
          }
        });
      }
      toast.success(`"${groupDoc.name}" deleted successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete doc:', err);
      toast.error('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSingleFileInGroup = async (fileObj, docTitle) => {
    if (!window.confirm(`Delete attached file "${fileObj.name || docTitle}"?`)) return;
    try {
      const res = await api.delete(`/clients/${client._id}/documents`, {
        data: {
          docType: fileObj.docType || 'customDocument',
          docId: fileObj.docId || fileObj._id,
          fileUrl: fileObj.fileUrl,
          docName: docTitle,
          reason: 'Deleted by staff'
        }
      });
      if (res.data.success) {
        toast.success('File deleted');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to delete file: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDownloadFile = async (e, fileUrl, customFileName) => {
    if (e) e.preventDefault();
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const fileName = customFileName || fileUrl.split('/').pop() || 'document';

    toast.loading('Preparing download...', { id: 'download-toast' });
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
      toast.success('Download started!', { id: 'download-toast' });
    } catch (error) {
      console.error('Error downloading file:', error);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Opening file download...', { id: 'download-toast' });
    }
  };

  const copyToClipboard = async (text, setSuccessState) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessState(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setSuccessState(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // SMART PRINTING SYSTEM: Auto Orientation (Portrait / Landscape) & Perfect Page Fit
  const handleSmartPrint = async (docsToPrint, printTitle = 'Client Documents') => {
    if (!docsToPrint || docsToPrint.length === 0) {
      toast.error('No documents available to print.');
      return;
    }

    const allFiles = [];
    docsToPrint.forEach(doc => {
      const files = doc.files || [{ name: doc.name, fileUrl: doc.fileUrl }];
      files.forEach((f, idx) => {
        if (f.fileUrl) {
          allFiles.push({
            docTitle: doc.name,
            fileTitle: f.name || doc.name,
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
              const viewport = page.getViewport({ scale: 2.0 });
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

  // Share portal link via chooser / WhatsApp
  const handleSharePortalLink = async () => {
    const clientName = client?.fullName || 'Client';
    const text = `📂 KTR Consultants - Client Documents Portal\nClient: ${clientName}\n\nReview verified case documents here:\n${shareBundleUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${clientName} - Documents Portal`,
          text: text,
          url: shareBundleUrl
        });
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

  // Share all case files via native chooser
  const handleShareAllFiles = async (docsToShare) => {
    const allFiles = [];
    docsToShare.forEach(doc => {
      const files = doc.files || [{ name: doc.name, fileUrl: doc.fileUrl }];
      files.forEach(f => {
        if (f.fileUrl) {
          allFiles.push({ title: f.name || doc.name, fileUrl: f.fileUrl });
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
      for (const item of allFiles.slice(0, 10)) {
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
          title: `${client?.fullName || 'Client'} - Documents`,
          text: `Verified Case Documents for ${client?.fullName || 'Client'}`
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

  // Share single document file
  const handleShareSingleDocFile = async (docItem) => {
    const primaryFile = docItem.files?.[0] || docItem;
    const fileUrl = primaryFile.fileUrl;
    if (!fileUrl) return;
    const fullUrl = getAssetUrl(fileUrl);
    const fileName = docItem.name.replace(/[^a-zA-Z0-9_-]/g, '_') + (fileUrl.toLowerCase().endsWith('.pdf') ? '.pdf' : '.jpg');

    toast.loading('Preparing file for sharing...', { id: 'share-file-toast' });

    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        toast.dismiss('share-file-toast');
        await navigator.share({
          files: [file],
          title: docItem.name,
          text: `${docItem.name} - ${client?.fullName || 'Client'}`
        });
        setShareDocModal(null);
        return;
      }
    } catch (err) {
      console.log('Native file share not supported or cancelled', err);
    }

    toast.dismiss('share-file-toast');
    const text = `📄 Document: ${docItem.name}\nClient: ${client?.fullName || 'Client'}\n\n🔗 View securely on KTR Portal:\n${shareBundleUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('Document link copied to clipboard!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setShareDocModal(null);
  };

  const isPdf = (url) => url && url.toLowerCase().split('?')[0].endsWith('.pdf');

  const toggleSelectDoc = (id) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.length === sortedDocItems.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(sortedDocItems.map(d => d.id));
    }
  };

  const displayedDocs = sortedDocItems.filter(doc => {
    if (!searchQuery) return true;
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activePreviewFile = previewData ? previewData.files[previewData.activeIndex] : null;

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-bold">
          {uploadError}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. CONTINUOUS DOCUMENT VIEWING FEED (Staff Portal)   */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'continuous' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Sticky Viewer Navigation Bar */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={closeContinuousView}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to List</span>
            </button>

            <span className="text-xs font-bold text-gray-700 truncate">
              Continuous Review ({sortedDocItems.length} Docs)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTopShareModal(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                title="Share Documents"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => handleSmartPrint(sortedDocItems, `${client?.fullName || 'Client'} - Complete Case File`)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-[#081326] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                title="Print All Documents"
              >
                <Printer className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>
          </div>

          {/* Continuous Vertical Feed of All Documents & Pages */}
          <div className="space-y-6">
            {sortedDocItems.map((doc, idx) => {
              const docFiles = doc.files || [{ title: doc.name, fileUrl: doc.fileUrl }];

              return (
                <div
                  key={doc.id || idx}
                  ref={(el) => (docRefs.current[idx] = el)}
                  id={`staff-doc-section-${idx}`}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden scroll-mt-28"
                >
                  {/* Document Section Header */}
                  <div className="p-3.5 sm:p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-[#081326] truncate">
                            {doc.name}
                          </h3>
                          {doc.files?.length > 1 && (
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

                    {/* Quick Actions for this doc */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadFile(e, doc.files[0]?.fileUrl, doc.name)}
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
                        onClick={() => handleSmartPrint([doc], `${doc.name} - ${client?.fullName || 'Client'}`)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                        title="Smart Print This Document"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Render Document Files / Pages vertically in sequence */}
                  <div className="p-3 sm:p-4 bg-slate-100/50 space-y-4">
                    {docFiles.map((fileObj, fIdx) => (
                      <div key={fIdx} className="space-y-2">
                        {docFiles.length > 1 && (
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                            <span>File / Page {fIdx + 1} of {docFiles.length}</span>
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
                              <span className="truncate">{fileObj.fileTitle || fileObj.name || doc.name} (PDF)</span>
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
                              title={fileObj.fileTitle || fileObj.name || doc.name}
                            />
                          </div>
                        ) : (
                          <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                            <div className="w-full bg-[#081326] text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{fileObj.fileTitle || fileObj.name || doc.name} (Image)</span>
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
                              alt={fileObj.fileTitle || fileObj.name || doc.name}
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
      ) : (
        /* ---------------------------------------------------- */
        /* 2. STANDARD DOCUMENT LIST VIEW                       */
        /* ---------------------------------------------------- */
        <>
          {/* Top Header & Actions Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#f59e0b]" /> Client Documents
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Upload, arrange serial order, preview, download, and share documents securely.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Continuous Review Mode Button */}
              {sortedDocItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => openContinuousView(0)}
                  className="px-3 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0"
                  title="View All Documents in Continuous Flow"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                  <span>View All</span>
                </button>
              )}

              {/* Copy Share Link */}
              <button
                type="button"
                onClick={() => copyToClipboard(shareBundleUrl, setCopiedLink)}
                className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0"
                title="Copy Public Banker Portal Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Share Button (File vs Link) */}
              <button
                type="button"
                onClick={() => setTopShareModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#081326] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0 border border-gray-200"
                title="Share Documents with Apps"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Share</span>
              </button>

              {/* Print All Button (Smart Print) */}
              <button
                type="button"
                onClick={() => handleSmartPrint(sortedDocItems, `${client?.fullName || 'Client'} - Complete Case File`)}
                disabled={printingProgress.active}
                className="px-3 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0 disabled:opacity-50"
                title="Smart Print All Case Documents"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>{printingProgress.active ? 'Preparing...' : 'Print All'}</span>
              </button>

              {/* Add Docs Button */}
              <button
                type="button"
                onClick={() => {
                  setCustomDocTitle('');
                  setCustomDocNotes('');
                  setSelectedFiles([]);
                  setShowUploadModal(true);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ Add Docs</span>
              </button>
            </div>
          </div>

      {/* Multi-Select Toolbar (If 1 or more documents selected) */}
      {selectedDocIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-3 px-5 flex items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>{selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const selected = sortedDocItems.filter(item => selectedDocIds.includes(item.id));
                handleSmartPrint(selected, `${client?.fullName || 'Client'} - Selected Documents`);
              }}
              className="px-3.5 py-1.5 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Selected ({selectedDocIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs text-gray-400 font-bold">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {selectedDocIds.length === sortedDocItems.length && sortedDocItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>Select All ({sortedDocItems.length})</span>
            </button>
          </div>
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Drag ☰ or use ▲ ▼ to arrange order
          </span>
        </div>

        {displayedDocs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-black text-[#081326]">No Documents Added Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Click <strong>+ Add Docs</strong> button above to upload client files. Simply give a document name and select files.
            </p>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#f59e0b]" /> + Add First Document
            </button>
          </div>
        ) : (
          displayedDocs.map((doc, index) => {
            const isSelected = selectedDocIds.includes(doc.id);
            const isFirst = index === 0;
            const isLast = index === displayedDocs.length - 1;
            const isBeingDragged = draggedIndex === index;
            const isTouchTarget = touchHoverIndex === index && draggedIndex !== null && draggedIndex !== index;
            const fileCount = doc.files?.length || 1;
            const primaryUrl = doc.files?.[0]?.fileUrl || doc.fileUrl;

            return (
              <div
                key={doc.id || index}
                data-doc-index={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
                  isBeingDragged
                    ? 'opacity-40 border-amber-400 scale-[0.98]'
                    : isTouchTarget
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/50'
                    : isSelected
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-gray-200/90 hover:border-gray-300'
                }`}
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Drag Handle, Serial, Checkbox, Doc Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    {/* Reorder Buttons & Touch Handle */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing touch-none select-none transition-colors"
                        title="Drag to Reorder Serial"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={isFirst || savingOrder}
                          className="p-0.5 text-gray-400 hover:text-[#081326] disabled:opacity-20 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={isLast || savingOrder}
                          className="p-0.5 text-gray-400 hover:text-[#081326] disabled:opacity-20 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectDoc(doc.id)}
                      className="text-gray-400 hover:text-amber-600 shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>

                    {/* Serial Tag */}
                    <span className="px-2 py-0.5 bg-[#081326] text-amber-400 rounded-md text-[11px] font-mono font-bold shrink-0">
                      #{index + 1}
                    </span>

                    {/* Document Name & Badges */}
                    <div 
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => openContinuousView(index)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-[#081326] hover:text-amber-600 transition-colors truncate">
                          {doc.name}
                        </h4>
                        {fileCount > 1 && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                            {fileCount} Files
                          </span>
                        )}
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                          {isPdf(primaryUrl) ? 'PDF' : 'IMAGE'}
                        </span>
                      </div>

                      {/* Notes snippet */}
                      {doc.notes && (
                        <p className="text-[11px] text-amber-700 font-medium truncate mt-0.5">
                          Note: {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons (Eye, Share, Print, Download, Note, Delete) */}
                  <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => openContinuousView(index)}
                      className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareDocModal(doc)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Share Document (File / Link)"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSmartPrint([doc], `${doc.name} - ${client?.fullName || 'Client'}`)}
                      className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Smart Print Document"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadFile(e, primaryUrl, doc.name)}
                      className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingNoteDoc({ docName: doc.name, text: doc.notes || '', doc })}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Add / Edit Note"
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(doc)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* ---------------------------------------------------- */}
      {/* 1. DOCUMENT PREVIEW MODAL (With PDF.js & ImageViewer) */}
      {/* ---------------------------------------------------- */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#081326]/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative bg-white w-full max-w-4xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-white border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#081326] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {previewData.activeIndex + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-[#081326] truncate">
                    {previewData.title}
                  </h3>
                  {previewData.files.length > 1 && (
                    <p className="text-[10px] text-gray-400 font-medium">
                      Attachment {previewData.activeIndex + 1} of {previewData.files.length}
                    </p>
                  )}
                </div>
              </div>

              {/* Header Actions: Open Tab, Print, Download, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={getAssetUrl(activePreviewFile.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Open direct file in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Tab</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSmartPrint([{ name: previewData.title, files: previewData.files }], `${previewData.title} - ${client?.fullName || 'Client'}`)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Smart Print"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownloadFile(e, activePreviewFile.fileUrl, previewData.title)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={closePreview}
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Viewer */}
            <div className="flex-1 bg-slate-900 p-2 sm:p-3 flex items-center justify-center overflow-auto relative">
              {/* Previous Floating Button */}
              {previewData.files.length > 1 && previewData.activeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex - 1 }))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border border-gray-200 text-[#081326] flex items-center justify-center transition-all z-20 cursor-pointer hover:scale-105"
                  title="Previous Attachment"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {/* Next Floating Button */}
              {previewData.files.length > 1 && previewData.activeIndex < previewData.files.length - 1 && (
                <button
                  type="button"
                  onClick={() => setPreviewData(prev => ({ ...prev, activeIndex: prev.activeIndex + 1 }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl border border-gray-200 text-[#081326] flex items-center justify-center transition-all z-20 cursor-pointer hover:scale-105"
                  title="Next Attachment"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {isPdf(activePreviewFile.fileUrl) ? (
                <PdfViewer
                  key={activePreviewFile.fileUrl}
                  url={getAssetUrl(activePreviewFile.fileUrl)}
                  title={previewData.title}
                  className="w-full h-full"
                />
              ) : (
                <ImageViewer
                  key={activePreviewFile.fileUrl}
                  src={getAssetUrl(activePreviewFile.fileUrl)}
                  alt={previewData.title}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Bottom thumbnail / file selector strip for multi-files */}
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

      {/* ---------------------------------------------------- */}
      {/* 2. UPLOAD MODAL */}
      {/* ---------------------------------------------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#081326]">Upload Client Document</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Single or multiple files supported (PDF, JPG, PNG)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-black p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpleUpload} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PAN Card, Salary Slip, Property Deed, Bank Statement..."
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified original copy, 6 months statement..."
                  value={customDocNotes}
                  onChange={(e) => setCustomDocNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select File(s) <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all space-y-2"
                >
                  <Upload className="w-8 h-8 text-[#f59e0b] mx-auto" />
                  <p className="text-xs font-bold text-gray-700">Click to browse or drag & drop files</p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG, WEBP (Supports multiple files)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedFiles.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-xs border border-gray-200">
                      <span className="truncate max-w-[280px] font-medium text-gray-700">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(fIdx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="px-5 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                  <span>{uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' File(s)' : ''}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. EDIT DOCUMENT NOTE MODAL */}
      {/* ---------------------------------------------------- */}
      {editingNoteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-[#081326]">Document Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteDoc(null)}
                className="text-gray-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-3">
              <p className="text-xs text-gray-500 font-medium">
                Add special instructions, verification notes, or status for <strong>{editingNoteDoc.docName}</strong>:
              </p>
              <textarea
                rows={4}
                value={editingNoteDoc.text}
                onChange={(e) => setEditingNoteDoc(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter note details..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNoteDoc(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={() => handleSaveDocNote(editingNoteDoc.docName, editingNoteDoc.doc)}
                  className="px-5 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  <span>{savingNote ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SINGLE DOCUMENT SHARE MODAL (File vs Link) */}
      {/* ---------------------------------------------------- */}
      {shareDocModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#081326]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="absolute inset-0"
            onClick={() => setShareDocModal(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#081326] truncate">Share {shareDocModal.name}</h3>
                <p className="text-[11px] text-gray-400">Select sharing method</p>
              </div>
              <button
                type="button"
                onClick={() => setShareDocModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleShareSingleDocFile(shareDocModal)}
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
                onClick={() => {
                  const text = `📄 Document: ${shareDocModal.name}\nClient: ${client?.fullName || 'Client'}\n\n🔗 View securely on KTR Portal:\n${shareBundleUrl}`;
                  navigator.clipboard.writeText(text);
                  toast.success('Document link copied to clipboard!');
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  setShareDocModal(null);
                }}
                className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left text-xs font-black text-blue-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share Link</p>
                  <p className="text-[10px] text-gray-500 font-medium">Share secure banker viewing link</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. TOP SHARE ALL CASE DOCUMENTS MODAL (File vs Link) */}
      {/* ---------------------------------------------------- */}
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
                type="button"
                onClick={() => setTopShareModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleShareAllFiles(sortedDocItems)}
                className="w-full p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left text-xs font-black text-amber-950 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#081326]">Share File(s)</p>
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

      {/* ---------------------------------------------------- */}
      {/* 6. SMART PRINTING PROGRESS OVERLAY */}
      {/* ---------------------------------------------------- */}
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

export default DocumentRepositoryTab;
