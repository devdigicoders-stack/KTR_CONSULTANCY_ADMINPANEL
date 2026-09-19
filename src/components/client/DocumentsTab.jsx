import React, { useState } from 'react';
import { Eye, Search, FileText, Upload, Trash2, ShieldAlert, X, Download, FolderPlus, Folder, ArrowLeft } from 'lucide-react';
import { getAssetUrl } from '../../utils/url';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DocumentsTab = ({ client, onRefresh }) => {
  const { role } = useAuth();
  const documents = client?.documentsList || [];
  const deletedDocuments = client?.deletedDocuments || [];
  const customFolders = client?.customFolders || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFolderDeleteModal, setShowFolderDeleteModal] = useState(false);
  
  const [currentFolder, setCurrentFolder] = useState(null); // null means root view

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
  const [selectedFile, setSelectedFile] = useState(null);

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
        formData.append('docName', docName || '');
      } else {
        formData.append('docType', docType);
        formData.append('docName', docName || '');
      }

      const res = await api.post(`/clients/${client._id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setDocName('');
        setSelectedFiles([]);
        if (onRefresh) onRefresh();
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
  let activeDocsToDisplay = [];
  if (currentFolder) {
    const updatedCurrentFolder = customFolders.find(f => f._id === currentFolder._id) || currentFolder;
    activeDocsToDisplay = (updatedCurrentFolder.documents || []).map(d => ({
      id: d._id,
      name: d.name,
      category: updatedCurrentFolder.name,
      file: d.fileUrl,
      uploaded: d.uploadedAt,
      status: 'Verified',
      isFolderDoc: true,
      folderId: updatedCurrentFolder._id
    }));
  } else {
    activeDocsToDisplay = documents;
  }

  const filteredDocs = activeDocsToDisplay.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.category && d.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFolders = customFolders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full space-y-6 p-1">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-gray-50 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 items-center flex-wrap">
          <button 
            onClick={() => { setShowDeletedBackup(false); setCurrentFolder(null); }}
            className={`text-xs font-bold pb-2 px-1 border-b-2 transition-colors ${!showDeletedBackup && !currentFolder ? 'text-[#f59e0b] border-[#f59e0b]' : 'text-gray-500 border-transparent hover:text-[#081326]'}`}
          >
            All Files & Folders
          </button>

          {role === 'admin' && (
            <button 
              onClick={() => setShowDeletedBackup(true)}
              className={`text-xs font-bold pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${showDeletedBackup ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600'}`}
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
              className="w-48 pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500" 
            />
          </div>

          {!showDeletedBackup && !currentFolder && (
            <button 
              onClick={() => setShowCreateFolderModal(true)}
              className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-600" /> New Folder
            </button>
          )}

          {!showDeletedBackup && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-[#081326] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#11203d] transition-colors flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Add Document {currentFolder ? `in ${currentFolder.name}` : ''}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Breadcrumb inside active documents */}
      {!showDeletedBackup && (
        <div className="px-6 py-2 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-600">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={`hover:text-blue-600 ${!currentFolder ? 'text-gray-900 font-bold' : ''}`}
          >
            All Documents
          </button>
          {currentFolder && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {currentFolder.name}
              </span>
              <button 
                onClick={() => setCurrentFolder(null)}
                className="ml-auto text-[11px] font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Root
              </button>
            </>
          )}
        </div>
      )}

      {!showDeletedBackup ? (
        <div className="flex-1 space-y-6">
          {/* Custom Folders Section (Root view only) */}
          {!currentFolder && customFolders.length > 0 && (
            <div className="px-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Custom Folders</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map((folder) => (
                  <div 
                    key={folder._id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-md transition-all group flex items-start justify-between cursor-pointer"
                    onClick={() => setCurrentFolder(folder)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                        <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="truncate">
                        <h5 className="font-bold text-[#081326] text-xs truncate group-hover:text-amber-600 transition-colors">
                          {folder.name}
                        </h5>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {folder.documents ? folder.documents.length : 0} files
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder);
                        setShowFolderDeleteModal(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Documents Table */}
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
                {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
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
                          onClick={() => { setDocToDelete(doc); setShowDeleteModal(true); }}
                          className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-1 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors shadow-xs"
                          title="Delete Document (Moves to Backup)"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                      {currentFolder 
                        ? `No documents found inside folder "${currentFolder.name}".`
                        : 'No active standalone documents found for this client.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                {currentFolder ? `Upload to "${currentFolder.name}"` : 'Add New Document'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Name / Title (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Property Registry, ICICI Bank Statement, Form 16 Part A"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
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
    </div>
  );
};

export default DocumentsTab;
