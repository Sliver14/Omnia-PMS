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
    { id: '101', type: 'Standard', floor: 1, status: 'available', price: 100.00 },
    { id: '102', type: 'Deluxe', floor: 1, status: 'occupied', price: 150.00 },
    { id: '103', type: 'Suite', floor: 1, status: 'cleaning', price: 250.00 },
    { id: '104', type: 'Family', floor: 1, status: 'maintenance', price: 200.00 },
    { id: '105', type: 'Standard', floor: 1, status: 'available', price: 100.00 },
    { id: '201', type: 'Deluxe', floor: 2, status: 'occupied', price: 150.00 },
    { id: '202', type: 'Suite', floor: 2, status: 'cleaning', price: 250.00 },
    { id: '203', type: 'Family', floor: 2, status: 'maintenance', price: 200.00 },
    { id: '204', type: 'Standard', floor: 2, status: 'available', price: 100.00 },
    { id: '205', type: 'Deluxe', floor: 2, status: 'occupied', price: 150.00 },
    { id: '301', type: 'Suite', floor: 3, status: 'cleaning', price: 250.00 },
    { id: '302', type: 'Family', floor: 3, status: 'maintenance', price: 200.00 },
    { id: '303', type: 'Standard', floor: 3, status: 'available', price: 100.00 },
    { id: '304', type: 'Deluxe', floor: 3, status: 'occupied', price: 150.00 },
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

  await prisma.booking.create({
    data: {
      title: 'John Doe – 301',
      start: new Date('2025-11-12T00:00:00.000Z'),
      end: new Date('2025-11-15T00:00:00.000Z'),
      room: '301',
      roomType: 'Deluxe Suite',
      guestId: guest1.id,
      status: 'checked_in',
      price: 250,
    },
  });

  await prisma.booking.create({
    data: {
      title: 'Jane Smith – 205',
      start: new Date('2025-11-12T00:00:00.000Z'),
      end: new Date('2025-11-14T00:00:00.000Z'),
      room: '205',
      roomType: 'Standard',
      guestId: guest2.id,
      status: 'confirmed',
      price: 120,
    },
  });

  await prisma.booking.create({
    data: {
      title: 'Mike Johnson – 402',
      start: new Date('2025-11-13T00:00:00.000Z'),
      end: new Date('2025-11-16T00:00:00.000Z'),
      room: '402',
      roomType: 'Premium',
      guestId: guest3.id,
      status: 'confirmed',
      price: 180,
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
