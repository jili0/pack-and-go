// 3. src/components/SocketManager.jsx (Verbesserte Komponente)
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/useSocket';
import { useAuth } from '@/context/AuthContext'; // Dein Auth Context

export default function SocketManager() {
  const { registerUser, isConnected, notifications, clearNotifications } = useSocket();
  const { account } = useAuth(); // Dein Auth Context
  const [hasPermission, setHasPermission] = useState(false);
  const role = account?.role;
  const filteredNotifications = notifications.filter((n) => {
  if (role === 'user') {
    return ['order-confirmed', 'order-cancelled'].includes(n.type);
  }
  if (role === 'company') {
    return ['order-created', 'review-submitted'].includes(n.type);
  }
  if (role === 'admin') {
    return ['order-created'].includes(n.type);
  }
  return false;
});


  // useEffect(() => {
  //   // Request notification permission
  //   if ('Notification' in window) {
  //     Notification.requestPermission().then(permission => {
  //       setHasPermission(permission === 'granted');
  //     });
  //   }
  // }, []);

  useEffect(() => {
    if (isConnected && account) {
      console.log("🧠 account object at registerUser:", account);
      registerUser(account.id, account.role);
    }
  }, [isConnected, account, registerUser]);

  return (
    <div className="notification-container">
      {/* Notifications */}
      {filteredNotifications.length > 0 && (
        <div className="notification-list">
          {filteredNotifications.slice(-3).map((notification, index) => (
            <div key={index} className="notification-box">
              <p className="notification-title">
                {notification.type.replace('-', ' ')}
              </p>
              <p className="notification-message">{notification.message}</p>
              <button onClick={clearNotifications} className="notification-clear">
                Clear all
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}