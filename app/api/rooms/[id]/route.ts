import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

interface Context {
  params: {
    id: string;
  };
}

// PUT (update) a room
export async function PUT(request: NextRequest, context: any) {
  try {
    const updatedRoomData = await request.json();
    const { id } = await context.params; // Explicitly await context.params

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updatedRoomData,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ message: 'Error updating room' }, { status: 500 });
  }
}
