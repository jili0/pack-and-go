"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/useSocket";

export default function NotificationButton({ account }) {
  const router = useRouter();
  const { notifications, clearNotifications, removeNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  const filteredNotifications = notifications.filter((notification) => {
    const { type, target } = notification;

    if (target) {
      switch (account?.role) {
        case "user":
          return target === "user" || target === "all";
        case "company":
          return target === "company" || target === "all";
        case "admin":
          return true;
        default:
          return false;
      }
    }

    switch (account?.role) {
      case "user":
        return ["order-confirmed", "order-cancelled"].includes(type);
      case "company":
        return [
          "order-created",
          "order-user-cancelled",
          "review-submitted",
        ].includes(type);
      case "admin":
        return true;
      default:
        return false;
    }
  });

  const unreadCount = filteredNotifications.filter(
    (n) => !readIds.has(`${n.type}-${n.orderId}-${n.timestamp}`)
  ).length;

  const handleDropdownOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setReadIds(
          new Set(
            filteredNotifications.map(
              (n) => `${n.type}-${n.orderId}-${n.timestamp}`
            )
          )
        );
      }, 1000);
    }
  };

  const handleNotificationClick = (notification, index) => {
    const { type, orderId } = notification;
    const routes = {
      "order-created": () =>
        account?.role === "company" && `/company#order-${orderId}`,
      newBookingRequest: () =>
        account?.role === "company" && `/company#order-${orderId}`,
      "order-confirmed": () =>
        account?.role === "user" && `/account/orders/${orderId}`,
      bookingConfirmed: () =>
        account?.role === "user" && `/account/orders/${orderId}`,
      "order-cancelled": () =>
        account?.role === "user" && `/account/orders/${orderId}`,
      bookingCancelled: () =>
        account?.role === "user" && `/account/orders/${orderId}`,
      "order-user-cancelled": () =>
        account?.role === "company" && `/company#order-${orderId}`,
      "review-submitted": () =>
        account?.role === "company" && `/company/reviews`,
    };

    const route = routes[type]?.();
    if (route) {
      router.push(route);
      removeNotification(index);
      setIsOpen(false);
    }
  };

  const getIcon = (type) =>
    ({
      "order-created": "📦",
      newBookingRequest: "📦",
      "order-confirmed": "✅",
      bookingConfirmed: "✅",
      "order-cancelled": "❌",
      bookingCancelled: "❌",
      "order-user-cancelled": "🚫",
      "review-submitted": "⭐",
    })[type] || "📬";

  const getTitle = (type) =>
    ({
      "order-created": "New Request",
      newBookingRequest: "New Request",
      "order-confirmed": "Confirmed",
      bookingConfirmed: "Confirmed",
      "order-cancelled": "Cancelled",
      bookingCancelled: "Cancelled",
      "order-user-cancelled": "User Cancelled",
      "review-submitted": "New Review",
    })[type] || "Notification";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(".notification-wrapper"))
        setIsOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notification-wrapper user-dropdown">
      <button onClick={handleDropdownOpen} className="notification-btn">
        <svg
          viewBox="0 0 24 24"
          width={36}
          height={36}
          fill="none"
          stroke="#007bff"
          strokeWidth="3"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu notification-dropdown">
          {filteredNotifications.length === 0 ? (
            <p className="notification-empty">No new notifications</p>
          ) : (
            <>
              <div className="notification-list">
                {filteredNotifications.slice(-5).map((notification, idx) => {
                  const id = `${notification.type}-${notification.orderId}-${notification.timestamp}`;
                  const isRead = readIds.has(id);
                  return (
                    <div
                      key={id}
                      className={`notification-item ${!isRead ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(notification, idx)}
                    >
                      <div className="notification-header">
                        <strong>
                          {getIcon(notification.type)}{" "}
                          {getTitle(notification.type)}
                          {!isRead && <span className="unread-dot">•</span>}
                        </strong>
                        <div className="notification-actions">
                          <span className="notification-time">
                            {new Date(
                              notification.timestamp
                            ).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(idx);
                            }}
                            className="notification-delete btn-secondary"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      {notification.orderId && (
                        <p className="notification-footer">
                          Order: {notification.orderId} • Click to view
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  clearNotifications();
                  setIsOpen(false);
                }}
                className="notification-clear"
              >
                🗑️ Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
