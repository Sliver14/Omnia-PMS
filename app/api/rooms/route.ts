import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// GET all rooms
export async function GET() {
  try {
    const rooms = await prisma.room.findMany();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ message: 'Error fetching rooms data' }, { status: 500 });
  }
}
