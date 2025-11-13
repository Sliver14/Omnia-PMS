// import { NextResponse, NextRequest } from 'next/server';
// import prisma from '../../../lib/prisma';

// interface Context {
//   params: {
//     id: string;
//   };
// }

// // PUT (update) a booking
// export async function PUT(request: NextRequest, context: Context) {
//   try {
//     const { guest, bookedRooms, ...bookingData } = await request.json();
//     const { id } = context.params;

//     const existingBooking = await prisma.booking.findUnique({
//       where: { id },
//       include: { bookedRooms: true },
//     });

//     if (!existingBooking) {
//       return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
//     }

//     // Handle guest update/creation if guest data is provided
//     let guestConnectOrCreate = {};
//     if (guest && guest.email) {
//       const existingGuest = await prisma.guest.findUnique({
//         where: { email: guest.email },
//       });

//       if (existingGuest) {
//         guestConnectOrCreate = { connect: { id: existingGuest.id } };
//       } else {
//         guestConnectOrCreate = { create: { name: guest.name, email: guest.email, phone: guest.phone } };
//       }
//     }

//     // Delete existing BookedRoom entries for this booking
//     await prisma.bookedRoom.deleteMany({
//       where: { bookingId: id },
//     });

//     // Calculate total price from bookedRooms
//     const totalPrice = bookedRooms.reduce((sum: number, room: { price: number; quantity: number }) => sum + (room.price * room.quantity), 0);

//     const updatedBooking = await prisma.booking.update({
//       where: { id },
//       data: {
//         ...bookingData,
//         start: bookingData.start ? new Date(bookingData.start) : undefined,
//         end: bookingData.end ? new Date(bookingData.end) : undefined,
//         guest: guestConnectOrCreate,
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

//     // Logic to update room status based on booking status
//     if (bookingData.status) {
//       for (const bookedRoom of updatedBooking.bookedRooms) {
//         const roomId = bookedRoom.roomId;
//         let newRoomStatus = null;

//         if (bookingData.status === 'confirmed' || bookingData.status === 'checked_in') {
//           newRoomStatus = 'occupied';
//         } else if (bookingData.status === 'cancelled' || bookingData.status === 'checked_out') {
//           // Check if there are any other active bookings for this room
//           const activeBookingsForRoom = await prisma.booking.findMany({
//             where: {
//               bookedRooms: {
//                 some: {
//                   roomId: roomId,
//                 },
//               },
//               NOT: {
//                 id: updatedBooking.id, // Exclude the current booking
//               },
//               status: {
//                 in: ['confirmed', 'checked_in'],
//               },
//               end: {
//                 gte: new Date(), // Only consider bookings that haven't ended yet
//               },
//             },
//           });

//           if (activeBookingsForRoom.length === 0) {
//             newRoomStatus = 'available';
//           } else {
//             newRoomStatus = 'occupied'; // Another active booking exists
//           }
//         }

//         if (newRoomStatus) {
//           await prisma.room.update({
//             where: { id: roomId },
//             data: { status: newRoomStatus },
//           });
//         }
//       }
//     }

//     return NextResponse.json(updatedBooking);
//   } catch (error) {
//     console.error('Error updating booking:', error);
//     return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
//   }
// }

// // DELETE a booking
// export async function DELETE(request: NextRequest, context: Context) {
//   try {
//     const { id } = context.params;

//     // Fetch the booking to get its associated rooms before deletion
//     const bookingToDelete = await prisma.booking.findUnique({
//       where: { id },
//       include: { bookedRooms: true },
//     });

//     if (!bookingToDelete) {
//       return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
//     }

//     const roomIdsToUpdate = bookingToDelete.bookedRooms.map(br => br.roomId);

//     // Delete associated BookedRoom entries first
//     await prisma.bookedRoom.deleteMany({
//       where: { bookingId: id },
//     });

//     await prisma.booking.delete({
//       where: { id },
//     });

//     // After deleting the booking, check if rooms can be set to 'available'
//     for (const roomId of roomIdsToUpdate) {
//       const activeBookingsForRoom = await prisma.booking.findMany({
//         where: {
//           bookedRooms: {
//             some: {
//               roomId: roomId,
//             },
//           },
//           status: {
//             in: ['confirmed', 'checked_in'],
//           },
//           end: {
//             gte: new Date(), // Only consider bookings that haven't ended yet
//           },
//         },
//       });

//       if (activeBookingsForRoom.length === 0) {
//         await prisma.room.update({
//           where: { id: roomId },
//           data: { status: 'available' },
//         });
//       }
//     }

//     return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
//   } catch (error) {
//     console.error('Error deleting booking:', error);
//     return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
//   }
// }


import { NextResponse, NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

interface Context {
  params: {
    id: string;
  };
}

// ---------------------------
export async function PUT(request: NextRequest, context: any) {
  try {
    const { guest, bookedRooms, status, ...bookingData } = await request.json();
    const { id } = context.params;

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { bookedRooms: true },
    });

    if (!existingBooking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Handle guest update/creation
    let guestConnectOrCreate: any = {};
    if (guest?.email) {
      const existingGuest = await prisma.guest.findUnique({ where: { email: guest.email } });
      guestConnectOrCreate = existingGuest
        ? { connect: { id: existingGuest.id } }
        : { create: { name: guest.name, email: guest.email, phone: guest.phone } };
    }

    // Delete existing bookedRooms
    await prisma.bookedRoom.deleteMany({ where: { bookingId: id } });

    // Calculate total price
    const totalPrice = bookedRooms.reduce(
      (sum: number, room: { price: number; quantity: number }) => sum + room.price * room.quantity,
      0
    );

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...bookingData,
        start: bookingData.start ? (() => { const d = new Date(bookingData.start); d.setHours(12, 0, 0, 0); return d; })() : undefined,
        end: bookingData.end ? (() => { const d = new Date(bookingData.end); d.setHours(12, 0, 0, 0); return d; })() : undefined,
        guest: guestConnectOrCreate,
        status,
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



    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const { id } = context.params;

    const bookingToDelete = await prisma.booking.findUnique({
      where: { id },
      include: { bookedRooms: true },
    });

    if (!bookingToDelete) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    const roomIds = bookingToDelete.bookedRooms.map(br => br.roomId);

    // Delete bookedRooms then booking
    await prisma.bookedRoom.deleteMany({ where: { bookingId: id } });
    await prisma.booking.delete({ where: { id } });



    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
  }
}
