import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, PlusSquare, Receipt, Sparkles } from 'lucide-react';

const PaymentsNavHeader = ({ activeTab = 'create-link' }) => {
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'create-link',
      name: 'Generate Payment Link',
      shortName: 'Payment Link',
      icon: CreditCard,
      path: '/payments/create',
      description: 'Online client payment links with gateway checkout',
    },
    {
      id: 'generate-invoice',
      name: 'Generate Invoice',
      shortName: 'Manual Invoice',
      icon: PlusSquare,
      path: '/payments/generate-invoice',
      description: 'Record Cash, UPI & Bank transfer collections',
    },
    {
      id: 'invoices',
      name: 'View Payments & Invoices',
      shortName: 'View Records',
      icon: Receipt,
      path: '/payments/invoices',
      description: 'Track gateway payments & manual collection history',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold text-[#f59e0b] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#f59e0b]" /> Financial Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#081326] tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create payment links, record manual collections (Cash/UPI/Bank), and track verified client invoices.
          </p>
        </div>
      </div>

      {/* 3 Clear Options Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/70">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#081326] shadow-sm border border-gray-200/80 font-bold'
                  : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 font-medium'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#081326] text-[#f59e0b] shadow-xs'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-400 font-bold">
                    0{idx + 1}.
                  </span>
                  <span className={`text-xs truncate ${isActive ? 'font-bold text-[#081326]' : 'font-semibold'}`}>
                    {tab.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5 hidden md:block line-clamp-1">
                  {tab.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentsNavHeader;
