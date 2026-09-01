import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, User, MapPin, Briefcase, Info, HeadphonesIcon, Check, UploadCloud
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AddNewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    mobile: '',
    email: '',
    alternativeEmail: '',
    idProofType: '',
    idProofNumber: '',
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    occupation: '',
    companyName: '',
    designation: '',
    annualIncome: '',
    sourceOfIncome: '',
    businessType: '',
    yearsInBusiness: '',
    website: '',
    referredBy: '',
    referrerMobile: '',
    relationship: '',
    notes: ''
  });

  const [files, setFiles] = useState({
    photoUrl: null,
    idProofUrl: null,
    addressProofUrl: null,
    panCardUrl: null,
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (files.photoUrl) submitData.append('photoUrl', files.photoUrl);
    if (files.idProofUrl) submitData.append('idProofUrl', files.idProofUrl);
    if (files.addressProofUrl) submitData.append('addressProofUrl', files.addressProofUrl);
    if (files.panCardUrl) submitData.append('panCardUrl', files.panCardUrl);

    try {
      const res = await api.post('/clients/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Client added successfully!' });
        window.scrollTo(0,0);
        setTimeout(() => navigate('/clients'), 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong!' });
      window.scrollTo(0,0);
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
          <span className="text-gray-500">Provide your personal, contact, and business information</span>
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
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
                <User className="w-4 h-4 text-[#f59e0b]" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter full name" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal text-gray-800 outline-none hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors cursor-pointer">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">PAN Number <span className="text-red-500">*</span></label>
                  <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required placeholder="Enter PAN number" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors uppercase" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Aadhaar Number</label>
                  <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="Enter Aadhaar number" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="Enter mobile number" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Alternative Email</label>
                  <input type="email" name="alternativeEmail" value={formData.alternativeEmail} onChange={handleChange} placeholder="Enter alternative email (optional)" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Identity & Address */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
                <MapPin className="w-4 h-4 text-[#f59e0b]" /> Identity & Address
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">ID Proof Type <span className="text-red-500">*</span></label>
                  <select name="idProofType" value={formData.idProofType} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal text-gray-800 outline-none hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors cursor-pointer">
                    <option value="">Select ID proof type</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">ID Proof Number <span className="text-red-500">*</span></label>
                  <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} required placeholder="Enter ID proof number" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 block">Address Line 1 <span className="text-red-500">*</span></label>
                <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required placeholder="House no., Building, Street" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 block">Address Line 2</label>
                <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} placeholder="Area, Landmark (optional)" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Country <span className="text-red-500">*</span></label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800" readOnly />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">State <span className="text-red-500">*</span></label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="Enter state" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">City <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Enter city" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Pincode <span className="text-red-500">*</span></label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Enter pincode" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
                <Briefcase className="w-4 h-4 text-[#f59e0b]" /> Additional Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Salaried, Business" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Company Name</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter company name" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Enter designation" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Annual Income (₹)</label>
                  <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="Enter annual income" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Source of Income</label>
                  <input type="text" name="sourceOfIncome" value={formData.sourceOfIncome} onChange={handleChange} placeholder="Select source" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700 block">Business Type</label>
                  <input type="text" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g. Proprietor, Pvt Ltd" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-normal outline-none text-gray-800 hover:border-gray-300 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Document Uploads - Phone & Touch Friendly */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
              <h3 className="font-semibold text-[#081326] text-sm flex items-center gap-2 mb-1 border-b border-gray-50 pb-3 sm:pb-4">
                <UploadCloud className="w-4 h-4 text-[#f59e0b]" /> Document Uploads
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">Photo (Optional)</label>
                  <input type="file" name="photoUrl" onChange={handleFileChange} className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer" accept="image/*" />
                </div>
                <div className="flex flex-col gap-1.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">PAN Card (PDF/Image) <span className="text-red-500">*</span></label>
                  <input type="file" name="panCardUrl" onChange={handleFileChange} required className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer" />
                </div>
                <div className="flex flex-col gap-1.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">Aadhaar/ID Proof (PDF/Image) <span className="text-red-500">*</span></label>
                  <input type="file" name="idProofUrl" onChange={handleFileChange} required className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer" />
                </div>
                <div className="flex flex-col gap-1.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">Address Proof (PDF/Image)</label>
                  <input type="file" name="addressProofUrl" onChange={handleFileChange} className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081326] file:text-white hover:file:bg-[#11203d] cursor-pointer" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-normal">Tip: You can take pictures directly from your mobile camera or upload from gallery.</p>
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                   <Info className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-xs sm:text-sm font-bold text-[#081326]">Important Note</p>
                   <p className="text-[11px] text-gray-500 font-normal">Please review all details before submitting.</p>
                 </div>
               </div>
               
               <div className="flex">
                 <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-[#081326] text-white rounded-xl text-sm font-bold hover:bg-[#11203d] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                   {loading ? 'Submitting...' : 'Submit Client Profile'} <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
            </div>

          </form>
        </div>

        {/* Right Sidebar (Client Preview & Help) */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6">
           {/* Quick Tips */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
             <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
               <div className="w-6 h-6 rounded bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100"><Check className="w-3.5 h-3.5" /></div> Quick Tips
             </h3>
             <ul className="flex flex-col gap-3 text-xs font-normal text-gray-600">
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Please fill all mandatory fields marked with <span className="text-red-500">*</span></li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Ensure the email and mobile number are valid</li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Upload clear images/PDFs of your documents</li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Review all details before final submission</li>
             </ul>
           </div>

           {/* Need Help */}
           <div className="bg-[#081326] rounded-2xl shadow-sm border border-[#11203d] p-6 text-white relative overflow-hidden group">
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/20 transition-all duration-500"></div>
             <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2 relative z-10">
               <HeadphonesIcon className="w-4 h-4 text-[#f59e0b]" /> Need Help?
             </h3>
             <p className="text-xs text-gray-400 font-normal mb-5 relative z-10 leading-relaxed">
               If you need any assistance while adding a client, our support team is here to help you.
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
