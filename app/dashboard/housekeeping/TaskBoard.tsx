'use client';

import { useMemo, useState, useEffect } from 'react';
import { Play, CheckCircle, RotateCcw } from 'lucide-react';

import { RoomStatus } from '@prisma/client';

export interface Room {
  id: string;
  type: string;
  floor: number;
  status: RoomStatus;
}

type TaskStatus = 'pending' | 'in-progress'; // Removed 'completed'

interface Task {
  id: string;
  room: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  status: TaskStatus;
  notes?: string;
}

const staffPool = ['Maria', 'Carlos', 'Aisha', 'Leo', 'Priya', 'Sam'];

const columns: { key: TaskStatus; label:string; emptyState: string }[] = [
  { key: 'pending', label: 'To Do', emptyState: 'No pending tasks' },
  { key: 'in-progress', label: 'In Progress', emptyState: 'Nothing in progress' },
  // Removed 'completed' column
];

function statusAccent(status: TaskStatus) {
  if (status === 'pending') return 'border-yellow-200 bg-white';
  if (status === 'in-progress') return 'border-blue-200 bg-blue-50';
  return 'border-emerald-200 bg-emerald-50';
}

function priorityBadge(priority: Task['priority']) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchRoomsAndGenerateTasks = async () => {
    const res = await fetch('/api/rooms');
    const roomsData: Room[] = await res.json();

    const generatedTasks: Task[] = roomsData
      .filter(room => room.status === 'cleaning' || room.status === 'maintenance')
      .map((room, index) => {
        const priority: Task['priority'] = room.status === 'maintenance' ? 'high' : 'medium';
        const status: TaskStatus = room.status === 'cleaning' ? 'in-progress' : 'pending';
        const notes =
          room.status === 'maintenance'
            ? 'Awaiting maintenance follow-up'
            : 'Schedule housekeeping turnover';

        return {
          id: `task-${room.id}`,
          room: room.id,
          priority,
          assignedTo: staffPool[index % staffPool.length],
          status,
          notes,
        };
      });
    setTasks(generatedTasks);
  };

  useEffect(() => {
    fetchRoomsAndGenerateTasks();
  }, []);

  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    await fetch(`/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchRoomsAndGenerateTasks();
  };

  const handleStart = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateRoomStatus(task.room, 'cleaning');
    }
  };

  const handleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateRoomStatus(task.room, 'ready'); // Changed to 'ready'
    }
  };

  const grouped = useMemo(
    () =>
      columns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.status === column.key),
      })),
    [tasks]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto"> {/* Added overflow-x-auto */}
      {grouped.map(column => (
        <section key={column.key} className="bg-gray-50 text-gray-900 rounded-xl p-4 border border-gray-200">
          <header className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{column.label}</h3>
            <span className="text-sm text-gray-500">{column.tasks.length}</span>
          </header>

          <div className="space-y-3 min-h-40">
            {column.tasks.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">{column.emptyState}</p>
            )}

            {column.tasks.map(task => (
              <article
                key={task.id}
                className={`rounded-lg border shadow-sm transition-all ${statusAccent(task.status)}`}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="text-lg font-semibold leading-tight">#{task.room}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityBadge(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Assigned to <span className="font-medium text-gray-800">{task.assignedTo}</span>
                  </p>
                  {task.notes && <p className="text-xs text-gray-500 bg-white/70 rounded-md px-3 py-2">{task.notes}</p>}
                </div>

                <footer className="border-t border-gray-200 bg-white/60 px-4 py-3 flex items-center justify-end gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStart(task.id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                  {/* The 'Reopen' button is not implemented as it would require more complex state management */}
                </footer>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
