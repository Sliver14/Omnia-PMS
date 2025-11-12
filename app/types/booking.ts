export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Guest {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  roomType: string;
  guest: Guest;
  status: BookingStatus;
  price: number;
  notes?: string;
}

