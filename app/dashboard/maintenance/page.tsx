'use client';

import AlertFeed from './AlertFeed';

export default function MaintenancePage() {
  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Alerts</h1>
        <p className="text-gray-600 mt-1">Track and resolve room issues</p>
      </div>
      <AlertFeed />
    </div>
  );
}