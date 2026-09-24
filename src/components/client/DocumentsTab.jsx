import { useState } from 'react';
import { 
  Eye, Search, FileText, Upload, Trash2, ShieldAlert, X, Download, 
  FolderPlus, Folder, ArrowLeft, FolderOpen, Copy, Check, ExternalLink 
} from 'lucide-react';
import { getAssetUrl, getPublicShareDocsUrl } from '../../utils/url';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

const DocumentsTab = ({ client, onRefresh }) => {
  const { role, user } = useAuth() || {};
  const currentRole = role || user?.role || localStorage.getItem('role') || 'staff';
  const documents = client?.documentsList || [];
  const deletedDocuments = client?.deletedDocuments || [];
  const customFolders = client?.customFolders || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFolderDeleteModal, setShowFolderDeleteModal] = useState(false);

  // WhatsApp Share States
  const [shareDocTarget, setShareDocTarget] = useState(null); // { title, url }
  const [showShareBundleModal, setShowShareBundleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDocUrl, setCopiedDocUrl] = useState(false);
  
  const [currentFolder, setCurrentFolder] = useState(null); // null means root view

  // Derived current folder synced with latest client data
  const activeFolder = currentFolder 
    ? (customFolders.find(f => f._id === currentFolder._id || (f._id && currentFolder._id && f._id.toString() === currentFolder._id.toString())) || currentFolder)
    : null;

  const [docToDelete, setDocToDelete] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeletedBackup, setShowDeletedBackup] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  const [docType, setDocType] = useState('otherDocs');
  const [docName, setDocName] = useState('');

  const cleanMobile = (client?.mobileNumber || client?.phone || '').replace(/\D/g, '').slice(-10);
  const shareBundleUrl = client?._id ? getPublicShareDocsUrl(client._id) : '';

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
    const totalFiles = (documents || []).length;
    
    const message = `📂 *Case Documents: ${clientName}*${appId}${caseType}\n📊 *Total Documents:* ${totalFiles} available\n\n👉 *Open this link to view, preview, download or save all documents:*\n${shareBundleUrl}\n\n_KTR Consultants - Financial & Legal Services_`;
    
    if (targetMobile) {
      window.open(`https://wa.me/91${targetMobile}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Verified: "text-green-600 bg-green-50 border border-green-100",
      Pending: "text-orange-500 bg-orange-50 border border-orange-100",
      Rejected: "text-red-500 bg-red-50 border border-red-100"
    };
    return (
      <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-0.5 rounded text-[10px] font-bold`}>
        {status || 'Verified'}
      </span>
    );
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

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

  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      alert('Folder name is required.');
      return;
    }
    try {
      setCreatingFolder(true);
      const res = await api.post(`/clients/${client._id}/folders`, {
        folderName: newFolderName.trim(),
        name: newFolderName.trim(),
        description: newFolderDescription.trim()
      });
      if (res.data.success) {
        setShowCreateFolderModal(false);
        setNewFolderName('');
        setNewFolderDescription('');
        if (onRefresh) onRefresh();
        else window.location.reload();
      }
    } catch (err) {
      console.error('Create folder error:', err);
      alert('Failed to create folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }
    if (!client?._id) {
      alert('Client ID is missing.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      // Append each selected file separately
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      if (currentFolder) {
        formData.append('folderId', currentFolder._id);
        formData.append('docName', (docName || '').trim());
        formData.append('documentName', (docName || '').trim());
        formData.append('category', currentFolder.folderName || currentFolder.name || 'Folder Document');
      } else if (docType && typeof docType === 'string' && docType.startsWith('folder_')) {
        const targetFId = docType.replace('folder_', '');
        const targetF = customFolders.find(f => f._id === targetFId || (f._id && f._id.toString() === targetFId.toString()));
        formData.append('folderId', targetFId);
        formData.append('docName', (docName || '').trim());
        formData.append('documentName', (docName || '').trim());
        formData.append('category', targetF?.folderName || targetF?.name || 'Folder Document');
      } else {
        formData.append('docType', docType);
        formData.append('docName', (docName || '').trim());
        formData.append('documentName', (docName || '').trim());
      }

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setDocName('');
        setSelectedFiles([]);
        if (onRefresh) await onRefresh();
        else window.location.reload();
      }
    } catch (err) {
      console.error('Upload document error:', err);
      alert('Failed to upload document: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSoftDeleteDocument = async () => {
    if (!docToDelete || !client?._id) return;
    try {
      setDeleting(true);
      let res;
      if (docToDelete.isFolderDoc) {
        res = await api.delete(`/clients/${client._id}/folders/${docToDelete.folderId}/documents/${docToDelete.id}`);
      } else {
        res = await api.delete(`/clients/${client._id}/documents`, {
          data: {
            docType: docToDelete.docType,
            fileUrl: docToDelete.file,
            docName: docToDelete.name,
            reason: 'Soft-deleted by user'
          }
        });
      }

      if (res.data.success) {
        setShowDeleteModal(false);
        setDocToDelete(null);
        if (onRefresh) onRefresh();
        else window.location.reload();
      }
    } catch (err) {
      console.error('Soft delete document error:', err);
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleSoftDeleteFolder = async () => {
    if (!folderToDelete || !client?._id) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/clients/${client._id}/folders/${folderToDelete._id}`);
      if (res.data.success) {
        setShowFolderDeleteModal(false);
        setFolderToDelete(null);
        if (currentFolder?._id === folderToDelete._id) setCurrentFolder(null);
        if (onRefresh) onRefresh();
        else window.location.reload();
      }
    } catch (err) {
      console.error('Soft delete folder error:', err);
      alert('Failed to delete folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  // Filter root documents or current folder documents
  const activeDocsToDisplay = activeFolder
    ? (activeFolder.documents || []).map(d => ({
        id: d._id,
        name: d.name || 'Document',
        category: activeFolder.folderName || activeFolder.name || 'Folder Document',
        file: d.fileUrl,
        uploaded: d.uploadedAt,
        status: 'Verified',
        isFolderDoc: true,
        folderId: activeFolder._id
      }))
    : (documents || []);

  const query = (searchQuery || '').toLowerCase();

  const filteredDocs = (activeDocsToDisplay || []).filter(d => 
    (d && typeof d.name === 'string' && d.name.toLowerCase().includes(query)) ||
    (d && typeof d.category === 'string' && d.category.toLowerCase().includes(query))
  );

  const filteredFolders = (customFolders || []).filter(f => 
    f && typeof (f.folderName || f.name) === 'string' && (f.folderName || f.name).toLowerCase().includes(query)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full space-y-6 p-1">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-gray-50 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 items-center flex-wrap">
          <button 
            onClick={() => { setShowDeletedBackup(false); setCurrentFolder(null); }}
            className={`text-xs font-bold pb-2 px-1 border-b-2 transition-colors cursor-pointer ${!showDeletedBackup && !currentFolder ? 'text-[#f59e0b] border-[#f59e0b]' : 'text-gray-500 border-transparent hover:text-[#081326]'}`}
          >
            All Files & Folders
          </button>

          {currentRole === 'admin' && (
            <button 
              onClick={() => setShowDeletedBackup(true)}
              className={`text-xs font-bold pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${showDeletedBackup ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Deleted Documents Backup ({deletedDocuments.length})
            </button>
          )}
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium" 
            />
          </div>

          {!showDeletedBackup && (
            <button 
              type="button"
              onClick={() => setShowShareBundleModal(true)}
              className="bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Share Complete Case Documents on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" /> Share Complete Docs
            </button>
          )}

          {!showDeletedBackup && !currentFolder && (
            <button 
              onClick={() => setShowCreateFolderModal(true)}
              className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-amber-100 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-600" /> New Folder
            </button>
          )}

          {!showDeletedBackup && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-[#081326] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#11203d] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#f59e0b]" /> Add Document {activeFolder ? `in ${activeFolder.folderName || activeFolder.name}` : ''}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Breadcrumb inside active documents */}
      {!showDeletedBackup && (
        <div className="px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-600">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={`hover:text-blue-600 cursor-pointer ${!activeFolder ? 'text-gray-900 font-bold' : ''}`}
          >
            All Documents
          </button>
          {activeFolder && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600 font-bold flex items-center gap-1.5 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {activeFolder.folderName || activeFolder.name}
              </span>
              <button 
                onClick={() => setCurrentFolder(null)}
                className="ml-auto text-[11px] font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Back to All Folders
              </button>
            </>
          )}
        </div>
      )}

      {!showDeletedBackup ? (
        <div className="flex-1 space-y-6">
          {/* Active Folder Header Banner (When inside a folder) */}
          {activeFolder && (
            <div className="px-6">
              <div className="bg-linear-to-r from-amber-50/80 via-white to-amber-50/40 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                    <Folder className="w-6 h-6 fill-amber-400 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[#081326]">
                        {activeFolder.folderName || activeFolder.name}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {activeDocsToDisplay.length} Document{activeDocsToDisplay.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {activeFolder.description || 'Custom folder for client case documents. Click upload to add files with a custom name.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#f59e0b]" /> Upload Document to this Folder
                  </button>
                  <button
                    onClick={() => setCurrentFolder(null)}
                    className="px-3.5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Folders Section (Root view only) */}
          {!currentFolder && customFolders.length > 0 && (
            <div className="px-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Custom Folders (Click to enter)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map((folder) => {
                  const fTitle = folder.folderName || folder.name;
                  const fDocCount = folder.documents ? folder.documents.length : 0;
                  return (
                    <div 
                      key={folder._id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer gap-3"
                      onClick={() => setCurrentFolder(folder)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                            <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                          </div>
                          <div className="truncate">
                            <h5 className="font-bold text-[#081326] text-xs truncate group-hover:text-amber-600 transition-colors">
                              {fTitle}
                            </h5>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {fDocCount} file{fDocCount === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToDelete(folder);
                            setShowFolderDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Open Folder &rarr;
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFolder(folder);
                            setShowUploadModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center gap-1 cursor-pointer"
                          title="Direct Upload to Folder"
                        >
                          <Upload className="w-3 h-3 text-[#f59e0b]" /> + Upload
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Documents Table or Empty State */}
          {filteredDocs.length === 0 ? (
            <div className="px-6 py-12 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 m-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
                <FolderOpen className="w-7 h-7 text-amber-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {activeFolder 
                  ? `Folder "${activeFolder.folderName || activeFolder.name}" is empty`
                  : 'No documents found'}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                {activeFolder
                  ? `No documents have been uploaded into "${activeFolder.folderName || activeFolder.name}" yet. Click below to add files with a Document Name.`
                  : 'No active standalone documents found for this client.'}
              </p>
              {activeFolder && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#f59e0b]" /> Upload First Document to this Folder
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                    <th className="px-6 py-3 whitespace-nowrap">Document</th>
                    <th className="px-6 py-3 whitespace-nowrap">Category / Location</th>
                    <th className="px-6 py-3 whitespace-nowrap">Uploaded On</th>
                    <th className="px-6 py-3 whitespace-nowrap">Status</th>
                    <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-50">
                  {filteredDocs.map((doc, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <a 
                              href={getAssetUrl(doc.file)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="font-bold text-[#081326] hover:text-blue-600 hover:underline"
                            >
                              {doc.name}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {doc.category || 'Document'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {doc.uploaded ? new Date(doc.uploaded).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={getAssetUrl(doc.file)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-1 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors shadow-xs"
                            title="View / Open File"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </a>
                          <button
                            onClick={(e) => handleDownloadFile(e, doc.file, doc.name)}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-1 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                            title="Download to Computer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                          <button
                            type="button"
                            onClick={() => setShareDocTarget({ title: doc.name, url: doc.file })}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1 text-emerald-700 font-bold text-xs hover:bg-emerald-600 hover:text-white transition-colors shadow-xs cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                          </button>
                          <button
                            onClick={() => { setDocToDelete(doc); setShowDeleteModal(true); }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-1 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors shadow-xs cursor-pointer"
                            title="Delete Document (Moves to Backup)"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Admin-Only Deleted Documents Backup Table */
        <div className="overflow-x-auto scrollbar-hide flex-1 p-4">
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Admin Backup & Recycle Vault</p>
              <p className="text-[11px] text-amber-700">
                These documents and folders were soft-deleted by staff/admin. They remain safely stored in the database backup and can be reviewed or downloaded at any time.
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="px-6 py-3 whitespace-nowrap">Document / Folder</th>
                <th className="px-6 py-3 whitespace-nowrap">Deleted By</th>
                <th className="px-6 py-3 whitespace-nowrap">Deleted Date</th>
                <th className="px-6 py-3 whitespace-nowrap">Reason</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Download</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {deletedDocuments.length > 0 ? deletedDocuments.map((del, index) => (
                <tr key={index} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#081326]">
                    {del.docName || del.docType || 'Document'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {del.deletedByName || 'Staff'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {del.deletedAt ? new Date(del.deletedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">
                    {del.reason || 'Soft-deleted'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {del.fileUrl ? (
                      <a 
                        href={getAssetUrl(del.fileUrl)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 rounded text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" /> View / Download
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No soft-deleted documents in backup trash.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowCreateFolderModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#f59e0b]" /> Create Custom Folder
              </h3>
              <button onClick={() => setShowCreateFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Folder Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Property Documents, GST Returns, Personal Records"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Brief note about what is inside this folder"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingFolder}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50"
                >
                  {creatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#f59e0b]" /> 
                {activeFolder 
                  ? `Upload to "${activeFolder.folderName || activeFolder.name}"` 
                  : 'Add New Document'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeFolder && (
              <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 font-medium">Destination Folder:</span>{' '}
                  <strong className="text-amber-900 font-bold">{activeFolder.folderName || activeFolder.name}</strong>
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {!currentFolder && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Document Category / Type</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-bold cursor-pointer"
                  >
                    <option value="panCardUrl">PAN Card</option>
                    <option value="aadhaarUrl">Aadhaar Card</option>
                    <option value="salarySlipUrl">Salary Slips</option>
                    <option value="itrUrl">Income Tax Return (ITR)</option>
                    <option value="form16Url">Form 16</option>
                    <option value="bankStatementUrl">Bank Statement</option>
                    <option value="propertyDocUrl">Property Papers / Documents</option>
                    <option value="idProofUrl">ID Proof</option>
                    <option value="addressProofUrl">Address Proof</option>
                    <option value="photoUrl">Photograph</option>
                    <option value="otherDocUrl">Other Document (Primary)</option>
                    <option value="customDocument">Custom Named Document</option>
                    {customFolders.length > 0 && (
                      <optgroup label="📁 Custom Folders">
                        {customFolders.map(f => (
                          <option key={f._id} value={`folder_${f._id}`}>📁 {f.folderName || f.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Document Name / Title {currentFolder ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}</span>
                  {currentFolder && <span className="text-[10px] text-amber-600 font-bold">Mention Name for identification</span>}
                </label>
                <input 
                  type="text" 
                  placeholder={currentFolder ? "e.g. 2nd Property Registry, Khatauni, Map, Possession Letter" : "e.g. Property Registry, ICICI Bank Statement, Form 16 Part A"}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required={!!currentFolder}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Document ka proper name likhein taaki list me saaf dikhe kya document hai.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Files (Multiple Allowed: PDF / Images / Docs) *
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
                      Clear All
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

      {/* Delete Document Confirmation Modal */}
      {showDeleteModal && docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Document?</h3>
            <p className="text-xs text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{docToDelete.name}"</span>? 
              <br/>
              It will be hidden from active list and safely backed up in <span className="font-bold text-red-600">Admin Backup Trash</span>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSoftDeleteDocument}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Move to Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Confirmation Modal */}
      {showFolderDeleteModal && folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowFolderDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Custom Folder?</h3>
            <p className="text-xs text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete folder <span className="font-bold text-gray-800">"{folderToDelete.name}"</span>? 
              <br/>
              All files contained in it will be backed up in <span className="font-bold text-red-600">Admin Backup Trash</span>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFolderDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSoftDeleteFolder}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Folder & Backup Files'}
              </button>
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
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{(documents || []).length} Files</span>
              </div>
              <p className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-200/60 font-medium">
                Jise bhi ye link share karenge wo bina login kiye saare documents dekh sakte hain, preview kar sakte hain, aur download ya save kar sakte hain.
              </p>
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

export default DocumentsTab;
