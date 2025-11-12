// app/dashboard/page.tsx
import { redirect } from 'next/navigation';

// Simple auth check (replace with real auth later)
export default function AdminDashboard() {
  // In real app: check session
  // if (!user) redirect('/login');

  redirect('/dashboard/bookings'); // or show overview
}