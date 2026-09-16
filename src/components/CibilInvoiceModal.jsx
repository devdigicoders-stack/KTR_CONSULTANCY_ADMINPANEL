import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

const CibilInvoiceModal = ({ isOpen, onClose, reportData, autoDownload = false }) => {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    name = 'Customer',
    pan = 'N/A',
    mobile = 'N/A',
    bureau = 'TransUnion CIBIL',
    paymentId = 'N/A',
    invoiceNumber = reportData?.invoiceNumber || ('KTR/INV/' + new Date().getFullYear() + '/' + Math.floor(10000 + Math.random() * 90000)),
    createdAt = new Date(),
    pricing = {}
  } = reportData || {};

  const date = new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const basePrice = pricing.basePrice || (bureau.includes('CRIF') ? 450 : bureau.includes('Experian') ? 400 : bureau.includes('Equifax') ? 350 : 500);
  const discountAmount = pricing.discountAmount || 0;
  const couponCode = pricing.couponCode || null;
  const taxableValue = Math.max(0, basePrice - discountAmount);
  const totalGst = pricing.gstAmount !== undefined ? pricing.gstAmount : Math.round(taxableValue * 0.18);
  const cgst = (totalGst / 2).toFixed(2);
  const sgst = (totalGst / 2).toFixed(2);
  const totalAmount = pricing.totalAmount || pricing.totalPayable || (taxableValue + totalGst);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    const element = printRef.current;
    const invNoClean = (invoiceNumber || 'KTR_CIBIL_INVOICE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const opt = {
      margin: [6, 6, 6, 6],
      filename: `Invoice_${invNoClean}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Direct download failed, opening browser print...');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (isOpen && autoDownload && reportData) {
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDownload, reportData]);

  if (!isOpen || !reportData) return null;

  return (
    <div className="invoice-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#081326]/80 backdrop-blur-sm overflow-y-auto">
      {/* Print-only styling */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .invoice-modal-card {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            display: block !important;
          }
          #admin-cibil-invoice-print {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      <div className="invoice-modal-card relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="no-print bg-[#081326] px-5 py-3.5 flex items-center justify-between text-white border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <h3 className="text-sm font-bold tracking-wide">Tax Invoice (Official Receipt)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3 py-1.5 bg-[#f59e0b] hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer border border-gray-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="admin-cibil-invoice-print" ref={printRef} className="p-6 sm:p-8 bg-white text-gray-800 font-sans text-xs">
          
          {/* Header Brand Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-gray-900 gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-lg bg-[#081326] flex items-center justify-center text-[#f59e0b] font-serif font-black text-lg shadow-sm">
                  K
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-[#081326] tracking-tight">
                    KTR CONSULTANTS
                  </h1>
                  <p className="text-[10.5px] font-semibold text-[#f59e0b] uppercase tracking-wider">
                    Financial & Credit Advisory Services
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight mt-1">
                Website: www.ktrconsultants.in | Email: info@ktrconsultants.in
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">
                Helpline: +91 99186 99696 / +91 96969 66896
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block bg-[#081326] text-[#f59e0b] font-black text-[11px] px-3 py-1 rounded-md uppercase tracking-wider mb-2">
                ORIGINAL TAX INVOICE
              </span>
              <p className="text-[11.5px] font-bold text-gray-800">
                Invoice No: <span className="font-mono text-[#081326]">{invoiceNumber}</span>
              </p>
              <p className="text-[11px] text-gray-600">
                Date: <span className="font-semibold text-gray-800">{date}</span>
              </p>
              <p className="text-[11px] text-gray-600">
                Place of Supply: <span className="font-semibold text-gray-800">Uttar Pradesh (09)</span>
              </p>
            </div>
          </div>

          {/* Billed To & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-gray-200">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Billed To (Applicant Details)
              </h4>
              <p className="text-sm font-bold text-gray-900">{name}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                PAN Number: <span className="font-mono font-bold text-gray-900">{pan}</span>
              </p>
              <p className="text-xs text-gray-600">
                Mobile: <span className="font-semibold text-gray-800">+91 {mobile}</span>
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Payment & Verification Meta
              </h4>
              <p className="text-xs text-gray-700 flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold text-gray-900">Online (Razorpay Gateway)</span>
              </p>
              <p className="text-xs text-gray-700 flex justify-between mt-1">
                <span>Transaction ID:</span>
                <span className="font-mono font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">{paymentId}</span>
              </p>
              <p className="text-xs text-gray-700 flex justify-between mt-1">
                <span>Payment Status:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Captured & Settled
                </span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mt-5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-left rounded-l-lg">Description of Service</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">
                      Official Credit Bureau PDF Report ({bureau})
                    </div>
                    <div className="text-[10.5px] text-gray-500 mt-0.5">
                      Comprehensive credit health report with credit score and active loan accounts
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-gray-600">998311</td>
                  <td className="py-3 px-3 text-center font-semibold text-gray-700">1</td>
                  <td className="py-3 px-3 text-right text-gray-700">₹{basePrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">₹{basePrice.toFixed(2)}</td>
                </tr>

                {discountAmount > 0 && (
                  <tr className="text-green-700 bg-green-50/50">
                    <td className="py-2 px-3 font-semibold" colSpan={4}>
                      🏷️ Promo Discount ({couponCode})
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      -₹{discountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 mt-2 border-t border-gray-200 gap-4">
            <div className="max-w-xs text-[11px] text-gray-500">
              <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> 100% Tax Compliant Digital Receipt
              </p>
              <p>
                This invoice is issued electronically and does not require a physical signature under the Information Technology Act.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Value:</span>
                <span className="font-semibold text-gray-800">₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (9%):</span>
                <span className="font-semibold text-gray-800">₹{cgst}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (9%):</span>
                <span className="font-semibold text-gray-800">₹{sgst}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#081326] pt-2 border-t-2 border-gray-900">
                <span>Total Amount:</span>
                <span className="text-[#f59e0b]">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Terms */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-end text-[10.5px] text-gray-500">
            <div>
              <p className="font-bold text-gray-700">Terms & Conditions:</p>
              <p>1. Official bureau reports are fetched in real-time from authorized KYC databases.</p>
              <p>2. For any invoice queries or dispute assistance, contact info@ktrconsultants.in.</p>
              <p>3. All disputes are subject to <strong className="text-gray-700">Lucknow Jurisdiction only</strong>.</p>
            </div>
            <div className="text-center sm:text-right mt-4 sm:mt-0">
              <div className="border border-dashed border-gray-400 p-2 rounded inline-block bg-gray-50 mb-1">
                <p className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">KTR CONSULTANTS</p>
                <p className="text-[9px] text-green-700 font-bold">DIGITALLY VERIFIED</p>
              </div>
              <p className="text-[10px] font-bold text-gray-700">Authorized Signatory</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-500">
            Click Print to download as PDF or send to printer.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#f59e0b] hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download / Print Invoice
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CibilInvoiceModal;
