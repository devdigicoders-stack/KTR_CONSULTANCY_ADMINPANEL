import React, { useRef, useState } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PaymentInvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    invoiceNumber = 'KTR/INV/' + new Date().getFullYear() + '/' + Math.floor(10000 + Math.random() * 90000),
    clientName = 'Customer',
    clientMobile = 'N/A',
    clientPan = '',
    clientEmail = '',
    clientAddress = '',
    serviceName = 'Financial Service',
    serviceDetails = '',
    amount = 0,
    taxRate = 0,
    taxAmount = 0,
    discount = 0,
    totalAmount = 0,
    paymentId = 'N/A',
    referenceNumber = '',
    paymentMode = 'Online Gateway',
    isManual = false,
    paidAt = new Date(),
    status = 'Paid',
    type = 'PaymentLink'
  } = invoiceData || {};

  const isNoTax = Number(taxRate) === 0;
  const isManualPayment = isManual || (paymentMode && !['Online', 'Online Gateway'].includes(paymentMode));
  const isPaid = status === 'Paid';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const targetId = invoiceData?._id || invoiceData?.linkId || invoiceData?.paymentId || invoiceData?.invoiceNumber;
    const invNoClean = (invoiceNumber || (isNoTax ? 'KTR_RECEIPT' : 'KTR_INVOICE')).replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      if (!isNoTax && targetId) {
        try {
          const isCibil = invoiceData.type === 'CIBIL';
          const endpoint = isCibil 
            ? `/cibil-reports/invoice-pdf/${targetId}`
            : `/payments/invoice-pdf/${targetId}`;

          const response = await api.get(endpoint, {
            responseType: 'blob'
          });
          
          if (response.data && response.status === 200) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Invoice_${invNoClean}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            toast.success('Official Tax Invoice PDF downloaded!');
            setDownloading(false);
            return;
          }
        } catch (serverErr) {
          console.warn('Server PDF generation failed, falling back to client PDF:', serverErr);
        }
      }

      // Client-Side Fallback or Receipt PDF for 0% non-taxable collections
      if (printRef.current) {
        const element = printRef.current;
        const opt = {
          margin: [6, 6, 6, 6],
          filename: isNoTax ? `Receipt_${invNoClean}.pdf` : `Invoice_${invNoClean}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
        toast.success(isNoTax ? 'Payment receipt downloaded successfully!' : 'Invoice downloaded successfully!');
      } else {
        throw new Error('Invoice element missing');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to download PDF. You can also use Print.');
    } finally {
      setDownloading(false);
    }
  };

  const date = new Date(paidAt || invoiceData?.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const basePrice = parseFloat(amount) || 0;
  const numDiscount = parseFloat(discount) || 0;
  const numTaxRate = parseFloat(taxRate) || 0;
  const taxableValue = invoiceData?.taxableAmount !== undefined && invoiceData?.taxableAmount !== null && invoiceData?.taxableAmount > 0
    ? parseFloat(invoiceData.taxableAmount)
    : Math.max(0, basePrice - numDiscount);
  const gstVal = numTaxRate > 0 ? Math.round((taxableValue * numTaxRate) / 100) : 0;
  const cgst = (gstVal / 2).toFixed(2);
  const sgst = (gstVal / 2).toFixed(2);
  const finalTotal = Math.max(0, Math.round(taxableValue + gstVal));

  if (!isOpen || !invoiceData) return null;

  return (
    <div className="fixed inset-0 bg-[#081326]/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print-specific style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #admin-payment-invoice-print, #admin-payment-invoice-print * {
            visibility: visible;
          }
          #admin-payment-invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          html, body {
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
          #admin-payment-invoice-print {
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
            <h3 className="text-sm font-bold tracking-wide">
              {isNoTax ? 'Payment Voucher / Receipt (0% No Tax)' : 'Official Tax Invoice'}
            </h3>
            {isManualPayment ? (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-400/30">
                Manual ({paymentMode})
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                Online Gateway
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3 py-1.5 bg-[#f59e0b] hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Downloading...' : (isNoTax ? 'Download Receipt' : 'Download PDF')}</span>
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
        <div id="admin-payment-invoice-print" ref={printRef} className="p-6 sm:p-8 bg-white text-gray-800 font-sans text-xs">
          
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
            </div>

            <div className="sm:text-right">
              <span className="inline-block bg-[#081326] text-[#f59e0b] font-black text-[11px] px-3 py-1 rounded-md uppercase tracking-wider mb-2">
                {isNoTax ? 'PAYMENT RECEIPT (NON-TAXABLE)' : 'ORIGINAL TAX INVOICE'}
              </span>
              <p className="text-[11.5px] font-bold text-gray-800">
                {isNoTax ? 'Receipt No: ' : 'Invoice No: '}<span className="font-mono text-[#081326]">{invoiceNumber}</span>
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
                Billed To (Client Details)
              </h4>
              <p className="text-sm font-bold text-gray-900">{clientName}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Mobile: <span className="font-semibold text-gray-800">+91 {clientMobile}</span>
              </p>
              {clientPan && (
                <p className="text-xs text-gray-600">
                  PAN: <span className="font-semibold text-gray-800">{clientPan}</span>
                </p>
              )}
              <p className="text-xs text-gray-600">
                Service: <span className="font-semibold text-gray-800">{serviceName}</span>
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Payment & Verification Status
              </h4>
              <p className="text-xs text-gray-600">
                Payment Status:{' '}
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isPaid ? (isManualPayment ? 'PAID (MANUAL RECEIPT)' : 'PAID / GATEWAY VERIFIED') : 'PAYMENT PENDING'}
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {isManualPayment ? 'Reference / UTR:' : 'Transaction ID:'}{' '}
                <span className="font-mono text-gray-900 font-bold">
                  {referenceNumber || paymentId || (isPaid ? 'Direct Payment' : '—')}
                </span>
              </p>
              <p className="text-xs text-gray-600">
                Payment Mode:{' '}
                <span className="font-semibold text-gray-800">
                  {paymentMode || (isManualPayment ? 'Direct Collection' : 'Online Gateway')}
                </span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="my-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#081326] text-white text-[11px]">
                  <th className="py-2.5 px-3 rounded-l-lg font-bold">#</th>
                  <th className="py-2.5 px-3 font-bold">Service Description</th>
                  <th className="py-2.5 px-3 font-bold text-right">Base Amount</th>
                  {numDiscount > 0 && <th className="py-2.5 px-3 font-bold text-right text-emerald-300">Discount</th>}
                  {numDiscount > 0 && <th className="py-2.5 px-3 font-bold text-right">Taxable Value</th>}
                  <th className="py-2.5 px-3 font-bold text-right">Tax ({taxRate}%)</th>
                  <th className="py-2.5 px-3 rounded-r-lg font-bold text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-500">01</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900">{serviceName}</p>
                    {serviceDetails && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{serviceDetails}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-gray-800">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </td>
                  {numDiscount > 0 && (
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold">
                      -₹{numDiscount.toLocaleString('en-IN')}
                    </td>
                  )}
                  {numDiscount > 0 && (
                    <td className="py-3 px-3 text-right font-mono font-semibold text-gray-800">
                      ₹{taxableValue.toLocaleString('en-IN')}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-mono text-gray-600">
                    ₹{gstVal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-gray-200 pt-4">
            <div className="text-[11px] text-gray-500 max-w-sm space-y-1">
              <p className="font-semibold text-gray-700">{isNoTax ? 'Tax Treatment:' : 'Tax Breakdown:'}</p>
              {isNoTax ? (
                <p className="text-gray-600 font-medium">• 0% GST (Non-Taxable Collection — No Tax Invoice Issued)</p>
              ) : (
                <>
                  <p>• CGST ({(numTaxRate / 2)}%): ₹{cgst}</p>
                  <p>• SGST ({(numTaxRate / 2)}%): ₹{sgst}</p>
                </>
              )}
              {numDiscount > 0 && (
                <p className="text-emerald-600 font-semibold">• Discount Applied: -₹{numDiscount.toLocaleString('en-IN')}</p>
              )}
            </div>

            <div className="w-full sm:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 text-right space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {numDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{numDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {numDiscount > 0 && (
                <div className="flex justify-between text-xs text-gray-700 font-semibold">
                  <span>Taxable Value:</span>
                  <span className="font-mono">₹{taxableValue.toLocaleString('en-IN')}</span>
                </div>
              )}
              {numTaxRate > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>GST ({numTaxRate}%):</span>
                  <span className="font-mono">+₹{gstVal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#081326] border-t border-gray-300 pt-2 mt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-[#f59e0b]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Seal */}
          <div className="mt-8 pt-4 border-t border-dashed border-gray-300 flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-gray-500 gap-3">
            <div>
              <p className="font-bold text-gray-700">Terms & Conditions:</p>
              <p>1. Payments processed are non-refundable once service is initiated or rendered.</p>
              <p>2. Computer generated invoice — does not require physical signature.</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isManualPayment ? 'Verified KTR Direct Receipt' : 'Verified KTR Online Receipt'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentInvoiceModal;
