// components/NotificationButton.jsx (UPDATED - Matches SocketManager logic)
'use client'
import { useState, useEffect } from "react";
import { useSocket } from "@/context/useSocket";

export default function NotificationButton({ account }) {
  const { notifications, clearNotifications, removeNotification } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const role = account?.role;
  
  // ✅ UPDATED filtering logic (matches SocketManager)
  const getFilteredNotifications = () => {
    if (!account?.role) {
      console.log('🚫 No account role, showing no notifications');
      return [];
    }

    const filtered = notifications.filter((notification) => {
      const { type, target } = notification;
      
      // ✅ New logic: Check the 'target' field from backend
      if (target) {
        switch (account.role) {
          case 'user':
            return target === 'user' || target === 'all';
          case 'company':
            return target === 'company' || target === 'all';
          case 'admin':
            return true; // Admins see everything
          default:
            return false;
        }
      }
      
      // ✅ Fallback: Old logic based on notification type
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
        onClick={() => setIsOpen(!isOpen)}
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
        {filteredNotifications.length > 0 && (
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
            }}
          >
            {filteredNotifications.length}
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
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ color: '#333', fontSize: '14px' }}>
                        {getNotificationIcon(notification.type)} {formatNotificationType(notification.type)}
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
                    <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.4' }}>
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
                onClick={() => {
                  clearNotifications();
                  setIsOpen(false);
                }}
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
      `}</style>
    </div>
  );
}

// ✅ Helper Functions (same as SocketManager)
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