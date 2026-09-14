import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserMinus, FileWarning, Search, Filter, Eye, X, RefreshCcw, Download, CheckCircle, Trash2, Edit, AlertTriangle, History, Clock, Phone, Mail, FileText
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/url';
import DocumentsTab from '../components/client/DocumentsTab';

const StatusBadge = ({ status, isDoc }) => {
  const styles = {
    Approved: "text-green-600 bg-green-50 border border-green-100",
    Rejected: "text-red-500 bg-red-50 border border-red-100",
    Pending: "text-orange-500 bg-orange-50 border border-orange-100",
  };
  const dotColor = {
    Approved: "bg-green-500",
    Rejected: "bg-red-500",
    Pending: "bg-orange-500"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      {!isDoc && dotColor[status] && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></span>}
      {status}
    </span>
  );
};

const Clients = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Clients');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [previewTab, setPreviewTab] = useState('Overview');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Quick Edit Contact Info Modal State
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({ fullName: '', mobile: '', email: '' });
  const [updatingContact, setUpdatingContact] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get(role === 'admin' ? '/clients' : '/clients/my-clients');
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [role]);

  const openPreview = async (client) => {
    try {
      // Fetch fresh client data including editHistory and documentsList
      const res = await api.get(`/clients/${client._id}`);
      if (res.data.success) {
        setSelectedClient(res.data.data);
      } else {
        setSelectedClient(client);
      }
    } catch (err) {
      console.error('Error fetching single client detail:', err);
      setSelectedClient(client);
    }
    setPreviewTab('Overview');
    setShowPreview(true);
  };

  const refreshSelectedClient = async () => {
    if (!selectedClient?._id) return;
    try {
      const res = await api.get(`/clients/${selectedClient._id}`);
      if (res.data.success) {
        setSelectedClient(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoading(true);
      const res = await api.patch(`/clients/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setSelectedClient(res.data.data);
        fetchClients();
      }
    } catch (error) {
      alert('Error updating status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const res = await api.delete(`/clients/${clientToDelete}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        setClientToDelete(null);
        fetchClients();
      }
    } catch (error) {
      alert('Error deleting client');
    }
  };

  const handleOpenEditContact = () => {
    if (!selectedClient) return;
    setContactFormData({
      fullName: selectedClient.fullName || '',
      mobile: selectedClient.mobile || '',
      email: selectedClient.email || ''
    });
    setShowEditContactModal(true);
  };

  const handleSaveContactInfo = async (e) => {
    e.preventDefault();
    if (!selectedClient?._id) return;

    try {
      setUpdatingContact(true);
      const res = await api.put(`/clients/${selectedClient._id}`, contactFormData);
      if (res.data.success) {
        setShowEditContactModal(false);
        fetchClients();
        refreshSelectedClient();
      }
    } catch (err) {
      console.error('Error updating client info:', err);
      alert('Failed to update contact info: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingContact(false);
    }
  };

  const tabs = ['All Clients', 'Approved Clients', 'Pending Clients', 'Rejected Clients'];

  // Filtering
  const filteredClients = clients.filter(c => {
    if (activeTab === 'Approved Clients') return c.status === 'Approved';
    if (activeTab === 'Pending Clients') return c.status === 'Pending';
    if (activeTab === 'Rejected Clients') return c.status === 'Rejected';
    return true;
  });

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      
      {/* Main Content Area */}
      <div className="flex flex-col space-y-6 transition-all duration-300 flex-1 min-w-0 w-full">
        
        {/* Stat Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Submissions</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Approved</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Approved').length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                  <UserMinus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Pending</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Pending').length}</h4>
              </div>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                  <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Rejected</p>
                <h4 className="text-xl sm:text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Rejected').length}</h4>
              </div>
            </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col overflow-hidden">
          {/* Tabs & Top Actions */}
          <div className="border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-2 sm:px-4 gap-3 bg-gray-50/30">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab 
                    ? 'bg-white text-[#f59e0b] shadow-xs border border-gray-200' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button 
                onClick={() => navigate('/clients/new')}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-xs text-center cursor-pointer"
              >
                + Add Client
              </button>
              <button 
                onClick={() => fetchClients()}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">ID</th>
                  <th className="px-5 py-4 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Email & Mobile</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Submitted By</th>
                  <th className="px-5 py-4 whitespace-nowrap">Submitted On</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-xs font-bold text-gray-500">No applications found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap text-blue-600 font-bold">{client._id.substring(client._id.length - 6)}</td>
                      <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap flex items-center gap-3">
                        {client.photoUrl ? (
                          <img src={getAssetUrl(client.photoUrl)} className="w-8 h-8 rounded-full object-cover shadow-sm" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-[10px]">
                            {client.fullName.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        {client.fullName}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span>{client.email || 'N/A'}</span>
                          <span className="text-gray-400 font-bold">{client.mobile || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={client.status} isDoc={false} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {client.user?.name?.substring(0, 2).toUpperCase() || 'WS'}
                          </div>
                          <span className="font-bold text-gray-700">{client.user?.name || 'Website / Self'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => openPreview(client)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          {role === 'admin' && (
                            <>
                              <button 
                                onClick={() => navigate(`/clients/edit/${client._id}`)}
                                className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                title="Edit Profile"
                              >
                                <Edit className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button 
                                onClick={() => { setClientToDelete(client._id); setShowDeleteModal(true); }}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer Modal */}
      {showPreview && selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm transition-opacity"
            onClick={closePreview}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h2 className="text-lg font-black text-[#081326] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#f59e0b] stroke-[2.5]" /> Client Profile Review
              </h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate(`/clients/${selectedClient._id}`)}
                  className="px-4 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] transition-colors shadow-sm"
                >
                  View Full Profile
                </button>
                <button 
                  onClick={closePreview} 
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-colors"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Profile Info Header with Quick Edit Button */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-5">
              {selectedClient.photoUrl ? (
                 <img src={getAssetUrl(selectedClient.photoUrl)} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
              ) : (
                 <div className="w-24 h-24 rounded-full bg-[#081326] text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white">
                   {selectedClient.fullName ? selectedClient.fullName.substring(0, 2).toUpperCase() : 'CL'}
                 </div>
              )}
              
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#081326]">{selectedClient.fullName}</h2>
                  <StatusBadge status={selectedClient.status} isDoc={false} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-600 items-center">
                   <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100 flex items-center gap-1">
                     <Mail className="w-3 h-3 text-gray-400" /> {selectedClient.email || 'No Email'}
                   </span>
                   <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100 flex items-center gap-1">
                     <Phone className="w-3 h-3 text-gray-400" /> {selectedClient.mobile || 'No Mobile'}
                   </span>
                   <button 
                     onClick={handleOpenEditContact}
                     className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                     title="Update Mobile No. / Email ID"
                   >
                     <Edit className="w-3 h-3" /> Edit Contact
                   </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 bg-white">
               {['Overview', 'Documents', 'Manage Docs', 'Edit History'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 ${
                      previewTab === tab 
                      ? 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/5 rounded-t-lg' 
                      : 'text-gray-400 border-transparent hover:text-[#081326]'
                    }`}
                  >
                    {tab}
                  </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
               {previewTab === 'Overview' && (
                  <div className="flex flex-col gap-6">
                    {/* Personal Info */}
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Personal Information</h4>
                        <button 
                          onClick={handleOpenEditContact}
                          className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit Info
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Date of Birth</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.dob ? new Date(selectedClient.dob).toLocaleDateString() : 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Gender</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.gender || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Alternative Email</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.alternativeEmail || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">PAN Number</p>
                           <p className="text-xs font-black text-[#081326] uppercase">{selectedClient.panNumber || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Aadhaar Number</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.aadhaarNumber || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">ID Proof ({selectedClient.idProofType || 'NA'})</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.idProofNumber || 'NA'}</p>
                         </div>
                         <div className="col-span-2">
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Address Details</p>
                           <p className="text-xs font-bold text-[#081326] bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                              {selectedClient.addressLine1} {selectedClient.addressLine2 ? `, ${selectedClient.addressLine2}` : ''}<br/>
                              {selectedClient.city}, {selectedClient.state}, {selectedClient.country || 'India'} - {selectedClient.pincode}
                           </p>
                         </div>
                      </div>
                    </div>

                    {/* Business Info */}
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Business / Additional</h4>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Occupation</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.occupation || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Company Name</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.companyName || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Designation</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.designation || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Annual Income</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.annualIncome ? `₹${selectedClient.annualIncome}` : 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Source of Income</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.sourceOfIncome || 'NA'}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Business Type</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.businessType || 'NA'}</p>
                         </div>
                      </div>
                    </div>
                  </div>
               )}

               {previewTab === 'Documents' && (
                  <div className="flex flex-col gap-6">
                    {/* PAN Card */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                       <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-xs font-black text-[#081326]">PAN Card</span>
                          {selectedClient.panCardUrl && (
                             <a href={getAssetUrl(selectedClient.panCardUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.panCardUrl ? (
                             selectedClient.panCardUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={`${getAssetUrl(selectedClient.panCardUrl)}#toolbar=0`} title="PAN Card" className="w-full h-60 rounded border border-gray-200 shadow-sm" />
                             ) : (
                                <img src={getAssetUrl(selectedClient.panCardUrl)} alt="PAN Card" className="max-h-60 rounded border border-gray-200 shadow-sm" />
                             )
                          ) : (
                             <p className="text-xs text-gray-400 font-bold py-10">Not uploaded</p>
                          )}
                       </div>
                    </div>

                    {/* ID Proof */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                       <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-xs font-black text-[#081326]">ID Proof <span className="text-gray-400 font-bold">({selectedClient.idProofType})</span></span>
                          {selectedClient.idProofUrl && (
                             <a href={getAssetUrl(selectedClient.idProofUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.idProofUrl ? (
                             selectedClient.idProofUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={`${getAssetUrl(selectedClient.idProofUrl)}#toolbar=0`} title="ID Proof" className="w-full h-60 rounded border border-gray-200 shadow-sm" />
                             ) : (
                                <img src={getAssetUrl(selectedClient.idProofUrl)} alt="ID Proof" className="max-h-60 rounded border border-gray-200 shadow-sm" />
                             )
                          ) : (
                             <p className="text-xs text-gray-400 font-bold py-10">Not uploaded</p>
                          )}
                       </div>
                    </div>

                    {/* Address Proof */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                       <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <span className="text-xs font-black text-[#081326]">Address Proof</span>
                          {selectedClient.addressProofUrl && (
                             <a href={getAssetUrl(selectedClient.addressProofUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.addressProofUrl ? (
                             selectedClient.addressProofUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={`${getAssetUrl(selectedClient.addressProofUrl)}#toolbar=0`} title="Address Proof" className="w-full h-60 rounded border border-gray-200 shadow-sm" />
                             ) : (
                                <img src={getAssetUrl(selectedClient.addressProofUrl)} alt="Address Proof" className="max-h-60 rounded border border-gray-200 shadow-sm" />
                             )
                          ) : (
                             <p className="text-xs text-gray-400 font-bold py-10">Not uploaded</p>
                          )}
                       </div>
                    </div>
                  </div>
               )}

               {previewTab === 'Manage Docs' && (
                  <DocumentsTab client={selectedClient} onRefresh={refreshSelectedClient} />
               )}

               {previewTab === 'Edit History' && (
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                     <h4 className="text-xs font-black text-[#081326] uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                       <History className="w-4 h-4 text-blue-600" /> Edit Audit History Log
                     </h4>
                     {selectedClient.editHistory && selectedClient.editHistory.length > 0 ? (
                       <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                         {selectedClient.editHistory.slice().reverse().map((item, idx) => (
                           <div key={idx} className="relative group">
                             <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-bold text-[#081326]">{item.action}</span>
                                 <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                                 </span>
                               </div>
                               <p className="text-[11px] text-gray-600 font-medium mb-1">{item.details}</p>
                               <p className="text-[10px] text-gray-400 font-bold">
                                 Edited By: <span className="text-gray-700">{item.editorName || 'Staff/Admin'}</span> ({item.editorRole || 'staff'})
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-xs text-gray-400 text-center py-8 font-medium">
                         No edit history recorded yet for this client.
                       </p>
                     )}
                  </div>
               )}
            </div>
            
            {/* Action Footer (Admin Only) */}
            {role === 'admin' && (
              <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
                 {selectedClient.status !== 'Approved' && (
                    <button 
                      onClick={() => updateStatus(selectedClient._id, 'Approved')} 
                      disabled={statusLoading}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-black hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Approve Application
                    </button>
                 )}
                 {selectedClient.status !== 'Rejected' && (
                    <button 
                      onClick={() => updateStatus(selectedClient._id, 'Rejected')} 
                      disabled={statusLoading}
                      className="flex-1 py-3 border-2 border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-black hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" /> Reject
                    </button>
                 )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Contact Info Modal */}
      {showEditContactModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowEditContactModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-[#081326] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#f59e0b]" /> Edit Client Contact Info
              </h3>
              <button onClick={() => setShowEditContactModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={contactFormData.fullName}
                  onChange={(e) => setContactFormData({ ...contactFormData, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={contactFormData.mobile}
                  onChange={(e) => setContactFormData({ ...contactFormData, mobile: e.target.value })}
                  required
                  placeholder="Enter 10 digit mobile number"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  placeholder="Enter client email address"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800">
                ⚡ Any update to Mobile No. or Email ID will be logged into the client's <strong>Edit History Audit Log</strong>.
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditContactModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingContact}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] disabled:opacity-50 cursor-pointer"
                >
                  {updatingContact ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-2">Delete Client?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium leading-relaxed">
              Are you sure you want to delete this client? This action cannot be undone and all associated records will be removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClient}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-200 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
