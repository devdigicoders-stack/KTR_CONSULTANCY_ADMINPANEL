import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserMinus, FileWarning, Search, Filter, Eye, X, RefreshCcw, Download, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AddNewClient from './AddNewClient';

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

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
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
    if (role === 'admin') {
      fetchClients();
    }
  }, [role]);

  if (role === 'user') {
    return <AddNewClient />;
  }

  const openPreview = (client) => {
    setSelectedClient(client);
    setPreviewTab('Overview');
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setTimeout(() => setSelectedClient(null), 300); // Wait for animation
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

  const tabs = ['All Clients', 'Approved Clients', 'Pending Clients', 'Rejected Clients'];

  // Filtering
  const filteredClients = clients.filter(c => {
    if (activeTab === 'Approved Clients') return c.status === 'Approved';
    if (activeTab === 'Pending Clients') return c.status === 'Pending';
    if (activeTab === 'Rejected Clients') return c.status === 'Rejected';
    return true;
  });

  const getFullUrl = (path) => {
    if (!path) return null;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      
      {/* Main Content Area */}
      <div className="flex flex-col space-y-6 transition-all duration-300 flex-1 min-w-0 w-full">
        
        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Users className="w-5 h-5 text-blue-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Total Submissions</p>
                <h4 className="text-2xl font-black text-[#081326] leading-none mb-1">{clients.length}</h4>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                  <UserCheck className="w-5 h-5 text-green-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Approved</p>
                <h4 className="text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Approved').length}</h4>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                  <UserMinus className="w-5 h-5 text-orange-500 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Pending</p>
                <h4 className="text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Pending').length}</h4>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                  <FileWarning className="w-5 h-5 text-red-600 stroke-[2]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">Rejected</p>
                <h4 className="text-2xl font-black text-[#081326] leading-none mb-1">{clients.filter(c => c.status === 'Rejected').length}</h4>
              </div>
            </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {/* Tabs & Top Actions */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 flex-wrap gap-4 bg-gray-50/30">
            <div className="flex gap-2 p-2">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-[#f59e0b] shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              <button 
                onClick={() => fetchClients()}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
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
                          <img src={getFullUrl(client.photoUrl)} className="w-8 h-8 rounded-full object-cover shadow-sm" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-[10px]">
                            {client.fullName.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        {client.fullName}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span>{client.email}</span>
                          <span className="text-gray-400 font-bold">{client.mobile}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={client.status} isDoc={false} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {client.user?.name?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <span className="font-bold text-gray-700">{client.user?.name || 'Unknown User'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <button 
                          onClick={() => openPreview(client)}
                          className="w-8 h-8 mx-auto rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 stroke-[2.5]" />
                        </button>
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
              <button 
                onClick={closePreview} 
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-lg shadow-sm transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Profile Info Header */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-5">
              {selectedClient.photoUrl ? (
                 <img src={getFullUrl(selectedClient.photoUrl)} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
              ) : (
                 <div className="w-24 h-24 rounded-full bg-[#081326] text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white">
                   {selectedClient.fullName.substring(0, 2).toUpperCase()}
                 </div>
              )}
              
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#081326]">{selectedClient.fullName}</h2>
                  <StatusBadge status={selectedClient.status} isDoc={false} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                   <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Email: {selectedClient.email}</span>
                   <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Mobile: {selectedClient.mobile}</span>
                   <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">Submitted: {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 bg-white">
               {['Overview', 'Documents'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-5 py-2.5 text-xs font-black transition-all border-b-2 ${
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
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Date of Birth</p>
                           <p className="text-xs font-black text-[#081326]">{new Date(selectedClient.dob).toLocaleDateString()}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Gender</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.gender}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">PAN Number</p>
                           <p className="text-xs font-black text-[#081326] uppercase">{selectedClient.panNumber}</p>
                         </div>
                         <div>
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Aadhaar Number</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.aadhaarNumber || 'NA'}</p>
                         </div>
                         <div className="col-span-2">
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Address Details</p>
                           <p className="text-xs font-bold text-[#081326] bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                              {selectedClient.addressLine1} {selectedClient.addressLine2},<br/>
                              {selectedClient.city}, {selectedClient.state} - {selectedClient.pincode}
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
                           <p className="text-[10px] text-gray-400 font-bold mb-1">Annual Income</p>
                           <p className="text-xs font-black text-[#081326]">{selectedClient.annualIncome ? `₹${selectedClient.annualIncome}` : 'NA'}</p>
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
                             <a href={getFullUrl(selectedClient.panCardUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.panCardUrl ? (
                             <img src={getFullUrl(selectedClient.panCardUrl)} alt="PAN Card" className="max-h-60 rounded border border-gray-200 shadow-sm" />
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
                             <a href={getFullUrl(selectedClient.idProofUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.idProofUrl ? (
                             <img src={getFullUrl(selectedClient.idProofUrl)} alt="ID Proof" className="max-h-60 rounded border border-gray-200 shadow-sm" />
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
                             <a href={getFullUrl(selectedClient.addressProofUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <Download className="w-3 h-3" /> Download
                             </a>
                          )}
                       </div>
                       <div className="p-5 flex justify-center bg-gray-50/30">
                          {selectedClient.addressProofUrl ? (
                             <img src={getFullUrl(selectedClient.addressProofUrl)} alt="Address Proof" className="max-h-60 rounded border border-gray-200 shadow-sm" />
                          ) : (
                             <p className="text-xs text-gray-400 font-bold py-10">Not uploaded</p>
                          )}
                       </div>
                    </div>

                  </div>
               )}
            </div>
            
            {/* Action Footer */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
               {selectedClient.status !== 'Approved' && (
                  <button 
                    onClick={() => updateStatus(selectedClient._id, 'Approved')} 
                    disabled={statusLoading}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl text-sm font-black hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Approve Application
                  </button>
               )}
               {selectedClient.status !== 'Rejected' && (
                  <button 
                    onClick={() => updateStatus(selectedClient._id, 'Rejected')} 
                    disabled={statusLoading}
                    className="flex-1 py-3 border-2 border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-black hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" /> Reject
                  </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
