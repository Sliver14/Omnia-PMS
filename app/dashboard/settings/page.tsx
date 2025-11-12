'use client';

import { useState } from 'react';
import { Bell, Globe, Save, ShieldCheck } from 'lucide-react';

interface Preferences {
  propertyName: string;
  timezone: string;
  currency: string;
  notifications: boolean;
  autoAssignHousekeeping: boolean;
}

const initialPreferences: Preferences = {
  propertyName: 'HotelAdmin Pro Demo',
  timezone: 'UTC+1 (Central European Time)',
  currency: 'USD – US Dollar',
  notifications: true,
  autoAssignHousekeeping: true,
};

export default function SettingsPage() {
  const [form, setForm] = useState(initialPreferences);

  return (
    <div className="space-y-6 text-gray-900">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure property preferences, notifications, and automation rules.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Property Details</h2>
              <p className="text-sm text-gray-500">
                Keep general information up to date for staff and guest emails.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Property Name</span>
              <input
                value={form.propertyName}
                onChange={event => setForm({ ...form, propertyName: event.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Timezone</span>
              <select
                value={form.timezone}
                onChange={event => setForm({ ...form, timezone: event.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-4 (Atlantic Time)</option>
                <option>UTC (GMT)</option>
                <option>UTC+1 (Central European Time)</option>
                <option>UTC+5:30 (India Standard Time)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Default Currency</span>
              <select
                value={form.currency}
                onChange={event => setForm({ ...form, currency: event.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>USD – US Dollar</option>
                <option>EUR – Euro</option>
                <option>GBP – British Pound</option>
                <option>NGN – Nigerian Naira</option>
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-gray-500">
                Decide when to alert staff about bookings, maintenance, and VIP arrivals.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={event => setForm({ ...form, notifications: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="text-sm font-medium text-gray-700">Booking notifications</span>
                <p className="text-sm text-gray-500">
                  Alert the front desk when reservations are added or updated.
                </p>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.autoAssignHousekeeping}
                onChange={event =>
                  setForm({ ...form, autoAssignHousekeeping: event.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="text-sm font-medium text-gray-700">Auto-assign housekeeping</span>
                <p className="text-sm text-gray-500">
                  Automatically schedule cleaning tasks after checkout.
                </p>
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="text-sm text-gray-500">
              Enable multi-factor authentication and set password rotation policies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Require MFA for staff</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Recommended (Managers & Admins)</option>
              <option>All staff accounts</option>
              <option>Disabled</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password rotation</span>
            <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Every 90 days</option>
              <option>Every 60 days</option>
              <option>Every 30 days</option>
              <option>Disabled</option>
            </select>
          </label>
        </div>

        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </section>
    </div>
  );
}

