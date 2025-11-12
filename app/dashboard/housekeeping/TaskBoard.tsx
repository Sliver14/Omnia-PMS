'use client';

import { useMemo, useState } from 'react';
import { Play, CheckCircle, RotateCcw } from 'lucide-react';
import { rooms } from '../../data/rooms';

type TaskStatus = 'pending' | 'in-progress' | 'completed';

interface Task {
  id: string;
  room: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  status: TaskStatus;
  notes?: string;
}

const staffPool = ['Maria', 'Carlos', 'Aisha', 'Leo', 'Priya', 'Sam'];

const initialTasks: Task[] = rooms
  .filter(room => room.status === 'cleaning' || room.status === 'maintenance')
  .map((room, index) => {
    const priority: Task['priority'] = room.status === 'maintenance' ? 'high' : 'medium';
    const status: TaskStatus = room.status === 'maintenance' ? 'in-progress' : 'pending';
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

const columns: { key: TaskStatus; label: string; emptyState: string }[] = [
  { key: 'pending', label: 'To Do', emptyState: 'No pending tasks' },
  { key: 'in-progress', label: 'In Progress', emptyState: 'Nothing in progress' },
  { key: 'completed', label: 'Completed', emptyState: 'No tasks completed yet' },
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const grouped = useMemo(
    () =>
      columns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.status === column.key),
      })),
    [tasks]
  );

  const updateStatus = (taskId: string, next: TaskStatus) => {
    setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status: next } : task)));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      onClick={() => updateStatus(task.id, 'in-progress')}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => updateStatus(task.id, 'completed')}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button
                      onClick={() => updateStatus(task.id, 'pending')}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reopen
                    </button>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
