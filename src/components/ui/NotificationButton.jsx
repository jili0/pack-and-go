// components/NotificationButton.jsx (FINAL & CORRECTED with Read Status)
'use client'

import { useState, useEffect } from "react";
import { useSocket } from "@/context/useSocket";

export default function NotificationButton({ account }) {
  const { notifications, clearNotifications, removeNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [testNotifications, setTestNotifications] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);

  // Kombiniere alle Benachrichtigungen
  const allNotifications = [...notifications, ...testNotifications];

  // Synchronisiere mit lokalen Benachrichtigungen (für Read-Status)  
  useEffect(() => {
    // Verwende JSON.stringify für tiefe Vergleiche
    const currentIds = allNotifications.map(n => `${n.type}-${n.orderId}-${n.timestamp}`);
    const localIds = localNotifications.map(n => `${n.type}-${n.orderId}-${n.timestamp}`);
    
    const hasNewNotifications = currentIds.some(id => !localIds.includes(id));
    
    if (hasNewNotifications) {
      setLocalNotifications(prev => {
        const newNotifications = allNotifications.filter(notification => 
          !prev.some(local => 
            local.type === notification.type && 
            local.orderId === notification.orderId &&
            local.timestamp === notification.timestamp
          )
        );
        
        return [
          ...prev,
          ...newNotifications.map(n => ({ ...n, read: false }))
        ];
      });
    }
  }, [allNotifications.length, notifications.length]); // ✅ Stable dependencies

  // Wenn Dropdown geöffnet wird, markiere alle als gelesen
  const handleDropdownOpen = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      // Markiere alle als gelesen nach kurzer Verzögerung
      setTimeout(() => {
        setLocalNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }, 1000); // 1 Sekunde Verzögerung
    }
  };

  // ✅ UPDATED filtering logic
  const getFilteredNotifications = () => {
    if (!account?.role) {
      console.log('🚫 No account role, showing no notifications');
      return [];
    }

    const filtered = localNotifications.filter((notification) => {
      const { type, target } = notification;

      if (target) {
        switch (account.role) {
          case 'user':
            return target === 'user' || target === 'all';
          case 'company':
            return target === 'company' || target === 'all';
          case 'admin':
            return true;
          default:
            return false;
        }
      }

      switch (account.role) {
        case 'user':
          return ['order-confirmed', 'order-cancelled'].includes(type);
        case 'company':
          return ['order-created', 'order-user-cancelled', 'review-submitted'].includes(type);
        case 'admin':
          return true;
        default:
          return false;
      }
    });

    console.log(`🔍 Filtered notifications: ${filtered.length}/${localNotifications.length} for role: ${account.role}`);
    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // Badge nur für ungelesene Benachrichtigungen anzeigen
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  console.log("🧪 [TEST] Incoming notifications:", allNotifications);
  console.log("🧪 [TEST] Filtered notifications:", filteredNotifications);
  console.log("🧪 [TEST] Unread count:", unreadCount);

  const deleteNotification = (indexToDelete) => {
    const notificationToDelete = filteredNotifications[indexToDelete];
    
    // Entferne aus lokalen Benachrichtigungen
    setLocalNotifications(prev => prev.filter(n =>
      !(n.type === notificationToDelete.type &&
        n.orderId === notificationToDelete.orderId &&
        n.timestamp === notificationToDelete.timestamp)
    ));

    // Entferne aus globalen Benachrichtigungen
    const actualIndex = notifications.findIndex(n =>
      n.type === notificationToDelete.type &&
      n.orderId === notificationToDelete.orderId &&
      n.timestamp === notificationToDelete.timestamp
    );

    if (actualIndex !== -1) {
      removeNotification(actualIndex);
    }
  };

  const clearAllNotifications = () => {
    setLocalNotifications([]);
    clearNotifications();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-wrapper')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notification-wrapper">
      <button
        onClick={handleDropdownOpen}
        className="notification-icon"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '20px',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: '0px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            zIndex: 1000,
            marginTop: '8px',
          }}
        >
          {filteredNotifications.length === 0 ? (
            <p
              className="notification-empty"
              style={{
                padding: '16px',
                textAlign: 'center',
                color: '#666',
                margin: 0,
              }}
            >
              No new notifications
            </p>
          ) : (
            <>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredNotifications.slice(-5).map((notification, idx) => (
                  <div
                    key={`${notification.type}-${notification.orderId}-${notification.timestamp}`}
                    className="notification-item"
                    style={{
                      padding: '12px 16px',
                      borderBottom: idx < filteredNotifications.length - 1 ? '1px solid #eee' : 'none',
                      position: 'relative',
                      backgroundColor: notification.read ? 'transparent' : '#f8f9ff',
                      borderLeft: notification.read ? 'none' : '3px solid #4285f4',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ 
                        color: notification.read ? '#666' : '#333', 
                        fontSize: '14px',
                        fontWeight: notification.read ? 'normal' : 'bold'
                      }}>
                        {getNotificationIcon(notification.type)} {formatNotificationType(notification.type)}
                        {!notification.read && <span style={{ color: '#4285f4', marginLeft: '4px' }}>•</span>}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => deleteNotification(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#999',
                            fontSize: '12px',
                            padding: '2px',
                            borderRadius: '2px',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#ff4444'}
                          onMouseLeave={(e) => e.target.style.color = '#999'}
                          title="Delete notification"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '13px', 
                      color: notification.read ? '#777' : '#555', 
                      lineHeight: '1.4' 
                    }}>
                      {notification.message}
                    </p>
                    {notification.orderId && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                        Order: {notification.orderId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={clearAllNotifications}
                className="notification-clear-btn"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#f8f9fa',
                  border: 'none',
                  borderTop: '1px solid #eee',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              >
                🗑️ Clear all
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .notification-wrapper {
          position: relative;
          display: inline-block;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
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
    case 'order-user-cancelled': 
      return '🚫';
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
    case 'order-user-cancelled': 
      return 'User Cancelled';
    case 'review-submitted':
      return 'New Review';
    default:
      return 'Notification';
  }
}