import React from 'react';

const OverviewTab = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#081326] mb-4 text-sm">Personal Information</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-bold text-[#081326]">Rahul Sharma</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Date of Birth</p>
              <p className="text-sm font-bold text-[#081326]">12 Jan 1990</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Gender</p>
              <p className="text-sm font-bold text-[#081326]">Male</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Mobile Number</p>
              <p className="text-sm font-bold text-[#081326]">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-bold text-[#081326]">rahul.sharma@email.com</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">PAN Number</p>
              <p className="text-sm font-bold text-[#081326]">ABCDE1234F</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Aadhaar Number</p>
              <p className="text-sm font-bold text-[#081326]">XXXX XXXX 1234</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Address</p>
              <p className="text-sm font-bold text-[#081326]">123, MG Road, New Delhi, Delhi - 110001</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#081326] mb-4 text-sm">Additional Information</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Occupation</p>
              <p className="text-sm font-bold text-[#081326]">Business</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Company Name</p>
              <p className="text-sm font-bold text-[#081326]">Rahul Traders Pvt. Ltd.</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Annual Income</p>
              <p className="text-sm font-bold text-[#081326]">₹ 25,00,000</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Source of Income</p>
              <p className="text-sm font-bold text-[#081326]">Business</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Assigned To</p>
              <p className="text-sm font-bold text-[#081326]">Aman Verma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-72 shrink-0 space-y-4">
        <h3 className="font-bold text-[#081326] text-sm mb-4 px-1">Quick Stats</h3>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight">Documents Uploaded</p>
            <p className="text-lg font-bold text-[#081326] leading-none mt-1">8</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight">CIVIL Score</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-bold text-[#081326] leading-none">782</p>
              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">↑ 14 points</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight">Credit Limit</p>
            <p className="text-lg font-bold text-[#081326] leading-none mt-1">₹ 5,00,000</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight">Total Enquiries</p>
            <p className="text-lg font-bold text-[#081326] leading-none mt-1">3</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight">Client Since</p>
            <p className="text-sm font-bold text-[#081326] leading-none mt-1">May 22, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
