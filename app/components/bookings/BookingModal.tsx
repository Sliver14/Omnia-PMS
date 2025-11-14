"use client";
import React, { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { X, Save, Trash2, LogIn, LogOut } from "lucide-react";
import type { Booking, BookingStatus, Guest } from '../../types/booking';
import type { Room } from '../../types/room';
import { RoomStatus } from '@prisma/client';
import { useHotel } from "@/app/context/HotelContext";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  defaultDate?: Date | null;
  onSave: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (bookingId: string, roomId: string) => void;
}

const createInitialForm = (seedDate?: Date | null): Partial<Booking> => {
  const baseDate = seedDate ?? new Date();
  return {
    start: baseDate,
    end: addDays(baseDate, 1),
    guest: { name: "", email: "", phone: "" },
    status: "checked_in",
    isPaymentConfirmed: false,
    paymentStatus: "pending",
    paymentMethod: "bank_transfer",
    totalPrice: 0,
    notes: "",
    bookedRooms: [],
  };
};

const calculateTotalPrice = (
  start: Date | undefined,
  end: Date | undefined,
  bookedRooms: Array<{ price: number; quantity: number }> | undefined
): number => {
  if (!start || !end || !bookedRooms || bookedRooms.length === 0) {
    return 0;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
  const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return bookedRooms.reduce(
    (sum, room) => sum + room.price * room.quantity * numberOfDays,
    0
  );
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
  const { hotelId, setHotelId } = useHotel(); // Get setHotelId from context
  const [form, setForm] = useState<Partial<Booking>>(() =>
    createInitialForm(defaultDate)
  );

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedRoomToAdd, setSelectedRoomToAdd] = useState<string>('');

  const [availableRoomsForPeriod, setAvailableRoomsForPeriod] = useState<Room[]>([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (booking) {
        setForm({
          ...booking,
          bookedRooms: booking.bookedRooms || [],
          totalPrice: booking.totalPrice || 0,
        });
      } else {
        const initialForm = createInitialForm(defaultDate);
        const calculatedPrice = calculateTotalPrice(initialForm.start, initialForm.end, initialForm.bookedRooms);
        setForm({
          ...initialForm,
          totalPrice: calculatedPrice,
        });
      }
    } else {
      setForm(createInitialForm(defaultDate));
    }
  }, [booking, defaultDate, isOpen]);

  // Effect to ensure check-out date is always after check-in date
  useEffect(() => {
    if (form.start && form.end) {
      const startDate = new Date(form.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(form.end);
      endDate.setHours(0, 0, 0, 0);

      if (endDate <= startDate) {
        setForm(prev => {
          const newEnd = addDays(startDate, 1);
          const newTotalPrice = calculateTotalPrice(prev.start, newEnd, prev.bookedRooms);
          return { ...prev, end: newEnd, totalPrice: newTotalPrice };
        });
      }
    }
  }, [form.start, form.end, form.bookedRooms]); // Added form.end and form.bookedRooms to dependencies to recalculate price correctly

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!form.start || !form.end || !hotelId) {
        if (!hotelId) console.warn("No hotelId available, skipping fetch for available rooms.");
        return;
      }

      setIsFetchingRooms(true);
      try {
        const queryParams = new URLSearchParams();
        const startDate = new Date(form.start);
        startDate.setHours(12, 0, 0, 0);
        const endDate = new Date(form.end);
        endDate.setHours(12, 0, 0, 0);

        queryParams.append('status', 'available_today');
        queryParams.append('checkInDate', startDate.toISOString());
        queryParams.append('checkOutDate', endDate.toISOString());

        const res = await fetch(`/api/rooms?${queryParams.toString()}`, {
          headers: {
            'X-Hotel-ID': hotelId,
          },
        });
        if (!res.ok) {
          throw new Error(`Error fetching available rooms: ${res.statusText}`);
        }
        const data = await res.json();
        const rooms = Array.isArray(data) ? data : [];
        const filteredData = rooms.filter(room => !form.bookedRooms?.some(br => br.roomId === room.id));
        setAvailableRoomsForPeriod(filteredData);
      } catch (error: any) {
        console.error("Error fetching available rooms:", error);
        setErrorMessage(error.message);
      } finally {
        setIsFetchingRooms(false);
      }
    };

    fetchAvailableRooms();
  }, [form.start, form.end, form.bookedRooms, hotelId]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setErrorMessage("");
    onClose();
  };

  const currentStart = form.start ?? new Date();
  const currentEnd = form.end ?? addDays(currentStart, 1);

  const availableRoomOptions = availableRoomsForPeriod.map((room) => ({
    value: room.id,
    label: `${room.id} - ${room.type} ($${room.price.toFixed(2)})`,
    type: room.type,
    price: room.price,
  }));

  const handleGuestChange = (field: keyof Guest, value: string) => {
    setForm((prev) => ({
      ...prev,
      guest: { ...(prev.guest ?? { name: "", email: "", phone: "" }), [field]: value },
    }));
  };

  const handleAddRoom = () => {
    const roomToAdd = availableRoomsForPeriod.find(r => r.id === selectedRoomToAdd);
    if (roomToAdd) {
      setForm(prev => {
        const newBookedRooms = [...(prev.bookedRooms || []), {
          roomId: roomToAdd.id,
          price: roomToAdd.price,
          quantity: 1,
          room: roomToAdd,
        }];
        const newTotalPrice = calculateTotalPrice(prev.start, prev.end, newBookedRooms);
        return {
          ...prev,
          bookedRooms: newBookedRooms,
          totalPrice: newTotalPrice,
        };
      });
      setSelectedRoomToAdd('');
    }
  };

  const handleRemoveRoom = (indexToRemove: number) => {
    setForm(prev => {
      const newBookedRooms = (prev.bookedRooms || []).filter((_, index) => index !== indexToRemove);
      const newTotalPrice = calculateTotalPrice(prev.start, prev.end, newBookedRooms);
      return {
        ...prev,
        bookedRooms: newBookedRooms,
        totalPrice: newTotalPrice,
      };
    });
  };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = new Date(e.target.value);
      newStart.setHours(0, 0, 0, 0); // Normalize to start of day
  
      setForm((prev) => {
              const nextDayAfterStart = addDays(newStart, 1);
              const adjustedEnd = nextDayAfterStart; // Always set to the next day
        
              const newTotalPrice = calculateTotalPrice(newStart, adjustedEnd, prev.bookedRooms);
              return { ...prev, start: newStart, end: adjustedEnd, totalPrice: newTotalPrice };
            });
          };  
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedEnd = new Date(e.target.value);
      selectedEnd.setHours(0, 0, 0, 0); // Normalize to start of day
  
      setForm((prev) => {
        const startDate = prev.start ? new Date(prev.start) : new Date();
        startDate.setHours(0, 0, 0, 0); // Normalize to start of day
  
        let adjustedEnd = selectedEnd;
  
        // Check-out date cannot be same as or before check-in date
        if (adjustedEnd <= startDate) {
          adjustedEnd = addDays(startDate, 1);
          setErrorMessage("Check-out date cannot be on or before check-in date. Adjusted to next day.");
        } else {
          setErrorMessage("");
        }
  
        const newTotalPrice = calculateTotalPrice(startDate, adjustedEnd, prev.bookedRooms);
  
        return {
          ...prev,
          end: adjustedEnd,
          totalPrice: newTotalPrice,
        };
      });
    };

  const handleSubmit = () => {
    setErrorMessage("");

    if (!form.guest?.name || !currentStart || !currentEnd || (form.bookedRooms && form.bookedRooms.length === 0)) {
      setErrorMessage("Please fill in all required fields and select at least one room.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (currentStart < today && !booking?.id) {
      setErrorMessage("Booking start date cannot be in the past.");
      return;
    }

    if (currentEnd < currentStart) {
      setErrorMessage("Check-out date must be equal to or later than check-in date.");
      return;
    }

    if (!booking && !form.isPaymentConfirmed) {
      setErrorMessage("Please confirm payment has been received to create the booking.");
      return;
    }

    const bookingPayload: Booking = {
      id: booking?.id ?? Date.now().toString(),
      title: `${form.guest.name} – ${form.bookedRooms?.length} Room(s)`,
      start: currentStart,
      end: currentEnd,
      guest: form.guest,
      status: form.status ?? "confirmed",
      isPaymentConfirmed: form.isPaymentConfirmed ?? false,
      paymentStatus: form.paymentStatus ?? "pending",
      paymentMethod: form.paymentMethod ?? "bank_transfer",
      totalPrice: form.totalPrice ?? 0,
      notes: form.notes,
      bookedRooms: form.bookedRooms?.map(br => ({
        roomId: br.roomId,
        price: br.price,
        quantity: br.quantity,
      })) || [],
    };

    onSave(bookingPayload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">
                    {booking ? "Edit Booking" : "New Booking"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    X
                  </button>
                </div>
        
                        <div className="p-6 space-y-5">
        
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input
                type="text"
                value={form.guest?.name || ""}
                onChange={(e) => handleGuestChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.guest?.email || ""}
                onChange={(e) => handleGuestChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.guest?.phone || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9+]/g, "");
                handleGuestChange("phone", value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="08123456789"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={format(currentStart, "yyyy-MM-dd")}
                onChange={handleStartDateChange}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={format(currentEnd, "yyyy-MM-dd")}
                min={format(addDays(currentStart, 1), "yyyy-MM-dd")}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
            <div className="flex gap-2">
              {isFetchingRooms ? (
                <div className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                  Fetching available rooms...
                </div>
              ) : availableRoomOptions.length === 0 ? (
                <div className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                  No rooms available for the selected dates.
                </div>
              ) : (
                <select
                  value={selectedRoomToAdd || ""}
                  onChange={(e) => setSelectedRoomToAdd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select room to add</option>
                  {availableRoomOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={handleAddRoom}
                disabled={!selectedRoomToAdd || availableRoomOptions.length === 0 || isFetchingRooms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Add Room
              </button>
            </div>

            {form.bookedRooms && form.bookedRooms.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium text-gray-700">Selected Rooms:</p>
                {form.bookedRooms.map((br, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{br.room?.id} - {br.room?.type} (${br.price.toFixed(2)})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
              <input
                type="number"
                value={form.totalPrice || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status || "confirmed"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as Booking["status"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="checked_in">Checked In</option>
                <option value="confirmed">Confirmed</option>
                
              </select>
            </div>
          </div>

          {!booking && (
            <div className="space-y-3 border-t border-gray-200 pt-5">
              <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                {/* <p className="font-medium">Bank Transfer Instructions:</p> */}
                <p>ESPEES</p>
                <p>Merchant Code: OMNIA HOTELS</p>
                {/* <p>Account Number: 1234567890</p>
                <p>SWIFT Code: EXAMPLESWIFT</p> */}
                <p className="mt-2">Please transfer the total amount to the account above.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPaymentConfirmed"
                  checked={form.isPaymentConfirmed ?? false}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isPaymentConfirmed: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPaymentConfirmed" className="ml-2 block text-sm text-gray-900">
                  Confirm payment received
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Any special requests..."
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <X className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            {booking && (
              <>
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => onCheckIn(booking.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <LogIn className="w-4 h-4" />
                    Check In
                  </button>
                )}
                {booking.status === "checked_in" && (
                  <button
                    onClick={() => onCheckOut(booking.id, booking.bookedRooms?.[0]?.roomId || '')}
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
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {booking ? "Update" : "Create"} Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
