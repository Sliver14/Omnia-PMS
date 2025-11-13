'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, List, Search, Plus } from 'lucide-react';
import BookingCalendar from '@/app/components/bookings/BookingCalendar';
import BookingList from '@/app/components/bookings/BookingList';
import BookingModal from '@/app/components/bookings/BookingModal';
import type { Booking } from '../../types/booking';

export default function BookingsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchBookings = useCallback(async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json(); // Remove type assertion for debugging

    if (!Array.isArray(data)) {
      console.error('API response is not an array:', data);
      // Handle the error appropriately, e.g., set an error state or return early
      setBookings([]); // Set to empty array to prevent further errors
      return;
    }

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

  // Effect to clear notification after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleOpenModal = (booking: Booking | null = null) => {
    if (booking && (booking.status === 'checked_in' || booking.status === 'checked_out')) {
      setNotification({ message: `Cannot edit bookings with status '${booking.status}'. Only 'confirmed' bookings can be edited.`, type: 'error' });
      return;
    }
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

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${isUpdate ? 'updating' : 'creating'} booking.`);
      }

      setNotification({ message: `Booking ${isUpdate ? 'updated' : 'created'} successfully!`, type: 'success' });
    } catch (error: any) {
      console.error('Error saving booking:', error);
      setNotification({ message: error.message || `Error ${isUpdate ? 'updating' : 'creating'} booking.`, type: 'error' });
    }

    await fetchBookings();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      setNotification({ message: 'Booking deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      setNotification({ message: 'Error deleting booking.', type: 'error' });
    }
    await fetchBookings();
    handleCloseModal();
  };

  const handleUpdateStatus = async (bookingId: string, roomId: string | null, status: Booking['status']) => {
    try {
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
      setNotification({ message: 'Booking status updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      setNotification({ message: 'Error updating booking status.', type: 'error' });
    }
    await fetchBookings();
  };

  return (
    <div className="space-y-6 text-gray-900">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage reservations and guest stays</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"> {/* Added flex-wrap */}
          <div className="relative flex-grow"> {/* Added flex-grow */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
           <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-md ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0"
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