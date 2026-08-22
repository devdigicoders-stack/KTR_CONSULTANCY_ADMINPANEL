import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const res = await api.get('/admin/profile');
          if (res.data.success) {
            setUser(res.data.data);
            setRole(res.data.data.role);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/admin/login', { email, password });
      
      if (res.data.success) {
        const adminData = res.data.data;
        setUser(adminData);
        setRole(adminData.role);
        
        // Store JWT token and partial user data
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('user', JSON.stringify(adminData));
        localStorage.setItem('role', adminData.role);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

