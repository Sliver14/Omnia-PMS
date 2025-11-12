// components/shared/StatusBadge.tsx
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status:
    | 'available'
    | 'occupied'
    | 'cleaning'
    | 'maintenance'
    | 'confirmed'
    | 'checked_in'
    | 'checked_out'
    | 'cancelled';
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800' },
  occupied: { label: 'Occupied', color: 'bg-blue-100 text-blue-800' },
  cleaning: { label: 'Cleaning', color: 'bg-yellow-100 text-yellow-800' },
  maintenance: { label: 'Maintenance', color: 'bg-red-100 text-red-800' },
  confirmed: { label: 'Confirmed', color: 'bg-purple-100 text-purple-800' },
  checked_in: { label: 'Checked In', color: 'bg-blue-100 text-blue-800' },
  checked_out: { label: 'Checked Out', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.color)}>
      {config.label}
    </span>
  );
}