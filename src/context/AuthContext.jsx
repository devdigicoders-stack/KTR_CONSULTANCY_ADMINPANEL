import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Hardcoded credentials for demonstration
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const userData = { email, name: 'Admin User' };
      setUser(userData);
      setRole('admin');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', 'admin');
      return { success: true };
    } else if (email === 'user@gmail.com' && password === 'user123') {
      const userData = { email, name: 'Regular User' };
      setUser(userData);
      setRole('user');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', 'user');
      return { success: true };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
