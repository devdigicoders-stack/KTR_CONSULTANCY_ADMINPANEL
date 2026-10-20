import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Archive, 
  RotateCcw, 
  Search, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  FileCheck2, 
  FolderOpen, 
  ShieldCheck, 
  History, 
  Clock, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  RefreshCcw, 
  Briefcase, 
  IndianRupee,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getAssetUrl } from '../utils/url';
import { FormattedNotes } from '../components/common/RichTextEditor';

const formatCurrency = (amt) => {
  if (!amt && amt !== 0) return '₹0';
  return '₹' + Number(amt).toLocaleString('en-IN');
};

const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'N/A';
  }
};

const DeletedClientsBackup = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'deleted' | 'restored'
  const [summaryStats, setSummaryStats] = useState({ totalCount: 0, deletedCount: 0, restoredCount: 0 });

  // Detail Drawer Modal State
  const [selectedBackupId, setSelectedBackupId] = useState(null);
  const [selectedBackupDetail, setSelectedBackupDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('profile'); // 'profile' | 'documents' | 'submissions' | 'pendency' | 'history'

  // Restore Modal State
  const [backupToRestore, setBackupToRestore] = useState(null);
  const [restorationNotes, setRestorationNotes] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch Backups List
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/clients/super-admin/deleted-backups', { params });
      if (res.data.success) {
        setBackups(res.data.data || []);
        setSummaryStats({
          totalCount: res.data.totalCount || 0,
          deletedCount: res.data.deletedCount || 0,
          restoredCount: res.data.restoredCount || 0
        });
      }
    } catch (error) {
      console.error('Fetch Backups Error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Super Admin access only.');
        navigate('/clients');
      } else {
        toast.error('Failed to load deleted client backups');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [statusFilter]);

  // Open Backup Details
  const handleOpenDetail = async (backupId) => {
    setSelectedBackupId(backupId);
    setActiveDetailTab('profile');
    try {
      setLoadingDetail(true);
      const res = await api.get(`/clients/super-admin/deleted-backups/${backupId}`);
      if (res.data.success) {
        setSelectedBackupDetail(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching backup detail:', error);
      toast.error('Could not load complete backup data');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedBackupId(null);
    setSelectedBackupDetail(null);
  };

  // Handle Restore
  const handleRestoreClient = async () => {
    if (!backupToRestore) return;
    try {
      setIsRestoring(true);
      const res = await api.post(`/clients/super-admin/restore/${backupToRestore._id}`, {
        notes: restorationNotes.trim() || 'Restored by Super Admin'
      });
      if (res.data.success) {
        toast.success(res.data.message || `Client "${backupToRestore.fullName}" restored successfully!`);
        setBackupToRestore(null);
        setRestorationNotes('');
        // Refresh detail view if open
        if (selectedBackupId === backupToRestore._id) {
          handleOpenDetail(backupToRestore._id);
        }
        fetchBackups();
      }
    } catch (error) {
      console.error('Restore Error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore client');
    } finally {
      setIsRestoring(false);
    }
  };

  // Filtered in-memory search if needed
  const filteredBackups = backups.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.fullName && b.fullName.toLowerCase().includes(q)) ||
      (b.mobile && b.mobile.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.panNumber && b.panNumber.toLowerCase().includes(q)) ||
      (b.deletedByName && b.deletedByName.toLowerCase().includes(q)) ||
      (b.deletionReason && b.deletionReason.toLowerCase().includes(q)) ||
      (b.caseType && b.caseType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation Breadcrumb & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/clients')}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Back to Active Clients"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Super Admin Access Only
              </span>
              <span className="text-[11px] font-bold text-gray-400">•</span>
              <span className="text-[11px] font-bold text-gray-500">Zero Data Loss Backup</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#081326] flex items-center gap-2.5 mt-0.5">
              <Archive className="w-6 h-6 text-red-600 stroke-[2.5]" />
              Deleted Clients Backup & Recovery
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/clients"
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-gray-500" />
            <span>Active Clients</span>
          </Link>
          <button
            onClick={fetchBackups}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            title="Refresh Backups"
          >
            <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Security Notice Card */}
      <div className="bg-gradient-to-r from-red-950 via-[#081326] to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-red-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-red-400 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Immutable Client Backup Archive
            </h3>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed max-w-3xl">
              When staff deletes a client or document from the portal, no data is ever erased. All applicant/co-applicant details, uploaded files, form submissions, case notes, pendency records, and full change history are permanently preserved here and can be restored back to the active client list at any time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-xs font-bold text-red-200 bg-red-900/50 px-3 py-1.5 rounded-xl border border-red-700/40 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-300" /> Super Admin Role Protected
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Backed Up</span>
            <div className="text-2xl font-black text-[#081326] mt-1">{summaryStats.totalCount}</div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Client profiles preserved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#081326]">
            <Archive className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">Currently Archived</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{summaryStats.deletedCount}</div>
            <p className="text-xs text-amber-600/80 font-medium mt-0.5">Hidden from staff portal</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Restored to Active</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{summaryStats.restoredCount}</div>
            <p className="text-xs text-emerald-600/80 font-medium mt-0.5">Visible to staff again</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Main Content Card: Tabs, Search & Backup List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar: Filter Tabs & Search */}
        <div className="border-b border-gray-100 p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50/50">
          {/* Status Tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {[
              { id: 'all', label: 'All Backups', count: summaryStats.totalCount },
              { id: 'deleted', label: 'Archived / Deleted', count: summaryStats.deletedCount },
              { id: 'restored', label: 'Restored Cases', count: summaryStats.restoredCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#081326] shadow-xs border border-gray-200'
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  statusFilter === tab.id ? 'bg-[#081326] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, mobile, PAN, deleter..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-red-500 shadow-xs placeholder-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Backups Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                <th className="px-5 py-4 whitespace-nowrap">Client Details</th>
                <th className="px-5 py-4 whitespace-nowrap">Loan & Case</th>
                <th className="px-5 py-4 whitespace-nowrap">Deleted By / Date</th>
                <th className="px-5 py-4 whitespace-nowrap">Deletion Reason</th>
                <th className="px-5 py-4 whitespace-nowrap text-center">Preserved Data</th>
                <th className="px-5 py-4 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-xs font-bold text-gray-500">
                    Loading backup archives...
                  </td>
                </tr>
              ) : filteredBackups.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-xs font-bold text-gray-500">
                    {searchQuery ? 'No deleted clients found matching your search.' : 'No deleted client records found in archive.'}
                  </td>
                </tr>
              ) : (
                filteredBackups.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    {/* 1. Client Details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-black text-[#081326] text-sm">{item.fullName}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {item.mobile || 'No Mobile'}
                          </span>
                          {item.panNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-gray-600">{item.panNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Loan & Case */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-emerald-700">{formatCurrency(item.loanAmount)}</span>
                        <span className="text-[11px] text-gray-500 font-medium">{item.caseType || 'Loan Case'}</span>
                      </div>
                    </td>

                    {/* 3. Deleted By & Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#081326]">{item.deletedByName || 'Staff'}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                            item.deletedByRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.deletedByRole || 'Staff'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.deletedAt)}
                        </span>
                      </div>
                    </td>

                    {/* 4. Deletion Reason */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-gray-700 italic truncate" title={item.deletionReason}>
                        "{item.deletionReason || 'Deleted via Staff Portal'}"
                      </p>
                    </td>

                    {/* 5. Preserved Data Counters */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-xl">
                        <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1" title="Documents preserved">
                          <FileText className="w-3 h-3" /> {item.documentCount || 0} Docs
                        </span>
                        <span>•</span>
                        <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1" title="Form submissions preserved">
                          <FileCheck2 className="w-3 h-3" /> {item.submissionCount || 0} Submissions
                        </span>
                      </div>
                    </td>

                    {/* 6. Restoration Status */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {item.restored ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-black">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Restored
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(item.restoredAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-black">
                          <Archive className="w-3 h-3 text-amber-600" /> Archived
                        </span>
                      )}
                    </td>

                    {/* 7. Action Buttons */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item._id)}
                          className="px-2.5 py-1.5 bg-[#081326] text-white hover:bg-[#11203d] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          title="View Complete Backup Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Record</span>
                        </button>

                        {!item.restored ? (
                          <button
                            onClick={() => { setBackupToRestore(item); setRestorationNotes(''); }}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            title="Restore Client to Active List"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/clients/${item.originalClientId}`)}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="View in Active Clients"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Active Case</span>
                          </button>
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

      {/* Comprehensive Backup Inspection Drawer Modal */}
      {selectedBackupId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={closeDetail}></div>
          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <Archive className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#081326] flex items-center gap-2">
                    Super Admin Complete Backup Archive
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold">
                    Original Client ID: <span className="font-mono text-gray-700">{selectedBackupDetail?.originalClientId}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedBackupDetail && !selectedBackupDetail.restored && (
                  <button
                    onClick={() => { setBackupToRestore(selectedBackupDetail); setRestorationNotes(''); }}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Client</span>
                  </button>
                )}
                <button
                  onClick={closeDetail}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {loadingDetail || !selectedBackupDetail ? (
              <div className="flex-1 flex items-center justify-center p-12 text-xs font-bold text-gray-500">
                Loading complete archived snapshot...
              </div>
            ) : (
              <>
                {/* Deletion & Restoration Status Banner */}
                <div className="px-6 py-3 bg-red-50/60 border-b border-red-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-900">
                      Deleted by: <span className="font-black">{selectedBackupDetail.deletedByName}</span> ({selectedBackupDetail.deletedByRole || 'staff'})
                    </span>
                    <span className="text-red-300">•</span>
                    <span className="text-red-700">
                      {formatDate(selectedBackupDetail.deletedAt)}
                    </span>
                  </div>
                  <div className="text-red-800 italic">
                    Reason: "{selectedBackupDetail.deletionReason || 'N/A'}"
                  </div>
                </div>

                {selectedBackupDetail.restored && (
                  <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Restored to Active List by {selectedBackupDetail.restoredByName} on {formatDate(selectedBackupDetail.restoredAt)}</span>
                    </div>
                    <Link
                      to={`/clients/${selectedBackupDetail.originalClientId}`}
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      Open Active Client Page <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Navigation Tabs */}
                <div className="px-6 border-b border-gray-100 flex gap-2 bg-white overflow-x-auto scrollbar-hide pt-2">
                  {[
                    { id: 'profile', label: 'Client Profile & Applicants', icon: User },
                    { id: 'documents', label: 'Archived Documents', icon: FileText },
                    { id: 'submissions', label: 'Form Submissions', icon: FileCheck2 },
                    { id: 'pendency', label: 'Pendencies', icon: Clock },
                    { id: 'history', label: 'Change History & Audit', icon: History }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                          activeDetailTab === tab.id
                            ? 'text-[#081326] border-[#081326] bg-gray-50/80 rounded-t-lg'
                            : 'text-gray-400 border-transparent hover:text-[#081326]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Panels */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* TAB 1: Profile & Co-Applicants */}
                  {activeDetailTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Primary Applicant Card */}
                      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                          Primary Applicant Snapshot
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 font-bold block">Full Name</span>
                            <span className="font-black text-[#081326] text-sm">
                              {selectedBackupDetail.clientSnapshot?.fullName || selectedBackupDetail.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Mobile Number</span>
                            <span className="font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.mobile || selectedBackupDetail.mobile || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Email Address</span>
                            <span className="font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.email || selectedBackupDetail.email || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">PAN Number</span>
                            <span className="font-mono font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.panNumber || selectedBackupDetail.panNumber || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Aadhaar Number</span>
                            <span className="font-mono font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.aadhaarNumber || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Date of Birth</span>
                            <span className="font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.dob ? formatDate(selectedBackupDetail.clientSnapshot.dob).split(',')[0] : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Profession / Occupation</span>
                            <span className="font-bold text-[#081326]">
                              {selectedBackupDetail.clientSnapshot?.occupation || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Loan Amount</span>
                            <span className="font-black text-emerald-700">
                              {formatCurrency(selectedBackupDetail.clientSnapshot?.loanAmount || selectedBackupDetail.loanAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold block">Case Type</span>
                            <span className="font-bold text-blue-700">
                              {selectedBackupDetail.clientSnapshot?.caseType || selectedBackupDetail.clientSnapshot?.loanType || 'General Loan'}
                            </span>
                          </div>
                          <div className="sm:col-span-2 md:col-span-3">
                            <span className="text-gray-400 font-bold block">Address</span>
                            <span className="font-medium text-gray-700">
                              {selectedBackupDetail.clientSnapshot?.addressLine1 || selectedBackupDetail.clientSnapshot?.address || 'N/A'}
                            </span>
                          </div>
                          {(selectedBackupDetail.clientSnapshot?.caseNotes || selectedBackupDetail.clientSnapshot?.notes) && (
                            <div className="sm:col-span-2 md:col-span-3 bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
                              <span className="text-amber-800 font-bold block mb-1">Case Notes</span>
                              <FormattedNotes content={selectedBackupDetail.clientSnapshot?.caseNotes || selectedBackupDetail.clientSnapshot?.notes} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Co-Applicants & Guarantors */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                          Co-Applicants & Guarantors ({selectedBackupDetail.clientSnapshot?.applicants?.length || 0})
                        </h4>
                        {selectedBackupDetail.clientSnapshot?.applicants && selectedBackupDetail.clientSnapshot.applicants.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedBackupDetail.clientSnapshot.applicants.map((app, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-black text-[#081326] text-sm">{app.fullName || `Applicant ${idx + 1}`}</span>
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    {app.relationship || 'Co-Applicant'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div>
                                    <span className="text-gray-400 font-bold block text-[10px]">Mobile</span>
                                    <span>{app.mobile || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 font-bold block text-[10px]">PAN</span>
                                    <span className="font-mono">{app.panNumber || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 font-bold block text-[10px]">Aadhaar</span>
                                    <span className="font-mono">{app.aadhaarNumber || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 font-bold block text-[10px]">Profession</span>
                                    <span>{app.occupation || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 italic">
                            No co-applicants or guarantors recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Archived Documents */}
                  {activeDetailTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>All uploaded documents and files remain safe and accessible to Super Admin. Click to view or download.</span>
                      </div>

                      {/* Extract All Snapshot Documents */}
                      {(() => {
                        const snap = selectedBackupDetail.clientSnapshot || {};
                        const allDocs = [];

                        // 1. Standard docs
                        const standardMap = [
                          { key: 'panCardUrl', label: 'PAN Card' },
                          { key: 'aadhaarUrl', label: 'Aadhaar Card' },
                          { key: 'photoUrl', label: 'Photo' },
                          { key: 'salarySlipUrl', label: 'Salary Slip' },
                          { key: 'itrUrl', label: 'ITR Document' },
                          { key: 'bankStatementUrl', label: 'Bank Statement' },
                          { key: 'form16Url', label: 'Form 16' },
                          { key: 'propertyDocUrl', label: 'Property Document' },
                          { key: 'idProofUrl', label: 'ID Proof' },
                          { key: 'addressProofUrl', label: 'Address Proof' },
                          { key: 'otherDocUrl', label: 'Other Document' }
                        ];

                        standardMap.forEach(item => {
                          if (snap[item.key]) {
                            allDocs.push({
                              name: item.label,
                              category: 'Standard Document',
                              fileUrl: snap[item.key],
                              uploadedAt: snap.createdAt
                            });
                          }
                        });

                        // 2. Custom documents
                        if (snap.customDocuments && Array.isArray(snap.customDocuments)) {
                          snap.customDocuments.forEach(cd => {
                            allDocs.push({
                              name: cd.name || cd.docType || 'Document',
                              category: cd.category || cd.docType || 'Custom Document',
                              fileUrl: cd.fileUrl,
                              notes: cd.notes,
                              password: cd.password,
                              uploadedAt: cd.uploadedAt || cd.createdAt
                            });
                          });
                        }

                        // 3. Custom folder documents
                        if (snap.customFolders && Array.isArray(snap.customFolders)) {
                          snap.customFolders.forEach(folder => {
                            if (folder.documents && Array.isArray(folder.documents)) {
                              folder.documents.forEach(doc => {
                                allDocs.push({
                                  name: doc.name || 'Folder File',
                                  category: `Folder: ${folder.folderName || folder.name || 'Folder'}`,
                                  fileUrl: doc.fileUrl,
                                  notes: doc.notes,
                                  password: doc.password,
                                  uploadedAt: doc.uploadedAt
                                });
                              });
                            }
                          });
                        }

                        // 4. Deleted documents backup
                        if (snap.deletedDocuments && Array.isArray(snap.deletedDocuments)) {
                          snap.deletedDocuments.forEach(dd => {
                            allDocs.push({
                              name: dd.docName || 'Previously Deleted Doc',
                              category: `Soft-Deleted Doc (${dd.reason || 'Staff'})`,
                              fileUrl: dd.fileUrl,
                              deletedInfo: `Deleted on ${formatDate(dd.deletedAt)} by ${dd.deletedByName}`,
                              uploadedAt: dd.deletedAt
                            });
                          });
                        }

                        // 5. Other docs array
                        if (snap.otherDocs && Array.isArray(snap.otherDocs)) {
                          snap.otherDocs.forEach((url, i) => {
                            allDocs.push({
                              name: `Other Attachment ${i + 1}`,
                              category: 'Other Docs',
                              fileUrl: url,
                              uploadedAt: snap.createdAt
                            });
                          });
                        }

                        if (allDocs.length === 0) {
                          return (
                            <div className="p-8 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                              No documents were uploaded for this client.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allDocs.map((doc, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span className="font-bold text-[#081326] text-xs truncate max-w-[200px]" title={doc.name}>
                                        {doc.name}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                                      {doc.category}
                                    </span>
                                  </div>
                                  {doc.notes && (
                                    <p className="text-[11px] text-gray-500 mt-1 italic">Note: {doc.notes}</p>
                                  )}
                                  {doc.password && (
                                    <p className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
                                      <Lock className="w-3 h-3" /> Password: <span className="font-mono font-bold">{doc.password}</span>
                                    </p>
                                  )}
                                  {doc.deletedInfo && (
                                    <p className="text-[10px] text-red-600 mt-0.5">{doc.deletedInfo}</p>
                                  )}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                  <span className="text-[10px] text-gray-400">
                                    {formatDate(doc.uploadedAt)}
                                  </span>
                                  {doc.fileUrl ? (
                                    <a
                                      href={getAssetUrl(doc.fileUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 bg-[#081326] hover:bg-[#11203d] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>View File</span>
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-gray-400">No URL</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 3: Form Submissions */}
                  {activeDetailTab === 'submissions' && (
                    <div className="space-y-4">
                      {selectedBackupDetail.clientSnapshot?.formSubmissions && selectedBackupDetail.clientSnapshot.formSubmissions.length > 0 ? (
                        selectedBackupDetail.clientSnapshot.formSubmissions.map((sub, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                <span className="font-black text-[#081326] text-sm">
                                  Form Submission #{idx + 1}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDate(sub.submittedAt)}
                              </span>
                            </div>

                            {/* Submitted Data Preview */}
                            {sub.submittedData ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                {Object.entries(sub.submittedData).map(([key, val]) => {
                                  if (typeof val === 'object' && val !== null) return null;
                                  return (
                                    <div key={key} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="font-bold text-[#081326] break-words">
                                        {String(val || 'N/A')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic">No submitted form fields available.</div>
                            )}

                            {/* Submissions Uploaded Files */}
                            {sub.uploadedFiles && sub.uploadedFiles.length > 0 && (
                              <div className="pt-2">
                                <span className="text-xs font-bold text-gray-700 block mb-2">Files Submitted:</span>
                                <div className="flex flex-wrap gap-2">
                                  {sub.uploadedFiles.map((f, fi) => (
                                    <a
                                      key={fi}
                                      href={getAssetUrl(f.fileUrl || f.url || f)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5 text-blue-600" />
                                      <span>{f.name || f.docName || `Document ${fi + 1}`}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                          No link form submissions recorded for this client.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Pendency Records */}
                  {activeDetailTab === 'pendency' && (
                    <div className="space-y-3">
                      {selectedBackupDetail.clientSnapshot?.pendencies && selectedBackupDetail.clientSnapshot.pendencies.length > 0 ? (
                        selectedBackupDetail.clientSnapshot.pendencies.map((p, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[#081326] text-xs">{p.title}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  p.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                              {p.description && (
                                <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                              )}
                              {p.addedByName && (
                                <span className="text-[10px] text-gray-400 mt-1 block">Added by: {p.addedByName}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatDate(p.createdAt)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                          No pendency records found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: Complete Change History & Audit Trail */}
                  {activeDetailTab === 'history' && (
                    <div className="space-y-4">
                      {/* Backup Audit Trail */}
                      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4">
                        <h4 className="text-xs font-black text-red-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-red-600" /> Backup System Audit Log
                        </h4>
                        <div className="space-y-2">
                          {(selectedBackupDetail.auditTrail || []).map((audit, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-red-100 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#081326]">{audit.action}</span>
                                <span className="text-[10px] text-gray-400">{formatDate(audit.timestamp)}</span>
                              </div>
                              <p className="text-gray-600">{audit.details}</p>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                Actor: {audit.actorName} ({audit.actorRole})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Client Profile Edit History */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                          Client Profile Edit History ({selectedBackupDetail.clientSnapshot?.editHistory?.length || 0})
                        </h4>
                        {selectedBackupDetail.clientSnapshot?.editHistory && selectedBackupDetail.clientSnapshot.editHistory.length > 0 ? (
                          <div className="space-y-2">
                            {selectedBackupDetail.clientSnapshot.editHistory.map((item, i) => (
                              <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl shadow-xs text-xs">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-bold text-[#081326]">{item.action || 'Edit Action'}</span>
                                  <span className="text-[10px] text-gray-400">{formatDate(item.timestamp)}</span>
                                </div>
                                <p className="text-gray-600">{item.details}</p>
                                <span className="text-[10px] text-gray-400 block mt-1">
                                  By: {item.editorName} ({item.editorRole})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 italic">
                            No edit history logs recorded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {backupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#081326]/60 backdrop-blur-sm" onClick={() => setBackupToRestore(null)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-[#081326] text-center mb-1">
              Restore Client to Active List?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4 font-medium">
              Client: <span className="font-bold text-[#081326]">{backupToRestore.fullName}</span> ({backupToRestore.mobile || 'No Mobile'})
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 mb-4 leading-relaxed">
              Restoring this client will re-enable their profile in the active staff portal with all original documents, submissions, co-applicants, and history intact.
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-gray-700">
                Restoration Note (Optional)
              </label>
              <textarea
                rows="2"
                value={restorationNotes}
                onChange={(e) => setRestorationNotes(e.target.value)}
                placeholder="e.g. Restored per client request / case reopened..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBackupToRestore(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleRestoreClient}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isRestoring ? 'Restoring...' : 'Yes, Restore Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedClientsBackup;
