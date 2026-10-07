import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Folder, FolderPlus, FileText, Upload, Plus, Search, Eye, Download, 
  Share2, Copy, Check, Trash2, Edit3, Filter, StickyNote, FileSpreadsheet, 
  Image as ImageIcon, AlertCircle, RefreshCw, X, ChevronRight, Lock, Users,
  CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import PdfViewer from '../components/common/PdfViewer';
import ImageViewer from '../components/common/ImageViewer';

const BankFormsRepository = ({ defaultScope = 'common' }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  // Determine scope based on URL or prop
  const isPrivate = location.pathname.includes('private') || defaultScope === 'private';
  const scope = isPrivate ? 'private' : 'common';

  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-Selection State
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form States
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchFolders = async () => {
    try {
      const res = await api.get(`/repository/folders?scope=${scope}`);
      if (res.data.success) {
        setFolders(res.data.folders || []);
        if (res.data.folders.length > 0 && selectedFolder === 'All' && !uploadFolder) {
          setUploadFolder(res.data.folders[0]);
        }
      }
    } catch (err) {
      console.error('Fetch folders error:', err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = `/repository/items?scope=${scope}${selectedFolder !== 'All' ? `&folderName=${encodeURIComponent(selectedFolder)}` : ''}`;
      const res = await api.get(url);
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Fetch items error:', err);
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchItems();
    setSelectedItemIds([]);
  }, [scope, selectedFolder]);

  // Create permanent folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const clean = newFolderName.trim();
    if (!clean) return;

    try {
      const res = await api.post('/repository/folders', { name: clean, scope });
      if (res.data.success) {
        toast.success(`Folder "${clean}" created!`);
        await fetchFolders();
        setSelectedFolder(clean);
        setUploadFolder(clean);
        setNewFolderName('');
        setShowNewFolderModal(false);
      }
    } catch (err) {
      console.error('Create folder error:', err);
      toast.error(err.response?.data?.message || 'Failed to create folder');
    }
  };

  // Rename folder
  const handleRenameFolder = async (e) => {
    e.preventDefault();
    if (!showRenameFolderModal || !renameFolderName.trim()) return;
    const oldName = showRenameFolderModal;
    const newName = renameFolderName.trim();

    try {
      const res = await api.put('/repository/folders/rename', {
        oldName,
        newName,
        scope
      });
      if (res.data.success) {
        toast.success(`Folder renamed to "${newName}"`);
        if (selectedFolder === oldName) setSelectedFolder(newName);
        if (uploadFolder === oldName) setUploadFolder(newName);
        setShowRenameFolderModal(null);
        setRenameFolderName('');
        await fetchFolders();
        await fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderName) => {
    if (!window.confirm(`Delete folder "${folderName}" and all its contents?`)) return;
    try {
      const res = await api.delete(`/repository/folders/${encodeURIComponent(folderName)}?scope=${scope}`);
      if (res.data.success) {
        toast.success(`Folder "${folderName}" deleted`);
        if (selectedFolder === folderName) setSelectedFolder('All');
        await fetchFolders();
        await fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete folder');
    }
  };

  // Append new files without wiping previous selection
  const handleFileSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}_${f.size}_${f.lastModified}`));
      const fresh = incoming.filter(f => !existing.has(`${f.name}_${f.size}_${f.lastModified}`));
      return [...prev, ...fresh];
    });
  };

  const handleRemoveFileFromQueue = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast.error('Please select at least one file.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('scope', scope);
      formData.append('folderName', uploadFolder || 'General');
      if (uploadDocName.trim()) formData.append('name', uploadDocName.trim());
      if (uploadNotes.trim()) formData.append('notes', uploadNotes.trim());

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      const res = await api.post('/repository/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Document(s) uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadDocName('');
        setUploadNotes('');
        await fetchFolders();
        await fetchItems();
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await api.delete(`/repository/items/${id}`);
      if (res.data.success) {
        toast.success('Document deleted');
        setSelectedItemIds(prev => prev.filter(i => i !== id));
        fetchItems();
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedItemIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedItemIds.length} selected document(s)?`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await api.post('/repository/items/bulk-delete', {
        itemIds: selectedItemIds
      });
      if (res.data.success) {
        toast.success(`${selectedItemIds.length} file(s) deleted`);
        setSelectedItemIds([]);
        fetchItems();
      }
    } catch (err) {
      toast.error('Failed to delete selected files');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk Download
  const handleBulkDownload = async () => {
    const selected = items.filter(i => selectedItemIds.includes(i._id));
    if (selected.length === 0) return;

    toast.loading(`Downloading ${selected.length} file(s)...`, { id: 'bulk-repo-dl' });
    try {
      for (const item of selected) {
        const fullUrl = getAssetUrl(item.fileUrl);
        const a = document.createElement('a');
        a.href = fullUrl;
        a.download = item.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise(r => setTimeout(r, 400));
      }
      toast.success('Downloaded!', { id: 'bulk-repo-dl' });
    } catch (e) {
      toast.error('Download error', { id: 'bulk-repo-dl' });
    }
  };

  // Bulk Share
  const handleBulkShare = async () => {
    const selected = items.filter(i => selectedItemIds.includes(i._id));
    if (selected.length === 0) return;

    const text = `📁 KTR Consultants – Repository Documents (${selected.length} files)\n\n` +
      selected.map((item, idx) => `${idx + 1}. ${item.name} (${item.folderName})\n🔗 ${getAssetUrl(item.fileUrl)}`).join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KTR Repository Documents',
          text
        });
        return;
      } catch (e) {}
    }

    navigator.clipboard.writeText(text);
    toast.success('Document links copied to clipboard!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleSelectItem = (id) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map(i => i._id));
    }
  };

  const handleCopyLink = (fileUrl, id) => {
    const fullUrl = getAssetUrl(fileUrl);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('File link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleShareFile = async (item) => {
    const fullUrl = getAssetUrl(item.fileUrl);
    const text = `📄 KTR Consultants - Document\n\nName: ${item.name}\nFolder: ${item.folderName}\n${item.notes ? `Note: ${item.notes}\n` : ''}\n🔗 View file:\n${fullUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text,
          url: fullUrl
        });
        return;
      } catch (e) {}
    }
    
    navigator.clipboard.writeText(text);
    toast.success('Share link copied!');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.folderName && item.folderName.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  const getFileIcon = (fileType, fileUrl) => {
    if (fileType === 'pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (fileType === 'image' || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileUrl)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (fileType === 'spreadsheet' || /\.(xls|xlsx|csv)$/i.test(fileUrl)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  const pageTitle = isPrivate 
    ? `${user?.name || 'My'} – Private Repository` 
    : 'Bank Forms & Others Repository';
  
  const pageSub = isPrivate
    ? 'Your private staff folder. Only you and Admin can view and manage these files.'
    : 'Common repository for standard bank forms, formats, PDFs, kits, and loan documents.';

  return (
    <div className="flex flex-col space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isPrivate ? (
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private Folder
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
                <Users className="w-3 h-3" /> Shared Common Repository
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
            <Folder className="w-6 h-6 text-[#f59e0b]" /> {pageTitle}
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {pageSub}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-gray-600" /> + New Folder
          </button>
          <button
            onClick={() => {
              setSelectedFiles([]);
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#f59e0b]" /> Upload Files
          </button>
        </div>
      </div>

      {/* Folders Bar & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => setSelectedFolder('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedFolder === 'All'
                ? 'bg-[#081326] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Folders ({items.length})
          </button>
          {folders.map(f => (
            <div key={f} className="flex items-center group relative">
              <button
                onClick={() => setSelectedFolder(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedFolder === f
                    ? 'bg-[#f59e0b] text-[#081326] font-black shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{f}</span>
              </button>
              {f !== 'General' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowRenameFolderModal(f);
                    setRenameFolderName(f);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-amber-600 ml-0.5 transition-opacity"
                  title="Rename folder"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] shadow-xs"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedItemIds.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>{selectedItemIds.length} file(s) selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBulkShare}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Selected</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedItemIds([])}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox Header */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-400 font-bold">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-amber-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
            <span>Select All ({filteredItems.length})</span>
          </button>
        </div>
      )}

      {/* Grid of Items */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-xs font-bold">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f59e0b] mb-2" />
          Loading documents...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-sm font-black text-[#081326] mb-1">No documents found</h4>
          <p className="text-xs text-gray-400 font-medium mb-4">
            {searchQuery ? 'No documents match your search query.' : 'Get started by uploading bank forms, PDFs, or private staff documents.'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#f59e0b]" /> Upload New File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isPdf = item.fileUrl.toLowerCase().endsWith('.pdf') || item.fileType === 'pdf';
            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(item.fileUrl) || item.fileType === 'image';
            const isSelected = selectedItemIds.includes(item._id);

            return (
              <div 
                key={item._id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group shadow-xs ${
                  isSelected ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200/90 hover:border-[#f59e0b]'
                }`}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(item._id)}
                        className="text-gray-400 hover:text-amber-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        {getFileIcon(item.fileType, item.fileUrl)}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 truncate max-w-[120px]">
                      {item.folderName}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[#081326] line-clamp-2 leading-snug" title={item.name}>
                      {item.name}
                    </h4>
                    {item.notes && (
                      <p className="text-[11px] text-gray-500 font-medium mt-1 line-clamp-2 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/60">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-2 border-t border-gray-50">
                    <span>{item.createdByName || 'Staff'}</span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-gray-50/70 px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {(isPdf || isImg) && (
                      <button
                        onClick={() => setPreviewDoc(item)}
                        className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#081326] transition-colors cursor-pointer"
                        title="Quick Preview"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                    <a
                      href={getAssetUrl(item.fileUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#081326] transition-colors cursor-pointer"
                      title="Download Original File"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                    <button
                      onClick={() => handleShareFile(item)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-[#081326] transition-colors cursor-pointer"
                      title="Share / Copy Link"
                    >
                      {copiedId === item._id ? <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  </div>

                  {(role === 'admin' || item.createdBy?._id === user?.id || item.createdBy === user?.id) && (
                    <button
                      onClick={() => handleDeleteItem(item._id, item.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#081326]/80 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5 truncate mr-4">
                {getFileIcon(previewDoc.fileType, previewDoc.fileUrl)}
                <div>
                  <h3 className="text-xs font-black text-[#081326] truncate">{previewDoc.name}</h3>
                  <span className="text-[10px] text-gray-500 font-bold">{previewDoc.folderName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(previewDoc.fileUrl)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-slate-900 flex items-center justify-center">
              {previewDoc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <PdfViewer url={getAssetUrl(previewDoc.fileUrl)} title={previewDoc.name} className="h-full" />
              ) : (
                <ImageViewer src={getAssetUrl(previewDoc.fileUrl)} alt={previewDoc.name} className="max-h-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#f59e0b]" /> Upload to {isPrivate ? 'Private Storage' : 'Bank Forms Repository'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Select Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                >
                  {folders.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Document Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SBI Home Loan Application Form 2026"
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Notes & Instructions (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Requires applicant signature on page 3 and branch stamp"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Select Files (Selecting more will append)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
                      <span>{selectedFiles.length} file(s) staged:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    {selectedFiles.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg text-xs border border-gray-200">
                        <span className="truncate max-w-[260px] font-medium text-gray-700">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFileFromQueue(fIdx)}
                          className="text-red-500 hover:text-red-700 font-bold ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#f59e0b]" />}
                  <span>{isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' File(s)' : ''}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#f59e0b]" /> Create New Folder
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank Kit"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-sm text-[#081326] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#f59e0b]" /> Rename Folder
              </h3>
              <button onClick={() => setShowRenameFolderModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRenameFolder} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">New Folder Name</label>
                <input
                  type="text"
                  required
                  value={renameFolderName}
                  onChange={(e) => setRenameFolderName(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(showRenameFolderModal)}
                  className="py-2 px-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowRenameFolderModal(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankFormsRepository;
