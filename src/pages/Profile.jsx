import React, { useState } from 'react';
import { User, Lock, Bell, Shield, History, ChevronRight } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Change Password');

  return (
    <div className="flex flex-col space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-[#081326] flex items-center gap-2">
          {activeTab}
        </h2>
        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-1">
          <span className="hover:text-[#f59e0b] cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-[#f59e0b] cursor-pointer transition-colors">My Profile</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#081326]">{activeTab}</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Profile Sidebar */}
        <div className="w-full xl:w-[280px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-[#081326] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              AU
            </div>
          </div>
          <h3 className="font-bold text-[#081326] text-base">Admin User</h3>
          <p className="text-xs text-gray-500 font-medium mb-4">User</p>
          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Online
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
          
          {/* Internal Sidebar */}
          <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-50 p-6 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('Profile Information')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'Profile Information' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#081326]'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" /> Profile Information
              </div>
              {activeTab === 'Profile Information' && <ChevronRight className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setActiveTab('Change Password')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'Change Password' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#081326]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4" /> Change Password
              </div>
              {activeTab === 'Change Password' && <ChevronRight className="w-4 h-4" />}
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[#081326] transition-colors">
              <Bell className="w-4 h-4" /> Notification Settings
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[#081326] transition-colors">
              <Shield className="w-4 h-4" /> Security Settings
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[#081326] transition-colors">
              <History className="w-4 h-4" /> Activity Logs
            </button>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-6 md:p-10">
            
            {activeTab === 'Profile Information' && (
              <div>
                <h3 className="font-bold text-[#081326] text-sm mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Full Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Email Address</label>
                    <input type="email" defaultValue="admin@ktrconsultants.com" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Mobile Number</label>
                    <input type="text" defaultValue="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Role</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b] bg-white">
                      <option>User</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div className="xl:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Department</label>
                    <input type="text" defaultValue="Management" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div className="xl:col-span-2 mt-4">
                    <button className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors">
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Change Password' && (
              <div className="flex flex-wrap gap-10 xl:gap-14">
                <div className="flex-1 min-w-[260px] max-w-md">
                  <h3 className="font-bold text-[#081326] text-sm mb-6 whitespace-nowrap">Change Password</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">Current Password</label>
                      <div className="relative">
                        <input type="password" placeholder="Enter current password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                        <EyeIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">New Password</label>
                      <div className="relative">
                        <input type="password" placeholder="Enter new password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                        <EyeIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">Confirm New Password</label>
                      <div className="relative">
                        <input type="password" placeholder="Confirm new password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors w-full sm:w-auto whitespace-nowrap">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Tips Checklist */}
                <div className="w-full sm:w-64 shrink-0">
                  <h3 className="font-bold text-[#081326] text-xs mb-3">Password Tips</h3>
                  <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                    A strong password helps keep your account secure. Avoid using personal information.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <Check className="w-3.5 h-3.5 shrink-0" /> At least 8 characters long
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <Check className="w-3.5 h-3.5 shrink-0" /> One uppercase letter
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <Check className="w-3.5 h-3.5 shrink-0" /> One lowercase letter
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <Check className="w-3.5 h-3.5 shrink-0" /> One number
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500">
                      <Check className="w-3.5 h-3.5 shrink-0" /> One special character
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-center opacity-50">
                    <div className="w-20 h-24 bg-gray-100 rounded-xl relative border border-gray-200 overflow-hidden flex flex-col">
                      <div className="h-10 border-b border-gray-200 rounded-t-full w-12 mx-auto mt-2 -mb-2 border-4 bg-transparent"></div>
                      <div className="flex-1 bg-[#081326] rounded-t-md relative flex items-center justify-center">
                        <div className="w-2 h-4 bg-[#f59e0b] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icons
const EyeIcon = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Check = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default Profile;
