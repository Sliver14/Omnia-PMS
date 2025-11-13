'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, Menu, Search, User, LogOut, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect
import Link from 'next/link';

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Topbar({ sidebarOpen, setSidebarOpen }: TopbarProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Effect for closing profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Effect for closing notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleLogout = () => {
    const isAdminRole = userRole === 'admin' || userRole === 'frontdesk';
    const callbackUrl = isAdminRole ? '/login' : '/staff/login';
    signOut({ callbackUrl });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button (hidden on large screens) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop sidebar toggle button (hidden on small screens) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block" // Visible only on large screens
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">
              HotelAdmin Pro
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
         
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                    <p className="font-medium text-sm">New booking received</p>
                    <p className="text-xs text-gray-600">Room 301 – John Doe</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50">
                    <p className="font-medium text-sm">Room 205 needs maintenance</p>
                    <p className="text-xs text-gray-600">Reported by housekeeping</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{session?.user?.name}</span>
                <span className="text-xs text-gray-500 capitalize">{userRole}</span>
              </div>
              <ChevronDown className="w-4 h-4 hidden md:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-2">
                  <Link
                    href="/dashboard/profile"
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>        </div>
      </div>
    </header>
  );
}