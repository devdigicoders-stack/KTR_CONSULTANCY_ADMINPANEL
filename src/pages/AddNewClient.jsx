import React, { useState } from 'react';
import { 
  ChevronRight, Calendar, User, CreditCard, Building2, 
  MapPin, Phone, Mail, Briefcase, Camera, Info, HeadphonesIcon, Check, Users
} from 'lucide-react';

const AddNewClient = () => {
  return (
    <div className="flex flex-col gap-6 relative h-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-[#081326]">Add New Client</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className="hover:text-[#081326] cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500">Client's personal, contact, and business information</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start flex-1 w-full">
        {/* Main Content Area */}
        <div className="flex flex-col space-y-6 flex-1 min-w-0 w-full xl:w-[70%]">
          
          {/* Stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm border-2 border-white ring-2 ring-[#f59e0b]/20">1</div>
              <span className="text-xs font-black text-[#081326] whitespace-nowrap">Personal & Contact</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-100 mx-4 min-w-[50px]"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">2</div>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Additional Info</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-100 mx-4 min-w-[50px]"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">3</div>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Documents & Data</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-100 mx-4 min-w-[50px]"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">4</div>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Review & Submit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
              <h3 className="font-black text-[#081326] text-sm flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
                <User className="w-4 h-4 text-[#f59e0b]" /> Personal Information
              </h3>
              
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter full name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Date of Birth <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" placeholder="dd/mm/yyyy" className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                    <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Gender <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select gender</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">PAN Number <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter PAN number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors uppercase" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Aadhaar Number</label>
                  <input type="text" placeholder="Enter Aadhaar number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                     <select className="px-2 py-2.5 bg-gray-50 border border-gray-100 rounded-l-lg text-xs font-bold text-gray-600 outline-none border-r-0">
                       <option>+91</option>
                     </select>
                     <input type="text" placeholder="Enter mobile number" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-r-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="Enter email address" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Alternative Email</label>
                  <input type="email" placeholder="Enter alternative email (optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Identity & Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
              <h3 className="font-black text-[#081326] text-sm flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
                <MapPin className="w-4 h-4 text-[#f59e0b]" /> Identity & Address
              </h3>
              
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">ID Proof Type <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select ID proof type</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">ID Proof Number <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter ID proof number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#081326]">Address Line 1 <span className="text-red-500">*</span></label>
                <input type="text" placeholder="House no., Building, Street" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#081326]">Address Line 2</label>
                <input type="text" placeholder="Area, Landmark (optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Country <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-[#081326] outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>India</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">State <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select state</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">City <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select city</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5 max-w-[31.5%]">
                  <label className="text-[11px] font-bold text-[#081326]">Pincode <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter pincode" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 md:col-span-2">
              <h3 className="font-black text-[#081326] text-sm flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
                <Briefcase className="w-4 h-4 text-[#f59e0b]" /> Additional Information
              </h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Occupation</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select occupation</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Company Name</label>
                  <input type="text" placeholder="Enter company name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Designation</label>
                  <input type="text" placeholder="Enter designation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Annual Income (₹)</label>
                  <input type="text" placeholder="Enter annual income" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Source of Income</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select source</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Business Type</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select business type</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Years in Business</label>
                  <input type="text" placeholder="Enter years (optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Website</label>
                  <input type="text" placeholder="Enter website (optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Reference Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 md:col-span-2">
              <h3 className="font-black text-[#081326] text-sm flex items-center gap-2 mb-2 border-b border-gray-50 pb-4">
                <Users className="w-4 h-4 text-[#f59e0b]" /> Reference Information (Optional)
              </h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Referred By</label>
                  <input type="text" placeholder="Enter referrer name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Referrer Mobile</label>
                  <input type="text" placeholder="Enter mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Relationship</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors appearance-none cursor-pointer">
                    <option>Select relationship</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#081326]">Notes</label>
                  <input type="text" placeholder="Enter any notes (optional)" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none hover:border-gray-200 focus:border-[#f59e0b] focus:bg-white transition-colors" />
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="col-span-1 md:col-span-2 flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                   <Info className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-xs font-black text-[#081326]">Important Note</p>
                   <p className="text-[10px] text-gray-500 font-bold">You can upload client documents and related data in the next step.</p>
                 </div>
               </div>
               
               <div className="flex gap-4">
                 <button className="px-6 py-2.5 border border-gray-200 bg-white text-[#081326] rounded-xl text-xs font-black hover:bg-gray-50 transition-colors shadow-sm">
                   Cancel
                 </button>
                 <button className="px-6 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-black hover:bg-[#11203d] transition-colors shadow-sm flex items-center gap-2">
                   Save & Next <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar (Client Preview & Help) */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6">
           
           {/* Client Preview Card */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
             <div className="p-5 border-b border-gray-50 bg-gray-50/30">
               <h3 className="font-black text-[#081326] text-sm">Client Preview</h3>
             </div>
             
             <div className="p-8 border-b border-gray-50 flex flex-col items-center text-center">
               <div className="w-24 h-24 rounded-full bg-gray-50 border border-dashed border-gray-300 text-gray-400 flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-100 hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all">
                 <Camera className="w-6 h-6 mb-1" />
                 <span className="text-[10px] font-bold">Upload Photo</span>
               </div>
               <h2 className="text-lg font-black text-[#081326] mb-1">Client Name</h2>
               <div className="w-6 h-[2px] bg-[#f59e0b] rounded mb-3"></div>
               <span className="px-3 py-1 bg-green-50 text-green-600 rounded-md font-bold text-[10px] border border-green-100">
                 New Client
               </span>
             </div>

             <div className="p-6 flex flex-col gap-4">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold">Client ID</span>
                 <span className="font-black text-[#081326]">—</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold">Mobile</span>
                 <span className="font-black text-[#081326]">—</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold">Email</span>
                 <span className="font-black text-[#081326]">—</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold">Status</span>
                 <span className="font-black text-green-500">Active</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-400 font-bold">Added On</span>
                 <span className="font-black text-[#081326]">—</span>
               </div>
             </div>
           </div>

           {/* Quick Tips */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
             <h3 className="font-black text-[#081326] text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
               <div className="w-6 h-6 rounded bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100"><Check className="w-3.5 h-3.5" /></div> Quick Tips
             </h3>
             <ul className="flex flex-col gap-3 text-xs font-bold text-gray-500">
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Please fill all mandatory fields marked with <span className="text-red-500">*</span></li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Ensure the email and mobile number are valid</li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> You can upload documents in the next step</li>
               <li className="flex gap-2 items-start"><Check className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" /> Review all details before final submission</li>
             </ul>
           </div>

           {/* Need Help */}
           <div className="bg-[#081326] rounded-2xl shadow-sm border border-[#11203d] p-6 text-white relative overflow-hidden group">
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/20 transition-all duration-500"></div>
             <h3 className="font-black text-white text-sm flex items-center gap-2 mb-2 relative z-10">
               <HeadphonesIcon className="w-4 h-4 text-[#f59e0b]" /> Need Help?
             </h3>
             <p className="text-[11px] text-gray-400 font-bold mb-5 relative z-10 leading-relaxed">
               If you need any assistance while adding a client, our support team is here to help you.
             </p>
             <button className="w-full bg-white/10 hover:bg-white text-white hover:text-[#081326] transition-colors rounded-xl py-2.5 text-xs font-black flex justify-center items-center gap-2 relative z-10 shadow-sm border border-white/20">
               <HeadphonesIcon className="w-4 h-4" /> Contact Support
             </button>
           </div>
           
        </div>
      </div>
    </div>
  );
};

export default AddNewClient;
