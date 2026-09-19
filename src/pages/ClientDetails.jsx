import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Search, Bell, Edit, Trash2, AlertTriangle, 
  History, Clock, Phone, Briefcase, IndianRupee, FileCheck, AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import OverviewTab from '../components/client/OverviewTab';
import DocumentRepositoryTab from '../components/client/DocumentRepositoryTab';
import PendencyTab from '../components/client/PendencyTab';
import DocumentsTab from '../components/client/DocumentsTab';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 0';
  return Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });
};

const ClientDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchClient();
  }, [id]);

  const tabs = [
    'Overview',
    'Documents',
    'Pendency',
    'Manage Docs',
    'Edit History'
  ];

  const getHeaderInfo = () => {
    switch(activeTab) {
      case 'Overview': return { title: 'Client Overview', breadcrumb: 'Overview' };
      case 'Documents': return { title: 'Document Repository & Quick Index', breadcrumb: 'Documents' };
      case 'Pendency': return { title: 'Continuous Pendency Tracking & History', breadcrumb: 'Pendency' };
      case 'Manage Docs': return { title: 'Manage Custom Folders & Backups', breadcrumb: 'Manage Docs' };
      case 'Edit History': return { title: 'Audit Trail & Edit History Log', breadcrumb: 'Edit History' };
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

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const activePendencies = (client.pendencies || []).filter(p => p.status !== 'Resolved');

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto pb-8">
      
      {/* Top Header Row with Breadcrumbs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black text-[#081326] flex items-center gap-2">
            {headerInfo.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-1">
            <Link to="/" className="hover:text-[#f59e0b] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/clients" className="hover:text-[#f59e0b] transition-colors">Clients</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#081326] font-bold">{headerInfo.breadcrumb}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 mr-2">
              <button 
                onClick={() => navigate(`/clients/edit/${id}`)}
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-600 hover:text-white transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Edit className="w-4 h-4 stroke-[2.5]" /> Edit Client
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" /> Delete
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-xs uppercase">
              {getInitials(user?.name) || 'AU'}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold text-[#081326] leading-tight">{user?.name || 'Staff'}</p>
              <p className="text-[9px] font-medium text-gray-500 capitalize">{user?.role || 'Staff'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Client Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#081326] flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {getInitials(client.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-[#081326]">{client.fullName}</h2>
                <span className={`${client.status === 'Approved' ? 'text-green-600 bg-green-50' : client.status === 'Rejected' ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'} px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 text-xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Approved' ? 'bg-green-500' : client.status === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                  {client.status || 'Pending'}
                </span>
                {activePendencies.length > 0 && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    {activePendencies.length} Active Pendency
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-xs font-medium text-gray-500 mt-2">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Mobile</p>
                  <p className="text-[#081326] font-bold">{client.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Profession</p>
                  <p className="text-[#081326] font-bold">{client.occupation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Loan Amount</p>
                  <p className="text-emerald-700 font-bold">{formatCurrency(client.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Case Type</p>
                  <p className="text-blue-700 font-bold">{client.caseType || client.loanType || 'General Loan'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Case Registered</p>
                  <p className="text-[#081326] font-bold">{new Date(client.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Overview | Documents | Pendency | Manage Docs | Edit History */}
        <div className="px-6 md:px-8 border-t border-gray-100 flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-black whitespace-nowrap transition-colors relative cursor-pointer ${
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
        {activeTab === 'Documents' && <DocumentRepositoryTab client={client} onRefresh={fetchClient} />}
        {activeTab === 'Pendency' && <PendencyTab client={client} onRefresh={fetchClient} />}
        {activeTab === 'Manage Docs' && <DocumentsTab client={client} onRefresh={fetchClient} />}
        {activeTab === 'Edit History' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-[#081326] uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" /> Edit Audit History Log
            </h4>
            {client.editHistory && client.editHistory.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                {client.editHistory.slice().reverse().map((item, idx) => (
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

export default ClientDetails;
