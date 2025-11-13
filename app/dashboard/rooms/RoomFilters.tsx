'use client';

import { Filter, Bed, Home } from 'lucide-react';

export interface RoomFilterState {
  status: string;
  type: string;
  floor: string;
}

interface RoomFiltersProps {
  filters: RoomFilterState;
  onChange: (filters: RoomFilterState) => void;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available_today', label: 'Available Rooms' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'ready', label: 'Ready' },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Deluxe', label: 'Deluxe' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Family', label: 'Family' },
];

const floorOptions = [
  { value: 'all', label: 'All Floors' },
  { value: '1', label: 'Floor 1' },
  { value: '2', label: 'Floor 2' },
  { value: '3', label: 'Floor 3' },
];

export default function RoomFilters({ filters, onChange }: RoomFiltersProps) {
  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Bed className="w-5 h-5 text-gray-500" />
          <select
            value={filters.type}
            onChange={e => onChange({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Home className="w-5 h-5 text-gray-500" />
          <select
            value={filters.floor}
            onChange={e => onChange({ ...filters, floor: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
          >
            {floorOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}