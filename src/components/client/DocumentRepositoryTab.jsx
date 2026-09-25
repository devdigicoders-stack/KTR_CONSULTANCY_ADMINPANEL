import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, Download, Eye, Upload, CheckCircle2, 
  ExternalLink, Search, PlusCircle, X, Trash2,
  Copy, Check, ArrowUp, ArrowDown, GripVertical,
  CheckSquare, Square, Share2, ChevronLeft, ChevronRight,
  Layers, ArrowLeft
} from 'lucide-react';
import { getAssetUrl, getPublicShareDocsUrl } from '../../utils/url';
import api from '../../api/axios';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

const DocumentRepositoryTab = ({ client, onRefresh }) => {
  // Preview File State: { title, files: [{ fileUrl, title, docId, docType }], activeIndex: 0 }
  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-file Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Multi-Select for Batch Sharing
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  // WhatsApp Share States
  const [shareDocTarget, setShareDocTarget] = useState(null); // single doc or batch { title, url, isBatch }
  const [showShareBundleModal, setShowShareBundleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);

  // Document Serial Order State & Dragging
  const [localOrder, setLocalOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const fileInputRef = useRef(null);

  const cleanMobile = (client?.mobile || client?.mobileNumber || client?.phone || '').replace(/\D/g, '').slice(-10);
  const shareBundleUrl = client?._id ? getPublicShareDocsUrl(client._id) : '';

  // ----------------------------------------------------
  // BACK BUTTON HANDLING: Stay on Documents Tab / Page
  // ----------------------------------------------------
  const closePreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  const openPreview = useCallback((title, files, startIndex = 0) => {
    if (!files || files.length === 0) return;
    const formattedFiles = files.map(f => typeof f === 'string' ? { fileUrl: f, title } : f);
    
    // Push dummy state to browser history so Android/Browser back button closes modal
    try {
      window.history.pushState({ ktrPreviewModal: true }, '');
    } catch (e) {
      // ignore
    }

    setPreviewData({
      title,
      files: formattedFiles,
      activeIndex: Math.max(0, Math.min(startIndex, formattedFiles.length - 1))
    });
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      if (previewData) {
        setPreviewData(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [previewData]);

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

  // ----------------------------------------------------
  // GATHER & GROUP DOCUMENTS BY TITLE / NAME
  // ----------------------------------------------------
  // When staff uploads multiple files under one title (e.g. "6 Months Salary Slips"),
  // they group cleanly together so Preview opens all files with Next/Prev navigation.
  const groupedDocsMap = new Map();
  const seenUrls = new Set();

  // 1. Custom Documents
  (client?.customDocuments || []).forEach((cd, idx) => {
    if (!cd.fileUrl || seenUrls.has(cd.fileUrl)) return;
    seenUrls.add(cd.fileUrl);

    const groupKey = (cd.name || 'Document').trim();
    const docEntry = {
      id: `cd_${cd._id || idx}`,
      docId: cd._id,
      name: groupKey,
      fileUrl: cd.fileUrl,
      docType: cd.docType || 'customDocument',
      category: cd.category || 'Uploaded File',
      uploadedAt: cd.uploadedAt,
      uploadedByName: cd.uploadedByName,
      rawDoc: cd
    };

    if (groupedDocsMap.has(groupKey)) {
      groupedDocsMap.get(groupKey).files.push(docEntry);
    } else {
      groupedDocsMap.set(groupKey, {
        id: `group_${docEntry.id}`,
        name: groupKey,
        docType: docEntry.docType,
        category: docEntry.category,
        uploadedAt: docEntry.uploadedAt,
        uploadedByName: docEntry.uploadedByName,
        files: [docEntry]
      });
    }
  });

  // 2. Custom Folders Documents
  (client?.customFolders || []).forEach(f => {
    (f.documents || []).forEach((fDoc, fIdx) => {
      if (!fDoc.fileUrl || seenUrls.has(fDoc.fileUrl)) return;
      seenUrls.add(fDoc.fileUrl);

      const groupKey = (fDoc.name || 'Folder Document').trim();
      const docEntry = {
        id: `folderdoc_${f._id}_${fDoc._id || fIdx}`,
        docId: fDoc._id,
        name: groupKey,
        fileUrl: fDoc.fileUrl,
        docType: 'folderDocument',
        category: `Folder: ${f.folderName || f.name}`,
        uploadedAt: fDoc.uploadedAt,
        uploadedByName: fDoc.uploadedByName
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
      } else {
        groupedDocsMap.set(groupKey, {
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          uploadedAt: docEntry.uploadedAt,
          uploadedByName: docEntry.uploadedByName,
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
      const docEntry = {
        id: `legacy_${item.key}`,
        name: groupKey,
        fileUrl: client[item.key],
        docType: item.key,
        category: 'Client Document'
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
      } else {
        groupedDocsMap.set(groupKey, {
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
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
      const docEntry = {
        id: `other_${idx}`,
        name: groupKey,
        fileUrl: url,
        docType: 'other',
        category: 'Client Document'
      };

      if (groupedDocsMap.has(groupKey)) {
        groupedDocsMap.get(groupKey).files.push(docEntry);
      } else {
        groupedDocsMap.set(groupKey, {
          id: `group_${docEntry.id}`,
          name: groupKey,
          docType: docEntry.docType,
          category: docEntry.category,
          files: [docEntry]
        });
      }
    }
  });

  const rawDocs = Array.from(groupedDocsMap.values());

  // Sort by saved serial order
  const activeOrder = localOrder || client?.documentOrder || [];
  const sortedDocItems = [...rawDocs].sort((a, b) => {
    // Match either group ID or individual file ID
    const indexA = activeOrder.findIndex(key => key === a.id || a.files.some(f => f.id === key));
    const indexB = activeOrder.findIndex(key => key === b.id || b.files.some(f => f.id === key));
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

    const newOrderKeys = newItems.flatMap(item => item.files.map(f => f.id));
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

  // Drag & Drop Reordering (Mouse and Touch support)
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

    const newOrderKeys = newItems.flatMap(item => item.files.map(f => f.id));
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

  // Mobile Touch Reorder Handlers on Drag Handle (☰)
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

    // Find the item element under the touch point
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

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setCustomDocTitle('');
        setSelectedFiles([]);
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

    e.target.value = '';
  };

  const handleRemoveSelectedFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Delete an entire document group or specific file
  const handleDeleteDocGroup = async (groupDoc) => {
    const fileName = groupDoc.name || 'Document';
    const filesCount = groupDoc.files?.length || 1;
    const confirmPrompt = filesCount > 1 
      ? `Delete all ${filesCount} file(s) under "${fileName}"?` 
      : `Delete "${fileName}"?`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      // Delete all files belonging to this group
      for (const fileObj of groupDoc.files) {
        await api.delete(`/clients/${client._id}/documents`, {
          data: {
            docType: fileObj.docType || 'customDocument',
            docId: fileObj.docId || fileObj._id,
            fileUrl: fileObj.fileUrl,
            docName: fileName,
            reason: 'Deleted by staff'
          }
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSingleFile = async (e, fileObj, docTitle) => {
    e.stopPropagation();
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
      if (res.data.success && onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete file: ' + (err.response?.data?.message || err.message));
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
      console.error('Error downloading file:', error);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAllInGroup = async (e, groupDoc) => {
    if (e) e.preventDefault();
    if (!groupDoc.files || groupDoc.files.length === 0) return;
    for (let i = 0; i < groupDoc.files.length; i++) {
      const f = groupDoc.files[i];
      const suffix = groupDoc.files.length > 1 ? `_Part${i + 1}` : '';
      const ext = f.fileUrl.split('.').pop() || 'pdf';
      const cleanName = `${groupDoc.name}${suffix}.${ext}`;
      await handleDownloadFile(null, f.fileUrl, cleanName);
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

  // WhatsApp Single Document Share (Share secure portal link so recipient can open & view online without downloading)
  const handleShareDocOnWhatsApp = (docTitle, fileUrl, targetMobile = null) => {
    if (!shareBundleUrl) return;
    const clientName = client?.fullName || 'Client';
    const appId = client?.applicationId ? ` (${client.applicationId})` : '';
    
    // Direct view portal link
    const message = `📄 *Document:* ${docTitle}\n👤 *Client:* ${clientName}${appId}\n\n👉 *Open Link to View Document Online:*\n${shareBundleUrl}\n\n_Sent via KTR Consultants Case Portal_`;
    
    if (targetMobile) {
      window.open(`https://wa.me/91${targetMobile}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // WhatsApp Batch / Selected / All Documents Share
  const handleShareSelectedOnWhatsApp = (targetMobile = null) => {
    if (!shareBundleUrl) return;
    const clientName = client?.fullName || 'Client';
    const appId = client?.applicationId ? ` (${client.applicationId})` : '';
    
    const selectedItems = sortedDocItems.filter(item => selectedDocIds.includes(item.id));
    const isAll = selectedItems.length === 0 || selectedItems.length === sortedDocItems.length;

    let docListText = '';
    if (!isAll) {
      docListText = `\n📋 *Selected Documents (${selectedItems.length}):*\n` + selectedItems.map((it, i) => `${i + 1}. 📄 ${it.name} ${it.files?.length > 1 ? `(${it.files.length} files)` : ''}`).join('\n');
    } else {
      docListText = `\n📋 *All Case Documents (${sortedDocItems.length} Categories):*\n` + sortedDocItems.map((it, i) => `${i + 1}. 📄 ${it.name} ${it.files?.length > 1 ? `(${it.files.length} files)` : ''}`).join('\n');
    }

    const message = `📂 *Case Documents: ${clientName}*${appId}${docListText}\n\n👉 *Open Link to View, Preview & Download Documents Online:*\n${shareBundleUrl}\n\n_KTR Consultants - Financial & Legal Services_`;
    
    if (targetMobile) {
      window.open(`https://wa.me/91${targetMobile}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const isPdf = (url) => url && url.toLowerCase().split('?')[0].endsWith('.pdf');

  // Toggle selection
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

  // Filter based on search query
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

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search document name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Share All Documents Button */}
          <button
            type="button"
            onClick={() => setShowShareBundleModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all shrink-0"
            title="Share All Documents Link via WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>Share All Documents</span>
          </button>

          {/* Add Docs Button */}
          <button
            type="button"
            onClick={() => {
              setCustomDocTitle('');
              setSelectedFiles([]);
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-[#081326] hover:bg-[#11203d] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#f59e0b]" />
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
              onClick={() => handleShareSelectedOnWhatsApp()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
              <span>Share Selected ({selectedDocIds.length})</span>
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
                key={doc.id}
                data-doc-index={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-4.5 shadow-xs flex flex-col justify-between gap-3 ${
                  isBeingDragged ? 'opacity-50 scale-[0.99] border-amber-500 bg-amber-50/50' : ''
                } ${
                  isTouchTarget ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-100/30' : ''
                } ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left side: Reorder + Checkbox + Icon + Document Name */}
                  <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
                    {/* Drag Handle (☰) & Arrow Controls */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 gap-0.5 select-none">
                      {/* Dedicated ☰ Mobile Drag Handle */}
                      <div 
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="cursor-grab active:cursor-grabbing px-1.5 py-1 text-gray-500 hover:text-amber-700 bg-white sm:bg-transparent rounded-lg border sm:border-0 border-gray-200 flex items-center justify-center font-bold text-sm touch-none"
                        title="Hold & Drag (☰) to reorder on mobile or desktop"
                        aria-label="Drag Handle"
                      >
                        <span className="text-base leading-none select-none">☰</span>
                      </div>

                      <button
                        type="button"
                        disabled={isFirst || savingOrder}
                        onClick={() => handleMoveItem(index, 'up')}
                        className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="text-[11px] font-mono font-black text-amber-700 px-1">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={isLast || savingOrder}
                        onClick={() => handleMoveItem(index, 'down')}
                        className="p-1 text-gray-400 hover:text-amber-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Multi-select Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectDoc(doc.id)}
                      className="cursor-pointer text-gray-400 hover:text-amber-600 shrink-0 mt-1 sm:mt-0"
                      title="Select document"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>

                    {/* Document Icon */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 relative">
                      <FileText className="w-5 h-5" />
                      {fileCount > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-black font-mono shadow-2xs">
                          {fileCount}
                        </span>
                      )}
                    </div>

                    {/* Document Title Entered by User - Full complete name wrapping across multiple lines */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#081326] break-words whitespace-normal leading-snug">
                          {doc.name}
                        </h4>
                        {fileCount > 1 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <Layers className="w-3 h-3 text-amber-700" /> {fileCount} Files Combined
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono break-all mt-0.5">
                        {fileCount === 1 
                          ? primaryUrl.split('/').pop() 
                          : `${fileCount} uploaded attachments under this document title`}
                        {doc.uploadedAt ? ` • Uploaded ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Preview, Download, WhatsApp, Delete Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                    {/* 1. Preview Button (Opens all files in viewer) */}
                    <button
                      type="button"
                      onClick={() => openPreview(doc.name, doc.files, 0)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title={fileCount > 1 ? `Preview All ${fileCount} Files Together` : "Preview Document Online"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{fileCount > 1 ? `Preview (${fileCount})` : 'Preview'}</span>
                    </button>

                    {/* 2. Download Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        if (fileCount > 1) {
                          handleDownloadAllInGroup(e, doc);
                        } else {
                          handleDownloadFile(e, primaryUrl, doc.name);
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title={fileCount > 1 ? `Download all ${fileCount} files` : "Download to Device"}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    {/* 3. WhatsApp Share Button */}
                    <button
                      type="button"
                      onClick={() => setShareDocTarget({ title: doc.name, url: primaryUrl })}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="Share Document via WhatsApp Link"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    {/* 4. Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDocGroup(doc)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-all cursor-pointer shadow-2xs"
                      title={fileCount > 1 ? `Delete all ${fileCount} files` : "Delete Document"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-files chip list if multiple files attached */}
                {fileCount > 1 && (
                  <div className="pt-2 border-t border-gray-100/80 flex items-center gap-2 overflow-x-auto py-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Files:</span>
                    {doc.files.map((fileObj, fIdx) => (
                      <div
                        key={fIdx}
                        onClick={() => openPreview(doc.name, doc.files, fIdx)}
                        className="px-2.5 py-1 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                        title={`Click to preview file ${fIdx + 1}`}
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold font-mono">
                          {fIdx + 1}
                        </span>
                        <span className="text-[11px] truncate max-w-[140px]">
                          {fileObj.fileUrl.split('/').pop()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingleFile(e, fileObj, doc.name)}
                          className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                          title="Delete this specific file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Docs Modal (Only Document Name + Select File(s)) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#081326]">Add Document(s)</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Simple upload with custom name</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimpleUpload} className="space-y-4 pt-4">
              {/* 1. Document Name / Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Last 6 Months Salary Slips, Bank Statement, Property Registry, etc."
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* 2. Select Files */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Select File(s) <span className="text-red-500">*</span>
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3 text-amber-600" /> + Add More
                    </button>
                  )}
                </div>

                {/* Mobile/Android file picker fix: broad accept without restrictive extension tags so system 'Files' picker opens */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*"
                />

                {selectedFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-amber-500 bg-gray-50/50 hover:bg-amber-50/20 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-8 h-8 text-[#f59e0b]" />
                    <p className="text-xs font-black text-gray-800">
                      Click to choose files from device
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Supports PDFs, Images, Excel, Word documents (Multiple files allowed)
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2 max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase px-1">
                      <span>Selected ({selectedFiles.length})</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-500 hover:underline cursor-pointer lowercase first-letter:uppercase"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-gray-200 gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate font-bold text-gray-800 max-w-[200px]" title={f.name}>
                              {f.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-gray-400 font-mono">
                              {(f.size / 1024).toFixed(0)} KB
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(i)}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
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
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4 text-[#f59e0b]" />
                  <span>
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' File(s)' : ''}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Document Multi-File Preview Modal with Next/Previous navigation & Back button */}
      {previewData && activePreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#081326]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* Modal Header */}
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

              {/* Navigation & Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Next / Prev Controls */}
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
                  type="button"
                  onClick={(e) => handleDownloadFile(e, activePreviewFile.fileUrl, `${previewData.title}_${previewData.activeIndex + 1}`)}
                  className="px-3 py-1.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Download current file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareDocTarget({ title: `${previewData.title} (File ${previewData.activeIndex + 1})`, url: activePreviewFile.fileUrl })}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Share Document on WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 font-bold cursor-pointer transition-colors"
                  title="Close preview (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body with Viewer */}
            <div className="flex-1 bg-gray-900/5 p-2 sm:p-4 flex items-center justify-center overflow-auto relative group">
              {/* Previous Floating Button */}
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

              {/* Next Floating Button */}
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

      {/* WhatsApp Share Modal (Single Document) */}
      {shareDocTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#081326]">Share Document on WhatsApp</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Banker/recipient can view directly online</p>
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

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Document:</span>
                <span className="font-bold text-[#081326] truncate max-w-[220px]">{shareDocTarget.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Client:</span>
                <span className="font-bold text-[#081326]">{client?.fullName || 'Client'}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  handleShareDocOnWhatsApp(shareDocTarget.title, shareDocTarget.url);
                  setShareDocTarget(null);
                }}
                className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Share with Any Contact / Banker / Group</span>
              </button>

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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareBundleUrl, setCopiedDocUrl)}
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                >
                  {copiedDocUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  <span>{copiedDocUrl ? 'Link Copied!' : 'Copy Portal Link'}</span>
                </button>
                <a
                  href={shareBundleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share All / Complete Case Documents Modal */}
      {showShareBundleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#081326]">Share All Documents</h3>
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

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Client:</span>
                <span>{client?.fullName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Categories:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{sortedDocItems.length} Documents</span>
              </div>
              <p className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-200/60 font-medium">
                Banker/recipient bina download kiye link open karke saare documents direct online preview, print ya save kar sakte hain.
              </p>
            </div>

            {/* Shareable Link Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Secure View Link
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
                  handleShareSelectedOnWhatsApp();
                  setShowShareBundleModal(false);
                }}
                className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Share Complete Docs on WhatsApp</span>
              </button>

              {cleanMobile && (
                <button
                  type="button"
                  onClick={() => {
                    handleShareSelectedOnWhatsApp(cleanMobile);
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
