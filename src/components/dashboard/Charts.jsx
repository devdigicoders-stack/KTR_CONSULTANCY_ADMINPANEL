import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mock Data for Line Chart
const clientData = [
  { name: 'May 15', clients: 200 },
  { name: 'May 16', clients: 500 },
  { name: 'May 17', clients: 580 },
  { name: 'May 18', clients: 550 },
  { name: 'May 19', clients: 850 },
  { name: 'May 20', clients: 850 },
  { name: 'May 21', clients: 1100 },
  { name: 'May 22', clients: 1250 },
];

// Mock Data for Donut Charts
const servicesData = [
  { name: 'Business Strategy', value: 4, color: '#081326' },
  { name: 'Digital Transformation', value: 3, color: '#f59e0b' },
  { name: 'Operations Consulting', value: 2, color: '#9ca3af' },
  { name: 'Data & Analytics', value: 2, color: '#d1d5db' },
  { name: 'Others', value: 3, color: '#e5e7eb' },
];

const clientStatusData = [
  { name: 'Active', value: 800, color: '#081326' },
  { name: 'Inactive', value: 300, color: '#f59e0b' },
  { name: 'Pending', value: 150, color: '#d1d5db' },
];

export const ClientOverviewChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Client Overview</h3>
        <select className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>
      
      <div className="flex-1 w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={clientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="clients" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorClients)" 
              activeDot={{ r: 6, fill: '#081326', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ServicesOverviewChart = () => {
  return (
    <div className="bg-white p-5 xl:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="font-bold text-[#081326] mb-4">Services Overview</h3>
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="relative w-28 h-28 xl:w-32 xl:h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={servicesData}
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg xl:text-xl font-bold text-[#081326] leading-none">14</span>
            <span className="text-[8px] xl:text-[9px] text-gray-500 uppercase font-semibold mt-1">Total Services</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {servicesData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] xl:text-[11px] text-[#081326] truncate max-w-[80px] xl:max-w-[110px]">{item.name}</span>
              </div>
              <span className="text-[10px] xl:text-[11px] font-bold text-[#081326]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ClientsByStatusChart = () => {
  return (
    <div className="bg-white p-5 xl:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="font-bold text-[#081326] mb-4">Clients by Status</h3>
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="relative w-28 h-28 xl:w-32 xl:h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientStatusData}
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {clientStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg xl:text-xl font-bold text-[#081326] leading-none">1,250</span>
            <span className="text-[8px] xl:text-[9px] text-gray-500 uppercase font-semibold mt-1">Total Clients</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full px-1">
          {clientStatusData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-[11px] xl:text-xs text-[#081326]">{item.name}</span>
              </div>
              <span className="text-[11px] xl:text-xs font-bold text-[#081326]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const growthData = [
  { name: 'Apr 23', clients: 200, enquiries: 80 },
  { name: 'Apr 27', clients: 450, enquiries: 200 },
  { name: 'May 01', clients: 580, enquiries: 280 },
  { name: 'May 05', clients: 550, enquiries: 250 },
  { name: 'May 10', clients: 850, enquiries: 300 },
  { name: 'May 15', clients: 850, enquiries: 350 },
  { name: 'May 20', clients: 1250, enquiries: 550 },
];

export const OverallGrowthChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={growthData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorClientsGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#081326" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#081326" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorEnquiriesGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '500' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: '500' }} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
        />
        <Area 
          type="monotone" 
          dataKey="enquiries" 
          stroke="#f59e0b" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorEnquiriesGrowth)" 
          activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
        />
        <Area 
          type="monotone" 
          dataKey="clients" 
          stroke="#081326" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorClientsGrowth)" 
          activeDot={{ r: 5, fill: '#081326', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const adminClientStatusData = [
  { name: 'Active', value: 800, color: '#081326', percent: '64%' },
  { name: 'Inactive', value: 300, color: '#f59e0b', percent: '24%' },
  { name: 'Pending', value: 100, color: '#3b82f6', percent: '8%' },
  { name: 'Closed', value: 50, color: '#9ca3af', percent: '4%' },
];

export const AdminClientStatusChart = () => {
  return (
    <div className="flex flex-col items-center justify-between h-full w-full pt-1 pb-1">
      {/* Donut Chart */}
      <div className="relative w-32 h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 shrink-0 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={adminClientStatusData}
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {adminClientStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
          <span className="text-xl lg:text-2xl xl:text-[28px] font-bold text-[#081326] leading-none tracking-tight">1,250</span>
          <span className="text-[10px] lg:text-[11px] text-gray-500 font-semibold mt-1">Total Clients</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-col w-full gap-2.5 lg:gap-3">
        {adminClientStatusData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs font-semibold text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#081326]">{item.value}</span>
              <span className="text-[10px] font-medium text-gray-400 w-8 text-right">({item.percent})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
