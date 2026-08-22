import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, History, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Profile Information');
  const { user, setUser } = useAuth();
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await api.put('/admin/profile', {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });
      if (res.data.success) {
        setUser(res.data.data);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setProfileMessage({ type: '', text: '' });
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/admin/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password.' 
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
            <div className="w-20 h-20 rounded-full bg-[#081326] text-white flex items-center justify-center text-2xl font-bold shadow-lg uppercase">
              {user?.name ? user.name.substring(0, 2) : 'AD'}
            </div>
          </div>
          <h3 className="font-bold text-[#081326] text-base">{user?.name || 'Admin User'}</h3>
          <p className="text-xs text-gray-500 font-medium mb-4 capitalize">{user?.role || 'Admin'}</p>
          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Online
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
          {/* Internal Sidebar */}
          <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-50 p-6 flex flex-col gap-2">
            <button onClick={() => setActiveTab('Profile Information')} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors ${activeTab === 'Profile Information' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#081326]'}`}>
              <div className="flex items-center gap-3"><User className="w-4 h-4" /> Profile Information</div>
              {activeTab === 'Profile Information' && <ChevronRight className="w-4 h-4" />}
            </button>
            <button onClick={() => setActiveTab('Change Password')} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors ${activeTab === 'Change Password' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#081326]'}`}>
              <div className="flex items-center gap-3"><Lock className="w-4 h-4" /> Change Password</div>
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
                {profileMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg text-xs font-bold ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {profileMessage.text}
                  </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Full Name</label>
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Email Address</label>
                    <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Mobile Number</label>
                    <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Role</label>
                    <input type="text" disabled value={profileData.role} className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-lg px-4 py-2.5 text-xs font-medium outline-none capitalize" />
                  </div>
                  <div className="xl:col-span-2 mt-4">
                    <button onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Change Password' && (
              <div className="flex flex-wrap gap-10 xl:gap-14">
                <div className="flex-1 min-w-[260px] max-w-md">
                  <h3 className="font-bold text-[#081326] text-sm mb-6 whitespace-nowrap">Change Password</h3>
                  {passwordMessage.text && (
                    <div className={`mb-4 p-3 rounded-lg text-xs font-bold ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {passwordMessage.text}
                    </div>
                  )}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">Current Password</label>
                      <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">New Password</label>
                      <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-2 whitespace-nowrap">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:border-[#f59e0b]" />
                    </div>
                    <div className="pt-2">
                      <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors w-full sm:w-auto whitespace-nowrap disabled:opacity-50">
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
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
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><Check className="w-3.5 h-3.5 shrink-0" /> At least 8 characters long</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><Check className="w-3.5 h-3.5 shrink-0" /> One uppercase letter</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><Check className="w-3.5 h-3.5 shrink-0" /> One lowercase letter</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><Check className="w-3.5 h-3.5 shrink-0" /> One number</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><Check className="w-3.5 h-3.5 shrink-0" /> One special character</div>
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

const Check = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default Profile;
