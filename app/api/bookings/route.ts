import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { NextRequest } from 'next/server';

// GET all bookings for a specific hotel
export async function GET(request: NextRequest) {
  const hotelId = request.headers.get('X-Hotel-ID');

  if (!hotelId) {
    return NextResponse.json({ message: 'X-Hotel-ID header is required' }, { status: 400 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { hotelId },
      include: {
        guest: true,
        bookedRooms: {
          include: {
            room: true,
          },
        },
      },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Error fetching bookings data' }, { status: 500 });
  }
}

// POST a new booking for a specific hotel
export async function POST(request: NextRequest) {
  const hotelId = request.headers.get('X-Hotel-ID');

  if (!hotelId) {
    return NextResponse.json({ message: 'X-Hotel-ID header is required' }, { status: 400 });
  }

  try {
    const { guest, bookedRooms, status, ...bookingData } = await request.json();

    // Calculate number of days
    const startDate = new Date(bookingData.start);
    startDate.setHours(12, 0, 0, 0);
    const endDate = new Date(bookingData.end);
    endDate.setHours(12, 0, 0, 0);
    const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    // Find or create guest for the specific hotel
    let guestRecord = await prisma.guest.findUnique({
      where: { email: guest.email },
    });
    if (!guestRecord) {
      guestRecord = await prisma.guest.create({
        data: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          hotelId,
        },
      });
    }

    const totalPrice = bookedRooms.reduce(
      (sum: number, room: { price: number; quantity: number }) =>
        sum + room.price * room.quantity * numberOfDays,
      0
    );

    for (const bookedRoom of bookedRooms) {
      const existingBookings = await prisma.bookedRoom.findMany({
        where: {
          roomId: bookedRoom.roomId,
          booking: {
            hotelId,
            status: {
              in: ['confirmed', 'checked_in'],
            },
            OR: [
              {
                start: { lt: endDate },
                end: { gt: startDate },
              },
            ],
          },
        },
        include: {
          booking: true,
        },
      });

      if (existingBookings.length > 0) {
        const conflictingBooking = existingBookings[0].booking;
        return NextResponse.json(
          {
            message: `Room ${bookedRoom.roomId} is already booked for the selected dates. Conflicting Booking ID: ${conflictingBooking.id}`,
            conflictingBookingId: conflictingBooking.id,
          },
          { status: 409 }
        );
      }
    }

    const newBooking = await prisma.booking.create({
      data: {
        ...bookingData,
        start: new Date(bookingData.start),
        end: new Date(bookingData.end),
        guestId: guestRecord.id,
        status: status,
        totalPrice,
        hotelId,
        bookedRooms: {
          create: bookedRooms.map((room: { roomId: string; price: number; quantity: number }) => ({
            roomId: room.roomId,
            price: room.price,
            quantity: room.quantity,
          })),
        },
      },
      include: { guest: true, bookedRooms: true },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ message: 'Error creating booking' }, { status: 500 });
  }
}
