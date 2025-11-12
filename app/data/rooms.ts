export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export interface Room {
  id: string;
  type: string;
  floor: number;
  status: RoomStatus;
}

export const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Family'] as const;
export const roomStatuses: RoomStatus[] = ['available', 'occupied', 'cleaning', 'maintenance'];

export const rooms: Room[] = Array.from({ length: 3 }, (_, floorIndex) =>
  Array.from({ length: 20 }, (_, roomIndex) => {
    const idNumber = (floorIndex + 1) * 100 + (roomIndex + 1);
    return {
      id: idNumber.toString(),
      type: roomTypes[(roomIndex + floorIndex) % roomTypes.length],
      floor: floorIndex + 1,
      status: roomStatuses[(roomIndex + floorIndex) % roomStatuses.length],
    };
  })
).flat();

