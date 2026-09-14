import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, User, Phone, Briefcase, FileText, 
  Percent, Tag, DollarSign, Copy, Check, Share2, 
  ExternalLink, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-all";
const labelCls = "text-xs font-semibold text-gray-700 block mb-1.5";

const CreatePaymentLink = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    serviceName: '',
    serviceDetails: '',
    amount: '',
    taxRate: '18',
    discount: '0'
  });

  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculations
  const numAmount = parseFloat(formData.amount) || 0;
  const numTaxRate = parseFloat(formData.taxRate) || 0;
  const numDiscount = parseFloat(formData.discount) || 0;

  const taxAmount = Math.round((numAmount * numTaxRate) / 100);
  const totalAmount = Math.max(0, Math.round(numAmount + taxAmount - numDiscount));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientMobile || !formData.serviceName || !formData.amount) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/create-link', {
        ...formData,
        amount: numAmount,
        taxRate: numTaxRate,
        discount: numDiscount
      });

      if (res.data.success) {
        toast.success('Payment link generated successfully!');
        setCreatedLink(res.data.data);
      }
    } catch (error) {
      console.error('Create payment link error:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = (linkId) => {
    // Determine target host domain (or standard website domain)
    const baseUrl = window.location.origin.includes('admin')
      ? window.location.origin.replace('admin.', '').replace(':5174', ':5173')
      : window.location.origin;
    return `${baseUrl}/pay/${linkId}`;
  };

  const handleCopyLink = () => {
    if (!createdLink) return;
    const url = getFullShareUrl(createdLink.linkId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Payment link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    if (!createdLink) return;
    const url = getFullShareUrl(createdLink.linkId);
    const text = `Hello ${createdLink.clientName},\n\nHere is your payment link for *${createdLink.serviceName}* from KTR Consultants:\nAmount Payable: ₹${createdLink.totalAmount.toLocaleString('en-IN')}\n\nClick link to pay & download invoice instantly:\n${url}\n\nThank you,\nKTR Consultants`;
    window.open(`https://wa.me/91${createdLink.clientMobile}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 relative h-full pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold text-[#f59e0b] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Payments System
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#081326]">Create Payment Link</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate custom payment links with itemized taxes & discounts to share directly with clients.
          </p>
        </div>

        <button
          onClick={() => navigate('/payments/invoices')}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <FileText className="w-4 h-4 text-[#081326]" />
          <span>View All Invoices</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Section 1: Client Information */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#f59e0b]" /> Client Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Client Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh Kumar"
                      required
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
                  <div className="relative">
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
                </div>
              </div>
            </div>

            {/* Section 2: Service Details */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" /> Service & Description
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Service Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleChange}
                    placeholder="e.g. CIBIL Consultation / Property Legal Valuation"
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Service Details / Description <span className="text-gray-400 font-normal">(Optional)</span></label>
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

            {/* Section 3: Pricing & Tax Breakdown */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#f59e0b]" /> Charges & Discounts
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
                    placeholder="0"
                    min="0"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 bg-[#081326] text-white font-bold rounded-xl text-sm hover:bg-[#11203d] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Link...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-[#f59e0b]" />
                    <span>Generate Payment Link</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Live Calculation & Generated Link Preview */}
        <div className="flex flex-col gap-6">
          
          {/* Summary Card */}
          <div className="bg-[#081326] text-white rounded-2xl shadow-xl p-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#f59e0b]/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-gray-800 pb-3">
              <span>Bill Calculation Preview</span>
              <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-[#f59e0b] px-2 py-0.5 rounded font-mono font-bold">
                Live
              </span>
            </h3>

            <div className="space-y-3 text-xs font-normal text-gray-300">
              <div className="flex justify-between">
                <span>Client:</span>
                <span className="font-semibold text-white">{formData.clientName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-semibold text-white">{formData.serviceName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-mono text-white">₹{numAmount.toLocaleString('en-IN')}</span>
              </div>

              {numTaxRate > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>GST ({numTaxRate}%):</span>
                  <span className="font-mono">+₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {numDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{numDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-gray-800 pt-3 mt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Payable:</span>
                <span className="text-xl font-extrabold font-mono text-[#f59e0b]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Success Generated Link Container */}
          {createdLink && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-2 text-emerald-800">
                <Check className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5" />
                <h4 className="font-bold text-sm">Payment Link Ready!</h4>
              </div>

              <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
                Invoice No: <span className="font-mono font-bold text-gray-900">{createdLink.invoiceNumber}</span>
              </p>

              <div className="bg-white border border-emerald-200 p-2.5 rounded-xl mb-4 flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-xs font-mono text-gray-700 truncate">
                  {getFullShareUrl(createdLink.linkId)}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-[#081326] text-white hover:bg-black text-xs font-bold rounded-lg shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#f59e0b]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Share</span>
                </button>

                <a
                  href={getFullShareUrl(createdLink.linkId)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-[#081326] hover:bg-black text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Open Page</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CreatePaymentLink;
