import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, FileText, ShieldCheck, MessageSquare, Briefcase, 
  MoreVertical, Plus, Upload, Eye, FileSignature, Edit, Activity,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  OverallGrowthChart, AdminClientStatusChart 
} from './Charts';
import { IndiaMapWidget } from './IndiaMapWidget';
import api from '../../api/axios';

const StatsCard = ({ title, value, icon: Icon, trend, isPositive, iconColorClass }) => (
  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center gap-3 sm:gap-4 xl:gap-5 h-full hover:border-[#f59e0b]/40 transition-colors">
    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
    </div>
    <div className="flex flex-col items-start justify-center min-w-0">
      <h4 className="text-[11px] xl:text-xs text-gray-500 font-semibold mb-0.5 truncate">{title}</h4>
      <p className="text-xl sm:text-2xl xl:text-[26px] font-black text-[#081326] leading-none mb-1 tracking-tight">{value}</p>
      <div className="flex items-center text-[10px] font-semibold">
        <span className={isPositive ? "text-green-600" : (isPositive === false ? "text-red-500" : "text-gray-400")}>
          {trend}
        </span>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, path }) => (
  <Link to={path} className="flex flex-col items-center justify-center py-2.5 px-2 border border-gray-100/80 rounded-xl hover:border-[#081326] hover:bg-gray-50 transition-colors group shadow-xs bg-white h-full">
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#081326] mb-1 stroke-[1.8]" />
    <span className="text-[9px] xl:text-[10px] font-bold text-[#081326] text-center leading-[1.2] px-1" dangerouslySetInnerHTML={{ __html: label }}></span>
  </Link>
);


