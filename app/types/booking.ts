export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'received' | 'failed';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash';

export interface Guest {
  name: string;
  email: string;
  phone: string;
}

export interface BookedRoom {
  roomId: string;
  price: number;
  quantity: number;
  room?: { // Optional, for frontend display
    id: string;
    type: string;
    floor: number;
    status: string;
    price: number;
  };
}

export interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  guest: Guest;
  status: BookingStatus;
  isPaymentConfirmed: boolean;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number; // Changed from price to totalPrice
  notes?: string;
  bookedRooms?: BookedRoom[]; // New field for multiple rooms
}

