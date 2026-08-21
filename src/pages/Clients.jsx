import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Users, UserCheck, UserMinus, Folder, FileWarning, Upload, History, Database,
  Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  MoreVertical, Download, FileText, CheckCircle, X, ArrowRight, RefreshCcw, LayoutDashboard
} from 'lucide-react';

const statCards = [
  { icon: Users, title: "Total Clients", value: "1,250", trend: "↑ 18% from last month", iconColor: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-100" },
  { icon: UserCheck, title: "Active Clients", value: "800", trend: "64% of total clients", iconColor: "text-green-600", bg: "bg-green-50", borderColor: "border-green-100" },
  { icon: UserMinus, title: "Inactive Clients", value: "300", trend: "24% of total clients", iconColor: "text-orange-500", bg: "bg-orange-50", borderColor: "border-orange-100" },
  { icon: Folder, title: "Total Documents", value: "3,480", trend: "↑ 24% from last month", iconColor: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-100" },
  { icon: FileWarning, title: "Pending Documents", value: "520", trend: "15% of total documents", iconColor: "text-orange-500", bg: "bg-orange-50", borderColor: "border-orange-100" }
];

const clientsData = [
  { id: 'CLT-00125', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', mobile: '+91 98765 43210', status: 'Active', addedOn: 'May 22, 2025', assignedTo: 'Aman Verma' },
  { id: 'CLT-00124', name: 'Neha Verma', email: 'neha.verma@email.com', mobile: '+91 91234 56789', status: 'Active', addedOn: 'May 22, 2025', assignedTo: 'Vikas Singh' },
  { id: 'CLT-00123', name: 'Aman Enterprises', email: 'contact@amanenterprises.com', mobile: '+91 99887 66554', status: 'Inactive', addedOn: 'May 21, 2025', assignedTo: 'Rahul Sharma' },
  { id: 'CLT-00122', name: 'Vikas Singh', email: 'vikas.singh@email.com', mobile: '+91 90000 11111', status: 'Pending', addedOn: 'May 21, 2025', assignedTo: 'Neha Verma' },
  { id: 'CLT-00121', name: 'Kavya Consulting', email: 'info@kavyaconsulting.com', mobile: '+91 95555 12345', status: 'Active', addedOn: 'May 20, 2025', assignedTo: 'Aman Verma' },
];

const documentsData = [
  { name: 'PAN Card', category: 'Identity Proof', file: 'PAN_Card.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
  { name: 'Aadhaar Card', category: 'Identity Proof', file: 'Aadhaar_Card.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
  { name: 'Address Proof', category: 'Address Proof', file: 'Address_Proof.pdf', uploaded: 'May 22, 2025', status: 'Verified' },
  { name: 'Bank Statement', category: 'Financial Document', file: 'Bank_Statement_May.pdf', uploaded: 'May 21, 2025', status: 'Pending' },
  { name: 'ITR Document', category: 'Financial Document', file: 'ITR_2024.pdf', uploaded: 'May 20, 2025', status: 'Rejected' },
];

const recordsTimeline = [
  { title: "Client Created", desc: "Client profile has been created.", time: "May 22, 2025\n10:30 AM", type: "success" },
  { title: "Documents Uploaded", desc: "5 documents uploaded by admin.", time: "May 22, 2025\n10:45 AM", type: "info" },
  { title: "CIBIL Score Checked", desc: "CIBIL score checked and updated.", time: "May 22, 2025\n11:15 AM", type: "warning" },
  { title: "Profile Updated", desc: "Client information updated.", time: "May 22, 2025\n11:30 AM", type: "primary" },
  { title: "Documents Verified", desc: "3 documents verified by admin.", time: "May 22, 2025\n12:00 PM", type: "success" },
];

const StatusBadge = ({ status, isDoc }) => {
  const styles = {
    Active: "text-green-600 bg-green-50",
    Inactive: "text-orange-500 bg-orange-50",
    Pending: isDoc ? "text-orange-500 bg-orange-50" : "text-blue-500 bg-blue-50",
    Verified: "text-green-600 bg-green-50",
    Rejected: "text-red-500 bg-red-50"
  };
  const dotColor = {
    Active: "bg-green-500",
    Inactive: "bg-orange-500",
    Pending: "bg-blue-500"
  };

  return (
    <span className={`${styles[status] || 'text-gray-600 bg-gray-50'} px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1.5 w-fit text-[11px]`}>
      {!isDoc && dotColor[status] && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`}></span>}
      {status}
    </span>
  );
};

const TimelineIcon = ({ type }) => {
  switch(type) {
    case 'success': return <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-green-500" /></div>;
    case 'info': return <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0"><Upload className="w-3.5 h-3.5 text-blue-500" /></div>;
    case 'warning': return <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-orange-500" /></div>;
    case 'primary': return <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0"><Users className="w-3.5 h-3.5 text-purple-500" /></div>;
    default: return <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0"><FileText className="w-3.5 h-3.5 text-gray-500" /></div>;
  }
};

const Clients = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('All Clients');
  const [showPreview, setShowPreview] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [previewTab, setPreviewTab] = React.useState('Overview');

  const handleRowClick = (client) => {
    setSelectedClient(client);
    setShowPreview(true);
  };

  const tabs = ['All Clients', 'Active Clients', 'Inactive Clients', 'Pending Clients'];
  const previewTabs = ['Overview', 'Documents (12)', 'CIBIL Score', 'Credit Info', 'History'];

  return (
    <div className="flex gap-6 relative items-start h-full pb-8">
      
      {/* Main Content Area */}
      <div className={`flex flex-col space-y-6 transition-all duration-300 flex-1 min-w-0 ${showPreview ? 'xl:w-[70%]' : 'w-full'}`}>
        
        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#f59e0b] hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center shrink-0 border ${card.borderColor}`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor} stroke-[2]`} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-0.5">{card.title}</p>
                <h4 className="text-2xl font-black text-[#081326] leading-none mb-1">{card.value}</h4>
                <p className="text-[10px] font-bold text-gray-500 mt-2">{card.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {/* Tabs & Top Actions */}
          <div className="border-b border-gray-50 flex justify-between items-center px-2 flex-wrap gap-4 bg-gray-50/30">
            <div className="flex gap-2 p-2">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-[#f59e0b] shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-[#081326] hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pr-2">
              <button 
                onClick={() => navigate('/clients/new')}
                className="bg-[#081326] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#11203d] transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" /> Add New Client
              </button>
              <button className="bg-white text-[#081326] border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                <Upload className="w-4 h-4 stroke-[2.5]" /> Import Clients
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-5 border-b border-gray-50 flex gap-4 flex-wrap items-center bg-white">
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-600 outline-none w-36 bg-white hover:border-gray-300 transition-colors cursor-pointer appearance-none shadow-sm">
              <option>All Status</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-600 outline-none w-40 bg-white hover:border-gray-300 transition-colors cursor-pointer appearance-none shadow-sm">
              <option>All Assigned To</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-600 outline-none w-40 bg-white hover:border-gray-300 transition-colors cursor-pointer appearance-none shadow-sm">
              <option>All Client Types</option>
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input type="text" placeholder="Search client..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-bold outline-none hover:border-gray-300 focus:border-[#f59e0b] transition-colors shadow-sm" />
            </div>
            <button className="bg-[#081326] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4 stroke-[2.5]" /> Filters
            </button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
              <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-black text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap w-10">
                    <input type="checkbox" className="rounded border-gray-300 text-[#081326] focus:ring-[#081326]" />
                  </th>
                  <th className="px-5 py-4 whitespace-nowrap">Client ID</th>
                  <th className="px-5 py-4 whitespace-nowrap">Client Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Email</th>
                  <th className="px-5 py-4 whitespace-nowrap">Mobile</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 whitespace-nowrap">Assigned To</th>
                  <th className="px-5 py-4 whitespace-nowrap">Added On</th>
                  <th className="px-5 py-4 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-gray-600 divide-y divide-gray-50">
                {clientsData.map((client, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300 text-[#081326] focus:ring-[#081326]" />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-blue-600 font-bold cursor-pointer" onClick={() => handleRowClick(client)}>{client.id}</td>
                    <td className="px-5 py-3.5 font-bold text-[#081326] whitespace-nowrap">{client.name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{client.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-700">{client.mobile}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={client.status} isDoc={false} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                        {client.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-700">{client.assignedTo}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-500">{client.addedOn}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleRowClick(client)} className="text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4 stroke-[2]" /></button>
                        <button className="text-gray-400 hover:text-[#f59e0b] transition-colors"><Edit className="w-4 h-4 stroke-[2]" /></button>
                        <button className="text-gray-400 hover:text-gray-800 transition-colors"><MoreVertical className="w-4 h-4 stroke-[2]" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-white flex-wrap gap-4">
            <span className="text-xs text-gray-500 font-bold">Showing 1 to 10 of 1,250 entries</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#081326] text-[#081326] font-black bg-gray-50 text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-xs hover:bg-gray-50 transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-xs hover:bg-gray-50 transition-colors">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-xs hover:bg-gray-50 transition-colors">4</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-xs hover:bg-gray-50 transition-colors">5</button>
              <span className="text-gray-400 px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 font-bold bg-white text-xs hover:bg-gray-50 transition-colors">125</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              <select className="ml-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 outline-none bg-white cursor-pointer hover:border-gray-300 transition-colors">
                <option>10 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
           {/* Chart placeholder 1 */}
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-black text-[#081326] text-sm mb-6">Clients by Status</h3>
             <div className="flex-1 flex items-center justify-center">
                {/* Simulated Donut Chart */}
                <div className="relative w-32 h-32 rounded-full border-[12px] border-blue-500 border-r-green-500 border-b-orange-500 border-l-green-500 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-black text-[#081326]">1,250</p>
                    <p className="text-[9px] font-bold text-gray-400">Total Clients</p>
                  </div>
                </div>
             </div>
             <div className="flex flex-col gap-3 mt-6">
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</div>
                  <div className="text-[#081326]">800 <span className="text-gray-400">(64%)</span></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-gray-500"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Inactive</div>
                  <div className="text-[#081326]">300 <span className="text-gray-400">(24%)</span></div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Pending</div>
                  <div className="text-[#081326]">150 <span className="text-gray-400">(12%)</span></div>
                </div>
             </div>
           </div>

           {/* Documents Overview */}
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-black text-[#081326] text-sm mb-6">Documents Overview</h3>
             <div className="flex flex-col gap-6 flex-1 justify-center">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                       <CheckCircle className="w-4 h-4 text-green-500 stroke-[2]" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Verified Documents</span>
                  </div>
                  <div className="text-xs font-black text-[#081326]">2,760 <span className="text-gray-400 font-bold">(79%)</span></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                       <FileWarning className="w-4 h-4 text-orange-500 stroke-[2]" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Pending Documents</span>
                  </div>
                  <div className="text-xs font-black text-[#081326]">520 <span className="text-gray-400 font-bold">(15%)</span></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                       <X className="w-4 h-4 text-red-500 stroke-[2]" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Rejected Documents</span>
                  </div>
                  <div className="text-xs font-black text-[#081326]">200 <span className="text-gray-400 font-bold">(06%)</span></div>
                </div>
             </div>
             <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 mb-1">Total Documents</p>
                <p className="text-lg font-black text-[#081326]">3,480</p>
             </div>
           </div>

           {/* Top Clients by Services */}
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-black text-[#081326] text-sm mb-6">Top Clients by Services</h3>
             <div className="flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 pb-2 border-b border-gray-50 uppercase tracking-wider">
                  <span>Client Name</span>
                  <span>Services Count</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#081326]">Rahul Sharma</span>
                  <span className="text-gray-600 w-8 text-center bg-gray-50 rounded py-0.5">8</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#081326]">Aman Enterprises</span>
                  <span className="text-gray-600 w-8 text-center bg-gray-50 rounded py-0.5">6</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#081326]">Neha Verma</span>
                  <span className="text-gray-600 w-8 text-center bg-gray-50 rounded py-0.5">5</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#081326]">Vikas Singh</span>
                  <span className="text-gray-600 w-8 text-center bg-gray-50 rounded py-0.5">4</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#081326]">Kavya Consulting</span>
                  <span className="text-gray-600 w-8 text-center bg-gray-50 rounded py-0.5">4</span>
                </div>
             </div>
             <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-[#081326] hover:bg-gray-50 transition-colors">View All Clients</button>
           </div>

           {/* Recent Enquiries */}
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-black text-[#081326] text-sm mb-6">Recent Enquiries</h3>
             <div className="flex flex-col gap-4 flex-1">
                {[
                  { name: 'Vikas Singh', service: 'Digital Transformation', time: '10 min ago' },
                  { name: 'Neha Verma', service: 'Business Strategy', time: '25 min ago' },
                  { name: 'Aman Enterprises', service: 'Operations Consulting', time: '45 min ago' },
                  { name: 'GreenTech Pvt. Ltd.', service: 'Data & Analytics', time: '1 hour ago' }
                ].map((enq, i) => (
                  <div key={i} className="flex justify-between items-start gap-2">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                         {enq.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-[#081326] leading-none mb-1">{enq.name}</p>
                         <p className="text-[10px] font-bold text-gray-500">Service: {enq.service}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap pt-0.5">{enq.time}</span>
                  </div>
                ))}
             </div>
             <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-[#081326] hover:bg-gray-50 transition-colors">View All Enquiries</button>
           </div>
        </div>
      </div>

      {/* Client Preview Sidebar Overlay */}
      {showPreview && selectedClient && (
        <div className="w-[30%] bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-[104px] overflow-hidden flex flex-col h-[calc(100vh-120px)] animate-in slide-in-from-right-8 duration-300 z-10 hidden xl:flex">
          
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-[#081326] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#f59e0b] stroke-[2.5]" /> Client Details
            </h3>
            <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-800 transition-colors bg-white p-1 rounded-md border border-gray-200 shadow-sm">
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          
          <div className="p-6 border-b border-gray-50 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#081326] text-white flex items-center justify-center text-2xl font-black shadow-lg mb-4">
              {selectedClient.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 justify-center mb-2">
              <h2 className="text-lg font-black text-[#081326]">{selectedClient.name}</h2>
              <StatusBadge status={selectedClient.status} isDoc={false} />
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-500">
               <span className="flex items-center gap-2 justify-center"><Folder className="w-3.5 h-3.5" /> {selectedClient.email}</span>
               <span className="flex items-center gap-2 justify-center"><Folder className="w-3.5 h-3.5" /> {selectedClient.mobile}</span>
               <span className="flex items-center gap-2 justify-center"><Folder className="w-3.5 h-3.5" /> {selectedClient.id}</span>
            </div>
          </div>

          <div className="flex gap-2 p-4 border-b border-gray-50 overflow-x-auto scrollbar-hide shrink-0">
             {previewTabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded text-[11px] font-bold transition-all ${
                    previewTab === tab 
                    ? 'text-[#f59e0b] border-b-2 border-[#f59e0b]' 
                    : 'text-gray-500 hover:text-[#081326]'
                  }`}
                >
                  {tab}
                </button>
             ))}
          </div>

          <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
             {previewTab === 'Overview' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-black text-[#081326]">Personal Information</h4>
                      <button className="px-3 py-1 text-[10px] font-bold border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Full Name</p>
                         <p className="text-xs font-bold text-[#081326]">{selectedClient.name}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Date of Birth</p>
                         <p className="text-xs font-bold text-[#081326]">12 Jan 1990</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Gender</p>
                         <p className="text-xs font-bold text-[#081326]">Male</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">PAN Number</p>
                         <p className="text-xs font-bold text-[#081326]">ABCDE1234F</p>
                       </div>
                       <div className="col-span-2">
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Aadhaar Number</p>
                         <p className="text-xs font-bold text-[#081326]">XXXX XXXX 1234</p>
                       </div>
                       <div className="col-span-2">
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Address</p>
                         <p className="text-xs font-bold text-[#081326] leading-relaxed">123, MG Road, New Delhi, Delhi - 110001</p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-black text-[#081326]">Additional Information</h4>
                      <button className="px-3 py-1 text-[10px] font-bold border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Occupation</p>
                         <p className="text-xs font-bold text-[#081326]">Business</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Company Name</p>
                         <p className="text-xs font-bold text-[#081326]">Rahul Traders Pvt. Ltd.</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Annual Income</p>
                         <p className="text-xs font-bold text-[#081326]">₹ 25,00,000</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Source of Income</p>
                         <p className="text-xs font-bold text-[#081326]">Business</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Referred By</p>
                         <p className="text-xs font-bold text-[#081326]">Website</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-gray-400 font-bold mb-0.5">Assigned To</p>
                         <p className="text-xs font-bold text-[#081326]">{selectedClient.assignedTo}</p>
                       </div>
                    </div>
                  </div>
                </div>
             )}
          </div>
          
          <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50 shrink-0">
             <button className="flex-1 py-2.5 border border-[#081326] text-[#081326] rounded-lg text-xs font-black hover:bg-gray-50 transition-colors shadow-sm">
               View Full Profile
             </button>
             <button className="flex-1 py-2.5 bg-[#f59e0b] text-white rounded-lg text-xs font-black hover:bg-[#d97706] transition-colors shadow-sm">
               Client Dashboard
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
