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
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { role, logout } = useAuth();

  const allNavGroups = [
    {
      title: 'CLIENT & DATA',
      items: [
        { name: 'Clients', icon: Users, path: '/clients' },
        { name: 'Documents & Data', icon: FolderOpen, path: '/documents' },
        { name: 'CIBIL / Civil Score', icon: ShieldCheck, path: '/cibil' },
        { name: 'Credit Information', icon: FileText, path: '/credit-info' },
      ],
      roles: ['admin', 'user']
    },
    {
      title: 'SERVICES MANAGEMENT',
      items: [
        { name: 'Services', icon: Briefcase, path: '/services' },
        { name: 'Service Details', icon: FileText, path: '/service-details' },
        { name: 'Add / Edit Services', icon: PlusSquare, path: '/add-service' },
      ],
      roles: ['admin']
    },
    {
      title: 'ENQUIRIES & QUERIES',
      items: [
        { name: 'Enquiries', icon: MessageSquare, path: '/enquiries' },
        { name: 'Website Queries', icon: Globe, path: '/website-queries' },
      ],
      roles: ['admin']
    },
    {
      title: 'USERS & ROLES',
      items: [
        { name: 'Users & Roles', icon: UserCog, path: '/users' },
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
        { name: 'Profile', icon: User, path: '/profile' },
        // Show settings only for admin
        ...(role === 'admin' ? [{ name: 'Settings', icon: Settings, path: '/settings' }] : [])
      ],
      roles: ['admin', 'user']
    }
  ];

  // Filter groups based on current user role
  const navGroups = allNavGroups.filter(group => group.roles.includes(role));

  return (
    <aside className="w-64 bg-[#081326] h-screen flex flex-col fixed left-0 top-0 overflow-y-auto scrollbar-hide">
      {/* Logo */}
      <div className="p-6 sticky top-0 bg-[#081326] z-10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="KTR Consultants" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="px-4 pb-6 flex-1 flex flex-col gap-6">
        {/* Main Dashboard Link */}
        <Link 
          to="/" 
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
            <h4 className="text-gray-500 text-[10px] font-bold tracking-wider mb-3 px-4 uppercase">{group.title}</h4>
            <div className="flex flex-col gap-1">
              {group.items.map((item, itemIdx) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link 
                    key={itemIdx} 
                    to={item.path} 
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive ? 'bg-[#f59e0b] text-[#081326] font-bold shadow-md' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-[#081326]' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </div>
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
  );
};

export default Sidebar;
