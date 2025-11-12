'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, List, Search, Plus } from 'lucide-react';
import BookingCalendar from '@/app/components/bookings/BookingCalendar';
import BookingList from '@/app/components/bookings/BookingList';
import BookingModal from '@/app/components/bookings/BookingModal';
import type { Booking } from '../../types/booking';

export default function BookingsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    const res = await fetch('/api/bookings');
    const data: Booking[] = await res.json();
    const formattedData = data.map(booking => ({
      ...booking,
      start: new Date(booking.start),
      end: new Date(booking.end),
    }));
    setBookings(formattedData);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenModal = (booking: Booking | null = null) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const handleSave = async (saved: Booking) => {
    const isUpdate = bookings.some(b => b.id === saved.id);
    const url = isUpdate ? `/api/bookings/${saved.id}` : '/api/bookings';
    const method = isUpdate ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved),
    });

    await fetchBookings();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    await fetchBookings();
    handleCloseModal();
  };

  const handleUpdateStatus = async (bookingId: string, roomId: string | null, status: Booking['status']) => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    // If checking out, update room status to 'cleaning'
    if (status === 'checked_out' && roomId) {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cleaning' }),
      });
    }
    await fetchBookings();
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage reservations and guest stays</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-md ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <BookingCalendar search={search} bookings={bookings} onSelectBooking={handleOpenModal} />
      ) : (
        <BookingList search={search} bookings={bookings} onSelectBooking={handleOpenModal} />
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onSave={handleSave}
        onDelete={handleDelete}
        onCheckIn={(id) => handleUpdateStatus(id, null, 'checked_in')}
        onCheckOut={(bookingId, roomId) => handleUpdateStatus(bookingId, roomId, 'checked_out')}
      />
    </div>
  );
}