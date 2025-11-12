'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RoomGrid from '../rooms/RoomGrid';
import RoomFilters, { type RoomFilterState } from '../rooms/RoomFilters';

export default function RoomsPage() {
  const [filters, setFilters] = useState<RoomFilterState>({
    status: 'all',
    type: 'all',
    floor: 'all',
  });

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Status</h1>
          <p className="text-gray-600 mt-1">Real-time room availability and condition</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <RoomFilters filters={filters} onChange={setFilters} />
      <RoomGrid filters={filters} />
    </div>
  );
}