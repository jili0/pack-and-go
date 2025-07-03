// 3. src/components/SocketManager.jsx (Verbesserte Komponente)
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/useSocket';
import { useAuth } from '@/context/AuthContext'; // Dein Auth Context

export default function SocketManager() {
  const { registerUser, isConnected, notifications, clearNotifications } = useSocket();
  const { user } = useAuth(); // Dein Auth Context
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted');
      });
    }
  }, []);

  useEffect(() => {
    if (isConnected && user) {
      registerUser(user.id, user.role);
    }
  }, [isConnected, user, registerUser]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mt-2 space-y-2">
          {notifications.slice(-3).map((notification, index) => (
            <div
              key={index}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm animate-slide-in"
            >
              <p className="font-semibold capitalize">{notification.type.replace('-', ' ')}</p>
              <p className="text-sm">{notification.message}</p>
              <button
                onClick={() => clearNotifications()}
                className="text-xs mt-1 hover:underline opacity-80"
              >
                Clear all
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
