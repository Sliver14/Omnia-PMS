'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StaffDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name}!</h2>
          <p className="mt-1 text-gray-600">
            You are logged in as a <span className="font-semibold">{session?.user?.role}</span>.
          </p>
        </div>
        <button
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              router.push('/staff/login');
            });
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
        <p className="mt-2 text-gray-600">
          This is where your assigned tasks will appear.
        </p>
        {/* Task list can be added here later */}
      </div>
    </div>
  );
}
