import { PrismaClient, RoomStatus, BookingStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const users = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'frontdesk', password: 'frontdeskpassword', role: 'frontdesk' },
    { username: 'housekeeper', password: 'housekeeperpassword', role: 'housekeeping' },
    { username: 'maintenance', password: 'maintenancepassword', role: 'maintenance' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  // Seed Rooms
  const rooms: { id: string; type: string; floor: number; status: RoomStatus; price: number }[] = [
    { id: '101', type: 'Standard', floor: 1, status: 'ready', price: 100.00 },
    { id: '102', type: 'Deluxe', floor: 1, status: 'ready', price: 150.00 },
    { id: '103', type: 'Suite', floor: 1, status: 'cleaning', price: 250.00 },
    { id: '104', type: 'Family', floor: 1, status: 'maintenance', price: 200.00 },
    { id: '105', type: 'Standard', floor: 1, status: 'ready', price: 100.00 },
    { id: '201', type: 'Deluxe', floor: 2, status: 'ready', price: 150.00 },
    { id: '202', type: 'Suite', floor: 2, status: 'cleaning', price: 250.00 },
    { id: '203', type: 'Family', floor: 2, status: 'maintenance', price: 200.00 },
    { id: '204', type: 'Standard', floor: 2, status: 'ready', price: 100.00 },
    { id: '205', type: 'Deluxe', floor: 2, status: 'ready', price: 150.00 },
    { id: '301', type: 'Suite', floor: 3, status: 'cleaning', price: 250.00 },
    { id: '302', type: 'Family', floor: 3, status: 'maintenance', price: 200.00 },
    { id: '303', type: 'Standard', floor: 3, status: 'ready', price: 100.00 },
    { id: '304', type: 'Deluxe', floor: 3, status: 'ready', price: 150.00 },
    { id: '305', type: 'Suite', floor: 3, status: 'cleaning', price: 250.00 },
  ];

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  // Seed Guests and Bookings
  const guest1 = await prisma.guest.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+123456789',
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+198765432',
    },
  });

  const guest3 = await prisma.guest.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+112233445',
    },
  });

  const room301 = await prisma.room.findUnique({ where: { id: '301' } });
  if (!room301) throw new Error('Room 301 not found');

  await prisma.booking.create({
    data: {
      title: 'John Doe – 301',
      start: new Date('2025-11-10T12:00:00.000Z'),
      end: new Date('2025-11-13T12:00:00.000Z'),
      guestId: guest1.id,
      status: 'checked_out', // Changed to checked_out as they are leaving today
      totalPrice: room301.price * 3, // Assuming 3 nights
      bookedRooms: {
        create: [
          {
            roomId: room301.id,
            price: room301.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const room205 = await prisma.room.findUnique({ where: { id: '205' } });
  if (!room205) throw new Error('Room 205 not found');

  await prisma.booking.create({
    data: {
      title: 'Jane Smith – 205',
      start: new Date('2025-11-14T12:00:00.000Z'),
      end: new Date('2025-11-16T12:00:00.000Z'),
      guestId: guest2.id,
      status: 'confirmed',
      totalPrice: room205.price * 2, // Assuming 2 nights
      bookedRooms: {
        create: [
          {
            roomId: room205.id,
            price: room205.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const room102 = await prisma.room.findUnique({ where: { id: '102' } });
  if (!room102) throw new Error('Room 102 not found');

  await prisma.booking.create({
    data: {
      title: 'Mike Johnson – 102',
      start: new Date('2025-11-13T12:00:00.000Z'),
      end: new Date('2025-11-15T12:00:00.000Z'),
      guestId: guest3.id,
      status: 'checked_in', // Changed to checked_in
      totalPrice: room102.price * 2, // Assuming 2 nights
      bookedRooms: {
        create: [
          {
            roomId: room102.id,
            price: room102.price,
            quantity: 1,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
