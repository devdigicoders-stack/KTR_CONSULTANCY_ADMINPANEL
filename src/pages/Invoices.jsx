import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CreditCard, Search, Filter, Plus, Copy, 
  Check, Share2, ExternalLink, Eye, Trash2, ArrowUpDown, 
  Download, Sparkles, CheckCircle2, Clock, XCircle, 
  Wallet, Building2, Banknote, HelpCircle, AlertCircle,
  RefreshCw, CheckCheck, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PaymentsNavHeader from '../components/PaymentsNavHeader';
import PaymentInvoiceModal from '../components/PaymentInvoiceModal';

const Invoices = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [manualInvoices, setManualInvoices] = useState([]);
  const [cibilInvoices, setCibilInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Tab Filters: 'all' | 'online' | 'manual' | 'cibil'
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending' | 'Failed'
  const [modeFilter, setModeFilter] = useState('ALL'); // 'ALL' | 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Online'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Quick "Mark as Paid" Modal for pending manual invoices
  const [markPaidItem, setMarkPaidItem] = useState(null);
  const [markPaidMode, setMarkPaidMode] = useState('Cash');
  const [markPaidRef, setMarkPaidRef] = useState('');
  const [markPaidDate, setMarkPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/invoices');
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
        setPaymentLinks(res.data.paymentLinks || []);
        setManualInvoices(res.data.manualInvoices || []);
        setCibilInvoices(res.data.cibilInvoices || []);
        setStats(res.data.stats || null);
      }
    } catch (error) {
      console.error('Fetch invoices error:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getFullShareUrl = (linkId) => {
    const baseUrl = window.location.origin.includes('admin')
      ? window.location.origin.replace('admin.', '').replace(':5174', ':5173')
      : window.location.origin;
    return `${baseUrl}/pay/${linkId}`;
  };

  const handleCopyLink = (linkId) => {
    const url = getFullShareUrl(linkId);
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    toast.success('Payment link copied!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleWhatsAppShare = (item) => {
    const isPaid = item.status === 'Paid';
    const isManual = item.isManual === true || item.paymentType === 'manual_invoice';
    const linkUrl = item.linkId && !isManual ? `\n🔗 Pay / View Online: ${getFullShareUrl(item.linkId)}` : '';

    const text = `📁 *KTR Consultants – Invoice / Receipt Update*\n\n` +
      `Invoice No: *${item.invoiceNumber}*\n` +
      `Client: ${item.clientName}\n` +
      `Service: ${item.serviceName}\n` +
      `Amount: ₹${item.totalAmount?.toLocaleString('en-IN')}\n` +
      `Payment Mode: ${item.paymentMode || (isManual ? 'Manual Collection' : 'Online Gateway')}\n` +
      `Status: *${isPaid ? (isManual ? 'PAID (Manual Receipt)' : 'PAID & VERIFIED') : 'PAYMENT PENDING'}*\n` +
      `${item.referenceNumber ? `Ref / UTR: ${item.referenceNumber}\n` : ''}` +
      `${linkUrl}\n` +
      `Thank you for choosing KTR Consultants.`;

    window.open(`https://wa.me/91${item.clientMobile}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This will permanently remove the invoice.')) return;
    try {
      const res = await api.delete(`/payments/${id}`);
      if (res.data.success) {
        toast.success('Record deleted successfully');
        fetchInvoices();
      }
    } catch (error) {
      toast.error('Failed to delete payment record');
    }
  };

  // Submit Quick Mark as Paid
  const handleConfirmMarkPaid = async (e) => {
    e.preventDefault();
    if (!markPaidItem) return;

    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/payments/${markPaidItem._id}/status`, {
        status: 'Paid',
        paymentMode: markPaidMode,
        referenceNumber: markPaidRef || `MANUAL_${markPaidMode.toUpperCase()}`,
        paidAt: markPaidDate ? new Date(markPaidDate) : new Date(),
      });

      if (res.data.success) {
        toast.success('Invoice marked as Paid successfully!');
        setMarkPaidItem(null);
        setMarkPaidRef('');
        fetchInvoices();
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Primary Tab Filtering
  let displayData = invoices;
  if (activeTab === 'online') {
    displayData = paymentLinks;
  } else if (activeTab === 'manual') {
    displayData = manualInvoices;
  }

  // Secondary Filters (Status, Mode, Search)
  const filteredData = displayData.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    
    let matchesMode = true;
    if (modeFilter !== 'ALL') {
      const itemMode = (item.paymentMode || '').toLowerCase();
      matchesMode = itemMode.includes(modeFilter.toLowerCase());
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (item.clientName && item.clientName.toLowerCase().includes(q)) ||
      (item.clientMobile && item.clientMobile.includes(q)) ||
      (item.serviceName && item.serviceName.toLowerCase().includes(q)) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q)) ||
      (item.paymentId && item.paymentId.toLowerCase().includes(q)) ||
      (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q))
    );

    return matchesStatus && matchesMode && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 relative h-full pb-10">
      
      {/* Top Header */}
      <PaymentsNavHeader activeTab="invoices" />

      {/* KPI Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Card 1: Total Invoiced */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Invoiced</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black font-mono text-[#081326]">
                ₹{stats.totalInvoiced.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{invoices.length} total invoices issued</p>
            </div>
          </div>

          {/* Card 2: Total Collected */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black font-mono text-emerald-700">
                ₹{stats.totalCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-600/80 mt-0.5">Verified & received payments</p>
            </div>
          </div>

          {/* Card 3: Online Gateway */}
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Online Gateway</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black font-mono text-blue-700">
                ₹{stats.onlineCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-blue-600/80 mt-0.5">{stats.onlineCount} links & CIBIL reports</p>
            </div>
          </div>

          {/* Card 4: Manual Collections */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Manual Collections</span>
              <Wallet className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black font-mono text-amber-700">
                ₹{stats.manualCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-amber-600/80 mt-0.5">{stats.manualCount} Cash, UPI & Bank invoices</p>
            </div>
          </div>

          {/* Card 5: Pending Due */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Dues</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black font-mono text-rose-700">
                ₹{stats.totalPending.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-rose-600/80 mt-0.5">{stats.pendingCount} collections pending</p>
            </div>
          </div>

        </div>
      )}

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col gap-4">
        
        {/* Primary Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Records ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'online' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Online Links ({paymentLinks.length})
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💼 Manual Invoices ({manualInvoices.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/payments/generate-invoice')}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#081326] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Record Manual Payment</span>
            </button>
            <button
              onClick={() => navigate('/payments/create')}
              className="px-3.5 py-2 bg-[#081326] hover:bg-[#11203d] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Create Payment Link</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar: Status, Mode & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              {['ALL', 'Paid', 'Pending', 'Failed'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === st ? 'bg-[#081326] text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Status' : st}
                </button>
              ))}
            </div>

            {/* Mode Filter Dropdown */}
            <div className="relative">
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#f59e0b] cursor-pointer"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="Online">Online Gateway (Razorpay)</option>
                <option value="Cash">Cash Receipt</option>
                <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                <option value="Bank">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Cheque / Demand Draft</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice no, client, mobile, UTR..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white"
            />
          </div>

        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <div className="inline-block w-6 h-6 border-2 border-[#081326] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading invoices & payments...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No matching invoices or payment records found</p>
            <p className="mt-1">Try resetting your filters or create a new invoice / link.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Invoice No.</th>
                  <th className="py-3.5 px-4">Source & Mode</th>
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status & Verification</th>
                  <th className="py-3.5 px-4">Transaction / Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                {filteredData.map(item => {
                  const isPaid = item.status === 'Paid';
                  const isManual = item.isManual === true || item.paymentType === 'manual_invoice';
                  const isCibil = item.type === 'CIBIL';
                  const dateStr = new Date(item.paidAt || item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      
                      {/* Invoice No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#081326] bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {item.invoiceNumber}
                        </span>
                      </td>

                      {/* Source & Mode (Distinguish Online from Manual) */}
                      <td className="py-3.5 px-4">
                        {isManual ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                              💼 Manual Collection
                            </span>
                            <span className="text-[10.5px] font-semibold text-gray-600">
                              {item.paymentMode || 'Cash'}
                            </span>
                          </div>
                        ) : isCibil ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit">
                              📊 CIBIL Report
                            </span>
                            <span className="text-[10.5px] font-semibold text-gray-500">
                              Online Gateway
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                              🌐 Payment Link
                            </span>
                            <span className="text-[10.5px] font-semibold text-gray-500">
                              Razorpay Checkout
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Client Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{item.clientName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">+91 {item.clientMobile}</p>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 line-clamp-1">{item.serviceName}</span>
                        {item.taxRate !== undefined && Number(item.taxRate) === 0 ? (
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded border border-gray-200">
                            0% No Tax
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            {item.taxRate || 18}% GST
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-gray-900">
                        ₹{item.totalAmount?.toLocaleString('en-IN')}
                      </td>

                      {/* Status & Verification Distinction */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          item.isGatewayVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified (Gateway)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid (Manual Receipt)</span>
                            </span>
                          )
                        ) : item.status === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Payment</span>
                          </span>
                        )}
                      </td>

                      {/* Transaction / Reference ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                        {item.referenceNumber || (item.paymentId !== 'N/A' ? item.paymentId : '—')}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Quick "Mark as Paid" button if manual & pending */}
                          {isManual && item.status === 'Pending' && (
                            <button
                              onClick={() => {
                                setMarkPaidItem(item);
                                setMarkPaidMode(item.paymentMode || 'Cash');
                              }}
                              title="Record received payment"
                              className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mark Paid</span>
                            </button>
                          )}

                          {/* View Invoice Preview */}
                          <button
                            onClick={() => handleViewInvoice(item)}
                            title="View Invoice Preview"
                            className="px-2 py-1.5 bg-[#081326] text-white hover:bg-black text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#f59e0b]" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {/* Download Invoice PDF */}
                          <button
                            onClick={() => handleDownloadInvoice(item)}
                            title="Download Invoice PDF"
                            className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          {/* WhatsApp Share */}
                          <button
                            onClick={() => handleWhatsAppShare(item)}
                            title="Share on WhatsApp"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Link (if online PaymentLink) */}
                          {item.linkId && !isManual && (
                            <button
                              onClick={() => handleCopyLink(item.linkId)}
                              title="Copy Shareable Payment Link"
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all cursor-pointer"
                            >
                              {copiedId === item.linkId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete Link (if PaymentLink or ManualInvoice) */}
                          {item.linkId && (
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              title="Delete Record"
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal for View / Download */}
      <PaymentInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceData={selectedInvoice}
      />

      {/* Quick Mark as Paid Modal for Pending Manual Invoices */}
      {markPaidItem && (
        <div className="fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[#081326] mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Record Payment as Received</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Invoice No: <span className="font-mono font-bold text-gray-800">{markPaidItem.invoiceNumber}</span> • Client: {markPaidItem.clientName}
            </p>

            <form onSubmit={handleConfirmMarkPaid} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Mode</label>
                <select
                  value={markPaidMode}
                  onChange={(e) => setMarkPaidMode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-[#f59e0b]"
                >
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI (GPay/PhonePe/Paytm)</option>
                  <option value="Bank Transfer">🏦 Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque">📜 Cheque</option>
                  <option value="Other">⚙️ Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Date</label>
                <input
                  type="date"
                  value={markPaidDate}
                  onChange={(e) => setMarkPaidDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Reference / UTR / Cheque Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Cash voucher"
                  value={markPaidRef}
                  onChange={(e) => setMarkPaidRef(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMarkPaidItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Confirm Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
