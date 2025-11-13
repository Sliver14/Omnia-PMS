'use client';

import { useState, useEffect } from 'react';
import { Bed } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import type { RoomFilterState } from './RoomFilters';
import type { Room } from '../../types/room';

export default function RoomGrid({ filters }: { filters: RoomFilterState }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }
        if (filters.type !== 'all') {
          queryParams.append('type', filters.type);
        }
        if (filters.floor !== 'all') {
          queryParams.append('floor', filters.floor);
        }

        const res = await fetch(`/api/rooms?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Error fetching rooms: ${res.statusText}`);
        }
        const data: Room[] = await res.json();
        setRooms(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [filters]); // Re-run effect when filters change

  if (loading) return <div className="text-center text-gray-600">Loading rooms...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;
  if (rooms.length === 0) return <div className="text-center text-gray-600">No rooms found matching your criteria.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {rooms.map(room => (
        <div
          key={room.id}
          className={`p-4 text-gray-900 rounded-xl border-2 transition-all cursor-pointer
            ${room.status === 'ready' ? 'border-indigo-200 bg-indigo-50 hover:border-indigo-400' :
              room.status === 'cleaning' ? 'border-yellow-200 bg-yellow-50' :
              room.status === 'maintenance' ? 'border-red-200 bg-red-50' :
              'border-gray-200 bg-gray-50'}`}
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