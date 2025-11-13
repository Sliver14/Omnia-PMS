import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../lib/prisma';

// GET all rooms with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') || 'all';
    const typeFilter = searchParams.get('type') || 'all';
    const floorFilter = searchParams.get('floor') || 'all';

    let where: any = {};

    if (typeFilter !== 'all') {
      where.type = typeFilter;
    }

    if (floorFilter !== 'all') {
      where.floor = parseInt(floorFilter);
    }

    if (statusFilter === 'available_today') {
      const checkInDateParam = searchParams.get('checkInDate');
      const checkOutDateParam = searchParams.get('checkOutDate');

      let requestedCheckIn: Date;
      let requestedCheckOut: Date;

      if (checkInDateParam && checkOutDateParam) {
        // Logic for BookingModal: use provided dates
        requestedCheckIn = new Date(checkInDateParam);
        requestedCheckOut = new Date(checkOutDateParam);
      } else {
        // Logic for RoomGrid: default to today 12 PM to tomorrow 12 PM
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        requestedCheckIn = today;
        requestedCheckOut = new Date(today);
        requestedCheckOut.setDate(today.getDate() + 1); // Set to 12 PM tomorrow
      }

      // Rooms must be 'ready'
      where.status = 'ready';

      // Find rooms that are currently booked (confirmed or checked_in) and overlap with the requested period
      const bookedRoomsForPeriod = await prisma.bookedRoom.findMany({
        where: {
          booking: {
            status: {
              in: ['confirmed', 'checked_in'],
            },
            AND: [
              {
                // Existing booking starts before requested check-out
                start: {
                  lt: requestedCheckOut,
                },
              },
              {
                // Existing booking ends after requested check-in
                end: {
                  gt: requestedCheckIn,
                },
              },
            ],
          },
        },
        select: {
          roomId: true,
        },
      });

      const occupiedRoomIds = bookedRoomsForPeriod.map((br) => br.roomId);

      where.id = {
        notIn: occupiedRoomIds,
      };
    } else if (statusFilter !== 'all') {
      where.status = statusFilter;
    }

    const rooms = await prisma.room.findMany({
      where,
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ message: 'Error fetching rooms data' }, { status: 500 });
  }
}
