import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../lib/prisma';

// GET all rooms with optional filters
export async function GET(request: NextRequest) {
  const hotelId = request.headers.get('X-Hotel-ID');
  if (!hotelId) {
    console.error('API: X-Hotel-ID header is missing.');
    return NextResponse.json({ message: 'X-Hotel-ID header is required' }, { status: 400 });
  }
  console.log('API: Received X-Hotel-ID:', hotelId);

  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') || 'all';
    const typeFilter = searchParams.get('type') || 'all';
    const floorFilter = searchParams.get('floor') || 'all';

    console.log('API: Received statusFilter:', statusFilter);
    console.log('API: Received typeFilter:', typeFilter);
    console.log('API: Received floorFilter:', floorFilter);

    let where: any = { hotelId };

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
        requestedCheckIn = new Date(checkInDateParam);
        requestedCheckOut = new Date(checkOutDateParam);
      } else {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        requestedCheckIn = today;
        requestedCheckOut = new Date(today);
        requestedCheckOut.setDate(today.getDate() + 1);
      }

      where.status = 'ready';

      console.log('API: Applying available_today logic. Requested Check-in:', requestedCheckIn, 'Check-out:', requestedCheckOut);

      const bookedRoomsForPeriod = await prisma.bookedRoom.findMany({
        where: {
          booking: {
            hotelId,
            status: {
              in: ['confirmed', 'checked_in'],
            },
            AND: [
              {
                start: {
                  lt: requestedCheckOut,
                },
              },
              {
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
      console.log('API: Occupied Room IDs for period:', occupiedRoomIds);

      where.id = {
        notIn: occupiedRoomIds,
      };
    } else if (statusFilter !== 'all') {
      where.status = statusFilter;
    }

    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      where.OR = [
        { id: { contains: searchTerm } },
        { type: { contains: searchTerm } },
      ];
    }

    console.log('API: Final Prisma where clause:', JSON.stringify(where, null, 2));

    const rooms = await prisma.room.findMany({
      where,
    });

    console.log('API: Number of rooms found:', rooms.length);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ message: 'Error fetching rooms data' }, { status: 500 });
  }
}
