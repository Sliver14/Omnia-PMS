import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

interface Context {
  params: {
    id: string;
  };
}

// PUT (update) a room
export async function PUT(request: NextRequest, context: any) {
  const hotelId = request.headers.get('X-Hotel-ID');
  if (!hotelId) {
    return NextResponse.json({ message: 'X-Hotel-ID header is required' }, { status: 400 });
  }

  try {
    const updatedRoomData = await request.json();
    const { id } = context.params;

    const updatedRoom = await prisma.room.update({
      where: { id, hotelId },
      data: updatedRoomData,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    // Provide more specific error message if room not found for that hotel
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Room not found for the specified hotel' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating room' }, { status: 500 });
  }
}
