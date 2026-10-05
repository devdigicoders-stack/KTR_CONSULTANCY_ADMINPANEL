import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Folder, FolderPlus, FileText, Upload, Plus, Search, Eye, Download, 
  Share2, Copy, Check, Trash2, Edit3, Filter, StickyNote, FileSpreadsheet, 
  Image as ImageIcon, AlertCircle, RefreshCw, X, ChevronRight, Lock, Users
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

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form States
  const [newFolderName, setNewFolderName] = useState('');
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
  }, [scope, selectedFolder]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const clean = newFolderName.trim();
    if (!folders.includes(clean)) {
      setFolders(prev => [...prev, clean]);
      setSelectedFolder(clean);
      setUploadFolder(clean);
    }
    setNewFolderName('');
    setShowNewFolderModal(false);
    toast.success(`Folder "${clean}" ready!`);
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
        fetchFolders();
        fetchItems();
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
        fetchItems();
      }
    } catch (err) {
      toast.error('Failed to delete document');
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Document: ${item.name} (${item.folderName})\n${item.notes ? `Note: ${item.notes}\n` : ''}`,
          url: fullUrl
        });
        return;
      } catch (e) {}
    }
    handleCopyLink(item.fileUrl, item._id);
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
            onClick={() => setShowUploadModal(true)}
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
            <button
              key={f}
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

            return (
              <div 
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#f59e0b] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {getFileIcon(item.fileType, item.fileUrl)}
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
                      onClick={() => handleDeleteDeleteItem(item._id, item.name)}
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
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Select Files (PDF, Images, Excel)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    ✓ {selectedFiles.length} file(s) selected
                  </p>
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
                  disabled={isUploading}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#f59e0b]" />}
                  <span>{isUploading ? 'Uploading...' : 'Upload Now'}</span>
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
    </div>
  );
};

export default BankFormsRepository;
