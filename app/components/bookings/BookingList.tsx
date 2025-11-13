'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User, DollarSign, Filter } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import type { Booking } from '../../types/booking';

interface ListBookingItem extends Booking {
  roomDisplay: string;
  roomTypeDisplay: string;
}

interface BookingListProps {
  search?: string;
  bookings: Booking[];
  onSelectBooking: (booking: ListBookingItem) => void;
}

export default function BookingList({ search = '', bookings, onSelectBooking }: BookingListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBookings = useMemo(() => {
    const term = search.toLowerCase();

    return bookings
      .map((booking) => {
        const rooms = booking.bookedRooms?.map((br) => br.room?.id || 'N/A') || [];
        const roomTypes = booking.bookedRooms?.map((br) => br.room?.type || 'N/A') || [];

        return {
          ...booking,
          rooms, // e.g. ["101", "102"]
          roomTypes, // e.g. ["Standard", "Deluxe"]
          roomDisplay: rooms.join(', '), // "101, 102"
          roomTypeDisplay: roomTypes.join(', '), // "Standard, Deluxe"
        };
      })
      .filter((booking) => {
        const matchesSearch =
          booking.guest.name.toLowerCase().includes(term) ||
          booking.roomDisplay.toLowerCase().includes(term) ||
          booking.roomTypeDisplay.toLowerCase().includes(term);

        const matchesStatus =
          filterStatus === 'all' || booking.status === filterStatus;

        return matchesSearch && matchesStatus;
      });
  }, [search, filterStatus, bookings]);


  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Price/Night
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.guest.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Room {booking.roomDisplay}</div>
                    <div className="text-sm text-gray-500">{booking.roomTypeDisplay}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(booking.start, 'MMM d')} – {format(booking.end, 'MMM d')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {booking.totalPrice}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onSelectBooking(booking)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}