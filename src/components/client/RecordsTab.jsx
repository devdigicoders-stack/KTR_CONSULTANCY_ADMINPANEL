import React from 'react';
import { CheckCircle, FileText, Upload, Filter, Users } from 'lucide-react';

const RecordsTab = () => {
  const TimelineIcon = ({ type, color }) => {
    switch(type) {
      case 'success-solid': return <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0 shadow-sm z-10 relative"><CheckCircle className="w-4 h-4 text-white" /></div>;
      case 'info': return <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm z-10 relative"><Upload className="w-4 h-4 text-slate-600" /></div>;
      case 'danger': return <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 shadow-sm z-10 relative border border-red-100"><FileText className="w-4 h-4 text-red-500" /></div>;
      case 'warning': return <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 shadow-sm z-10 relative border border-orange-100"><CheckCircle className="w-4 h-4 text-orange-500" /></div>;
      case 'primary': return <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 shadow-sm z-10 relative border border-blue-100"><Users className="w-4 h-4 text-blue-600" /></div>;
      case 'success': return <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0 shadow-sm z-10 relative border border-green-100"><CheckCircle className="w-4 h-4 text-green-500" /></div>;
      default: return <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm z-10 relative border border-indigo-100"><FileText className="w-4 h-4 text-indigo-500" /></div>;
    }
  };

  const records = [
    { title: "Client Created", desc: "Admin", time: "May 22, 2025 10:30 AM", type: "success-solid" },
    { title: "Documents Uploaded", desc: "Admin", time: "May 22, 2025 10:45 AM", type: "info" },
    { title: "CIVIL Score Checked", desc: "System", time: "May 22, 2025 11:15 AM", type: "danger" },
    { title: "Basic Credit Information Viewed", desc: "System", time: "May 22, 2025 11:20 AM", type: "warning" },
    { title: "Service Enquiry Submitted", desc: "Client", time: "May 22, 2025 01:10 PM", type: "warning" },
    { title: "Record Updated", desc: "Admin", time: "May 22, 2025 02:30 PM", type: "primary" },
    { title: "Note Added", desc: "Admin", time: "May 22, 2025 03:45 PM", type: "default" },
    { title: "Documents Verified", desc: "Admin", time: "May 23, 2025 09:10 AM", type: "success" },
    { title: "Status Updated", desc: "Admin", time: "May 23, 2025 09:30 AM", type: "success-solid" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-10">
      {/* Timeline Section */}
      <div className="flex-1 relative flex flex-col pl-4 pt-4">
        
        <div className="flex-1 relative">
          {/* Vertical Line */}
          <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-gray-200 z-0"></div>
          
          <div className="space-y-8">
            {records.map((record, idx) => (
              <div key={idx} className="flex gap-6 items-start group">
                <TimelineIcon type={record.type} />
                <div className="flex-1 pt-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#081326]">{record.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">{record.desc}</p>
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                    {record.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Filter + Record Summary Box */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 items-end">
        
        <button className="bg-[#081326] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#11203d] transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>

        <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.03)] border border-gray-100 p-8 w-full">
          <h3 className="font-bold text-[#081326] text-sm mb-8">Record Summary</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Total Activities</span>
              <span className="text-xs font-bold text-[#081326]">9</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Last Activity</span>
              <span className="text-[11px] font-bold text-[#081326]">May 23, 2025 09:30 AM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Added By</span>
              <span className="text-[11px] font-bold text-[#081326]">Admin User</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Assigned To</span>
              <span className="text-[11px] font-bold text-[#081326]">Aman Verma</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsTab;
