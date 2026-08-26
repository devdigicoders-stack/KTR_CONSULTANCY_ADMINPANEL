import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, History, ChevronRight, CheckCircle, Smartphone } from 'lucide-react';
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
  
  // Notification State
  const [notificationData, setNotificationData] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newClientAlerts: true,
    documentAlerts: true
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    loginAlerts: true
  });
  
  // Logs State
  const [activityLogs, setActivityLogs] = useState([]);

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
    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        if (res.data.success) {
          const fetchedUser = res.data.data;
          // Refresh user context silently
          setUser(prev => ({...prev, ...fetchedUser}));
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile", err);
      }
    };
    fetchFreshProfile();
  }, [setUser]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      });
      if (user.notificationSettings) {
        setNotificationData(user.notificationSettings);
      }
      if (user.securitySettings) {
        setSecurityData(user.securitySettings);
      }
      if (user.activityLogs) {
        setActivityLogs([...user.activityLogs].reverse());
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (field) => {
    setNotificationData(prev => ({...prev, [field]: !prev[field]}));
  };

  const handleSecurityChange = (field) => {
    setSecurityData(prev => ({...prev, [field]: !prev[field]}));
  };

  const handleUpdateProfile = async (updateType = 'profile') => {
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        notificationSettings: notificationData,
        securitySettings: securityData
      };

      const res = await api.put('/admin/profile', payload);
      if (res.data.success) {
        setUser(res.data.data);
        if (updateType === 'profile') setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (updateType === 'settings') setProfileMessage({ type: 'success', text: 'Settings saved successfully!' });
      }
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update.' 
      });
    } finally {
      setIsUpdatingProfile(false);
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage({ type: '', text: '' });
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
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    }
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div 
      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
      onClick={onChange}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 max-w-[1400px] mx-auto pb-10">
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
            {[
              { id: 'Profile Information', icon: User },
              { id: 'Change Password', icon: Lock },
              { id: 'Notification Settings', icon: Bell },
              { id: 'Security Settings', icon: Shield },
              { id: 'Activity Logs', icon: History }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors ${activeTab === tab.id ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#081326]'}`}
              >
                <div className="flex items-center gap-3"><tab.icon className="w-4 h-4" /> {tab.id}</div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div className="flex-1 p-6 md:p-10 max-w-4xl">
            
            {/* Global Messages for Settings */}
            {profileMessage.text && activeTab !== 'Change Password' && activeTab !== 'Activity Logs' && (
              <div className={`mb-6 p-3 rounded-lg text-xs font-bold ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {profileMessage.text}
              </div>
            )}

            {activeTab === 'Profile Information' && (
              <div>
                <h3 className="font-bold text-[#081326] text-sm mb-6">Profile Information</h3>
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
                    <button onClick={() => handleUpdateProfile('profile')} disabled={isUpdatingProfile} className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
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

                <div className="w-full sm:w-64 shrink-0">
                  <h3 className="font-bold text-[#081326] text-xs mb-3">Password Tips</h3>
                  <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                    A strong password helps keep your account secure. Avoid using personal information.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> At least 8 characters long</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> One uppercase letter</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> One lowercase letter</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> One number</div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-500"><CheckCircle className="w-3.5 h-3.5 shrink-0" /> One special character</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notification Settings' && (
              <div className="max-w-2xl">
                <h3 className="font-bold text-[#081326] text-sm mb-2">Notification Preferences</h3>
                <p className="text-xs text-gray-500 font-medium mb-6">Choose how and when you want to be notified about activity in your dashboard.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[#081326] mb-1">Email Alerts</h4>
                      <p className="text-[11px] text-gray-500">Receive daily summaries and critical alerts via email.</p>
                    </div>
                    <ToggleSwitch checked={notificationData.emailAlerts} onChange={() => handleNotificationChange('emailAlerts')} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[#081326] mb-1">SMS Alerts</h4>
                      <p className="text-[11px] text-gray-500">Get text messages for important events (Standard rates apply).</p>
                    </div>
                    <ToggleSwitch checked={notificationData.smsAlerts} onChange={() => handleNotificationChange('smsAlerts')} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[#081326] mb-1">New Client Registration</h4>
                      <p className="text-[11px] text-gray-500">Notify me immediately when a new client registers.</p>
                    </div>
                    <ToggleSwitch checked={notificationData.newClientAlerts} onChange={() => handleNotificationChange('newClientAlerts')} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[#081326] mb-1">Document Uploads</h4>
                      <p className="text-[11px] text-gray-500">Notify me when clients upload new documents.</p>
                    </div>
                    <ToggleSwitch checked={notificationData.documentAlerts} onChange={() => handleNotificationChange('documentAlerts')} />
                  </div>
                  
                  <div className="mt-8 pt-4">
                    <button onClick={() => handleUpdateProfile('settings')} disabled={isUpdatingProfile} className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                      {isUpdatingProfile ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security Settings' && (
              <div className="max-w-2xl">
                <h3 className="font-bold text-[#081326] text-sm mb-2">Security Configurations</h3>
                <p className="text-xs text-gray-500 font-medium mb-6">Manage how you secure your admin account and monitor access.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between p-5 border border-gray-100 rounded-xl bg-orange-50/30">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#081326] mb-1">Two-Factor Authentication (2FA)</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed mb-2">Add an extra layer of security to your account. We will ask for a verification code when you log in.</p>
                        {!securityData.twoFactorEnabled ? (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Currently Disabled</span>
                        ) : (
                          <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded">Currently Enabled</span>
                        )}
                      </div>
                    </div>
                    <ToggleSwitch checked={securityData.twoFactorEnabled} onChange={() => handleSecurityChange('twoFactorEnabled')} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[#081326] mb-1">New Login Alerts</h4>
                      <p className="text-[11px] text-gray-500">Receive an email when someone logs in from a new device.</p>
                    </div>
                    <ToggleSwitch checked={securityData.loginAlerts} onChange={() => handleSecurityChange('loginAlerts')} />
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <button onClick={() => handleUpdateProfile('settings')} disabled={isUpdatingProfile} className="bg-[#f59e0b] hover:bg-[#d97706] text-[#081326] px-6 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                      {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Activity Logs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-[#081326] text-sm mb-1">Recent Activity</h3>
                    <p className="text-[11px] text-gray-500">Monitor all actions performed on your admin account.</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                  {activityLogs.length === 0 ? (
                    <div className="p-10 text-center">
                      <History className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">No recent activity found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {activityLogs.map((log, index) => (
                        <div key={index} className="p-4 flex items-start gap-4 hover:bg-white transition-colors">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                            <History className="w-3.5 h-3.5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-xs font-bold text-[#081326]">{log.action}</h4>
                              <span className="text-[10px] font-bold text-gray-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-1">{log.details}</p>
                            {log.ipAddress && (
                              <p className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded w-fit">IP: {log.ipAddress}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
