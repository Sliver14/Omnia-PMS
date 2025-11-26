'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Bed, Check, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import type { Room } from '../types/room';
import type { Booking } from '../types/booking';
import { useApi } from '../lib/hooks';

export default function DashboardPage() {
  const { data: roomsData, error: roomsError, isLoading: roomsLoading } = useApi<Room[]>('/api/rooms');
  const { data: bookingsData, error: bookingsError, isLoading: bookingsLoading } = useApi<Booking[]>('/api/bookings');

  const loading = roomsLoading || bookingsLoading;
  const error = roomsError || bookingsError;

  const rooms = useMemo(() => roomsData || [], [roomsData]);
  const bookings = useMemo(
    () =>
      bookingsData
        ? bookingsData.map((b) => ({ ...b, start: new Date(b.start), end: new Date(b.end) }))
        : [],
    [bookingsData]
  );

  // Today
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Metrics
  const totalRooms = rooms.length;

  // Real available rooms logic (like in RoomGrid)
  const availableRoomsCount = useMemo(() => {
    return rooms.filter((room) => {
      // Room is unavailable today if it has an active booking or is in cleaning/maintenance
      const hasActiveBooking = bookings.some(
        (booking) =>
          booking.status !== 'cancelled' &&
          booking.bookedRooms?.some((br) => br.room?.id === room.id) &&
          booking.start <= today &&
          booking.end >= today
      );
      return !hasActiveBooking && room.status === 'ready';
    }).length;
  }, [rooms, bookings, today]);

  const cleaningRooms = useMemo(() => rooms.filter((r) => r.status === 'cleaning').length, [rooms]);
  const maintenanceRooms = useMemo(() => rooms.filter((r) => r.status === 'maintenance').length, [rooms]);

  const checkInsToday = useMemo(
    () => bookings.filter((b) => b.start.toDateString() === today.toDateString() && b.status === 'confirmed').length,
    [bookings, today]
  );

  const checkOutsToday = useMemo(
    () => bookings.filter((b) => b.end.toDateString() === today.toDateString() && b.status === 'checked_in').length,
    [bookings, today]
  );

  if (loading) return <p className="text-gray-600">Loading dashboard...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="text-gray-600 mt-1">Welcome to your Hotel Management System</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Rooms</p>
            <p className="text-2xl font-semibold">{totalRooms}</p>
          </div>
          <Bed className="w-8 h-8 text-blue-500" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Rooms</p>
            <p className="text-2xl font-semibold">{availableRoomsCount}</p>
          </div>
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Check-ins Today</p>
            <p className="text-2xl font-semibold">{checkInsToday}</p>
          </div>
          <LogIn className="w-8 h-8 text-purple-500" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Check-outs Today</p>
            <p className="text-2xl font-semibold">{checkOutsToday}</p>
          </div>
          <LogOut className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Room Status Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <p className="text-gray-700">Available: <span className="font-medium">{availableRoomsCount}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <p className="text-gray-700">Cleaning: <span className="font-medium">{cleaningRooms}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <p className="text-gray-700">Maintenance: <span className="font-medium">{maintenanceRooms}</span></p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <Link href="/dashboard/rooms" className="text-blue-600 hover:underline">View all rooms</Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No recent bookings.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.guest.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.bookedRooms?.map(br => br.room?.id).join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(booking.start, 'MMM d')} - {format(booking.end, 'MMM d')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-right">
          <Link href="/dashboard/bookings" className="text-blue-600 hover:underline">View all bookings</Link>
        </div>
      </div>
    </div>
  );
}
