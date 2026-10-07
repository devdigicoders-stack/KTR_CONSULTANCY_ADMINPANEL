import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, Phone, Briefcase, IndianRupee, FileText, 
  Info, HeadphonesIcon, Check, ArrowRight, FileCheck, StickyNote,
  Plus, Trash2, Calendar, Users, ShieldCheck, CreditCard
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm font-medium outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-all";
const labelCls = "text-xs font-bold text-gray-700 block mb-1";

// Age calculation helper (Formula: Current Year - Year of Birth)
const calculateAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const birthYear = d.getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return age >= 0 ? age : null;
};

const AddNewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Loan Case Overview
  const [caseData, setCaseData] = useState({
    loanAmount: '',
    caseType: '',
    caseNotes: ''
  });

  // Multiple Applicants (No practical limit: Applicant 1, Applicant 2, Applicant 3...)
  const [applicants, setApplicants] = useState([
    {
      fullName: '',
      dob: '',
      mobile: '',
      occupation: '',
      panNumber: '',
      aadhaarNumber: '',
      motherName: '',
      relationship: 'Primary Applicant'
    }
  ]);

  const handleCaseChange = (e) => {
    setCaseData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplicantChange = (index, field, value) => {
    setApplicants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddApplicant = () => {
    setApplicants(prev => [
      ...prev,
      {
        fullName: '',
        dob: '',
        mobile: '',
        occupation: '',
        panNumber: '',
        aadhaarNumber: '',
        motherName: '',
        relationship: `Co-Applicant ${prev.length}`
      }
    ]);
  };

  const handleRemoveApplicant = (index) => {
    if (applicants.length <= 1) return;
    setApplicants(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const primaryApp = applicants[0];
    if (!primaryApp.fullName.trim() || !primaryApp.mobile.trim() || !caseData.caseType.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Applicant 1 Name, Mobile, and Case Type).' });
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      // Process applicants with calculated ages
      const processedApplicants = applicants.map((app, idx) => {
        const appDob = app.dob ? new Date(app.dob) : undefined;
        return {
          fullName: app.fullName.trim(),
          dob: appDob,
          age: appDob ? calculateAge(appDob) : null,
          mobile: (app.mobile || '').trim(),
          occupation: (app.occupation || primaryApp.occupation || 'Salaried').trim(),
          panNumber: (app.panNumber || '').trim().toUpperCase(),
          aadhaarNumber: (app.aadhaarNumber || '').trim(),
          motherName: (app.motherName || '').trim(),
          relationship: idx === 0 ? 'Primary Applicant' : (app.relationship || `Co-Applicant ${idx}`)
        };
      });

      const primaryDob = primaryApp.dob ? new Date(primaryApp.dob) : undefined;
      const primaryAge = primaryDob ? calculateAge(primaryDob) : null;

      const submitData = new FormData();
      submitData.append('fullName', primaryApp.fullName.trim());
      submitData.append('mobile', primaryApp.mobile.trim());
      submitData.append('occupation', (primaryApp.occupation || 'Salaried').trim());
      if (primaryDob) submitData.append('dob', primaryApp.dob);
      if (primaryAge) submitData.append('age', primaryAge);
      if (primaryApp.panNumber) submitData.append('panNumber', primaryApp.panNumber.trim().toUpperCase());
      if (primaryApp.aadhaarNumber) submitData.append('aadhaarNumber', primaryApp.aadhaarNumber.trim());
      if (primaryApp.motherName) submitData.append('motherName', primaryApp.motherName.trim());

      submitData.append('loanAmount', caseData.loanAmount || 0);
      submitData.append('caseType', caseData.caseType.trim());
      submitData.append('loanType', caseData.caseType.trim());
      submitData.append('notes', caseData.caseNotes.trim());
      submitData.append('caseNotes', caseData.caseNotes.trim());
      submitData.append('status', 'Pending');
      submitData.append('applicants', JSON.stringify(processedApplicants));

      const res = await api.post('/clients/profile', submitData);

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Client case registered successfully with multiple applicants! Redirecting...' });
        window.scrollTo(0, 0);
        setTimeout(() => navigate('/clients'), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong while saving the client.' });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative h-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-[#081326]">Add New Client Case</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span onClick={() => navigate('/clients')} className="hover:text-[#081326] cursor-pointer transition-colors">Clients</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500 font-semibold">Multiple Applicants & Case File Creation</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 w-full">
        {/* Main Content Area */}
        <div className="flex flex-col space-y-6 flex-1 min-w-0 w-full xl:w-[75%]">

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-bold border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8 space-y-8">
            
            {/* 1. Case Details Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#081326] text-base flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#f59e0b]" /> Loan Case Requirements
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Basic loan parameters and case classification.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-black">
                  Status: Pending
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Loan Amount */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      name="loanAmount"
                      value={caseData.loanAmount}
                      onChange={handleCaseChange}
                      required
                      min={0}
                      placeholder="e.g. 3500000"
                      className={`${inputCls} pl-10 font-bold text-[#081326]`}
                    />
                  </div>
                </div>

                {/* Case Type */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Case Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="caseType"
                      value={caseData.caseType}
                      onChange={handleCaseChange}
                      required
                      placeholder="e.g. BT from PNB Housing, Home Loan, LAP..."
                      className={`${inputCls} pl-10 font-bold`}
                    />
                  </div>
                </div>

                {/* Case Notes */}
                <div className="flex flex-col sm:col-span-2">
                  <label className={labelCls}>
                    Case Notes / Observations (Optional)
                  </label>
                  <div className="relative">
                    <StickyNote className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <textarea
                      name="caseNotes"
                      value={caseData.caseNotes}
                      onChange={handleCaseChange}
                      rows={2}
                      placeholder="e.g. Legal clearance in progress, salary credit verified..."
                      className={`${inputCls} pl-10 resize-none font-normal text-xs`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Applicants Section (Applicant 1, Applicant 2, Applicant 3...) */}
            <div className="space-y-6 pt-2">
              <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-[#081326] text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" /> Applicants ({applicants.length})
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Add all borrowers, co-borrowers and guarantors without any limit. Age is automatically calculated from DOB.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddApplicant}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Applicant
                </button>
              </div>

              {/* List of Applicants */}
              <div className="space-y-6">
                {applicants.map((app, idx) => {
                  const calculatedAge = calculateAge(app.dob);

                  return (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl border transition-all ${
                        idx === 0 
                          ? 'bg-amber-50/20 border-amber-200/80 shadow-2xs' 
                          : 'bg-slate-50/50 border-gray-200'
                      }`}
                    >
                      {/* Applicant Card Header */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200/70">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black font-mono ${
                            idx === 0 ? 'bg-[#081326] text-amber-400' : 'bg-blue-600 text-white'
                          }`}>
                            Applicant {idx + 1}
                          </span>
                          <span className="text-sm font-black text-[#081326]">
                            {app.fullName.trim() || `Applicant ${idx + 1}`}
                          </span>
                          {calculatedAge !== null && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black border border-emerald-300">
                              ({calculatedAge} Yrs)
                            </span>
                          )}
                          {idx === 0 && (
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-200/60 px-2 py-0.5 rounded">
                              Primary Borrower
                            </span>
                          )}
                        </div>

                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveApplicant(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Remove this applicant"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Applicant Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Full Name */}
                        <div className="flex flex-col">
                          <label className={labelCls}>
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required={idx === 0}
                              value={app.fullName}
                              onChange={(e) => handleApplicantChange(idx, 'fullName', e.target.value)}
                              placeholder={`Legal name for Applicant ${idx + 1}`}
                              className={`${inputCls} pl-10`}
                            />
                          </div>
                        </div>

                        {/* DOB with Auto Age Calculation */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-gray-700">
                              Date of Birth (DOB)
                            </label>
                            {calculatedAge !== null && (
                              <span className="text-xs font-black text-amber-700">
                                Age: {calculatedAge} Yrs
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="date"
                              value={app.dob}
                              onChange={(e) => handleApplicantChange(idx, 'dob', e.target.value)}
                              className={`${inputCls} pl-10 font-bold`}
                            />
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="flex flex-col">
                          <label className={labelCls}>
                            Mobile Number {idx === 0 && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="tel"
                              required={idx === 0}
                              maxLength={10}
                              value={app.mobile}
                              onChange={(e) => handleApplicantChange(idx, 'mobile', e.target.value)}
                              placeholder="10-digit mobile"
                              className={`${inputCls} pl-10 font-mono`}
                            />
                          </div>
                        </div>

                        {/* Profession / Occupation */}
                        <div className="flex flex-col">
                          <label className={labelCls}>
                            Profession / Profile
                          </label>
                          <div className="relative">
                            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={app.occupation}
                              onChange={(e) => handleApplicantChange(idx, 'occupation', e.target.value)}
                              placeholder="e.g. Salaried, Business, Doctor"
                              className={`${inputCls} pl-10`}
                            />
                          </div>
                        </div>

                        {/* PAN Number */}
                        <div className="flex flex-col">
                          <label className={labelCls}>
                            PAN Number (Optional)
                          </label>
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              maxLength={10}
                              value={app.panNumber}
                              onChange={(e) => handleApplicantChange(idx, 'panNumber', e.target.value.toUpperCase())}
                              placeholder="ABCDE1234F"
                              className={`${inputCls} pl-10 font-mono uppercase`}
                            />
                          </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div className="flex flex-col">
                          <label className={labelCls}>
                            Aadhaar Number (Optional)
                          </label>
                          <div className="relative">
                            <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              maxLength={12}
                              value={app.aadhaarNumber}
                              onChange={(e) => handleApplicantChange(idx, 'aadhaarNumber', e.target.value)}
                              placeholder="12-digit Aadhaar"
                              className={`${inputCls} pl-10 font-mono`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add More Applicants Button at Bottom */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleAddApplicant}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#081326] rounded-xl text-xs font-black flex items-center gap-2 mx-auto transition-all cursor-pointer border border-gray-200"
                >
                  <Plus className="w-4 h-4 stroke-[3] text-blue-600" />
                  <span>Add Another Applicant (Applicant {applicants.length + 1})</span>
                </button>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#081326] hover:bg-[#11203d] text-amber-400 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? 'Registering Case...' : 'Create Client Case & Checklist'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default AddNewClient;
