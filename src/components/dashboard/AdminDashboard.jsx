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

const StatsCard = ({ title, value, icon: Icon, trend, isPositive, iconColorClass }) => (
  <div className="bg-white p-5 rounded-[20px] border border-gray-100/80 shadow-sm flex items-center gap-4 xl:gap-5 h-full">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
      <Icon className="w-6 h-6 stroke-[1.5]" />
    </div>
    <div className="flex flex-col items-start justify-center">
      <h4 className="text-[11px] xl:text-xs text-[#081326] font-semibold mb-0.5">{title}</h4>
      <p className="text-2xl xl:text-[28px] font-bold text-[#081326] leading-none mb-1.5 tracking-tight">{value}</p>
      <div className="flex items-center text-[10px] font-medium">
        <span className={isPositive ? "text-green-600" : (isPositive === false ? "text-red-500" : "text-gray-400")}>
          {trend}
        </span>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label }) => (
  <button className="flex flex-col items-center justify-center py-3 px-2 border border-gray-100/80 rounded-xl hover:border-[#081326] hover:bg-gray-50 transition-colors group shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white h-full">
    <Icon className="w-5 h-5 xl:w-5 xl:h-5 text-[#081326] mb-1.5 stroke-[1.5]" />
    <span className="text-[9px] xl:text-[10px] font-bold text-[#081326] text-center leading-[1.2] px-1" dangerouslySetInnerHTML={{ __html: label }}></span>
  </button>
);


