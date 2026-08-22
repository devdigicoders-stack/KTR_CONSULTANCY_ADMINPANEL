import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, UserPlus, Mail, Phone, Shield, Search, X, Edit, Trash2, Eye, ToggleLeft, ToggleRight, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { role, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', role: 'user' });
    setFormMessage({ type: '', text: '' });
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone, password: '', role: user.role });
    setFormMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage({ type: '', text: '' });

    try {
      const res = await api.post('/admin/users', formData);
      if (res.data.success) {
        setFormMessage({ type: 'success', text: 'User created successfully!' });
        resetForm();
        fetchUsers();
        setTimeout(() => setShowAddModal(false), 1500);
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage({ type: '', text: '' });

    try {
      // Don't send empty password if it wasn't updated
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      const res = await api.put(`/admin/users/${selectedUser._id}`, updateData);
      if (res.data.success) {
        setFormMessage({ type: 'success', text: 'User updated successfully!' });
        fetchUsers();
        setTimeout(() => setShowEditModal(false), 1500);
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update user.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      const res = await api.delete(`/admin/users/${selectedUser._id}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 font-bold">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative h-full pb-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[#081326] flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-[#f59e0b]" />
            Users & Roles
          </h2>
          <p className="text-xs font-bold text-gray-400">Manage admin and user accounts</p>
        </div>
        
        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-[#081326] hover:bg-[#0a1830] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#f59e0b]" />
          Add New User
        </button>
      </div>

      {/* Stats/Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-black text-[#081326]">{users.length}</p>
          </div>
          <div className="w-[1px] h-8 bg-gray-100"></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admins</p>
            <p className="text-xl font-black text-[#081326]">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="w-[1px] h-8 bg-gray-100"></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
            <p className="text-xl font-black text-green-600">{users.filter(u => u.status === 'active').length}</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-xs font-medium text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-xs font-medium text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#081326]">{user.name} {user._id === currentUser?._id && <span className="text-[10px] text-[#f59e0b] ml-1">(You)</span>}</p>
                          <p className="text-[10px] font-medium text-gray-400">ID: {user._id.substring(user._id.length - 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          user.role === 'admin' 
                            ? 'bg-[#f59e0b]/10 text-[#d97706]' 
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          user.status === 'active' 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {user.status || 'active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                          title="View" 
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEdit(user)}
                          title="Edit" 
                          className="p-1.5 text-gray-400 hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user._id !== currentUser?._id && (
                          <>
                            <button 
                              onClick={() => toggleStatus(user)}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'} 
                              className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                            >
                              {user.status === 'active' ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                              title="Delete" 
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#081326]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-[#081326] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#f59e0b]" />
                Add New User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-[#081326] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {formMessage.text && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${formMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {formMessage.text}
                </div>
              )}
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" placeholder="Enter email address" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Phone Number</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" placeholder="Enter phone number" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" placeholder="Create a password" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Role</label>
                  <div className="relative">
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all appearance-none">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDownIcon /></div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-[#081326] bg-[#f59e0b] hover:bg-[#d97706] transition-colors disabled:opacity-50">
                    {formLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#081326]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-[#081326] flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#f59e0b]" />
                Edit User
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-[#081326] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {formMessage.text && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${formMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {formMessage.text}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Phone Number</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span></label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all" placeholder="Enter new password" />
                </div>
                {selectedUser?._id !== currentUser?._id && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Role</label>
                    <div className="relative">
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] focus:bg-white transition-all appearance-none">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDownIcon /></div>
                    </div>
                  </div>
                )}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-[#081326] bg-[#f59e0b] hover:bg-[#d97706] transition-colors disabled:opacity-50">
                    {formLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-[#081326]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-[#081326] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#f59e0b]" />
                User Details
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-[#081326] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-xl uppercase shadow-md mb-3">
                  {selectedUser.name.substring(0, 2)}
                </div>
                <h4 className="font-black text-[#081326] text-lg">{selectedUser.name}</h4>
                <p className="text-xs font-medium text-gray-500 capitalize flex items-center gap-1.5 mt-1">
                  <Shield className="w-3.5 h-3.5" />
                  {selectedUser.role} • {selectedUser.status || 'active'}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-sm font-bold text-[#081326] flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> {selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-[#081326] flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> {selectedUser.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Joined On</p>
                    <p className="text-sm font-bold text-[#081326]">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
                    <p className="text-sm font-bold text-[#081326]">{selectedUser._id.substring(selectedUser._id.length - 8)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-[#081326]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-[#081326] text-lg mb-2">Delete User?</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">
                Are you sure you want to delete <span className="font-bold text-[#081326]">{selectedUser.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ChevronDownIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

export default Users;
