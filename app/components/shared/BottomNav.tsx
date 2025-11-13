// app/components/shared/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bed, Calendar, Users } from 'lucide-react'; // Common icons for mobile nav
import { cn } from '../../lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Bed, label: 'Rooms', href: '/dashboard/rooms' },
  { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: Users, label: 'Profile', href: '/dashboard/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around py-2 sm:hidden">
      {navItems.map((item) => {
        const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium px-2 py-1 rounded-lg transition-colors',
              isActive
                ? 'text-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
