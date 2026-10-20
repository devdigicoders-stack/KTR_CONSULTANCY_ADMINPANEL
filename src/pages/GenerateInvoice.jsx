import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, User, Phone, Briefcase, FileText, 
  CreditCard, Check, Share2, Download, Eye, Sparkles,
  ArrowRight, DollarSign, Tag, Building2, Search, CheckCircle2,
  Calendar, Hash, MessageSquare, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PaymentsNavHeader from '../components/PaymentsNavHeader';
import PaymentInvoiceModal from '../components/PaymentInvoiceModal';

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-all";
const labelCls = "text-xs font-semibold text-gray-700 block mb-1.5";

const popularServices = [
  'CIBIL Consultation',
  'Loan Documentation & Advisory',
  'Property Legal Valuation',
  'Accounting & ITR Filing',
  'Chain Deed Assessment'
];

const paymentModes = [
  { id: 'Cash', label: '💵 Cash Receipt' },
  { id: 'UPI', label: '📱 UPI (GPay / PhonePe / Paytm)' },
  { id: 'Bank Transfer', label: '🏦 Bank Transfer (NEFT/RTGS/IMPS)' },
  { id: 'Cheque', label: '📜 Cheque / Demand Draft' },
  { id: 'Card / POS', label: '💳 Card / POS Terminal' },
  { id: 'Other', label: '⚙️ Other Offline Mode' }
];

