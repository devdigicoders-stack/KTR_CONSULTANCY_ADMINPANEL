import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans overflow-x-hidden">
      {/* Sidebar - responsive sliding drawer on mobile, fixed on desktop */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0 ml-0 lg:ml-64 lg:w-[calc(100%-256px)] flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        
        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

