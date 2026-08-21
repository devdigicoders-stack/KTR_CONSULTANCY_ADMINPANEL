import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';

const Dashboard = () => {
  const { role } = useAuth();
  
  if (role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
};

export default Dashboard;
