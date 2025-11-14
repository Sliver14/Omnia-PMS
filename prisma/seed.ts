import { PrismaClient, RoomStatus, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
console.log(prisma);

async function main() {
  console.log('Start seeding...');

  const hotelData = [
    { id: "clx1s2q5t000008l3g6f6e2z1", name: "Omnia Towers" },
    { id: "clx1s2q5t000108l3h2g2a2b2", name: "Omnia Hotels & Suites" },
    { id: "clx1s2q5t000208l3f6g6e2z3", name: "Omnia Court" },
    { id: "clx1s2q5t000308l3h2g2a2b4", name: "Omnia Castle" },
  ];

  for (const hotel of hotelData) {
    console.log(`Seeding hotel: ${hotel.name}`);

    const createdHotel = await prisma.hotel.upsert({
      where: { id: hotel.id },
      update: {},
      create: { id: hotel.id, name: hotel.name },
    });

    // Seed Users
    const users = [
      { username: `admin_${hotel.id.slice(-4)}`, password: 'adminpassword', role: 'admin' },
      { username: `frontdesk_${hotel.id.slice(-4)}`, password: 'frontdeskpassword', role: 'frontdesk' },
      { username: `housekeeper_${hotel.id.slice(-4)}`, password: 'housekeeperpassword', role: 'housekeeping' },
      { username: `maintenance_${hotel.id.slice(-4)}`, password: 'maintenancepassword', role: 'maintenance' },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
          hotelId: createdHotel.id,
        },
      });
    }

    // Seed Rooms
    const rooms = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 5; i++) {
        const roomNumber = `${floor}0${i}`;
        const types = ['Standard', 'Deluxe', 'Suite', 'Family'];
        const statuses: RoomStatus[] = ['ready', 'cleaning', 'maintenance'];
        rooms.push({
          id: `${hotel.id.slice(-4)}-${roomNumber}`,
          type: types[i % types.length],
          floor: floor,
          status: statuses[i % statuses.length],
          price: 100 + (i * 10),
          hotelId: createdHotel.id,
        });
      }
    }

    for (const room of rooms) {
      await prisma.room.create({ data: room });
    }

    // Seed Guests
    const guests = [];
    for (let i = 1; i <= 5; i++) {
      guests.push(await prisma.guest.create({
        data: {
          name: `Guest ${i} ${hotel.name}`,
          email: `guest${i}_${hotel.id.slice(-4)}@example.com`,
          phone: `+12345678${i}`,
          hotelId: createdHotel.id,
        },
      }));
    }

    // Seed Bookings
    const bookings = [
      {
        title: `Booking 1 for ${guests[0].name}`,
        start: new Date('2025-11-10T12:00:00.000Z'),
        end: new Date('2025-11-13T12:00:00.000Z'),
        guestId: guests[0].id,
        status: BookingStatus.checked_out,
        totalPrice: 300,
        roomId: rooms[0].id,
      },
      {
        title: `Booking 2 for ${guests[1].name}`,
        start: new Date('2025-11-14T12:00:00.000Z'),
        end: new Date('2025-11-16T12:00:00.000Z'),
        guestId: guests[1].id,
        status: BookingStatus.confirmed,
        totalPrice: 220,
        roomId: rooms[1].id,
      },
    ];

    for (const booking of bookings) {
      const room = rooms.find(r => r.id === booking.roomId);
      if (room) {
        await prisma.booking.create({
          data: {
            title: booking.title,
            start: booking.start,
            end: booking.end,
            guestId: booking.guestId,
            status: booking.status,
            totalPrice: booking.totalPrice,
            hotelId: createdHotel.id,
            bookedRooms: {
              create: [{
                roomId: room.id,
                price: room.price,
                quantity: 1,
              }],
            },
          },
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
