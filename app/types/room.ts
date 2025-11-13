import { RoomStatus } from '@prisma/client';

export interface Room {
  id: string;
  type: string;
  floor: number;
  status: RoomStatus;
  price: number;
}