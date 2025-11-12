// lib/users.ts
export type Role = 'admin' | 'frontdesk' | 'housekeeping' | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@hotel.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Front Desk',
    email: 'frontdesk@hotel.com',
    password: 'desk123',
    role: 'frontdesk',
  },
  {
    id: '3',
    name: 'Maria (Housekeeping)',
    email: 'maria@hotel.com',
    password: 'clean123',
    role: 'housekeeping',
  },
  {
    id: '4',
    name: 'Carlos (Maintenance)',
    email: 'carlos@hotel.com',
    password: 'fix123',
    role: 'maintenance',
  },
];