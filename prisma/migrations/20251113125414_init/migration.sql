/*
  Warnings:

  - You are about to drop the column `price` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomType` on the `Booking` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "BookedRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" REAL NOT NULL,
    CONSTRAINT "BookedRoom_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookedRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'bank_transfer',
    "isPaymentConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("end", "guestId", "id", "isPaymentConfirmed", "notes", "paymentMethod", "paymentStatus", "start", "status", "title") SELECT "end", "guestId", "id", "isPaymentConfirmed", "notes", "paymentMethod", "paymentStatus", "start", "status", "title" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
