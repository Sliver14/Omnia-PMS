'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { X, Save, Trash2, LogIn, LogOut } from 'lucide-react';
import type { Booking, Guest } from '@/types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  defaultDate?: Date | null;
  onSave: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

const roomOptions = [
  { value: '301', label: '301 - Deluxe Suite', type: 'Deluxe Suite' },
  { value: '205', label: '205 - Standard', type: 'Standard' },
  { value: '402', label: '402 - Premium', type: 'Premium' },
];

const createInitialForm = (seedDate?: Date | null): Partial<Booking> => {
  const baseDate = seedDate ?? new Date();
  return {
    start: baseDate,
    end: addDays(baseDate, 2),
    room: '',
    roomType: '',
    guest: { name: '', email: '', phone: '' },
    status: 'confirmed',
    price: 0,
    notes: '',
  };
};

export default function BookingModal({
  isOpen,
  onClose,
  booking,
  defaultDate,
  onSave,
  onDelete,
  onCheckIn,
  onCheckOut,
}: BookingModalProps) {
  const [form, setForm] = useState<Partial<Booking>>(() => createInitialForm(defaultDate));

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isOpen) return;

    if (booking) {
      setForm(booking);
      return;
    }

    if (defaultDate) {
      setForm(prev => ({
        ...prev,
        start: defaultDate,
        end: addDays(defaultDate, 2),
      }));
      return;
    }

    setForm(createInitialForm());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [booking, defaultDate, isOpen]);

  if (!isOpen) return null;

  const currentStart = form.start ?? new Date();
  const currentEnd = form.end ?? addDays(currentStart, 2);

  const handleGuestChange = (field: keyof Guest, value: string) => {
    setForm(prev => ({
      ...prev,
      guest: { ...(prev.guest ?? { name: '', email: '', phone: '' }), [field]: value },
    }));
  };

  const handleSubmit = () => {
    if (!form.room || !form.guest?.name || !currentStart || !currentEnd) return;

    const selectedRoom = roomOptions.find(r => r.value === form.room);
    const bookingPayload: Booking = {
      id: booking?.id ?? Date.now().toString(),
      title: `${form.guest.name} – ${form.room}`,
      start: currentStart,
      end: currentEnd,
      room: form.room,
      roomType: selectedRoom?.type ?? form.roomType ?? '',
      guest: form.guest,
      status: form.status ?? 'confirmed',
      price: form.price ?? 0,
      notes: form.notes,
    };

    onSave(bookingPayload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {booking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Guest Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input
                type="text"
                value={form.guest?.name || ''}
                onChange={e => handleGuestChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.guest?.email || ''}
                onChange={e => handleGuestChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.guest?.phone || ''}
              onChange={e => handleGuestChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="+123456789"
            />
          </div>

          {/* Room & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select
                value={form.room || ''}
                onChange={e => {
                  const room = roomOptions.find(r => r.value === e.target.value);
                  setForm({ ...form, room: e.target.value, roomType: room?.type || '' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select room</option>
                {roomOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={format(currentStart, 'yyyy-MM-dd')}
                onChange={e => setForm(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={format(currentEnd, 'yyyy-MM-dd')}
                onChange={e => setForm(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
              <input
                type="number"
                value={form.price || ''}
                onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status || 'confirmed'}
                onChange={e =>
                  setForm(prev => ({ ...prev, status: e.target.value as Booking['status'] }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes || ''}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Any special requests..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            {booking && (
              <>
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => onCheckIn(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <LogIn className="w-4 h-4" />
                    Check In
                  </button>
                )}
                {booking.status === 'checked-in' && (
                  <button
                    onClick={() => onCheckOut(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Check Out
                  </button>
                )}
                <button
                  onClick={() => onDelete(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {booking ? 'Update' : 'Create'} Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}