// cron-jobs/updateBookingStatus.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBookingStatuses() {
  try {
    const now = new Date();
    // Ensure 'now' is also set to a specific time if comparisons are always at 12 PM
    // For example, if check-in is always 12 PM, then 'now' should be compared against 12 PM boundaries.
    // For this cron job, we'll assume 'now' is the exact time for comparison.

    console.log(`[${now.toISOString()}] Running updateBookingStatuses cron job...`);

    // --- Update Confirmed to Checked_In ---
    // Find confirmed bookings whose check-in time (12 PM on start date) has passed
    const bookingsToCheckIn = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        start: {
          lte: now, // Booking start time (12 PM) is now or in the past
        },
      },
      include: {
        bookedRooms: true,
      },
    });

    if (bookingsToCheckIn.length > 0) {
      console.log(`Found ${bookingsToCheckIn.length} bookings to check in.`);
      for (const booking of bookingsToCheckIn) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'checked_in' },
        });
        console.log(`Booking ${booking.id} checked in.`);
        // Note: Room status is dynamically determined, so no static 'occupied' update here.
      }
    } else {
      console.log('No confirmed bookings to check in.');
    }


    // --- Update Checked_In to Checked_Out ---
    // Find checked_in bookings whose check-out time (12 PM on end date) has passed
    const bookingsToCheckOut = await prisma.booking.findMany({
      where: {
        status: 'checked_in',
        end: {
          lte: now, // Booking end time (12 PM) is now or in the past
        },
      },
      include: {
        bookedRooms: true,
      },
    });

    if (bookingsToCheckOut.length > 0) {
      console.log(`Found ${bookingsToCheckOut.length} bookings to check out.`);
      for (const booking of bookingsToCheckOut) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'checked_out' },
        });
        console.log(`Booking ${booking.id} checked out.`);

        // Set associated rooms to 'cleaning' status
        const roomIds = booking.bookedRooms.map(br => br.roomId);
        if (roomIds.length > 0) {
          await prisma.room.updateMany({
            where: { id: { in: roomIds } },
            data: { status: 'cleaning' },
          });
          console.log(`Rooms ${roomIds.join(', ')} set to 'cleaning' for booking ${booking.id}.`);
        }
      }
    } else {
      console.log('No checked-in bookings to check out.');
    }

    console.log('updateBookingStatuses cron job finished.');
  } catch (error) {
    console.error('Error in updateBookingStatuses cron job:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingStatuses();
