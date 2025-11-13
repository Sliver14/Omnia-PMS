// app/dashboard/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="space-y-6 text-gray-900">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <UserCircle className="w-16 h-16 text-gray-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {session.user?.name && (
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-lg font-semibold">{session.user.name}</p>
          </div>
        )}
        {session.user?.email && (
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg font-semibold">{session.user.email}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500">Username</p>
          <p className="text-lg font-semibold">{session.user?.username}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Role</p>
          <p className="text-lg font-semibold">{session.user?.role}</p>
        </div>
      </div>
    </div>
  );
}
