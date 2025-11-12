'use client';

import type { ElementType } from 'react';
import { Home, Bed, Calendar, Users, Wrench, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { rooms } from '../data/rooms';

interface NavItem {
  icon: ElementType;
  label: string;
  href: string;
  badge?: string | number;
  badgeClassName?: string;
}

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const availableCount = rooms.filter(room => room.status === 'available').length;
  const cleaningCount = rooms.filter(room => room.status === 'cleaning').length;
  const maintenanceCount = rooms.filter(room => room.status === 'maintenance').length;

  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    {
      icon: Bed,
      label: 'Rooms',
      href: '/dashboard/rooms',
      badge: `${availableCount} open`,
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
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30',
        open ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
      )}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn('font-medium', open ? 'block' : 'hidden lg:block')}>
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