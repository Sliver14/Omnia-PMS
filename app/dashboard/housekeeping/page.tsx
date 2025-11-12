'use client';

import TaskBoard from './TaskBoard';

export default function HousekeepingPage() {
  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Housekeeping</h1>
        <p className="text-gray-600 mt-1">Assign and track cleaning tasks</p>
      </div>
      <TaskBoard />
    </div>
  );
}