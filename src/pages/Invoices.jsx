import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CreditCard, Search, Filter, Plus, Copy, 
  Check, Share2, ExternalLink, Eye, Trash2, ArrowUpDown, 
  Download, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PaymentInvoiceModal from '../components/PaymentInvoiceModal';

const Invoices = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState([]);
  
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'links'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/invoices');
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
        setPaymentLinks(res.data.paymentLinks || []);
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
    setAutoDownload(false);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = (inv) => {
    setSelectedInvoice(inv);
    setAutoDownload(true);
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment link?')) return;
    try {
      const res = await api.delete(`/payments/${id}`);
      if (res.data.success) {
        toast.success('Payment link deleted');
        fetchInvoices();
      }
    } catch (error) {
      toast.error('Failed to delete payment link');
    }
  };

  // Filter Logic
  const displayData = activeTab === 'links' ? paymentLinks : invoices;

  const filteredData = displayData.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.clientName && item.clientName.toLowerCase().includes(q)) ||
      (item.clientMobile && item.clientMobile.includes(q)) ||
      (item.serviceName && item.serviceName.toLowerCase().includes(q)) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q)) ||
      (item.paymentId && item.paymentId.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 relative h-full pb-10">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold text-[#f59e0b] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Financial Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#081326]">Invoices & Payment Links</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track all customer invoices, generated payment links, and payment verification records.
          </p>
        </div>

        <button
          onClick={() => navigate('/payments/create')}
          className="px-4 py-2.5 bg-[#081326] hover:bg-[#11203d] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 text-[#f59e0b]" />
          <span>Create Payment Link</span>
        </button>
      </div>

      {/* Navigation Tabs & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'links' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generated Links ({paymentLinks.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            {['ALL', 'Paid', 'Pending'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-[#081326] text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice, client, mobile..."
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
            <p className="font-semibold text-gray-700">No invoices or payment links found</p>
            <p className="mt-1">Try resetting your filter or create a new payment link.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Invoice No.</th>
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-800 font-medium">
                {filteredData.map(item => {
                  const isPaid = item.status === 'Paid';
                  const dateStr = new Date(item.paidAt || item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      
                      {/* Invoice No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#081326] bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                          {item.invoiceNumber}
                        </span>
                      </td>

                      {/* Client Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{item.clientName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">+91 {item.clientMobile}</p>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{item.serviceName}</span>
                        {item.type === 'CIBIL' && (
                          <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-100">
                            CIBIL
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-gray-900">
                        ₹{item.totalAmount?.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Payment ID */}
                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        {item.paymentId !== 'N/A' ? item.paymentId : '—'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-500">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Invoice */}
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
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>

                          {/* Copy Link (if PaymentLink and pending) */}
                          {item.linkId && (
                            <button
                              onClick={() => handleCopyLink(item.linkId)}
                              title="Copy Shareable Payment Link"
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all cursor-pointer"
                            >
                              {copiedId === item.linkId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete Link (if PaymentLink) */}
                          {item.linkId && (
                            <button
                              onClick={() => handleDeleteLink(item._id)}
                              title="Delete Link"
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Invoice Modal */}
      <PaymentInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => { setIsInvoiceModalOpen(false); setAutoDownload(false); }}
        invoiceData={selectedInvoice}
        autoDownload={autoDownload}
      />

    </div>
  );
};

export default Invoices;
