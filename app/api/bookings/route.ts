import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// GET all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { guest: true },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Error fetching bookings data' }, { status: 500 });
  }
}

// POST a new booking
export async function POST(request: Request) {
  try {
    const { guest, ...bookingData } = await request.json();

    // Find or create guest
    const existingGuest = await prisma.guest.findUnique({
      where: { email: guest.email },
    });

    let guestRecord;
    if (existingGuest) {
      guestRecord = existingGuest;
    } else {
      guestRecord = await prisma.guest.create({
        data: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
        },
      });
    }

    const newBooking = await prisma.booking.create({
      data: {
        ...bookingData,
        start: new Date(bookingData.start),
        end: new Date(bookingData.end),
        guestId: guestRecord.id,
      },
      include: { guest: true },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ message: 'Error creating booking' }, { status: 500 });
  }
}
