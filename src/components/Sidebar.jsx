import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  ShieldCheck, 
  FileText, 
  User, 
  LogOut,
  Briefcase,
  PlusSquare,
  MessageSquare,
  Globe,
  UserCog,
  BarChart2,
  Settings,
  MapPin,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const location = useLocation();
  const { role, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [enquiryUnreadCount, setEnquiryUnreadCount] = useState(0);
  const [cibilCaseNewCount, setCibilCaseNewCount] = useState(0);
  const [caQuoteNewCount, setCaQuoteNewCount] = useState(0);
  const [chainDeedNewCount, setChainDeedNewCount] = useState(0);
  const [propAssessNewCount, setPropAssessNewCount] = useState(0);

  // Close sidebar on mobile whenever the route changes
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (role === 'admin') {
      const fetchPendingCount = async () => {
        try {
          const res = await api.get('/clients/pending/count');
          if (res.data.success) {
            setPendingCount(res.data.count);
          }
        } catch (error) {
          console.error("Error fetching pending count", error);
        }
      };
      fetchPendingCount();

      // Poll for pending applications in real-time every 15 seconds
      const fetchPendingApps = async () => {
        try {
          const res = await api.get('/applications/pending-count');
          if (res.data.success) setPendingAppsCount(res.data.count);
        } catch (e) {}
      };
      fetchPendingApps();
      const interval = setInterval(fetchPendingApps, 15000);

      // Poll for unread enquiries every 15 seconds
      const fetchEnquiryUnread = async () => {
        try {
          const res = await api.get('/enquiries/unread-count');
          if (res.data.success) setEnquiryUnreadCount(res.data.count);
        } catch (e) {}
      };
      fetchEnquiryUnread();
      const interval2 = setInterval(fetchEnquiryUnread, 15000);

      // Poll for new CIBIL cases every 15 seconds
      const fetchCibilNew = async () => {
        try {
          const res = await api.get('/cibil-cases/new-count');
          if (res.data.success) setCibilCaseNewCount(res.data.count);
        } catch (e) {}
      };
      fetchCibilNew();
      const interval3 = setInterval(fetchCibilNew, 15000);

      // Poll for new CA Quotes every 15 seconds
      const fetchCaQuotesNew = async () => {
        try {
          const res = await api.get('/ca-quotes/new-count');
          if (res.data.success) setCaQuoteNewCount(res.data.count);
        } catch (e) {}
      };
      fetchCaQuotesNew();
      const interval4 = setInterval(fetchCaQuotesNew, 15000);

      // Poll for new Chain Deeds every 15 seconds
      const fetchChainDeedsNew = async () => {
        try {
          const res = await api.get('/chain-deeds/new-count');
          if (res.data.success) setChainDeedNewCount(res.data.count);
        } catch (e) {}
      };
      fetchChainDeedsNew();
      const interval5 = setInterval(fetchChainDeedsNew, 15000);

      // Poll for new Property Assessments every 15 seconds
      const fetchPropAssessNew = async () => {
        try {
          const res = await api.get('/property-assessments/new-count');
          if (res.data.success) setPropAssessNewCount(res.data.count);
        } catch (e) {}
      };
      fetchPropAssessNew();
      const interval6 = setInterval(fetchPropAssessNew, 15000);

      return () => { 
        clearInterval(interval); 
        clearInterval(interval2); 
        clearInterval(interval3); 
        clearInterval(interval4); 
        clearInterval(interval5); 
        clearInterval(interval6); 
      };
    }
  }, [role, location.pathname]); // Refresh on route change to get updated counts

  const allNavGroups = [
    {
      title: 'USERS & ROLES',
      items: [
        { name: 'Users & Roles', icon: UserCog, path: '/users' },
      ],
      roles: ['admin']
    },
    {
      title: 'CLIENT & DATA',
      items: [
        { name: role === 'admin' ? 'Clients' : 'My Application', icon: Users, path: '/clients' },
        { name: 'Documents & Data', icon: FolderOpen, path: '/documents' },
        ...(role === 'admin' ? [
          { name: 'CIBIL / Civil Score', icon: ShieldCheck, path: '/cibil' },
          { name: 'CIBIL Case Submissions', icon: FileText, path: '/cibil-cases' },
        ] : [])
      ],
      roles: ['admin', 'staff']
    },
    {
      title: 'SERVICES MANAGEMENT',
      items: [
        { name: 'Services', icon: Briefcase, path: '/services' },
        { name: 'Service Details', icon: FileText, path: '/service-details' },
        { name: 'Add / Edit Services', icon: PlusSquare, path: '/add-service' },
        { name: 'Property Assessments & Maps', icon: MapPin, path: '/property-assessments' },
        { name: 'Property Legal (Chain Deed)', icon: FileText, path: '/chain-deeds' },
      ],
      roles: ['admin']
    },
    {
      title: 'ENQUIRIES & QUERIES',
      items: [
        { name: 'Online Applications', icon: FileText, path: '/online-applications' },
        { name: 'Enquiries', icon: MessageSquare, path: '/enquiries' },
        { name: 'Non-Approved Eligibility', icon: FileText, path: '/eligibility-checks' },
        { name: 'CA Quotes', icon: FileText, path: '/ca-quotes' },
      ],
      roles: ['admin']
    },
    {
      title: 'REPORTS & MONITORING',
      items: [
        { name: 'Reports', icon: BarChart2, path: '/reports' },
      ],
      roles: ['admin']
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', icon: User, path: '/profile' }
      ],
      roles: ['admin', 'staff']
    }
  ];

  // Filter groups based on current user role
  const navGroups = allNavGroups.filter(group => group.roles.includes(role));

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Dark Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 bg-[#081326]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside 
        className={`w-64 bg-[#081326] h-screen flex flex-col fixed left-0 top-0 overflow-y-auto scrollbar-hide z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo and Mobile Close button */}
        <div className="p-5 sm:p-6 sticky top-0 bg-[#081326] z-10 flex items-center justify-between border-b border-white/5">
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-3">
            <img src="/logo.png" alt="KTR Consultants" className="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="px-4 py-4 sm:pb-6 flex-1 flex flex-col gap-6">
          {/* Main Dashboard Link */}
          <Link 
            to="/" 
            onClick={handleNavClick}
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm ${
              location.pathname === '/' ? 'bg-[#f59e0b] text-[#081326] font-bold shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-4 h-4 ${location.pathname === '/' ? 'text-[#081326]' : 'text-gray-400'}`} />
              <span>Dashboard</span>
            </div>
          </Link>

          {/* Navigation Groups */}
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-gray-500 text-[10px] font-bold tracking-wider mb-2.5 px-4 uppercase">{group.title}</h4>
              <div className="flex flex-col gap-1">
                {group.items.map((item, itemIdx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={itemIdx} 
                      to={item.path} 
                      onClick={handleNavClick}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm ${
                        isActive ? 'bg-[#f59e0b] text-[#081326] font-bold shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-[#081326]' : 'text-gray-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Clients' && pendingCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {pendingCount}
                        </div>
                      )}
                      {item.name === 'Online Applications' && pendingAppsCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {pendingAppsCount}
                        </div>
                      )}
                      {item.name === 'Enquiries' && enquiryUnreadCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {enquiryUnreadCount}
                        </div>
                      )}
                      {item.name === 'CA Quotes' && caQuoteNewCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {caQuoteNewCount}
                        </div>
                      )}
                      {item.name === 'Property Assessments & Maps' && propAssessNewCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {propAssessNewCount}
                        </div>
                      )}
                      {item.name === 'Property Legal (Chain Deed)' && chainDeedNewCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {chainDeedNewCount}
                        </div>
                      )}
                      {item.name === 'CIBIL Case Submissions' && cibilCaseNewCount > 0 && role === 'admin' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {cibilCaseNewCount}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 mt-auto sticky bottom-0 bg-[#081326] border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold text-sm w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

