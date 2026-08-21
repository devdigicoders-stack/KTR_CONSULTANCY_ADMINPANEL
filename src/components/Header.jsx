import React, { useState, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Calendar, Clock, LogOut, Search, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (role === 'admin') {
    return (
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-gray-500 hover:text-[#081326]">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Live Date and Time */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-[#081326] bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-100">
              <Calendar className="w-4 h-4 text-[#f59e0b] stroke-[2]" />
              <span className="text-sm font-bold tracking-wide">{formatDate(currentDateTime)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#081326] bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-100">
              <Clock className="w-4 h-4 text-[#f59e0b] stroke-[2]" />
              <span className="text-sm font-bold tracking-wide w-[90px]">{formatTime(currentDateTime)}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center hidden md:flex mx-8">
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-gray-50 border border-gray-100 rounded-full pl-11 pr-16 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-gray-200 transition-colors" 
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md text-[10px] font-black text-gray-400 shadow-sm border border-gray-100 tracking-wider">
              Ctrl + /
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative text-gray-400 hover:text-[#081326] transition-colors">
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              6
            </span>
          </button>

          <div className="h-8 w-px bg-gray-100"></div>

          {/* Profile */}
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-10 h-10 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-all uppercase">
                {user?.name?.substring(0, 2) || 'AD'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[#081326] leading-none mb-1 group-hover:text-[#f59e0b] transition-colors">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-[11px] font-semibold text-gray-500 leading-none capitalize">
                  Super Administrator
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-1 transition-colors stroke-[2]" />
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-500 hover:text-[#081326]">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Live Date and Time */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-[#081326] bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-100">
            <Calendar className="w-4 h-4 text-[#f59e0b] stroke-[2]" />
            <span className="text-sm font-bold tracking-wide">{formatDate(currentDateTime)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#081326] bg-gray-50/50 px-4 py-2 rounded-lg border border-gray-100">
            <Clock className="w-4 h-4 text-[#f59e0b] stroke-[2]" />
            <span className="text-sm font-bold tracking-wide w-[90px]">{formatTime(currentDateTime)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-[#081326] transition-colors">
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            5
          </span>
        </button>

        <div className="h-8 w-px bg-gray-100"></div>

        {/* Profile */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-10 h-10 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-all uppercase">
              {user?.name?.substring(0, 2) || 'AU'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#081326] leading-none mb-1 group-hover:text-[#f59e0b] transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 leading-none capitalize">
                User
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-1 transition-colors stroke-[2]" />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
