import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, ChevronDown, Calendar, Clock, LogOut, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const displayName = user?.name || (role === 'admin' ? 'Admin User' : 'Staff Member');
  const initials = user?.name ? user.name.substring(0, 2) : (role === 'admin' ? 'AD' : 'ST');
  const roleDisplay = role === 'admin' ? 'Super Administrator' : (user?.role || 'Staff');

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-3.5 sm:px-6 md:px-8 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger Menu Toggle Button (Mobile) */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-[#081326] hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
        
        {/* Live Date and Time */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#081326] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#f59e0b] stroke-[2]" />
            <span className="font-bold tracking-wide">{formatDate(currentDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#081326] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#f59e0b] stroke-[2]" />
            <span className="font-bold tracking-wide w-[70px]">{formatTime(currentDateTime)}</span>
          </div>
        </div>
      </div>

      {/* Search Bar - Desktop */}
      <div className="flex-1 justify-center hidden md:flex mx-6 max-w-md">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-full pl-10 pr-14 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#f59e0b] focus:bg-white transition-colors" 
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded text-[9px] font-bold text-gray-400 border border-gray-100">
            Ctrl + /
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notifications */}
        <button 
          className="relative p-2 rounded-xl text-gray-400 hover:text-[#081326] hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#f59e0b] text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {role === 'admin' ? 6 : 3}
          </span>
        </button>

        <div className="h-6 w-px bg-gray-200"></div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2.5 cursor-pointer group p-1 rounded-xl hover:bg-gray-50 transition-all select-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#081326] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 group-hover:ring-[#f59e0b]/50 transition-all uppercase shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#081326] leading-none mb-0.5 group-hover:text-[#f59e0b] transition-colors truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 leading-none capitalize truncate max-w-[120px]">
                {roleDisplay}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors stroke-[2]" />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-50 sm:hidden">
                <p className="text-xs font-bold text-[#081326]">{displayName}</p>
                <p className="text-[10px] text-gray-500 capitalize">{roleDisplay}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors cursor-pointer"
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