const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatsCard title="Total Users" value="28" icon={Users} trend="↑ 12% this month" isPositive={true} iconColorClass="bg-blue-50 text-blue-600" />
        <StatsCard title="Total Clients" value="1,250" icon={Users} trend="↑ 18% this month" isPositive={true} iconColorClass="bg-orange-50 text-orange-500" />
        <StatsCard title="Total Documents" value="3,480" icon={FileText} trend="↑ 24% this month" isPositive={true} iconColorClass="bg-purple-50 text-purple-600" />
        <StatsCard title="CIBIL Scores Checked" value="2,150" icon={ShieldCheck} trend="↑ 15% this month" isPositive={true} iconColorClass="bg-green-50 text-green-600" />
        <StatsCard title="Website Enquiries" value="320" icon={MessageSquare} trend="↑ 19% this month" isPositive={true} iconColorClass="bg-pink-50 text-pink-600" />
        <StatsCard title="Active Services" value="14" icon={Briefcase} trend="→ No change" isPositive={null} iconColorClass="bg-blue-50 text-blue-600" />
      </div>

      {/* Row 2: Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5">
        
        {/* Overall Growth Chart */}
        <div className="lg:col-span-2 xl:col-span-6 bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-6">
              <h3 className="font-bold text-[#081326]">Overall Growth</h3>
              <div className="flex items-center gap-4 text-[11px] font-bold">
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
            <div className="flex bg-gray-50 rounded-lg p-1">
              {['7D', '30D', '6M', '1Y'].map(period => (
                <button 
                  key={period}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-colors ${period === '30D' ? 'bg-white shadow-sm text-[#081326]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 -ml-4">
            <OverallGrowthChart />
          </div>
        </div>

        {/* Client Status Donut */}
        <div className="lg:col-span-1 xl:col-span-3 bg-white p-4 xl:p-5 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#081326] whitespace-nowrap text-sm xl:text-base">Client Status</h3>
            <select className="text-[10px] xl:text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none shrink-0 ml-1">
              <option>This Month</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <AdminClientStatusChart />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 xl:col-span-3 bg-white p-4 xl:p-5 rounded-[20px] border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col h-[350px]">
          <h3 className="font-bold text-[#081326] mb-5 text-sm xl:text-base">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 xl:gap-3 flex-1">
            <QuickActionButton icon={UserPlus} label="+ Add New<br/>Client" />
            <QuickActionButton icon={ShieldCheck} label="Check CIVIL<br/>Score" />
            <QuickActionButton icon={Upload} label="Upload<br/>Document" />
            <QuickActionButton icon={Plus} label="Add New<br/>Service" />
            <QuickActionButton icon={Users} label="Manage<br/>Users" />
            <QuickActionButton icon={Activity} label="View<br/>Reports" />
          </div>
        </div>
      </div>

      {/* Row 3: Activity, Services, Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Recent Activities */}
        <div className="bg-white p-5 xl:p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="font-bold text-[#081326] text-sm xl:text-base">Recent Activities</h3>
            <button className="text-[10px] font-bold text-[#081326] bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">View All</button>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {[
              { text: "New client <b>&quot;Rahul Sharma&quot;</b> added", time: "2 min ago", type: "Client", color: "bg-green-50 text-green-600", icon: UserPlus, iconColor: "bg-blue-50 text-blue-600" },
              { text: "Document <b>&quot;PAN_Card.pdf&quot;</b> uploaded", time: "15 min ago", type: "Document", color: "bg-blue-50 text-blue-600", icon: FileText, iconColor: "bg-orange-50 text-orange-600" },
              { text: "CIBIL Score checked for <b>&quot;Aman Ent.&quot;</b>", time: "1 hr ago", type: "CIBIL", color: "bg-purple-50 text-purple-600", icon: ShieldCheck, iconColor: "bg-purple-50 text-purple-600" },
              { text: "New enquiry from <b>&quot;Vikas Singh&quot;</b>", time: "2 hrs ago", type: "Enquiry", color: "bg-orange-50 text-orange-600", icon: MessageSquare, iconColor: "bg-green-50 text-green-600" },
              { text: "Service <b>&quot;Business Strategy&quot;</b> added", time: "3 hrs ago", type: "Service", color: "bg-green-50 text-green-600", icon: Briefcase, iconColor: "bg-blue-50 text-blue-600" },
              { text: "User <b>&quot;Priya Patel&quot;</b> joined as Manager", time: "5 hrs ago", type: "User", color: "bg-blue-50 text-blue-600", icon: Users, iconColor: "bg-blue-50 text-blue-600" }
            ].map((activity, idx) => {
              const ActIcon = activity.icon;
              return (
                <div key={idx} className="flex items-center gap-3 pb-3.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full ${activity.iconColor} flex items-center justify-center shrink-0`}>
                    <ActIcon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#081326] leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: activity.text }}></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-medium text-gray-400 w-[45px] text-right">{activity.time}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md w-14 text-center ${activity.color}`}>{activity.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white p-5 xl:p-6 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <h3 className="font-bold text-[#081326] text-sm xl:text-base">Top Services</h3>
            <button className="text-[10px] font-bold text-[#081326] bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">View All</button>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {[
              { name: "Business Strategy", count: 4, percent: 28, color: "bg-[#081326]" },
              { name: "Digital Transformation", count: 3, percent: 21, color: "bg-[#f59e0b]" },
              { name: "Operations Consulting", count: 2, percent: 14, color: "bg-[#3b82f6]" },
              { name: "Data & Analytics", count: 2, percent: 14, color: "bg-[#10b981]" },
              { name: "Risk Management", count: 2, percent: 14, color: "bg-[#8b5cf6]" },
              { name: "Others", count: 1, percent: 7, color: "bg-[#9ca3af]" },
            ].map((service, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold text-[#081326] w-32 shrink-0 truncate">{service.name}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${service.color} rounded-full`} style={{ width: `${service.percent}%` }}></div>
                </div>
                <div className="flex items-center gap-1 w-14 shrink-0 justify-end">
                  <span className="text-[11px] font-bold text-[#081326]">{service.count}</span>
                  <span className="text-[9px] font-semibold text-gray-500">({service.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Distribution Map */}
        <IndiaMapWidget />

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
                  <th className="px-5 py-3 whitespace-nowrap">#</th>
                  <th className="px-5 py-3 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Email</th>
                  <th className="px-5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap">Added On</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 divide-y divide-gray-50">
                {[
                  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@email.com', mob: '+91 98765 43210', status: 'Active', date: '22 May 2025' },
                  { id: 2, name: 'Neha Verma', email: 'neha.verma@email.com', mob: '+91 91234 56789', status: 'Active', date: '22 May 2025' },
                  { id: 3, name: 'Aman Enterprises', email: 'contact@amanent.com', mob: '+91 99887 66554', status: 'Inactive', date: '21 May 2025' },
                  { id: 4, name: 'Vikas Singh', email: 'vikas.singh@email.com', mob: '+91 90000 11111', status: 'Pending', date: '21 May 2025' },
                  { id: 5, name: 'Kavya Consulting', email: 'info@kavyaconsulting.com', mob: '+91 95555 12345', status: 'Active', date: '20 May 2025' },
                ].map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-400">{row.id}</td>
                    <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">{row.name}</td>
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Eye className="w-3.5 h-3.5 hover:text-[#081326] cursor-pointer" />
                        <Edit className="w-3.5 h-3.5 hover:text-[#081326] cursor-pointer" />
                        <MoreVertical className="w-3.5 h-3.5 hover:text-[#081326] cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#081326]">Document Status</h3>
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
                {[
                  { icon: FileSignature, color: 'text-purple-500', name: 'PAN Cards', tot: 850, ver: 680, pen: 120, rej: 50, prog: 80 },
                  { icon: FileText, color: 'text-orange-500', name: 'Aadhaar Cards', tot: 780, ver: 650, pen: 90, rej: 40, prog: 83 },
                  { icon: FileText, color: 'text-green-500', name: 'Address Proof', tot: 620, ver: 510, pen: 70, rej: 40, prog: 82 },
                  { icon: FileText, color: 'text-blue-500', name: 'Bank Statements', tot: 540, ver: 450, pen: 60, rej: 30, prog: 83 },
                  { icon: FileText, color: 'text-green-500', name: 'Others', tot: 690, ver: 560, pen: 80, rej: 50, prog: 81 },
                ].map((doc, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap flex items-center gap-2">
                       <doc.icon className={`w-3.5 h-3.5 ${doc.color}`} /> {doc.name}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
