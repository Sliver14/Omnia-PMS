// import { NextResponse } from 'next/server';
// import prisma from '../../lib/prisma';

// // GET all bookings
// export async function GET() {
//   try {
//     const bookings = await prisma.booking.findMany({
//       include: {
//         guest: true,
//         bookedRooms: {
//           include: {
//             room: true, // ✅ include full room info for each booked room
//           },
//         },
//       },
//     });
//     return NextResponse.json(bookings);
//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     return NextResponse.json({ message: 'Error fetching bookings data' }, { status: 500 });
//   }
// }

// // POST a new booking
// export async function POST(request: Request) {
//   try {
//     const { guest, bookedRooms, ...bookingData } = await request.json();

//     // Find or create guest
//     const existingGuest = await prisma.guest.findUnique({
//       where: { email: guest.email },
//     });

//     let guestRecord;
//     if (existingGuest) {
//       guestRecord = existingGuest;
//     } else {
//       guestRecord = await prisma.guest.create({
//         data: {
//           name: guest.name,
//           email: guest.email,
//           phone: guest.phone,
//         },
//       });
//     }

//     // Calculate total price from bookedRooms
//     const totalPrice = bookedRooms.reduce((sum: number, room: { price: number; quantity: number }) => sum + (room.price * room.quantity), 0);

//     const newBooking = await prisma.booking.create({
//       data: {
//         ...bookingData,
//         start: new Date(bookingData.start),
//         end: new Date(bookingData.end),
//         guestId: guestRecord.id,
//         totalPrice: totalPrice, // Set the calculated total price
//         bookedRooms: {
//           create: bookedRooms.map((room: { roomId: string; price: number; quantity: number }) => ({
//             roomId: room.roomId,
//             price: room.price,
//             quantity: room.quantity,
//           })),
//         },
//       },
//       include: { guest: true, bookedRooms: true },
//     });

//     return NextResponse.json(newBooking, { status: 201 });
//   } catch (error) {
//     console.error('Error creating booking:', error);
//     return NextResponse.json({ message: 'Error creating booking' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// GET all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: true,
        bookedRooms: {
          include: {
            room: true, // ✅ include full room info for each booked room
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

// POST a new booking
export async function POST(request: Request) {
  try {
    const { guest, bookedRooms, status, ...bookingData } = await request.json();

    // Calculate number of days
    const startDate = new Date(bookingData.start);
    startDate.setHours(12, 0, 0, 0); // Set check-in time to 12 PM
    const endDate = new Date(bookingData.end);
    endDate.setHours(12, 0, 0, 0); // Set check-out time to 12 PM
    const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());
    const numberOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

    // Find or create guest
    let guestRecord = await prisma.guest.findUnique({
      where: { email: guest.email },
    });
    if (!guestRecord) {
      guestRecord = await prisma.guest.create({
        data: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
        },
      });
    }

    // Calculate total price from bookedRooms, including number of days
    const totalPrice = bookedRooms.reduce(
      (sum: number, room: { price: number; quantity: number }) =>
        sum + room.price * room.quantity * numberOfDays,
      0
    );

    // Check for room availability
    for (const bookedRoom of bookedRooms) {
      const existingBookings = await prisma.bookedRoom.findMany({
        where: {
          roomId: bookedRoom.roomId,
          booking: {
            status: {
              in: ['confirmed', 'checked_in'],
            },
            OR: [
              {
                start: {
                  lt: endDate, // existing booking starts before new booking ends
                },
                end: {
                  gt: startDate, // existing booking ends after new booking starts
                },
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

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        ...bookingData,
        start: new Date(bookingData.start),
        end: new Date(bookingData.end),
        guestId: guestRecord.id,
        status: status, // status passed from frontend
        totalPrice,
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
