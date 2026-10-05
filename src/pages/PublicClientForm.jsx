import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, Upload, Check, 
  ArrowRight, RefreshCw, Lock, Building, Phone, Mail, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PublicClientForm = () => {
  const { id } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/forms/public/${id}`);
        if (res.data.success && res.data.data) {
          const config = res.data.data;
          setFormConfig(config);

          // Pre-fill initial form state
          const initial = {
            fullName: config.clientName || '',
            mobile: config.clientMobile || ''
          };
          setFormData(initial);
        } else {
          setError(res.data?.message || 'Form link is invalid or expired.');
        }
      } catch (err) {
        console.error('Fetch public form error:', err);
        setError(err.response?.data?.message || 'This form link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, file) => {
    setUploadedFiles(prev => ({ ...prev, [fieldId]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formConfig) return;

    // Validate required fields
    for (const f of formConfig.fields || []) {
      if (f.required) {
        if (f.type === 'file' && !uploadedFiles[f.id]) {
          toast.error(`Please upload ${f.label}`);
          return;
        }
        if (f.type !== 'file' && (!formData[f.id] || !formData[f.id].toString().trim())) {
          toast.error(`Please fill in ${f.label}`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const submitPayload = new FormData();

      // Append text data
      Object.keys(formData).forEach(key => {
        submitPayload.append(key, formData[key]);
      });

      // Append files
      Object.keys(uploadedFiles).forEach(fieldId => {
        const file = uploadedFiles[fieldId];
        if (file) {
          const fieldDef = (formConfig.fields || []).find(f => f.id === fieldId);
          const mappedKey = fieldDef?.mappedDocType || fieldId;
          submitPayload.append(mappedKey, file);
        }
      });

      const res = await api.post(`/forms/public/${id}/submit`, submitPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSubmissionSuccess(res.data);
      } else {
        toast.error(res.data?.message || 'Submission failed.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit form. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#f59e0b] mb-3" />
        <p className="text-xs font-bold text-gray-500">Loading secure form...</p>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-[#081326] mb-1">Link Expired or Not Found</h3>
          <p className="text-xs text-gray-500 font-medium mb-6">
            {error || 'This data collection form is no longer available or the link has expired.'}
          </p>
          <a
            href="/"
            className="px-6 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-colors inline-block"
          >
            Go to KTR Homepage
          </a>
        </div>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Form Submitted Successfully
            </span>
            <h2 className="text-xl font-black text-[#081326] mt-3">
              Thank You, {submissionSuccess.clientName}!
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Your details and documents have been received securely by our verification team.
            </p>
          </div>

          {submissionSuccess.applicationId && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reference / Case ID</span>
              <span className="text-base font-mono font-black text-[#081326]">{submissionSuccess.applicationId}</span>
            </div>
          )}

          <div className="pt-2 text-xs text-gray-400 font-medium border-t border-gray-100 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KTR Consultants & Financial Advisory</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="KTR Consultants" className="h-10 sm:h-12 mx-auto w-auto" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Secure Client Portal
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <h1 className="text-xl sm:text-2xl font-black text-[#081326]">
              {formConfig.title}
            </h1>
            {formConfig.description && (
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5 leading-relaxed">
                {formConfig.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-gray-400">
              <span>Prepared for:</span>
              <span className="text-[#081326]">{formConfig.clientName}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(formConfig.fields || []).map((field, idx) => {
              const value = formData[field.id] !== undefined ? formData[field.id] : (formData[field.mappedField] || '');

              return (
                <div key={field.id || idx} className="space-y-1.5">
                  <label className="block text-xs font-black text-[#081326]">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows="3"
                      value={value}
                      required={field.required}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all"
                    ></textarea>
                  ) : field.type === 'file' ? (
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#f59e0b] rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-amber-50/30 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        required={field.required}
                        onChange={(e) => handleFileChange(field.id, e.target.files?.[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-[#081326]">
                        {uploadedFiles[field.id]?.name ? (
                          <span className="text-emerald-700 font-black">✓ {uploadedFiles[field.id].name}</span>
                        ) : (
                          <span>Click or tap to upload file (PDF / Image)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Maximum file size: 100MB</p>
                    </div>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={value}
                      required={field.required}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all"
                    />
                  )}
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#081326] text-white hover:bg-[#11203d] rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Your Details...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Verified Details</span>
                    <ArrowRight className="w-4 h-4 text-[#f59e0b]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-[11px] text-gray-400 font-medium flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>All submitted records are encrypted and protected under KTR Privacy Policy.</span>
        </div>
      </div>
    </div>
  );
};

export default PublicClientForm;
