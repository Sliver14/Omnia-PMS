'use client';

import { useState, useEffect } from 'react';
import { Bed } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import type { RoomFilterState } from './RoomFilters';
import type { Room } from '../../types/booking';

export default function RoomGrid({ filters }: { filters: RoomFilterState }) {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch('/api/rooms');
      const data: Room[] = await res.json();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  const filtered = rooms.filter(room => {
    if (filters.status !== 'all' && room.status !== filters.status) return false;
    if (filters.type !== 'all' && room.type !== filters.type) return false;
    if (filters.floor !== 'all' && room.floor !== Number(filters.floor)) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filtered.map(room => (
        <div
          key={room.id}
          className={`p-4 text-gray-900 rounded-xl border-2 transition-all cursor-pointer
            ${room.status === 'available' ? 'border-green-200 bg-green-50 hover:border-green-400' :
              room.status === 'occupied' ? 'border-blue-200 bg-blue-50' :
              room.status === 'cleaning' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{room.id}</h3>
            <Bed className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm text-gray-700">{room.type}</p>
          <div className="mt-2">
            <StatusBadge status={room.status} />
          </div>
        </div>
      ))}
    </div>
  );
}