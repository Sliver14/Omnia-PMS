'use client';

import { useMemo } from 'react';
import { CalendarRange, TrendingUp, Users, DollarSign } from 'lucide-react';
import { rooms } from '../../data/rooms';

const revenueByMonth = [
  { month: 'Aug', revenue: 48000 },
  { month: 'Sep', revenue: 51200 },
  { month: 'Oct', revenue: 49800 },
  { month: 'Nov', revenue: 54500 },
];

const occupancy = [
  { label: 'Available', value: rooms.filter(r => r.status === 'available').length },
  { label: 'Occupied', value: rooms.filter(r => r.status === 'occupied').length },
  { label: 'Cleaning', value: rooms.filter(r => r.status === 'cleaning').length },
  { label: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length },
];

export default function ReportsPage() {
  const totalRevenue = useMemo(
    () => revenueByMonth.reduce((sum, entry) => sum + entry.revenue, 0),
    []
  );

  return (
    <div className="space-y-6 text-gray-900">
      <header>
        <h1 className="text-3xl font-bold">Performance Reports</h1>
        <p className="text-gray-600 mt-1">
          Review revenue trends, occupancy, and staffing metrics at a glance.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YTD Revenue</p>
              <p className="text-2xl font-semibold">${(totalRevenue / 1000).toFixed(1)}k</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+6.4% vs. last year</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Occupancy</p>
              <p className="text-2xl font-semibold">
                {Math.round((occupancy[1].value / rooms.length) * 100)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+2.1 pts week over week</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Housekeeping Load</p>
              <p className="text-2xl font-semibold">{occupancy[2].value} rooms</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Balanced across three shifts</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Trend</h2>
            <CalendarRange className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {revenueByMonth.map(entry => (
              <div key={entry.month} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium text-gray-500">{entry.month}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: `${(entry.revenue / 60000) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-sm font-semibold text-gray-800">
                  ${(entry.revenue / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Occupancy Breakdown</h2>
          <div className="space-y-4">
            {occupancy.map(segment => (
              <div key={segment.label} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600">{segment.label}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-purple-500"
                    style={{ width: `${(segment.value / rooms.length) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-semibold text-gray-800">
                  {segment.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

