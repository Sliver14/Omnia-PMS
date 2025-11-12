'use client';

import { useCallback, useMemo, useState } from 'react';
import { Calendar, View, momentLocalizer } from 'react-big-calendar';
import type { SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { addDays, format, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookingModal from './BookingModal';
import type { Booking } from '@/types/booking';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const mockBookings: Booking[] = [
  {
    id: '1',
    title: 'John Doe – 301',
    start: new Date(2025, 10, 12),
    end: new Date(2025, 10, 15),
    room: '301',
    roomType: 'Deluxe Suite',
    guest: { name: 'John Doe', email: 'john@example.com', phone: '+123456789' },
    status: 'checked-in',
    price: 250,
  },
  {
    id: '2',
    title: 'Jane Smith – 205',
    start: new Date(2025, 10, 12),
    end: new Date(2025, 10, 14),
    room: '205',
    roomType: 'Standard',
    guest: { name: 'Jane Smith', email: 'jane@example.com', phone: '+198765432' },
    status: 'confirmed',
    price: 120,
  },
  {
    id: '3',
    title: 'Mike Johnson – 402',
    start: new Date(2025, 10, 13),
    end: new Date(2025, 10, 16),
    room: '402',
    roomType: 'Premium',
    guest: { name: 'Mike Johnson', email: 'mike@example.com', phone: '+112233445' },
    status: 'confirmed',
    price: 180,
  },
];

const roomColors: Record<string, string> = {
  'Deluxe Suite': '#7c3aed',
  Premium: '#2563eb',
  Standard: '#16a34a',
  Family: '#f97316',
};

interface BookingCalendarProps {
  search?: string;
}

export default function BookingCalendar({ search = '' }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);

  const events = useMemo(
    () =>
      bookings
        .filter(b => {
          const term = search.toLowerCase();
          return (
            b.guest.name.toLowerCase().includes(term) ||
            b.room.toLowerCase().includes(term) ||
            b.roomType.toLowerCase().includes(term)
          );
        })
        .map(b => ({
          ...b,
          end: addDays(b.end, -1),
        })),
    [bookings, search]
  );

  const handleNavigate = useCallback((nextDate: Date) => setDate(nextDate), []);
  const handleViewChange = useCallback((nextView: View) => setView(nextView), []);

  const handleSelectSlot = useCallback(
    ({ start }: SlotInfo) => {
      setSelectedSlotDate(startOfDay(start as Date));
      setSelectedBooking(null);
      setModalOpen(true);
    },
    []
  );

  const handleSelectEvent = useCallback(
    (event: Booking) => {
      const booking = bookings.find(b => b.id === event.id);
      if (booking) {
        setSelectedBooking(booking);
        setSelectedSlotDate(null);
        setModalOpen(true);
      }
    },
    [bookings]
  );

  const handleSave = useCallback((saved: Booking) => {
    setBookings(prev => {
      const exists = prev.some(b => b.id === saved.id);
      if (exists) {
        return prev.map(b => (b.id === saved.id ? saved : b));
      }
      return [...prev, saved];
    });
    setModalOpen(false);
    setSelectedBooking(null);
    setSelectedSlotDate(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    setModalOpen(false);
    setSelectedBooking(null);
  }, []);

  const handleCheckIn = useCallback((id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'checked-in' } : b))
    );
  }, []);

  const handleCheckOut = useCallback((id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'checked-out' } : b))
    );
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedBooking(null);
    setSelectedSlotDate(null);
  }, []);

  const eventStyleGetter = useCallback((event: Booking) => {
    const backgroundColor = roomColors[event.roomType] ?? '#6b7280';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.92,
        color: 'white',
        border: '0',
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate(addDays(date, -30))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNavigate(addDays(date, 30))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold min-w-[180px]">
            {format(date, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as View[]).map(option => (
            <button
              key={option}
              onClick={() => handleViewChange(option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                ${view === option ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(roomColors).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          views={['month', 'week', 'day']}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={event => handleSelectEvent(event as Booking)}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            event: ({ event }: { event: Booking }) => (
              <div className="flex flex-col h-full p-1 text-xs overflow-hidden">
                <span className="font-medium truncate">{event.guest.name}</span>
                <span className="truncate">Room {event.room}</span>
              </div>
            ),
          }}
        />
      </div>

      <BookingModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        booking={selectedBooking}
        defaultDate={selectedSlotDate}
        onSave={handleSave}
        onDelete={handleDelete}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />
    </div>
  );
}
