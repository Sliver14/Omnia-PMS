// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bed, Calendar, Users, Wrench, DollarSign, Clock, Check, LogIn, LogOut } from 'lucide-react'; // Added Check, LogIn, LogOut
import Link from 'next/link';
import { format } from 'date-fns';
import type { Room } from '../types/room';
import type { Booking } from '../types/booking';

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0); // New state for available rooms
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all rooms data for static counts
        const roomsRes = await fetch('/api/rooms');
        if (!roomsRes.ok) throw new Error('Failed to fetch rooms');
        const roomsData: Room[] = await roomsRes.json();
        setRooms(roomsData);

        // Fetch available rooms today for dynamic count
        const availableRoomsRes = await fetch('/api/rooms?status=available_today');
        if (!availableRoomsRes.ok) throw new Error('Failed to fetch available rooms');
        const availableRoomsData: Room[] = await availableRoomsRes.json();
        setAvailableRoomsCount(availableRoomsData.length);

        // Fetch bookings data
        const bookingsRes = await fetch('/api/bookings');
        if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
        const bookingsData: Booking[] = await bookingsRes.json();
        setBookings(bookingsData.map(b => ({
          ...b,
          start: new Date(b.start),
          end: new Date(b.end),
        })));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-600">Error: {error}</div>;

  // Dashboard Metrics
  const totalRooms = rooms.length;
  const cleaningRooms = rooms.filter(room => room.status === 'cleaning').length;
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const checkInsToday = bookings.filter(b => b.start.toDateString() === today.toDateString() && b.status === 'confirmed').length;
  const checkOutsToday = bookings.filter(b => b.end.toDateString() === today.toDateString() && b.status === 'checked_in').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const checkedInBookings = bookings.filter(b => b.status === 'checked_in').length;

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
            <p className="text-sm text-gray-500">Available Rooms</p> {/* Changed from Ready Rooms */}
            <p className="text-2xl font-semibold">{availableRoomsCount}</p> {/* Used availableRoomsCount */}
          </div>
          <Check className="w-8 h-8 text-green-500" /> {/* Assuming Check icon is available */}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Check-ins Today</p>
            <p className="text-2xl font-semibold">{checkInsToday}</p>
          </div>
          <LogIn className="w-8 h-8 text-purple-500" /> {/* Assuming LogIn icon is available */}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Check-outs Today</p>
            <p className="text-2xl font-semibold">{checkOutsToday}</p>
          </div>
          <LogOut className="w-8 h-8 text-orange-500" /> {/* Assuming LogOut icon is available */}
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Room Status Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <p className="text-gray-700">Available: <span className="font-medium">{availableRoomsCount}</span></p> {/* Changed from Ready */}
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
                {bookings.slice(0, 5).map(booking => ( // Show top 5 recent bookings
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.guest.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.bookedRooms?.map(br => br.room?.id).join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(booking.start, 'MMM d')} - {format(booking.end, 'MMM d')}
                    </td>
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
