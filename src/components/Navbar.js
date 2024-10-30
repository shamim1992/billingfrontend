import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, Search, ChevronDown, User, Lock, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { logout } from '../redux/slices/authSlice';

const Navbar = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
 
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    router.push('/auth/login'); // Redirect to the login page
  };

  const ProfileDropdown = () => (
    <div 
      className={`
        absolute right-0 top-full mt-2 w-64 rounded-lg  shadow-lg border
        transform transition-all duration-200 ease-in-out
        ${isProfileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-sm text-gray-900">{user ? user.name : ''}</div>
            <div className="text-xs text-gray-500">{user ? user.email : ''}</div>
          </div>
        </div>
      </div>

      <div className="p-2 text-sm">
        <Link href="/profile">
          <span className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer">
            <User size={18} />
            <span>View Profile</span>
          </span>
        </Link>
        
        <Link href="/change-password">
          <span className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer">
            <Lock size={18} />
            <span>Change Password</span>
          </span>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-30  border-b">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="hidden md:flex items-center gap-3 w-96">
            {/* <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <input type="checkbox" value="dark" className="toggle theme-controller" />
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          <div className="relative" ref={dropdownRef}>
            <button 
              className={`
                flex items-center gap-2 p-2 rounded-lg
                ${isProfileOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}
              `}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user ? user.name : 'Guest'}</div>
                <div className="text-xs text-gray-500 capitalize">{user ? user.role : ''}</div>
              </div>
              <ChevronDown 
                size={16} 
                className={`
                  text-gray-500 transition-transform duration-200
                  ${isProfileOpen ? 'rotate-180' : ''}
                `}
              />
            </button>

            <ProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
