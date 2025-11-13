'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import { Home, Bed, Calendar, Users, Wrench, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react'; // Added ChevronLeft, ChevronRight
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import type { Room } from '../types/room';

interface NavItem {
  icon: ElementType;
  label: string;
  href: string;
  badge?: string | number;
  badgeClassName?: string;
}

interface SidebarProps {
  open: boolean;
  setSidebarOpen: (open: boolean) => void; // Added setSidebarOpen
}

export default function Sidebar({ open, setSidebarOpen }: SidebarProps) { // Destructure setSidebarOpen
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableTodayCount, setAvailableTodayCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch all rooms for static counts (cleaning, maintenance, ready)
      const allRoomsRes = await fetch('/api/rooms');
      const allRoomsData: Room[] = await allRoomsRes.json();
      setRooms(allRoomsData);

      // Fetch available today rooms for dynamic count
      const availableTodayRes = await fetch('/api/rooms?status=available_today');
      const availableTodayData: Room[] = await availableTodayRes.json();
      setAvailableTodayCount(availableTodayData.length);
    };
    fetchCounts();
  }, []); // Fetch on mount

  const pathname = usePathname();
  const cleaningCount = rooms.filter(room => room.status === 'cleaning').length;
  const maintenanceCount = rooms.filter(room => room.status === 'maintenance').length;

  const allNavItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    {
      icon: Bed,
      label: 'Rooms',
      href: '/dashboard/rooms',
      badge: `${availableTodayCount} open`, // Display availableTodayCount
      badgeClassName: 'bg-emerald-100 text-emerald-700',
    },
    { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
    {
      icon: Users,
      label: 'Housekeeping',
      href: '/dashboard/housekeeping',
      badge: `${cleaningCount} cleaning`,
      badgeClassName: 'bg-blue-100 text-blue-700',
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      href: '/dashboard/maintenance',
      badge: maintenanceCount ? `${maintenanceCount} issues` : undefined,
      badgeClassName: 'bg-amber-100 text-amber-700',
    },
    { icon: Users, label: 'Staff', href: '/dashboard/staff' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
    { icon: Users, label: 'Profile', href: '/dashboard/profile' }, // Added Profile link
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'frontdesk') {
      return item.label !== 'Reports' && item.label !== 'Staff';
    }
    return true; // Show all items for other roles (e.g., admin)
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30',
        open ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
      )}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100',
                !open && 'justify-center' // Center items when collapsed
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn('font-medium', !open && 'lg:hidden')}> {/* Hide label on desktop when collapsed */}
                {item.label}
              </span>
              {item.badge && open && (
                <span
                  className={cn(
                    'ml-auto text-xs px-2 py-1 rounded-full font-semibold',
                    item.badgeClassName ?? 'bg-gray-100 text-gray-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
