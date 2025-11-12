'use client';

import { useCallback, useMemo, useState } from 'react';
import { Calendar, View, momentLocalizer } from 'react-big-calendar';
import type { SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { addDays, format, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking } from '../../types/booking';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const roomColors: Record<string, string> = {
  'Deluxe Suite': '#7c3aed',
  Premium: '#2563eb',
  Standard: '#16a34a',
  Family: '#f97316',
};

interface BookingCalendarProps {
  search?: string;
  bookings: Booking[];
  onSelectBooking: (booking: Booking | null) => void;
}

export default function BookingCalendar({ search = '', bookings, onSelectBooking }: BookingCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

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
      // This would ideally open the modal for a new booking on a specific date.
      // For now, we'll just log it. The parent component handles modal opening.
      console.log('Selected slot:', start);
    },
    []
  );

  const handleSelectEvent = useCallback(
    (event: Booking) => {
      onSelectBooking(event);
    },
    [onSelectBooking]
  );

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
    </div>
  );
}