const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#f59e0b] border-t-transparent"></div></div>;
  }

  const { stats, clientStatus, documentStatus, latestClients, topServices, recentActivities, overallGrowth, clientLocations } = data;

  const getIconForType = (type) => {
    switch (type) {
      case 'Client': return { icon: UserPlus, color: 'bg-green-50 text-green-600', iconColor: 'bg-blue-50 text-blue-600' };
      case 'Document': return { icon: FileText, color: 'bg-blue-50 text-blue-600', iconColor: 'bg-orange-50 text-orange-600' };
      case 'CIBIL': return { icon: ShieldCheck, color: 'bg-purple-50 text-purple-600', iconColor: 'bg-purple-50 text-purple-600' };
      case 'Enquiry': return { icon: MessageSquare, color: 'bg-orange-50 text-orange-600', iconColor: 'bg-green-50 text-green-600' };
      case 'Service': return { icon: Briefcase, color: 'bg-green-50 text-green-600', iconColor: 'bg-blue-50 text-blue-600' };
      default: return { icon: Activity, color: 'bg-gray-50 text-gray-600', iconColor: 'bg-gray-50 text-gray-600' };
    }
  };

  const getServiceColor = (index) => {
    const colors = ["bg-[#081326]", "bg-[#f59e0b]", "bg-[#3b82f6]", "bg-[#10b981]", "bg-[#8b5cf6]"];
    return colors[index % colors.length];
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yrs ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mos ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hrs ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        <StatsCard title="Total Users" value={stats.totalUsers.value} icon={Users} trend={stats.totalUsers.trend.text} isPositive={stats.totalUsers.trend.isPositive} iconColorClass="bg-blue-50 text-blue-600" />
        <StatsCard title="Total Clients" value={stats.totalClients.value} icon={Users} trend={stats.totalClients.trend.text} isPositive={stats.totalClients.trend.isPositive} iconColorClass="bg-orange-50 text-orange-500" />
        <StatsCard title="Total Documents" value={stats.totalDocuments.value} icon={FileText} trend={stats.totalDocuments.trend.text} isPositive={stats.totalDocuments.trend.isPositive} iconColorClass="bg-purple-50 text-purple-600" />
        <StatsCard title="CIBIL Scores Checked" value={stats.cibilChecks.value} icon={ShieldCheck} trend={stats.cibilChecks.trend.text} isPositive={stats.cibilChecks.trend.isPositive} iconColorClass="bg-green-50 text-green-600" />
        <StatsCard title="Website Enquiries" value={stats.websiteEnquiries.value} icon={MessageSquare} trend={stats.websiteEnquiries.trend.text} isPositive={stats.websiteEnquiries.trend.isPositive} iconColorClass="bg-pink-50 text-pink-600" />
        <StatsCard title="Active Services" value={stats.activeServices.value} icon={Briefcase} trend={stats.activeServices.trend.text} isPositive={stats.activeServices.trend.isPositive} iconColorClass="bg-blue-50 text-blue-600" />
      </div>

      {/* Row 2: Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5">
        
        {/* Overall Growth Chart */}
        <div className="lg:col-span-2 xl:col-span-6 bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col min-h-[320px] sm:h-[350px]">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <h3 className="font-bold text-[#081326] text-sm sm:text-base">Overall Growth (6M)</h3>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#081326]"></div>
                  <span className="text-gray-600">Clients</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                  <span className="text-gray-600">Enquiries</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 -ml-4">
            <OverallGrowthChart data={overallGrowth} />
          </div>
        </div>

        {/* Client Status Donut */}
        <div className="lg:col-span-1 xl:col-span-3 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col min-h-[300px] sm:h-[350px]">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="font-bold text-[#081326] whitespace-nowrap text-sm sm:text-base">Client Status</h3>
            <select className="text-[10px] sm:text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none shrink-0 ml-1">
              <option>All Time</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <AdminClientStatusChart data={clientStatus} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 xl:col-span-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col min-h-[250px] sm:h-[350px]">
          <h3 className="font-bold text-[#081326] mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-2.5 flex-1">
            <QuickActionButton icon={UserPlus} label="+ Add Client" path="/clients/new" />
            <QuickActionButton icon={ShieldCheck} label="Check CIVIL" path="/cibil" />
            <QuickActionButton icon={Upload} label="Upload Docs" path="/documents" />
            <QuickActionButton icon={Plus} label="Add Service" path="/add-service" />
            <QuickActionButton icon={Users} label="Manage Users" path="/users" />
            <QuickActionButton icon={Activity} label="View Reports" path="/reports" />
          </div>
        </div>
      </div>


      {/* Row 3: Activity, Services, Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Recent Activities */}
        <div className="bg-white p-5 xl:p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="font-bold text-[#081326] text-sm xl:text-base">Recent Activities</h3>
          </div>
          <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-2" style={{maxHeight: '300px'}}>
            {recentActivities.map((activity, idx) => {
              const { icon: ActIcon, color, iconColor } = getIconForType(activity.type);
              return (
                <div key={idx} className="flex items-center gap-3 pb-3.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full ${iconColor} flex items-center justify-center shrink-0`}>
                    <ActIcon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#081326] leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: activity.text }}></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-medium text-gray-400 w-[45px] text-right">{getTimeAgo(activity.date)}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md w-14 text-center ${color}`}>{activity.type}</span>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && <p className="text-sm text-gray-500 text-center mt-4">No recent activities</p>}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white p-5 xl:p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="font-bold text-[#081326] text-sm xl:text-base">Top Services</h3>
            <Link to="/online-applications" className="text-[10px] font-bold text-[#081326] bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">View All</Link>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {topServices.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold text-[#081326] w-32 shrink-0 truncate" title={service.name}>{service.name}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${getServiceColor(idx)} rounded-full`} style={{ width: `${service.percent}%` }}></div>
                </div>
                <div className="flex items-center gap-1 w-14 shrink-0 justify-end">
                  <span className="text-[11px] font-bold text-[#081326]">{service.count}</span>
                  <span className="text-[9px] font-semibold text-gray-500">({service.percent}%)</span>
                </div>
              </div>
            ))}
            {topServices.length === 0 && <p className="text-sm text-gray-500 text-center mt-4">No services applied yet</p>}
          </div>
        </div>

        {/* Client Distribution Map */}
        <IndiaMapWidget data={clientLocations} />

      </div>

      {/* Row 4: Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Clients */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#081326]">Latest Clients</h3>
            <Link to="/clients" className="text-[10px] font-bold text-[#081326] bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100">View All</Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase">
                  <th className="px-5 py-3 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Email</th>
                  <th className="px-5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap">Added On</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
                {latestClients.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">
                      <Link to={`/clients/${row.id}`} className="hover:text-[#de9e48] transition-colors">{row.name}</Link>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">{row.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">{row.mob}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[9px] uppercase ${
                        row.status === 'Active' ? 'bg-green-100 text-green-700' :
                        row.status === 'Inactive' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium">{row.date}</td>
                  </tr>
                ))}
                {latestClients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">No clients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#081326]">Document Status Overview</h3>
            <Link to="/documents" className="text-[10px] font-bold text-[#081326] bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100">View All</Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase">
                  <th className="px-5 py-3 whitespace-nowrap">Type</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Total</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Verified</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Pending</th>
                  <th className="px-5 py-3 whitespace-nowrap text-right">Rejected</th>
                  <th className="px-5 py-3 whitespace-nowrap">Progress</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
                {documentStatus.map((doc, i) => {
                  let docIcon = FileText;
                  let docColor = 'text-green-500';
                  if (doc.name === 'PAN Cards') { docIcon = FileSignature; docColor = 'text-purple-500'; }
                  if (doc.name === 'ID Proofs') { docIcon = FileText; docColor = 'text-orange-500'; }
                  if (doc.name === 'Address Proofs') { docIcon = MapPin; docColor = 'text-blue-500'; }

                  return (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap flex items-center gap-2">
                        <docIcon className={`w-3.5 h-3.5 ${docColor}`} /> {doc.name}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-600">{doc.tot}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-500">{doc.ver}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-500">{doc.pen}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-500">{doc.rej}</td>
                      <td className="px-5 py-3.5 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-[#081326] h-1.5 rounded-full" style={{width: `${doc.prog}%`}}></div>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400">{doc.prog}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
