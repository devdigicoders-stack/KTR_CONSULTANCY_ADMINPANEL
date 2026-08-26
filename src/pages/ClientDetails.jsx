import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Search, Bell, MoreHorizontal, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import OverviewTab from '../components/client/OverviewTab';
import DocumentsTab from '../components/client/DocumentsTab';
import RecordsTab from '../components/client/RecordsTab';
import CibilScoreTab from '../components/client/CibilScoreTab';
import CreditInfoTab from '../components/client/CreditInfoTab';
import ClientDashboardTab from '../components/client/ClientDashboardTab';

const ClientDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        if (res.data.success) {
          setClient(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const tabs = user?.role === 'admin' ? [
    'Overview',
    'Documents',
    'Records',
    'CIVIL Score',
    'Credit Information',
    'Client Dashboard'
  ] : [
    'Overview',
    'Documents'
  ];

  const getHeaderInfo = () => {
    switch(activeTab) {
      case 'Overview': return { title: 'View Client-Wise Information', breadcrumb: 'Client Details' };
      case 'Documents': return { title: 'View Uploaded Documents/Data', breadcrumb: 'Documents & Data' };
      case 'Records': return { title: 'Track Client Records', breadcrumb: 'Track Records' };
      case 'CIVIL Score': return { title: 'Check & Display CIVIL Score', breadcrumb: 'CIVIL Score' };
      case 'Credit Information': return { title: 'View Basic Credit Information', breadcrumb: 'Credit Information' };
      case 'Client Dashboard': return { title: 'Client Data Dashboard', breadcrumb: 'Client Dashboard' };
      default: return { title: 'Client Details', breadcrumb: 'Client Details' };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleDeleteClient = async () => {
    try {
      const res = await api.delete(`/clients/${id}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        navigate('/clients');
      }
    } catch (err) {
      alert('Error deleting client');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading client details...</div>;
  }

  if (!client) {
    return <div className="p-8 text-center text-red-500 font-medium">Client not found.</div>;
  }

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto">
      
      {/* Top Header Row with Breadcrumbs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-[#081326] flex items-center gap-2">
            {headerInfo.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-1">
            <Link to="/" className="hover:text-[#f59e0b] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/clients" className="hover:text-[#f59e0b] transition-colors">Clients</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#081326]">{headerInfo.breadcrumb}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 mr-2">
              <button 
                onClick={() => navigate(`/clients/edit/${id}`)}
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors shadow-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4 stroke-[2.5]" /> Edit Client
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" /> Delete
              </button>
            </div>
          )}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search anything..." className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-medium outline-none bg-gray-50/50 focus:bg-white transition-colors" />
          </div>
          <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-sm uppercase">
              {getInitials(user?.name) || 'AU'}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold text-[#081326] leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-[9px] font-medium text-gray-500 capitalize">{user?.role || 'Staff'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Client Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#081326] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(client.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#081326]">{client.fullName}</h2>
                <span className={`${client.status === 'Approved' ? 'text-green-600 bg-green-50' : client.status === 'Rejected' ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'} px-2 py-1 rounded-md font-bold flex items-center gap-1.5 text-[10px]`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Approved' ? 'bg-green-500' : client.status === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'}`}></span>{client.status === 'Approved' ? 'Active' : client.status === 'Rejected' ? 'Inactive' : 'Pending'}
                </span>
              </div>
              <div className="flex gap-8 text-[11px] font-medium text-gray-500">
                <div>
                  <p className="text-gray-400 mb-0.5">Client ID</p>
                  <p className="text-[#081326] font-bold">{id || 'CLT-00125'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Added On</p>
                  <p className="text-[#081326] font-bold">{new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Added By</p>
                  <p className="text-[#081326] font-bold">{client.user?.name || 'Website / Self'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="px-6 md:px-8 border-t border-gray-50 flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-[#f59e0b]' 
                  : 'text-gray-400 hover:text-[#081326]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f59e0b] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Content Area */}
      <div className="flex-1">
        {activeTab === 'Overview' && <OverviewTab client={client} />}
        {activeTab === 'Documents' && <DocumentsTab client={client} />}
        {activeTab === 'Records' && <RecordsTab client={client} />}
        {activeTab === 'CIVIL Score' && <CibilScoreTab client={client} />}
        {activeTab === 'Credit Information' && <CreditInfoTab client={client} />}
        {activeTab === 'Client Dashboard' && <ClientDashboardTab client={client} />}
      </div>

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
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClient}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-red-200"
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

export default ClientDetails;
