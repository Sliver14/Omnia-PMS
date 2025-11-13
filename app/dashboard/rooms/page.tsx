'use client';

import { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react'; // Added Search icon
import RoomGrid from '../rooms/RoomGrid';
import RoomFilters, { type RoomFilterState } from '../rooms/RoomFilters';

export default function RoomsPage() {
  const [filters, setFilters] = useState<RoomFilterState>({
    status: 'all',
    type: 'all',
    floor: 'all',
  });
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Status</h1>
          <p className="text-gray-600 mt-1">Real-time room availability and condition</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0"> {/* Added flex-wrap */}
          <div className="relative flex-grow"> {/* Added flex-grow */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0"> {/* Added flex-shrink-0 */}
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <RoomFilters filters={filters} onChange={setFilters} />
      <RoomGrid filters={filters} searchTerm={searchTerm} />
    </div>
  );
}