import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Search, FileText, Bell, MoreHorizontal, ArrowLeft } from 'lucide-react';

import OverviewTab from '../components/client/OverviewTab';
import DocumentsTab from '../components/client/DocumentsTab';
import RecordsTab from '../components/client/RecordsTab';
import CibilScoreTab from '../components/client/CibilScoreTab';
import CreditInfoTab from '../components/client/CreditInfoTab';
import ClientDashboardTab from '../components/client/ClientDashboardTab';

const ClientDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    'Overview',
    'Documents',
    'Records',
    'CIVIL Score',
    'Credit Information',
    'Client Dashboard',
    'Notes'
  ];

  const getHeaderInfo = () => {
    switch(activeTab) {
      case 'Overview': return { title: 'View Client-Wise Information', breadcrumb: 'Client Details' };
      case 'Documents': return { title: 'View Uploaded Documents/Data', breadcrumb: 'Documents & Data' };
      case 'Records': return { title: 'Track Client Records', breadcrumb: 'Track Records' };
      case 'CIVIL Score': return { title: 'Check & Display CIVIL Score', breadcrumb: 'CIVIL Score' };
      case 'Credit Information': return { title: 'View Basic Credit Information', breadcrumb: 'Credit Information' };
      case 'Client Dashboard': return { title: 'Client Data Dashboard', breadcrumb: 'Client Dashboard' };
      default: return { title: 'Client Details', breadcrumb: 'Client Details' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto">
      
      {/* Top Header Row with Breadcrumbs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-[#081326] flex items-center gap-2">
            {headerInfo.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mt-1">
            <Link to="/" className="hover:text-[#f59e0b] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/clients" className="hover:text-[#f59e0b] transition-colors">Clients</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#081326]">{headerInfo.breadcrumb}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search anything..." className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-medium outline-none bg-gray-50/50 focus:bg-white transition-colors" />
          </div>
          <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-sm">AU</div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold text-[#081326] leading-tight">Admin User</p>
              <p className="text-[9px] font-medium text-gray-500">User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Client Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#081326] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              RS
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#081326]">Rahul Sharma</h2>
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold flex items-center gap-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                </span>
              </div>
              <div className="flex gap-8 text-[11px] font-medium text-gray-500">
                <div>
                  <p className="text-gray-400 mb-0.5">Client ID</p>
                  <p className="text-[#081326] font-bold">{id || 'CLT-00125'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Added On</p>
                  <p className="text-[#081326] font-bold">May 22, 2025</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Assigned To</p>
                  <p className="text-[#081326] font-bold">Aman Verma</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="border border-gray-200 text-[#081326] px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
              Edit Client
            </button>
            <button className="bg-gray-50 text-[#081326] px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
              More Actions <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 md:px-8 border-t border-gray-50 flex gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-[#f59e0b]' 
                  : 'text-gray-400 hover:text-[#081326]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f59e0b] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Content Area */}
      <div className="flex-1">
        {activeTab === 'Overview' && <OverviewTab />}
        {activeTab === 'Documents' && <DocumentsTab />}
        {activeTab === 'Records' && <RecordsTab />}
        {activeTab === 'CIVIL Score' && <CibilScoreTab />}
        {activeTab === 'Credit Information' && <CreditInfoTab />}
        {activeTab === 'Client Dashboard' && <ClientDashboardTab />}
        {activeTab === 'Notes' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">Notes feature coming soon...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ClientDetails;
