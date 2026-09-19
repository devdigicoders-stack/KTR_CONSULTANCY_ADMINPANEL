import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, Phone, Briefcase, IndianRupee, FileCheck, 
  CheckCircle2, Info, HeadphonesIcon, Check, ArrowRight, Shield
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-all";
const labelCls = "text-xs font-bold text-gray-700 block mb-1";

const professionOptions = [
  '',
  'Salaried',
  'Self-Employed / Business',
  'Professional (Dr / CA / Lawyer)',
  'Trader / Retailer',
  'Manufacturer',
  'Contractor',
  'Farmer / Agriculture',
  'Retired',
  'Other'
];

const caseTypeOptions = [
  '',
  'Home Loan',
  'Personal Loan',
  'Business Loan',
  'Loan Against Property (LAP)',
  'MSME / Commercial Loan',
  'Car / Auto Loan',
  'Education Loan',
  'Balance Transfer & Top-up',
  'Project Finance',
  'Debt Consolidation',
  'CIBIL Clearance / Score Repair',
  'Other'
];

const statusOptions = [
  'Pending',
  'Approved',
  'Rejected'
];

const AddNewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    occupation: '',
    loanAmount: '',
    caseType: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.occupation || !formData.caseType) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName.trim());
      submitData.append('mobile', formData.mobile.trim());
      submitData.append('occupation', formData.occupation);
      submitData.append('loanAmount', formData.loanAmount || 0);
      submitData.append('caseType', formData.caseType);
      submitData.append('loanType', formData.caseType);
      submitData.append('status', formData.status || 'Pending');

      const res = await api.post('/clients/profile', submitData);

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Client added successfully! Redirecting...' });
        window.scrollTo(0, 0);
        setTimeout(() => navigate('/clients'), 1200);
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
        <h2 className="text-xl font-black text-[#081326]">Add New Client</h2>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span onClick={() => navigate('/clients')} className="hover:text-[#081326] cursor-pointer transition-colors">Clients</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500 font-semibold">Initial Client Creation (Basic Details)</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 w-full">
        {/* Main Content Area */}
        <div className="flex flex-col space-y-6 flex-1 min-w-0 w-full xl:w-[70%]">

          {message.text && (
            <div className={`p-4 rounded-xl text-xs font-bold border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8 space-y-6">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-black text-[#081326] text-base flex items-center gap-2">
                <User className="w-5 h-5 text-[#f59e0b]" /> Client Information
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Enter the basic information to create the client case. Documents and pendencies can be managed afterwards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Client Name */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Client Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter full legal client name"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              {/* 2. Mobile No. */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    className={`${inputCls} pl-10 font-bold`}
                  />
                </div>
              </div>

              {/* 3. Profession */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Profession <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className={`${inputCls} pl-10 cursor-pointer font-medium`}
                  >
                    {professionOptions.map(p => (
                      <option key={p} value={p}>{p === '' ? 'Select Profession' : p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Loan Amount */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Loan Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    required
                    min={0}
                    placeholder="e.g. 1500000"
                    className={`${inputCls} pl-10 font-bold text-[#081326]`}
                  />
                </div>
              </div>

              {/* 5. Case Type */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Case Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleChange}
                    required
                    className={`${inputCls} pl-10 cursor-pointer font-medium`}
                  >
                    {caseTypeOptions.map(c => (
                      <option key={c} value={c}>{c === '' ? 'Select Case Type' : c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Status */}
              <div className="flex flex-col">
                <label className={labelCls}>
                  Case Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className={`${inputCls} pl-10 cursor-pointer font-bold`}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Basic details only. Additional documents and pendencies can be managed anytime.</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/clients')}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating Client...' : 'Create Client Case'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6">
          {/* Quick Guidance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <h3 className="font-bold text-[#081326] text-xs uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
              <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Check className="w-3.5 h-3.5" />
              </div>
              KTR Staff Principles
            </h3>
            <ul className="flex flex-col gap-3 text-xs font-normal text-gray-600">
              <li className="flex gap-2 items-start">
                <Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                <span><strong>Client Creation:</strong> Basic intake details only for quick filing.</span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                <span><strong>Documents:</strong> Upload documents in the organized Documents repository.</span>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                <span><strong>Pendency:</strong> Track continuous missing requirements without losing history.</span>
              </li>
            </ul>
          </div>

          {/* Need Help Box */}
          <div className="bg-[#081326] rounded-2xl shadow-sm border border-[#11203d] p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 mb-2 relative z-10">
              <HeadphonesIcon className="w-4 h-4 text-[#f59e0b]" /> Need Support?
            </h3>
            <p className="text-xs text-gray-400 font-medium mb-4 relative z-10 leading-relaxed">
              If you have questions regarding loan guidelines or case filing, contact the admin desk.
            </p>
            <div className="text-[11px] text-[#f59e0b] font-bold">
              KTR Finance Management Panel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewClient;
