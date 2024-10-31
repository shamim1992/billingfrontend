import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, Receipt, PieChart, Settings, HelpCircle, Component } from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const { user } = useSelector((state) => state.auth);
  
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${user?.role}` },
    { name: 'Patients', icon: Users, path: '/patients' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Departments', icon: Component, path: '/departments' },
    { name: 'Appointments', icon: Calendar, path: '/appointments' },
    { name: 'Billing', icon: Receipt, path: '/billing' },
    { name: 'Reports', icon: PieChart, path: '/reports' },
  ];

  const bottomMenuItems = [
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Help', icon: HelpCircle, path: '/help' },
  ];

  return (
    <aside className={` bg-white
      fixed inset-y-0 left-0 z-50
      w-64 border-r
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      transition-transform duration-200 ease-in-out
      flex flex-col h-screen
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b sticky top-0 ">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-bold">ChanRe</span>
        </div>
      </div>

      {/* Main Menu - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setActiveItem(item.name)}
              >
                <span className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}>
                  <Icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Menu - Sticky Footer */}
      <div className="p-4 border-t sticky bottom-0 ">
        <div className="space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path}>
                <span className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;