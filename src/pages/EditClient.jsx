import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, User, Phone, Briefcase, IndianRupee, FileText, 
  ArrowRight, StickyNote, Lock, Plus, Trash2, Calendar, 
  Users, ShieldCheck, CreditCard, Tag, Check
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/common/RichTextEditor';

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

const EditClient = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Core Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    occupation: '',
    loanAmount: '',
    caseType: '',
    panNumber: '',
    aadhaarNumber: '',
    mobile: '',
    email: '',
    motherName: '',
    status: 'Pending',
    caseNotes: '',
    internalNotes: ''
  });

  // Primary Applicant Custom Fields
  const [primaryCustomFields, setPrimaryCustomFields] = useState([]);
  const [newPrimaryFieldName, setNewPrimaryFieldName] = useState('');
  const [newPrimaryFieldValue, setNewPrimaryFieldValue] = useState('');

  // Co-Applicants
  const [coApplicants, setCoApplicants] = useState([]);

  // Case-Level Custom Fields (Key-Value pairs)
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/clients/${id}`);
        if (res.data.success) {
          const client = res.data.data;
          const primaryApp = (client.applicants && client.applicants.length > 0) 
            ? client.applicants[0] 
            : {
                fullName: client.fullName || '',
                dob: client.dob || '',
                occupation: client.occupation || '',
                panNumber: client.panNumber || '',
                aadhaarNumber: client.aadhaarNumber || '',
                mobile: client.mobile || '',
                motherName: client.motherName || '',
                email: client.email || '',
                customFields: []
              };

          setFormData({
            fullName: primaryApp.fullName || client.fullName || '',
            dob: primaryApp.dob ? primaryApp.dob.split('T')[0] : (client.dob ? client.dob.split('T')[0] : ''),
            occupation: primaryApp.occupation || client.occupation || '',
            loanAmount: client.loanAmount || '',
            caseType: client.caseType || client.loanType || '',
            panNumber: primaryApp.panNumber || client.panNumber || '',
            aadhaarNumber: primaryApp.aadhaarNumber || client.aadhaarNumber || '',
            mobile: primaryApp.mobile || client.mobile || '',
            email: primaryApp.email || client.email || '',
            motherName: primaryApp.motherName || client.motherName || '',
            status: client.status || 'Pending',
            caseNotes: client.caseNotes || client.notes || '',
            internalNotes: client.internalNotes || ''
          });

          // Primary Applicant Custom Fields
          if (primaryApp.customFields && Array.isArray(primaryApp.customFields)) {
            setPrimaryCustomFields(primaryApp.customFields.map(cf => ({
              fieldName: cf.fieldName || '',
              fieldValue: cf.fieldValue || ''
            })));
          }

          // Populate Co-Applicants (applicants index 1 onwards, or legacy coApplicant object)
          if (client.applicants && client.applicants.length > 1) {
            setCoApplicants(client.applicants.slice(1).map((app, idx) => ({
              fullName: app.fullName || '',
              dob: app.dob ? app.dob.split('T')[0] : '',
              occupation: app.occupation || '',
              panNumber: app.panNumber || '',
              aadhaarNumber: app.aadhaarNumber || '',
              mobile: app.mobile || '',
              relationship: app.relationship || `Co-Applicant ${idx + 1}`,
              customFields: app.customFields && Array.isArray(app.customFields) ? app.customFields : []
            })));
          } else if (client.hasCoApplicant && client.coApplicant && client.coApplicant.fullName) {
            setCoApplicants([{
              fullName: client.coApplicant.fullName || '',
              dob: client.coApplicant.dob ? client.coApplicant.dob.split('T')[0] : '',
              occupation: client.coApplicant.occupation || '',
              panNumber: client.coApplicant.panNumber || '',
              aadhaarNumber: client.coApplicant.aadhaarNumber || '',
              mobile: client.coApplicant.mobile || '',
              relationship: client.coApplicant.relationship || 'Co-Applicant 1',
              customFields: client.coApplicant.customFields && Array.isArray(client.coApplicant.customFields) ? client.coApplicant.customFields : []
            }]);
          }

          // Populate Case-Level Custom Fields
          if (client.customFields && Array.isArray(client.customFields)) {
            setCustomFields(client.customFields.map(cf => ({
              fieldName: cf.fieldName || '',
              fieldValue: cf.fieldValue || ''
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching client details for edit', error);
        setMessage({ type: 'error', text: 'Failed to load client details.' });
      } finally {
        setFetching(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Co-Applicant Handlers
  const handleAddCoApplicant = () => {
    setCoApplicants(prev => [
      ...prev,
      {
        fullName: '',
        dob: '',
        occupation: '',
        panNumber: '',
        aadhaarNumber: '',
        mobile: '',
        relationship: `Co-Applicant ${prev.length + 1}`,
        customFields: []
      }
    ]);
  };

  const handleCoApplicantChange = (index, field, value) => {
    setCoApplicants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveCoApplicant = (index) => {
    setCoApplicants(prev => prev.filter((_, idx) => idx !== index));
  };

  // Co-Applicant Custom Fields
  const handleAddCoAppCustomField = (index, fieldName, fieldValue) => {
    if (!fieldName.trim()) return;
    setCoApplicants(prev => {
      const updated = [...prev];
      const curFields = updated[index].customFields || [];
      updated[index] = {
        ...updated[index],
        customFields: [...curFields, { fieldName: fieldName.trim(), fieldValue: fieldValue.trim() }]
      };
      return updated;
    });
  };

  const handleRemoveCoAppCustomField = (appIndex, fieldIndex) => {
    setCoApplicants(prev => {
      const updated = [...prev];
      const curFields = updated[appIndex].customFields || [];
      updated[appIndex] = {
        ...updated[appIndex],
        customFields: curFields.filter((_, i) => i !== fieldIndex)
      };
      return updated;
    });
  };

  // Primary Custom Fields
  const handleAddPrimaryCustomField = () => {
    if (!newPrimaryFieldName.trim()) return;
    setPrimaryCustomFields(prev => [
      ...prev,
      { fieldName: newPrimaryFieldName.trim(), fieldValue: newPrimaryFieldValue.trim() }
    ]);
    setNewPrimaryFieldName('');
    setNewPrimaryFieldValue('');
  };

  const handleRemovePrimaryCustomField = (idx) => {
    setPrimaryCustomFields(prev => prev.filter((_, i) => i !== idx));
  };

  // Case-Level Custom Field Handlers
  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    setCustomFields(prev => [
      ...prev,
      { fieldName: newFieldName.trim(), fieldValue: newFieldValue.trim() }
    ]);
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomFieldChange = (index, key, val) => {
    setCustomFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.caseType.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Applicant Name, Mobile, and Case Type).' });
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const primaryDob = formData.dob ? new Date(formData.dob) : undefined;
      const primaryAge = primaryDob ? calculateAge(primaryDob) : null;

      const primaryAppObj = {
        fullName: formData.fullName.trim(),
        dob: primaryDob,
        age: primaryAge,
        mobile: formData.mobile.trim(),
        occupation: (formData.occupation || 'Salaried').trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        aadhaarNumber: formData.aadhaarNumber.trim(),
        motherName: formData.motherName.trim(),
        email: formData.email.trim(),
        relationship: 'Primary Applicant',
        customFields: primaryCustomFields
      };

      const processedCoApplicants = coApplicants.map((app, idx) => {
        const appDob = app.dob ? new Date(app.dob) : undefined;
        return {
          fullName: (app.fullName || `Co-Applicant ${idx + 1}`).trim(),
          dob: appDob,
          age: appDob ? calculateAge(appDob) : null,
          mobile: (app.mobile || '').trim(),
          occupation: (app.occupation || formData.occupation || 'Salaried').trim(),
          panNumber: (app.panNumber || '').trim().toUpperCase(),
          aadhaarNumber: (app.aadhaarNumber || '').trim(),
          relationship: (app.relationship || `Co-Applicant ${idx + 1}`).trim(),
          customFields: app.customFields || []
        };
      });

      const allApplicants = [primaryAppObj, ...processedCoApplicants];

      const submitData = new FormData();
      submitData.append('fullName', primaryAppObj.fullName);
      submitData.append('mobile', primaryAppObj.mobile);
      submitData.append('occupation', primaryAppObj.occupation);
      if (primaryDob) submitData.append('dob', formData.dob);
      if (primaryAge) submitData.append('age', primaryAge);
      if (primaryAppObj.panNumber) submitData.append('panNumber', primaryAppObj.panNumber);
      if (primaryAppObj.aadhaarNumber) submitData.append('aadhaarNumber', primaryAppObj.aadhaarNumber);
      if (primaryAppObj.motherName) submitData.append('motherName', primaryAppObj.motherName);
      if (primaryAppObj.email) submitData.append('email', primaryAppObj.email);

      submitData.append('loanAmount', formData.loanAmount || 0);
      submitData.append('caseType', formData.caseType.trim());
      submitData.append('loanType', formData.caseType.trim());
      submitData.append('status', formData.status || 'Pending');
      submitData.append('notes', formData.caseNotes.trim());
      submitData.append('caseNotes', formData.caseNotes.trim());
      submitData.append('internalNotes', formData.internalNotes.trim());
      submitData.append('applicants', JSON.stringify(allApplicants));

      // Append Custom Fields
      submitData.append('customFields', JSON.stringify(customFields));

      const res = await api.put(`/clients/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Case details updated successfully! Redirecting to Overview...' });
        window.scrollTo(0, 0);
        // Immediately navigate back to client overview so staff sees the updated details instantly
        setTimeout(() => {
          navigate(`/clients/${id}`);
        }, 700);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong!' });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const calculatedPrimaryAge = calculateAge(formData.dob);

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12 text-sm font-bold text-gray-500">
        Loading case details...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative h-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-[#081326]">Edit Client Case</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span onClick={() => navigate('/clients')} className="hover:text-[#081326] cursor-pointer transition-colors">Clients</span>
          <ChevronRight className="w-3 h-3" />
          <span onClick={() => navigate(`/clients/${id}`)} className="hover:text-[#081326] cursor-pointer transition-colors">
            {formData.fullName || 'Client Case'}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500 font-semibold">Edit Case Details</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 w-full">
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8 space-y-7">
            
            {/* 1. Primary Applicant & Core Case Details Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#081326] text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" /> Applicant & Case Details
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Modify core loan parameters and applicant information.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-600">Case Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Bank Side Pending">Bank Side Pending</option>
                    <option value="Client Side Pending">Client Side Pending</option>
                    <option value="Case Sanctioned">Case Sanctioned</option>
                    <option value="Disbursement Pendency">Disbursement Pendency</option>
                    <option value="Case Disbursed">Case Disbursed</option>
                    <option value="Pending">Pending (Legacy)</option>
                    <option value="Approved">Approved (Legacy)</option>
                    <option value="Rejected">Rejected (Legacy)</option>
                  </select>
                </div>
              </div>

              {/* Logical Order: Full Name, DOB, Profession, Loan Amount, Case Type, PAN, Aadhaar, Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Full Name */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Applicant Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Priyanka Singh"
                      className={`${inputCls} pl-10 font-bold text-[#081326]`}
                    />
                  </div>
                </div>

                {/* 2. DOB */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Date of Birth (DOB)
                    </label>
                    {calculatedPrimaryAge !== null && (
                      <span className="text-xs font-black text-amber-700">
                        Age: {calculatedPrimaryAge} Yrs
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`${inputCls} pl-10 font-bold`}
                    />
                  </div>
                </div>

                {/* 3. Profession / Occupation */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Profession / Profile
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="e.g. Salaried, Business, Doctor"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* 4. Loan Amount */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      required
                      min={0}
                      placeholder="e.g. 3500000"
                      className={`${inputCls} pl-10 font-black text-emerald-800 bg-emerald-50/30 border-emerald-200/80`}
                    />
                  </div>
                </div>

                {/* 5. Case Type */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Case Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="caseType"
                      value={formData.caseType}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. BT from PNB Housing, Home Loan, LAP..."
                      className={`${inputCls} pl-10 font-bold text-blue-900 bg-blue-50/20 border-blue-200/80`}
                    />
                  </div>
                </div>

                {/* 6. PAN Number */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    PAN Number (Optional)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="panNumber"
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange({ target: { name: 'panNumber', value: e.target.value.toUpperCase() } })}
                      placeholder="ABCDE1234F"
                      className={`${inputCls} pl-10 font-mono uppercase`}
                    />
                  </div>
                </div>

                {/* 7. Aadhaar Number */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Aadhaar Number (Optional)
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="aadhaarNumber"
                      maxLength={12}
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      placeholder="12-digit Aadhaar"
                      className={`${inputCls} pl-10 font-mono`}
                    />
                  </div>
                </div>

                {/* 8. Mobile Number */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile"
                      className={`${inputCls} pl-10 font-mono`}
                    />
                  </div>
                </div>

                {/* Optional Email Address */}
                <div className="flex flex-col">
                  <label className={labelCls}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="client@example.com"
                    className={inputCls}
                  />
                </div>

                {/* Primary Applicant Custom Fields */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-600" /> Primary Applicant Custom Fields
                    </span>
                    <span className="text-[10px] text-gray-400">e.g. CIBIL score, share %, employer</span>
                  </div>

                  {primaryCustomFields.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {primaryCustomFields.map((cf, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs font-bold">
                          <span>{cf.fieldName}: {cf.fieldValue}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePrimaryCustomField(idx)}
                            className="text-purple-500 hover:text-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Field Name (e.g. CIBIL Score)"
                      value={newPrimaryFieldName}
                      onChange={e => setNewPrimaryFieldName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Field Value (e.g. 785)"
                      value={newPrimaryFieldValue}
                      onChange={e => setNewPrimaryFieldValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPrimaryCustomField}
                      disabled={!newPrimaryFieldName.trim()}
                      className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold disabled:opacity-40"
                    >
                      + Add Field
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Co-Applicants Section (Unlimited with always-available Add option) */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#081326] text-sm sm:text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" /> Co-Borrowers / Co-Applicants / Guarantors
                    {coApplicants.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold border border-blue-200">
                        {coApplicants.length} Added
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Add an unlimited number of co-applicants or guarantors. Each person is captured and stored separately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCoApplicant}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Co-Applicant
                </button>
              </div>

              {/* Co-Applicants List */}
              {coApplicants.length > 0 && (
                <div className="space-y-3">
                  {coApplicants.map((app, idx) => {
                    const coAge = calculateAge(app.dob);
                    return (
                      <div 
                        key={idx} 
                        className="p-4 rounded-xl border border-gray-200 bg-slate-50/60 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-200/70 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#081326]">
                              {app.fullName.trim() || `Co-Applicant ${idx + 1}`}
                            </span>
                            {coAge !== null && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-300">
                                {coAge} Yrs
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoApplicant(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Remove Co-Applicant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Full Name</label>
                            <input
                              type="text"
                              value={app.fullName}
                              onChange={(e) => handleCoApplicantChange(idx, 'fullName', e.target.value)}
                              placeholder={`Legal Name for Co-Applicant ${idx + 1}`}
                              className={inputCls}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-gray-600">Date of Birth</label>
                              {coAge !== null && <span className="text-[10px] text-amber-700 font-bold">{coAge} Yrs</span>}
                            </div>
                            <input
                              type="date"
                              value={app.dob}
                              onChange={(e) => handleCoApplicantChange(idx, 'dob', e.target.value)}
                              className={`${inputCls} font-bold`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Profession / Profile</label>
                            <input
                              type="text"
                              value={app.occupation}
                              onChange={(e) => handleCoApplicantChange(idx, 'occupation', e.target.value)}
                              placeholder="e.g. Business, Salaried"
                              className={inputCls}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Mobile Number</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={app.mobile}
                              onChange={(e) => handleCoApplicantChange(idx, 'mobile', e.target.value)}
                              placeholder="10-digit mobile"
                              className={`${inputCls} font-mono`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">PAN Number</label>
                            <input
                              type="text"
                              maxLength={10}
                              value={app.panNumber}
                              onChange={(e) => handleCoApplicantChange(idx, 'panNumber', e.target.value.toUpperCase())}
                              placeholder="ABCDE1234F"
                              className={`${inputCls} font-mono uppercase`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Aadhaar Number</label>
                            <input
                              type="text"
                              maxLength={12}
                              value={app.aadhaarNumber}
                              onChange={(e) => handleCoApplicantChange(idx, 'aadhaarNumber', e.target.value)}
                              placeholder="12-digit Aadhaar"
                              className={`${inputCls} font-mono`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-600 block mb-1">Relationship</label>
                            <input
                              type="text"
                              value={app.relationship}
                              onChange={(e) => handleCoApplicantChange(idx, 'relationship', e.target.value)}
                              placeholder="e.g. Co-Borrower, Guarantor, Spouse"
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* Co-Applicant Custom Fields */}
                        <div className="pt-2 border-t border-gray-200/60">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                            Co-Applicant Custom Fields
                          </span>
                          {app.customFields && app.customFields.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {app.customFields.map((cf, cIdx) => (
                                <span key={cIdx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 rounded text-[11px] font-bold">
                                  <span>{cf.fieldName}: {cf.fieldValue}</span>
                                  <button type="button" onClick={() => handleRemoveCoAppCustomField(idx, cIdx)} className="text-purple-600 hover:text-red-600">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              id={`coapp-fn-${idx}`}
                              placeholder="Field Name (e.g. CIBIL Score)"
                              className="flex-1 px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none"
                            />
                            <input
                              type="text"
                              id={`coapp-fv-${idx}`}
                              placeholder="Value"
                              className="flex-1 px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fn = document.getElementById(`coapp-fn-${idx}`)?.value || '';
                                const fv = document.getElementById(`coapp-fv-${idx}`)?.value || '';
                                if (fn.trim()) {
                                  handleAddCoAppCustomField(idx, fn, fv);
                                  document.getElementById(`coapp-fn-${idx}`).value = '';
                                  document.getElementById(`coapp-fv-${idx}`).value = '';
                                }
                              }}
                              className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Add Another Co-Applicant Button (Always Available) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddCoApplicant}
                  className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-dashed border-blue-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Another Applicant / Co-Applicant / Guarantor</span>
                </button>
              </div>
            </div>

            {/* 3. Custom Fields Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <h3 className="font-black text-[#081326] text-sm sm:text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" /> Custom Fields
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Add custom parameters like CIBIL score, property valuation, sanction bank, or DSA code.
                </p>
              </div>

              {/* Added Custom Fields List */}
              {customFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {customFields.map((cf, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-purple-50/40 border border-purple-200/80 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block truncate">
                          {cf.fieldName}
                        </span>
                        <input
                          type="text"
                          value={cf.fieldValue}
                          onChange={(e) => handleCustomFieldChange(idx, 'fieldValue', e.target.value)}
                          placeholder="Enter value"
                          className="w-full text-xs font-bold text-[#081326] bg-transparent outline-none border-b border-purple-200 focus:border-purple-500 py-0.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                        title="Delete custom field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Row for New Custom Field */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-end bg-gray-50/80 p-3 rounded-xl border border-gray-200/80">
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Field Name</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. CIBIL Score, Property Valuation..."
                    className={inputCls}
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Field Value</label>
                  <input
                    type="text"
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder="e.g. 785, ₹ 65,00,000..."
                    className={inputCls}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  disabled={!newFieldName.trim()}
                  className="px-4 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40 shrink-0 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Field
                </button>
              </div>
            </div>

            {/* 4. Notes Section: Case Notes vs Internal Notes */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* General Case Notes / Observations */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-xs font-bold text-gray-700">
                      Case Notes / Remarks / Observations
                    </label>
                  </div>
                  <RichTextEditor
                    value={formData.caseNotes}
                    onChange={(val) => setFormData(prev => ({ ...prev, caseNotes: val, notes: val }))}
                    placeholder="General observations, process status, technical issues, key points..."
                    minHeight="140px"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Use formatting toolbar for bold, italics, bullet points, numbers, headings, highlights, and alignment.
                  </p>
                </div>

                {/* 🔒 Internal Notes (Internal Team Only) */}
                <div className="flex flex-col bg-amber-50/40 p-3 rounded-xl border border-amber-200/70">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <label className="text-xs font-black text-amber-900">
                      Internal Notes (Internal Team Only)
                    </label>
                  </div>
                  <RichTextEditor
                    value={formData.internalNotes}
                    onChange={(val) => setFormData(prev => ({ ...prev, internalNotes: val }))}
                    placeholder="🔒 Confidential team notes, commission details, internal checklist remarks... (Never visible to bankers)"
                    minHeight="140px"
                  />
                  <p className="text-[10px] text-amber-800 font-bold mt-1">
                    🔒 Strictly restricted to internal staff. Never shown in banker-shared links.
                  </p>
                </div>

              </div>
            </div>

            {/* Submit Bar */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/clients/${id}`)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#081326] hover:bg-[#11203d] text-amber-400 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Update Case Details'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default EditClient;
