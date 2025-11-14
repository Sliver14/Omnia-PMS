'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, Menu, User, LogOut, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useHotel } from '../context/HotelContext';

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Topbar({ sidebarOpen, setSidebarOpen }: TopbarProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const { hotelId, setHotelId } = useHotel();

  // --- Existing states ---
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // --- NEW: Hotel Switcher states ---
  const [hotelOpen, setHotelOpen] = useState(false);
  
  // TODO: Fetch hotels from the API
  const hotels = [
    { id: "clx1s2q5t000008l3g6f6e2z1", name: "Omnia Towers" },
    { id: "clx1s2q5t000108l3h2g2a2b2", name: "Omnia Hotels & Suites" },
    { id: "clx1s2q5t000208l3f6g6e2z3", name: "Omnia Court" },
    { id: "clx1s2q5t000308l3h2g2a2b4", name: "Omnia Castle" },
  ];
  const hotelRef = useRef<HTMLDivElement>(null);

  const selectedHotel = hotels.find(h => h.id === hotelId) || hotels[0];

  useEffect(() => {
    if (!hotelId) {
      setHotelId(hotels[0].id);
    }
  }, [hotelId, setHotelId, hotels]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationsOpen]);

  // NEW: Close hotel dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (hotelRef.current && !hotelRef.current.contains(e.target as Node)) {
        setHotelOpen(false);
      }
    };
    if (hotelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [hotelOpen]);

  const handleLogout = () => {
    const isAdminRole = userRole === 'admin' || userRole === 'frontdesk';
    const callbackUrl = isAdminRole ? '/login' : '/staff/login';
    signOut({ callbackUrl });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Left section */}
        <div className="flex items-center space-x-4">

          {/* Mobile toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>

          {/* Logo + Hotel Switcher */}
          <div className="relative flex items-center space-x-2" ref={hotelRef}>
            
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Omnia Hotels</span>
            </Link>

            {/* Hotel Switcher button */}
            <button
              onClick={() => setHotelOpen(!hotelOpen)}
              className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 border border-gray-300 ml-2"
            >
              <span className="text-sm">{selectedHotel.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Hotel dropdown */}
            {hotelOpen && (
              <div className="absolute top-12 left-32 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-50">
                {hotels.map((hotel) => (
                  <button
                    key={hotel.id}
                    onClick={() => {
                      setHotelId(hotel.id);
                      setHotelOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {hotel.name}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Section */}
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
                    <p className="text-xs text-gray-600">Room 301 — John Doe</p>
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
          </div>

        </div>
      </div>
    </header>
  );
}