const GenerateInvoice = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientMode, setClientMode] = useState('new'); // 'new' | 'existing'
  const [clientSearch, setClientSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    clientRef: '',
    clientName: '',
    clientMobile: '',
    clientEmail: '',
    clientPan: '',
    clientAddress: '',
    serviceName: '',
    serviceDetails: '',
    amount: '',
    taxRate: '18',
    discount: '',
    paymentMode: 'Cash',
    paymentStatus: 'Paid',
    paymentDate: todayStr,
    referenceNumber: '',
    notes: ''
  });

  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Fetch clients for existing client picker
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const res = await api.get(role === 'admin' ? '/clients' : '/clients/my-clients');
        if (res.data.success) {
          setClients(res.data.data || []);
        }
      } catch (err) {
        console.error('Fetch clients error:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [role]);

  const handleSelectClient = (c) => {
    setFormData(prev => ({
      ...prev,
      clientRef: c._id || '',
      clientName: c.fullName || c.name || '',
      clientMobile: c.mobile || '',
      clientEmail: c.email || '',
      clientPan: c.panNumber || c.pan || '',
      clientAddress: c.addressLine1 || c.address || '',
    }));
    toast.success(`Selected client: ${c.fullName || c.name}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'discount' || name === 'amount') {
      let cleanVal = value;
      if (cleanVal.length > 1 && cleanVal.startsWith('0') && !cleanVal.startsWith('0.')) {
        cleanVal = cleanVal.replace(/^0+/, '') || '0';
      }
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Pricing calculations
  const numAmount = parseFloat(formData.amount) || 0;
  const numDiscount = parseFloat(formData.discount) || 0;
  const numTaxRate = parseFloat(formData.taxRate) || 0;

  const taxableAmount = Math.max(0, numAmount - numDiscount);
  const taxAmount = Math.round((taxableAmount * numTaxRate) / 100);
  const totalAmount = Math.max(0, Math.round(taxableAmount + taxAmount));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientMobile || !formData.serviceName || !formData.amount) {
      toast.error('Please fill in client name, mobile, service, and amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/create-manual-invoice', {
        ...formData,
        amount: numAmount,
        discount: numDiscount,
        taxRate: numTaxRate,
      });

      if (res.data.success) {
        toast.success('Manual invoice generated successfully!');
        setCreatedInvoice(res.data.data);
      }
    } catch (error) {
      console.error('Create manual invoice error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!createdInvoice) return;
    const isPaid = createdInvoice.status === 'Paid';
    const text = `📁 *KTR Consultants – Tax Invoice / Payment Receipt*\n\n` +
      `Invoice No: *${createdInvoice.invoiceNumber}*\n` +
      `Client: ${createdInvoice.clientName}\n` +
      `Service: ${createdInvoice.serviceName}\n` +
      `Amount: ₹${createdInvoice.totalAmount.toLocaleString('en-IN')}\n` +
      `Payment Mode: ${createdInvoice.paymentMode}\n` +
      `Status: *${isPaid ? 'PAID & RECORDED' : 'PAYMENT PENDING'}*\n` +
      `${createdInvoice.referenceNumber ? `Reference / UTR: ${createdInvoice.referenceNumber}\n` : ''}` +
      `\nThank you for choosing KTR Consultants. Contact us for any invoice queries.`;

    window.open(`https://wa.me/91${createdInvoice.clientMobile}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase();
    const name = (c.fullName || c.name || '').toLowerCase();
    const mob = (c.mobile || '').toLowerCase();
    const pan = (c.panNumber || c.pan || '').toLowerCase();
    return name.includes(q) || mob.includes(q) || pan.includes(q);
  }).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 relative h-full pb-10 max-w-6xl mx-auto">
      {/* Top Header */}
      <PaymentsNavHeader activeTab="generate-invoice" />

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container (2 Columns on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#081326] flex items-center gap-2">
                  <PlusSquare className="w-5 h-5 text-[#f59e0b]" />
                  <span>Generate Manual Invoice</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record payments received via Cash, UPI, Bank Transfer or Cheque, and issue verified invoices.
                </p>
              </div>

              {/* Client Picker Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold w-fit">
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    clientMode === 'new' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Walk-in / New
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    clientMode === 'existing' ? 'bg-white text-[#081326] shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Existing Client
                </button>
              </div>
            </div>

            {/* Existing Client Search Picker if active */}
            {clientMode === 'existing' && (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-amber-900 block mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#f59e0b]" /> Search & Select Registered Client
                </label>
                <input
                  type="text"
                  placeholder="Type client name, mobile or PAN..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium outline-none focus:border-[#f59e0b]"
                />

                {loadingClients ? (
                  <p className="text-xs text-gray-500 mt-2">Loading clients...</p>
                ) : (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {filteredClients.map(c => (
                      <button
                        type="button"
                        key={c._id}
                        onClick={() => handleSelectClient(c)}
                        className={`p-2 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                          formData.clientRef === c._id
                            ? 'bg-[#081326] text-white border-[#081326]'
                            : 'bg-white border-amber-100 hover:border-amber-300 text-gray-800'
                        }`}
                      >
                        <p className="font-bold truncate">{c.fullName || c.name}</p>
                        <p className={`text-[11px] font-mono ${formData.clientRef === c._id ? 'text-amber-300' : 'text-gray-500'}`}>
                          +91 {c.mobile} {c.panNumber ? `• PAN: ${c.panNumber}` : ''}
                        </p>
                      </button>
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="text-xs text-gray-500 col-span-2">No matching clients found.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Section 1: Client Information */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#f59e0b]" /> Client Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Client Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar Verma"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="clientMobile"
                    value={formData.clientMobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>PAN Number <span className="text-gray-400 font-normal">(Optional, for GST)</span></label>
                  <input
                    type="text"
                    name="clientPan"
                    value={formData.clientPan}
                    onChange={handleChange}
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    className={inputCls + " uppercase font-mono"}
                  />
                </div>

                <div>
                  <label className={labelCls}>Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Service & Particulars */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" /> Service & Description
              </h3>

              {/* Quick Select Popular Services */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {popularServices.map((srv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, serviceName: srv }))}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      formData.serviceName === srv 
                        ? 'bg-[#081326] text-white border-[#081326] font-bold'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    + {srv}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Service Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    placeholder="e.g. CIBIL Consultation / Loan Documentation"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Service Description / Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    name="serviceDetails"
                    rows={2}
                    value={formData.serviceDetails}
                    onChange={handleChange}
                    placeholder="Provide additional details or terms for the client..."
                    className={inputCls + " resize-none"}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Amount, GST & Discounts */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#f59e0b]" /> Pricing & GST Treatment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Base Amount (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    min="1"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>GST Rate (%)</label>
                  <select
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className={inputCls + " cursor-pointer"}
                  >
                    <option value="0">0% (Exempt / No Tax)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard Advisory)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Discount (₹)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        setFormData(prev => ({ ...prev, discount: '' }));
                      }
                    }}
                    placeholder="0"
                    min="0"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Payment Mode & Status (Crucial for manual payments) */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#f59e0b]" /> Payment Mode & Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Payment Mode */}
                <div>
                  <label className={labelCls}>Payment Mode <span className="text-red-500">*</span></label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className={inputCls + " cursor-pointer font-semibold"}
                  >
                    {paymentModes.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className={labelCls}>Payment Status <span className="text-red-500">*</span></label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className={inputCls + " cursor-pointer font-semibold"}
                  >
                    <option value="Paid">🟢 Paid (Payment Received in Full)</option>
                    <option value="Pending">🟡 Pending (Invoice Issued / Payment Due)</option>
                  </select>
                </div>

                {/* Payment Date (if Paid) */}
                {formData.paymentStatus === 'Paid' && (
                  <div>
                    <label className={labelCls}>Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Reference Number / UTR / Cheque */}
                <div>
                  <label className={labelCls}>
                    Reference / UTR / Cheque No. <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    placeholder="e.g. UPI Ref / UTR / Cheque No."
                    className={inputCls + " font-mono"}
                  />
                </div>

              </div>
            </div>

            {/* Section 5: Internal Notes */}
            <div className="border-t border-gray-100 pt-5">
              <label className={labelCls}>Staff Remarks / Internal Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Paid in cash at Gorakhpur branch / Handed to Accounts"
                className={inputCls}
              />
            </div>

            {/* Action Bar */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 bg-[#081326] text-white font-bold rounded-xl text-sm hover:bg-[#11203d] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Invoice...</span>
                ) : (
                  <>
                    <PlusSquare className="w-4 h-4 text-[#f59e0b]" />
                    <span>Generate & Record Invoice</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Calculation & Generated Success Card */}
        <div className="flex flex-col gap-6">
          
          {/* Live Calculation Preview Card */}
          <div className="bg-[#081326] text-white rounded-2xl shadow-xl p-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#f59e0b]/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
              <span>Invoice Calculation Preview</span>
              <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-[#f59e0b] px-2 py-0.5 rounded font-mono font-bold">
                Live
              </span>
            </h3>

            <div className="space-y-3 text-xs font-normal text-gray-300">
              <div className="flex justify-between">
                <span>Client:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">{formData.clientName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">{formData.serviceName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold text-amber-300">{formData.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  formData.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {formData.paymentStatus === 'Paid' ? 'PAID' : 'PENDING'}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-800/80 pt-2">
                <span>Base Price:</span>
                <span className="font-mono text-white">₹{numAmount.toLocaleString('en-IN')}</span>
              </div>

              {numDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{numDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {numDiscount > 0 && (
                <div className="flex justify-between text-amber-200/90 font-medium">
                  <span>Taxable Value:</span>
                  <span className="font-mono text-white">₹{taxableAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {numTaxRate > 0 ? (
                <div className="flex justify-between text-amber-400">
                  <span>GST ({numTaxRate}%):</span>
                  <span className="font-mono">+₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-400">
                  <span>GST:</span>
                  <span className="font-mono">0% (Non-Taxable)</span>
                </div>
              )}

              <div className="border-t border-gray-800 pt-3 mt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total:</span>
                <span className="text-xl font-extrabold font-mono text-[#f59e0b]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Non-Gateway Notice */}
            <div className="mt-4 pt-3 border-t border-gray-800/70 text-[10.5px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>Manual Collection: Verified directly by staff. Never tagged as online gateway capture.</span>
            </div>
          </div>

          {/* Success Generated Card */}
          {createdInvoice && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <h4 className="font-bold text-sm">Invoice Generated Successfully!</h4>
              </div>

              <div className="bg-white border border-emerald-200/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice No:</span>
                  <span className="font-mono font-bold text-[#081326]">{createdInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-bold text-gray-900">{createdInvoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode:</span>
                  <span className="font-semibold text-gray-800">{createdInvoice.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-mono font-extrabold text-[#081326]">₹{createdInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="py-2.5 px-3 bg-[#081326] hover:bg-black text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>View / Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Share</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreatedInvoice(null);
                  setFormData(prev => ({
                    ...prev,
                    clientName: '',
                    clientMobile: '',
                    serviceName: '',
                    serviceDetails: '',
                    amount: '',
                    discount: '',
                    referenceNumber: '',
                    notes: ''
                  }));
                }}
                className="w-full mt-3 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/70 rounded-xl transition-colors cursor-pointer"
              >
                + Create Another Invoice
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Invoice Preview & Download Modal */}
      {createdInvoice && (
        <PaymentInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          invoiceData={createdInvoice}
        />
      )}

    </div>
  );
};

export default GenerateInvoice;
