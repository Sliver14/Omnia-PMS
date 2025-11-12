'use client';

import { useState } from 'react';
import { Calendar, List, Search } from 'lucide-react';
import BookingCalendar from '@/app/components/bookings/BookingCalendar';
import BookingList from '@/app/components/bookings/BookingList';

export default function BookingsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [search, setSearch] = useState('');

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
        </div>
      </div>

      {view === 'calendar' ? <BookingCalendar search={search} /> : <BookingList search={search} />}
    </div>
  );
}