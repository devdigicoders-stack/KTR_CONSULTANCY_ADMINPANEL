import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, MapPin, Briefcase, Info, HeadphonesIcon, 
  Check, UploadCloud, UserPlus, Trash2, Users
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors";
const labelCls = "text-xs font-medium text-gray-700 block";

const occupationOptions = [
  '', 'Salaried', 'Self-Employed / Business', 'Professional (Dr/CA/Lawyer)',
  'Retired', 'Housewife', 'Student', 'Farmer', 'Other'
];

const emptyApplicant = {
  fullName: '',
  mobile: '',
  occupation: '',
  panNumber: '',
  aadhaarNumber: '',
  motherName: '',
  address: '',
};

const ApplicantSection = ({ data, onChange, prefix, title, icon: Icon, isCoApplicant = false }) => (
  <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
    <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
      <Icon className="w-4 h-4 text-[#f59e0b]" /> {title}
    </h3>

    {/* Mandatory Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          name={`${prefix}fullName`}
          value={data.fullName}
          onChange={onChange}
          required
          placeholder="Enter full name"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Mobile Number <span className="text-red-500">*</span></label>
        <input
          type="tel"
          name={`${prefix}mobile`}
          value={data.mobile}
          onChange={onChange}
          required
          maxLength={10}
          placeholder="Enter mobile number"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Occupation <span className="text-red-500">*</span></label>
        <select
          name={`${prefix}occupation`}
          value={data.occupation}
          onChange={onChange}
          required
          className={inputCls + " cursor-pointer"}
        >
          {occupationOptions.map(o => (
            <option key={o} value={o}>{o === '' ? 'Select occupation' : o}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Optional Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>PAN Number <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          type="text"
          name={`${prefix}panNumber`}
          value={data.panNumber}
          onChange={onChange}
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
          className={inputCls + " uppercase"}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Aadhaar Number <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          type="text"
          name={`${prefix}aadhaarNumber`}
          value={data.aadhaarNumber}
          onChange={onChange}
          placeholder="12-digit Aadhaar number"
          maxLength={12}
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Mother's Name <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          type="text"
          name={`${prefix}motherName`}
          value={data.motherName}
          onChange={onChange}
          placeholder="Enter mother's name"
          className={inputCls}
        />
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>Address <span className="text-gray-400 font-normal">(Optional)</span></label>
      <input
        type="text"
        name={`${prefix}address`}
        value={data.address}
        onChange={onChange}
        placeholder="House no., Street, Area, City, State, Pincode"
        className={inputCls}
      />
    </div>
  </div>
);

const AddNewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCoApplicant, setShowCoApplicant] = useState(false);

  const [mainApplicant, setMainApplicant] = useState({ ...emptyApplicant });
  const [coApplicant, setCoApplicant] = useState({ ...emptyApplicant });

  const [files, setFiles] = useState({});

  const handleMainChange = (e) => {
    setMainApplicant(prev => ({ ...prev, [e.target.name.replace('main_', '')]: e.target.value }));
  };

  const handleCoChange = (e) => {
    setCoApplicant(prev => ({ ...prev, [e.target.name.replace('co_', '')]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();

    // Main applicant fields
    Object.keys(mainApplicant).forEach(key => {
      submitData.append(key, mainApplicant[key]);
    });

    // Co-applicant fields
    if (showCoApplicant) {
      Object.keys(coApplicant).forEach(key => {
        submitData.append(`coApplicant_${key}`, coApplicant[key]);
      });
    }

    // Files
    Object.keys(files).forEach(key => {
      if (files[key]) submitData.append(key, files[key]);
    });

    try {
      const res = await api.post('/clients/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Client added successfully!' });
        window.scrollTo(0, 0);
        setTimeout(() => navigate('/clients'), 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong!' });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative h-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-800 text-[#081326]">Add New Client</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="hover:text-[#081326] cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Add client with basic details and documents</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 w-full">
        {/* Main Content Area */}
        <div className="flex flex-col space-y-6 flex-1 min-w-0 w-full xl:w-[70%]">

          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:gap-6">

            {/* Main Applicant */}
            <ApplicantSection
              data={mainApplicant}
              onChange={handleMainChange}
              prefix="main_"
              title="Applicant Details"
              icon={User}
            />

            {/* Co-Applicant Toggle */}
            <div>
              {!showCoApplicant ? (
                <button
                  type="button"
                  onClick={() => setShowCoApplicant(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-dashed border-[#f59e0b] text-[#f59e0b] rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors w-full justify-center cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  + Add Co-Applicant
                </button>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowCoApplicant(false); setCoApplicant({ ...emptyApplicant }); }}
                    className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Co-Applicant
                  </button>
                  <ApplicantSection
                    data={coApplicant}
                    onChange={handleCoChange}
                    prefix="co_"
                    title="Co-Applicant Details"
                    icon={Users}
                    isCoApplicant
                  />
                </div>
              )}
            </div>

            {/* Document Uploads */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
                <UploadCloud className="w-4 h-4 text-[#f59e0b]" /> Document Uploads
                <span className="ml-auto text-[11px] text-gray-400 font-normal">All optional</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'panCardUrl', label: 'PAN Card' },
                  { name: 'aadhaarUrl', label: 'Aadhaar Card' },
                  { name: 'photoUrl', label: 'Photograph' },
                  { name: 'salarySlipUrl', label: 'Salary Slip / ITR' },
                  { name: 'bankStatementUrl', label: 'Bank Statement' },
                  { name: 'addressProofUrl', label: 'Address Proof' },
                  { name: 'otherDocUrl', label: 'Other Document' },
                ].map(doc => (
                  <div key={doc.name} className="flex flex-col gap-1.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-700 block">{doc.label}</label>
                    <input
                      type="file"
                      name={doc.name}
                      onChange={handleFileChange}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer"
                      accept="image/*,.pdf"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 font-normal">
                💡 You can take pictures directly from your mobile camera or upload from gallery. Accepted formats: Image / PDF.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#081326]">Ready to submit?</p>
                  <p className="text-[11px] text-gray-500 font-normal">Only Name, Mobile & Occupation are required. Everything else is optional.</p>
                </div>
              </div>

              <div className="flex">
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-[#081326] text-white rounded-xl text-sm font-bold hover:bg-[#11203d] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                  {loading ? 'Submitting...' : 'Save Client'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6">
          {/* Quick Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <div className="w-6 h-6 rounded bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
                <Check className="w-3.5 h-3.5" />
              </div>
              Quick Tips
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-normal text-gray-600">
              <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Only fields marked with <span className="text-red-500 mx-1">*</span> are required</li>
              <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Add co-applicant if someone else is applying jointly</li>
              <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Upload documents for faster processing</li>
              <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> You can always update client details later</li>
            </ul>
          </div>

          {/* Need Help */}
          <div className="bg-[#081326] rounded-2xl shadow-sm border border-[#11203d] p-6 text-white relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/20 transition-all duration-500"></div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2 relative z-10">
              <HeadphonesIcon className="w-4 h-4 text-[#f59e0b]" /> Need Help?
            </h3>
            <p className="text-xs text-gray-400 font-normal mb-5 relative z-10 leading-relaxed">
              If you need any assistance while adding a client, our support team is here to help.
            </p>
            <button className="w-full bg-white/10 hover:bg-white text-white hover:text-[#081326] transition-colors rounded-xl py-2.5 text-sm font-medium flex justify-center items-center gap-2 relative z-10 shadow-sm border border-white/20">
              <HeadphonesIcon className="w-4 h-4" /> Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewClient;
