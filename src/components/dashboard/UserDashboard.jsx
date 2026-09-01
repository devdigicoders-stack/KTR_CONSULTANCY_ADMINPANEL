import React, { useState, useEffect } from 'react';
import { 
  Users, FolderOpen, ShieldCheck, MoreVertical, Plus, Upload, FileText, Download, BarChart2, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClientOverviewChart, ClientsByStatusChart } from './Charts';
import api from '../../api/axios';

const StatsCard = ({ title, value, icon: Icon, trend, isPositive }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-[#f59e0b]/10 text-[#081326] shrink-0">
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-xs text-gray-500 font-medium mb-0.5 leading-tight truncate">{title}</h4>
          <p className="text-xl sm:text-2xl font-black text-[#081326] leading-none">{value}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600 shrink-0">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
    
    <div className="flex items-center gap-1.5 text-xs">
      <span className={isPositive ? "text-green-600 font-semibold" : "text-gray-500 font-medium"}>
        {trend}
      </span>
      <span className="text-gray-400 text-[11px]">
        from last month
      </span>
    </div>
  </div>
);

const RecentActivityItem = ({ icon: Icon, text, highlight, time }) => (
  <div className="flex gap-3 items-center py-3 border-b border-gray-50 last:border-0 first:pt-0 last:pb-0">
    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[#081326] stroke-[1.8]" />
    </div>
    <div className="flex-1 min-w-0 pr-2">
      <p className="text-xs text-gray-600 leading-relaxed truncate">
        {text.split(highlight).map((part, i, arr) => 
          i === arr.length - 1 ? part : <React.Fragment key={i}>{part}<span className="font-bold text-[#081326]">"{highlight}"</span></React.Fragment>
        )}
      </p>
    </div>
    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{time}</span>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center py-3.5 px-2 border border-gray-100 rounded-xl hover:border-[#f59e0b] hover:bg-[#f59e0b]/5 transition-colors group shadow-xs bg-white h-full cursor-pointer">
    <Icon className="w-5 h-5 text-[#081326] group-hover:text-[#f59e0b] mb-1.5 transition-colors stroke-[1.8]" />
    <span className="text-[10px] xl:text-[11px] font-bold text-[#081326] text-center leading-tight">{label}</span>
  </button>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDocuments: 0,
    totalCibilChecks: 0,
    clientOverview: [],
    clientsByStatus: [],
    recentActivities: [],
    latestClients: [],
    recentDocuments: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/clients/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleRowClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-[#081326] flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#f59e0b]" /> Dashboard Overview
        </h2>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        <StatsCard title="Total Clients" value={stats.totalClients} icon={Users} trend="↑ Active" isPositive={true} />
        <StatsCard title="Documents Uploaded" value={stats.totalDocuments} icon={FolderOpen} trend="↑ Uploaded" isPositive={true} />
      </div>

      {/* Charts & Activity Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 min-h-[300px] sm:h-[350px]">
          <ClientOverviewChart data={stats.clientOverview} />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col min-h-[280px] sm:h-[350px]">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="font-bold text-[#081326] text-sm sm:text-base">Recent Activities</h3>
            <Link to="/clients" className="text-xs font-semibold text-[#f59e0b] hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-0 scrollbar-hide">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act, i) => (
                <RecentActivityItem 
                  key={i}
                  icon={act.type === 'client' ? Users : act.type === 'document' ? FileText : ShieldCheck} 
                  text={act.text} 
                  highlight={act.highlight} 
                  time={new Date(act.time).toLocaleDateString()} 
                />
              ))
            ) : (
              <p className="text-xs text-gray-500 font-medium">No recent activities found.</p>
            )}
          </div>
        </div>
      </div>


      {/* Charts & Quick Actions Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientsByStatusChart data={stats.clientsByStatus} total={stats.totalClients} />
        
        <div className="bg-white p-5 xl:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-[#081326] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <QuickActionButton icon={Plus} label="Add Client" />
            <QuickActionButton icon={Upload} label="Upload Document" />
          </div>
        </div>
      </div>

      {/* Tables Row 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#081326]">Latest Clients</h3>
            <Link to="/clients" className="text-xs font-semibold text-[#081326] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-bold text-[#081326]">
                  <th className="px-5 py-3 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Email</th>
                  <th className="px-5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap">Added On</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
                {stats.latestClients && stats.latestClients.length > 0 ? (
                  stats.latestClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick(client._id)}>
                      <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">{client.name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{client.email}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{client.mobile}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`${client.status === 'Active' ? 'text-green-600 bg-green-50' : client.status === 'Inactive' ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'} px-2 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Active' ? 'bg-green-500' : client.status === 'Inactive' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-500 font-medium">No clients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#081326]">Recent Documents</h3>
            <Link to="/documents" className="text-xs font-semibold text-[#081326] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-bold text-[#081326]">
                  <th className="px-5 py-3 whitespace-nowrap">Document Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Uploaded On</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
                {stats.recentDocuments && stats.recentDocuments.length > 0 ? (
                  stats.recentDocuments.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">{doc.name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{doc.client}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">{new Date(doc.uploaded).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`${doc.status === 'Verified' ? 'text-green-600 bg-green-50' : doc.status === 'Rejected' ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'} px-2 py-1 rounded-md font-bold w-fit`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500 font-medium">No documents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

// Missing icons for Dashboard
const BarChartIcon = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const ChevronDownIcon = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default UserDashboard;
