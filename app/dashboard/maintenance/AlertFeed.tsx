import { useState } from 'react';
import { AlertCircle, Wrench, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  room: string;
  issue: string;
  reportedBy: string;
  timestamp: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

const mockAlerts: Alert[] = [
  { id: '1', room: '301', issue: 'AC not cooling', reportedBy: 'Guest', timestamp: new Date(), status: 'open' },
  { id: '2', room: '205', issue: 'Leaky faucet', reportedBy: 'Housekeeping', timestamp: new Date(Date.now() - 3600000), status: 'in-progress' },
];

export default function AlertFeed() {
  const [alerts] = useState(mockAlerts);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'in-progress': return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-4 text-gray-900">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-white text-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
          <div className="flex-shrink-0">
            {getStatusIcon(alert.status)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">Room {alert.room} - {alert.issue}</h4>
                <p className="text-sm text-gray-600 mt-1">Reported by {alert.reportedBy}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {alert.status === 'open' && (
                <button className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
                  Start Repair
                </button>
              )}
              {alert.status === 'in-progress' && (
                <button className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}