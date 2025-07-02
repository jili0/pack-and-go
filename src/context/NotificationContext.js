// context/NotificationContext.js
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
      {/* UI for rendering notifications */}
      <div className="fixed top-5 right-5 z-50 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded shadow-lg bg-white border-l-4 ${
              n.type === "success"
                ? "border-green-500"
                : n.type === "error"
                ? "border-red-500"
                : n.type === "warning"
                ? "border-yellow-500"
                : "border-blue-500"
            }`}
          >
            <strong className="block font-semibold">{n.title}</strong>
            <p>{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
