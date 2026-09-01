import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Activity, Users, FileText, CheckSquare, Briefcase } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // today, week, month, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let query = '';
      const now = new Date();
      let start = new Date();
      let end = new Date();

      if (dateRange === 'today') {
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
      } else if (dateRange === 'week') {
        start.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        start.setMonth(now.getMonth() - 1);
      } else if (dateRange === 'custom') {
        if (!customStart || !customEnd) {
          setLoading(false);
          return; // Wait for both dates
        }
        start = new Date(customStart);
        end = new Date(customEnd);
        end.setHours(23,59,59,999);
      }

      query = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

      const res = await fetch(`${BACKEND_URL}/reports${query}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const summaryData = [
      ['Category', 'Count'],
      ['Total Clients', reportData.summary.clients],
      ['Online Applications', reportData.summary.applications],
      ['Enquiries', reportData.summary.enquiries],
      ['Cibil Cases', reportData.summary.cibilCases],
      ['CA Quotes', reportData.summary.caQuotes],
      ['Chain Deeds', reportData.summary.chainDeeds],
      ['Property Assessments', reportData.summary.propertyAssessments],
      ['Eligibility Checks', reportData.summary.eligibilityChecks],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + summaryData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KTR_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartData = () => {
    if (!reportData) return [];
    return [
      { name: 'Clients', count: reportData.summary.clients },
      { name: 'Applications', count: reportData.summary.applications },
      { name: 'Enquiries', count: reportData.summary.enquiries },
      { name: 'CIBIL', count: reportData.summary.cibilCases },
      { name: 'CA Quotes', count: reportData.summary.caQuotes },
      { name: 'Chain Deeds', count: reportData.summary.chainDeeds },
      { name: 'Assessments', count: reportData.summary.propertyAssessments },
      { name: 'Eligibility', count: reportData.summary.eligibilityChecks },
    ];
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    setDateRange('custom');
    fetchReportData();
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-[#de9e48]" size={26} />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Comprehensive overview of all business activities</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={!reportData || loading}
          className="flex items-center gap-2 bg-[#020d1c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <button onClick={() => setDateRange('today')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${dateRange === 'today' ? 'bg-[#f59e0b] text-[#081326]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Today</button>
            <button onClick={() => setDateRange('week')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${dateRange === 'week' ? 'bg-[#f59e0b] text-[#081326]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Last 7 Days</button>
            <button onClick={() => setDateRange('month')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${dateRange === 'month' ? 'bg-[#f59e0b] text-[#081326]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Last 30 Days</button>
            <button onClick={() => setDateRange('custom')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${dateRange === 'custom' ? 'bg-[#f59e0b] text-[#081326]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Custom Date</button>
          </div>
          
          {dateRange === 'custom' && (
            <form onSubmit={handleCustomDateSubmit} className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <Calendar size={14} className="text-gray-400" />
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} required className="bg-transparent text-sm text-gray-700 outline-none" />
                <span className="text-gray-400 text-sm">to</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} required className="bg-transparent text-sm text-gray-700 outline-none" />
              </div>
              <button type="submit" className="bg-[#020d1c] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800">Apply</button>
            </form>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f59e0b] border-t-transparent"></div>
        </div>
      ) : reportData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="New Clients" count={reportData.summary.clients} icon={Users} color="text-blue-500" bg="bg-blue-50" />
            <StatCard title="Applications" count={reportData.summary.applications} icon={CheckSquare} color="text-green-500" bg="bg-green-50" />
            <StatCard title="Enquiries" count={reportData.summary.enquiries} icon={FileText} color="text-purple-500" bg="bg-purple-50" />
            <StatCard title="CIBIL Cases" count={reportData.summary.cibilCases} icon={Activity} color="text-red-500" bg="bg-red-50" />
            <StatCard title="CA Quotes" count={reportData.summary.caQuotes} icon={Briefcase} color="text-yellow-500" bg="bg-yellow-50" />
            <StatCard title="Chain Deeds" count={reportData.summary.chainDeeds} icon={FileText} color="text-indigo-500" bg="bg-indigo-50" />
            <StatCard title="Assessments" count={reportData.summary.propertyAssessments} icon={FileText} color="text-pink-500" bg="bg-pink-50" />
            <StatCard title="Eligibility Checks" count={reportData.summary.eligibilityChecks} icon={CheckSquare} color="text-teal-500" bg="bg-teal-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Volume Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#de9e48" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getChartData().filter(d => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getChartData().filter(d => d.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">Failed to load reports data.</div>
      )}
    </div>
  );
};

const StatCard = ({ title, count, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default Reports;
