import React from 'react';
import { 
  Users, FolderOpen, ShieldCheck, MoreVertical, Plus, Upload, FileText, Download 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ClientOverviewChart, ClientsByStatusChart } from './Charts';

const StatsCard = ({ title, value, icon: Icon, trend, isPositive, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#f59e0b]/10 text-[#081326] shrink-0">
          <Icon className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs text-gray-500 font-medium mb-1 leading-tight">{title}</h4>
          <p className="text-xl font-bold text-[#081326] leading-none">{value}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-gray-600 shrink-0">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
    
    <div className="flex items-center gap-1.5 text-xs">
      <span className={isPositive ? "text-green-500 font-medium" : "text-gray-500 font-medium"}>
        {trend}
      </span>
      <span className="text-gray-400">
        from last month
      </span>
    </div>
  </div>
);

const RecentActivityItem = ({ icon: Icon, text, highlight, time }) => (
  <div className="flex gap-3 items-center py-3 border-b border-gray-50 last:border-0 first:pt-0 last:pb-0">
    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[#081326] stroke-[1.5]" />
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

const QuickActionButton = ({ icon: Icon, label }) => (
  <button className="flex flex-col items-center justify-center py-4 px-2 border border-gray-100 rounded-xl hover:border-[#f59e0b] hover:bg-[#f59e0b]/5 transition-colors group shadow-sm bg-white h-full">
    <Icon className="w-5 h-5 text-[#081326] group-hover:text-[#f59e0b] mb-2 transition-colors stroke-[1.5]" />
    <span className="text-[10px] xl:text-[11px] font-semibold text-[#081326] text-center leading-tight">{label}</span>
  </button>
);

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleRowClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header with Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChartIcon className="w-5 h-5 text-gray-500" /> Dashboard Overview
        </h2>
        <button className="bg-[#081326] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#11203d] transition-colors">
          <Download className="w-4 h-4" /> Export Report <ChevronDownIcon className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Clients" value="1,250" icon={Users} trend="↑ 18%" isPositive={true} />
        <StatsCard title="Documents Uploaded" value="3,480" icon={FolderOpen} trend="↑ 24%" isPositive={true} />
        <StatsCard title="CIVIL Scores Checked" value="2,150" icon={ShieldCheck} trend="↑ 12%" isPositive={true} />
      </div>

      {/* Charts & Activity Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px]">
          <ClientOverviewChart />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Activities</h3>
            <Link to="/clients" className="text-xs font-semibold text-[#081326] hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-0 scrollbar-hide">
            <RecentActivityItem icon={Users} text="New client Rahul Sharma added" highlight="Rahul Sharma" time="2 minutes ago" />
            <RecentActivityItem icon={FileText} text="Document PAN_Card.pdf uploaded by Neha Verma" highlight="PAN_Card.pdf" time="15 minutes ago" />
            <RecentActivityItem icon={ShieldCheck} text="CIVIL Score checked for Aman Enterprises" highlight="Aman Enterprises" time="1 hour ago" />
          </div>
        </div>
      </div>

      {/* Charts & Quick Actions Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientsByStatusChart />
        
        <div className="bg-white p-5 xl:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-[#081326] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3 flex-1">
            <QuickActionButton icon={Plus} label="Add Client" />
            <QuickActionButton icon={Upload} label="Upload Document" />
            <QuickActionButton icon={ShieldCheck} label="Check CIVIL Score" />
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
                <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick('CLT-00125')}>
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">Rahul Sharma</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">rahul.sharma@email.com</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">+91 98765 43210</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 22, 2025</td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick('CLT-00124')}>
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">Neha Verma</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">neha.verma@email.com</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">+91 91234 56789</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 22, 2025</td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick('CLT-00123')}>
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">Aman Enterprises</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">contact@amanenterprises.com</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">+91 99887 66554</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-md font-bold flex items-center gap-1.5 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Inactive
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 21, 2025</td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
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
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">PAN_Card.pdf</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">Neha Verma</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 22, 2025</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold w-fit">Verified</span>
                  </td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">Aadhar_Card.pdf</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">Rahul Sharma</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 22, 2025</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold w-fit">Verified</span>
                  </td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">Company_Reg.pdf</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">Aman Enterprises</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">May 21, 2025</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-md font-bold w-fit">Pending</span>
                  </td>
                  <td className="px-5 py-3.5 text-right"><button className="text-gray-400 hover:text-gray-800"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
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
