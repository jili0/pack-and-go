"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { ...notification, id }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000); // Auto-hide after 5 seconds
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* Basic notification UI */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type}`}>
            <strong>{n.title}</strong>
            <p>{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
