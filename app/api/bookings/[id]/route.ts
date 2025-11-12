import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

// PUT (update) a booking
export async function PUT(request: NextRequest, context: any) {
  try {
    const { guest, ...bookingData } = await request.json();
    const { id } = context.params;

    // Handle guest update/creation if guest data is provided
    let guestConnectOrCreate = {};
    if (guest && guest.email) {
      const existingGuest = await prisma.guest.findUnique({
        where: { email: guest.email },
      });

      if (existingGuest) {
        guestConnectOrCreate = { connect: { id: existingGuest.id } };
      } else {
        guestConnectOrCreate = { create: { name: guest.name, email: guest.email, phone: guest.phone } };
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...bookingData,
        start: bookingData.start ? new Date(bookingData.start) : undefined,
        end: bookingData.end ? new Date(bookingData.end) : undefined,
        guest: guestConnectOrCreate,
      },
      include: { guest: true },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
  }
}

// DELETE a booking
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { id } = context.params;

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
  }
}
