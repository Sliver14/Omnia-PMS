// app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Topbar from '../dashboard/Topbar';
import BottomNav from '../components/shared/BottomNav'; // Import BottomNav

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar open={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main
          className={`flex-1 mt-16 transition-all duration-300 overflow-x-hidden ${ // Added overflow-x-hidden
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          } pb-16 sm:pb-0`}
        >
          <div className="p-4 sm:p-6 lg:p-8 pt-24">{children}</div>
        </main>
      </div>
      <BottomNav /> {/* Render BottomNav */}
    </div>
  );
}