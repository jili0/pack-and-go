// src/components/SocketManager.jsx (KORRIGIERT - Ohne doppelte CSS)
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/useSocket';
import { useAuth } from '@/context/AuthContext';

export default function SocketManager() {
  const { socket, registerUser, isConnected, notifications, clearNotifications, removeNotification } = useSocket();
  const { account } = useAuth();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // ✅ User Registration on Connection
  useEffect(() => {
    if (isConnected && account?.id && account?.role && !hasRegistered) {
      console.log("🧠 Registering user:", account.id, "as", account.role);
      registerUser(account.id, account.role);
      setHasRegistered(true);
    }
  }, [isConnected, account?.id, account?.role, hasRegistered, registerUser]);

  // ✅ Reset registration when account changes
  useEffect(() => {
    setHasRegistered(false);
  }, [account?.id]);

  // ✅ KORRIGIERTE Notification Filtering
  const getFilteredNotifications = () => {
    if (!account?.role) {
      console.log('🚫 No account role, showing no notifications');
      return [];
    }

    const filtered = notifications.filter((notification) => {
      const { type, target } = notification;
      
      // ✅ Neue Logik: Prüfe das 'target' Feld vom Backend
      if (target) {
        switch (account.role) {
          case 'user':
            return target === 'user' || target === 'all';
          case 'company':
            return target === 'company' || target === 'all';
          case 'admin':
            return true; // Admins sehen alles
          default:
            return false;
        }
      }
      
      // ✅ Fallback: Alte Logik basierend auf notification type
      switch (account.role) {
        case 'user':
          return ['order-confirmed', 'order-cancelled', 'bookingConfirmed', 'bookingCancelled'].includes(type);
        
        case 'company':
          return ['order-created', 'review-submitted', 'newBookingRequest'].includes(type);
        
        case 'admin':
          return true;
        
        default:
          return false;
      }
    });

    console.log(`🔍 Filtered notifications: ${filtered.length}/${notifications.length} for role: ${account.role}`);
    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // ✅ Individual delete notification function
  const deleteNotification = (indexToDelete) => {
    console.log("🗑️ Delete notification at index:", indexToDelete);
    const notificationToDelete = filteredNotifications[indexToDelete];
    const actualIndex = notifications.findIndex(n => 
      n.type === notificationToDelete.type && 
      n.orderId === notificationToDelete.orderId &&
      n.timestamp === notificationToDelete.timestamp
    );
    
    if (actualIndex !== -1) {
      removeNotification(actualIndex);
    }
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Debug Log
  console.log("🔍 Debug SocketManager:", {
    isConnected,
    accountRole: account?.role,
    accountId: account?.id,
    totalNotifications: notifications.length,
    filteredNotifications: filteredNotifications.length,
    hasRegistered,
  });

  return (
    <div className="notification-container">
      {/* ✅ Notifications */}
      {filteredNotifications.length > 0 && (
        <div className="notification-widget">
          {/* Header */}
          <div className="notification-header">
            <div className="notification-title">
              <span className="notification-icon">🔔</span>
              <span>Notifications ({filteredNotifications.length})</span>
            </div>
            <div className="notification-controls">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="control-btn"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <div className="dropdown-container">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="control-btn dropdown-btn"
                  title="Options"
                >
                  ⋮
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button 
                      onClick={() => {
                        clearNotifications();
                        setIsDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      🗑️ Clear All
                    </button>
                    <button 
                      onClick={() => {
                        setIsMinimized(true);
                        setIsDropdownOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      ➖ Minimize
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification List */}
          {!isMinimized && (
            <div className="notification-list">
              {filteredNotifications.slice(-5).map((notification, index) => (
                <div 
                  key={`${notification.type}-${notification.orderId}-${notification.timestamp}`} 
                  className="notification-box"
                  data-type={notification.type}
                >
                  <div className="notification-content">
                    <div className="notification-header-item">
                      <span className="notification-type">
                        {getNotificationIcon(notification.type)} {formatNotificationType(notification.type)}
                      </span>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    {notification.orderId && (
                      <p className="notification-meta">Order: {notification.orderId}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteNotification(index)}
                    className="delete-btn"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Debug Info (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>🔍 Debug Info</summary>
            <pre>{JSON.stringify({
              isConnected,
              accountRole: account?.role,
              accountId: account?.id,
              hasRegistered,
              notificationCount: notifications.length,
              filteredCount: filteredNotifications.length,
              lastNotifications: notifications.slice(-3).map(n => ({
                type: n.type,
                target: n.target,
                orderId: n.orderId,
                timestamp: n.timestamp,
                message: n.message
              }))
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

// ✅ Helper Functions
function getNotificationIcon(type) {
  switch (type) {
    case 'order-created':
    case 'newBookingRequest':
      return '📦';
    case 'order-confirmed':
    case 'bookingConfirmed':
      return '✅';
    case 'order-cancelled':
    case 'bookingCancelled':
      return '❌';
    case 'review-submitted':
      return '⭐';
    default:
      return '📬';
  }
}

function formatNotificationType(type) {
  switch (type) {
    case 'order-created':
    case 'newBookingRequest':
      return 'New Request';
    case 'order-confirmed':
    case 'bookingConfirmed':
      return 'Confirmed';
    case 'order-cancelled':
    case 'bookingCancelled':
      return 'Cancelled';
    case 'review-submitted':
      return 'New Review';
    default:
      return 'Notification';
  }
}