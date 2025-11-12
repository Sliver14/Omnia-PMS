'use client';

import { useState } from 'react';
import { UserPlus, Search, Users } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
}

const staff: StaffMember[] = [
  { id: '1', name: 'Maria Garcia', role: 'Front Desk', shift: 'Morning', status: 'on-duty' },
  { id: '2', name: 'Carlos Mendes', role: 'Housekeeping Lead', shift: 'Evening', status: 'on-duty' },
  { id: '3', name: 'Priya Desai', role: 'Maintenance', shift: 'On Call', status: 'off-duty' },
  { id: '4', name: 'Leo Thompson', role: 'Concierge', shift: 'Afternoon', status: 'on-duty' },
  { id: '5', name: 'Aisha Rahman', role: 'Housekeeping', shift: 'Morning', status: 'on-duty' },
  { id: '6', name: 'Sam Peterson', role: 'Security', shift: 'Night', status: 'off-duty' },
];

const statusStyles: Record<StaffMember['status'], string> = {
  'on-duty': 'bg-emerald-100 text-emerald-700',
  'off-duty': 'bg-gray-100 text-gray-700',
  'on-leave': 'bg-amber-100 text-amber-700',
};

export default function StaffPage() {
  const [query, setQuery] = useState('');

  const filtered = staff.filter(member =>
    `${member.name} ${member.role}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 text-gray-900">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Directory</h1>
          <p className="text-gray-600 mt-1">
            Track availability, shifts, and assignments across your team.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <UserPlus className="w-4 h-4" />
          Add Staff
        </button>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search staff..."
              />
            </div>
            <span className="text-sm text-gray-500">
              {filtered.length} of {staff.length} team members
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm">
            <Users className="w-4 h-4" />
            {staff.filter(member => member.status === 'on-duty').length} on duty now
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 text-left">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Shift
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">#{member.id.padStart(3, '0')}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{member.role}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{member.shift}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[member.status]}`}
                  >
                    {member.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium space-x-3">
                  <button className="hover:text-blue-700">Assign</button>
                  <button className="hover:text-blue-700">Message</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No staff found. Try adjusting filters.</div>
        )}
      </section>
    </div>
  );
}

