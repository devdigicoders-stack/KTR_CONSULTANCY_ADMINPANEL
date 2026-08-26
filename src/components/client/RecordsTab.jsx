import { CheckCircle, FileText, Upload, Filter, Users } from 'lucide-react';

const RecordsTab = ({ client }) => {
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

  const records = (client?.records || []).map(r => {
    let type = 'default';
    if (r.action.includes('Created')) type = 'success-solid';
    else if (r.action.includes('Document')) type = 'info';
    else if (r.action.includes('CIBIL')) type = 'danger';
    else if (r.status === 'Failed') type = 'warning';

    return {
      title: r.action,
      desc: r.status,
      time: new Date(r.date).toLocaleString(),
      type
    };
  });

  return (
    <div className="flex flex-col xl:flex-row gap-10">
      {/* Timeline Section */}
      <div className="flex-1 relative flex flex-col pl-4 pt-4">
        
        <div className="flex-1 relative">
          {/* Vertical Line */}
          <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-gray-200 z-0"></div>
          
          <div className="relative border-l-2 border-gray-100 ml-4.5 space-y-8 pb-4">
            {records.length > 0 ? records.map((record, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute -left-[19px] top-0">
                  <TimelineIcon type={record.type} />
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group-hover:border-[#f59e0b] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-[#081326]">{record.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">{record.time}</span>
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">Status: <span className="font-bold text-gray-700">{record.desc}</span></p>
                </div>
              </div>
            )) : (
              <div className="pl-8 text-sm text-gray-500 font-medium">No activity records found.</div>
            )}
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
              <span className="text-xs font-bold text-[#081326]">{records.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Last Activity</span>
              <span className="text-[11px] font-bold text-[#081326]">{records.length > 0 ? records[0].time : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Added By</span>
              <span className="text-[11px] font-bold text-[#081326]">{client?.user?.name || 'Admin'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Assigned To</span>
              <span className="text-[11px] font-bold text-[#081326]">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsTab;
