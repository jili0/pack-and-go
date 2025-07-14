// src/context/useSocket.js (MIT localStorage Persistence)
'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  
  const currentAccountRef = useRef(null);
  const hasInitialized = useRef(false);

  // ✅ Load notifications from localStorage on init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pack-and-go-notifications');
      if (saved) {
        try {
          const parsedNotifications = JSON.parse(saved);
          
          // Filter old notifications (older than 7 days) but preserve read status
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const validNotifications = parsedNotifications.filter(notification => {
            const notificationTime = new Date(notification.timestamp).getTime();
            return notificationTime > sevenDaysAgo;
          });
          
          // ✅ Ensure read status is preserved from localStorage
          const notificationsWithReadStatus = validNotifications.map(notification => ({
            ...notification,
            read: notification.read !== undefined ? notification.read : false // ✅ Preserve existing read status
          }));
          
          setNotifications(notificationsWithReadStatus);
          
          // Log read status for debugging
          const unreadCount = notificationsWithReadStatus.filter(n => !n.read).length;
        } catch (error) {
          console.error('❌ Error loading notifications from localStorage:', error);
          localStorage.removeItem('pack-and-go-notifications'); // Clear corrupted data
        }
      }
    }
  }, []);

  // ✅ Save notifications to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (notifications.length > 0) {
          // Keep only the latest 50 notifications to prevent storage bloat
          const notificationsToSave = notifications.slice(-50);
          localStorage.setItem('pack-and-go-notifications', JSON.stringify(notificationsToSave));
        } else {
          // If no notifications, remove from localStorage
          localStorage.removeItem('pack-and-go-notifications');
        }
      } catch (error) {
        console.error('❌ Error saving notifications to localStorage:', error);
        // If storage is full, clear old notifications
        try {
          const recentNotifications = notifications.slice(-20);
          if (recentNotifications.length > 0) {
            localStorage.setItem('pack-and-go-notifications', JSON.stringify(recentNotifications));
          } else {
            localStorage.removeItem('pack-and-go-notifications');
          }
        } catch (secondError) {
          console.error('❌ Failed to save even after cleanup:', secondError);
        }
      }
    }
  }, [notifications]);

  // ✅ Cleanup old notifications periodically
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 Tage
      
      setNotifications(prev => {
        const cleaned = prev.filter(notification => {
          const notificationTime = new Date(notification.timestamp).getTime();
          return notificationTime > sevenDaysAgo;
        });
        
        if (cleaned.length !== prev.length) {
        }
        
        return cleaned;
      });
    };

    // Cleanup beim Start und dann alle 2 Stunden
    cleanupOldNotifications();
    const interval = setInterval(cleanupOldNotifications, 2 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // ✅ Request notification permission ONCE
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Notification !== "undefined" && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
      });
    }
  }, []);

  // ✅ Initialize socket ONLY ONCE - FÜR NEXT.JS INTEGRATION
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // ✅ KORREKTE Konfiguration für Next.js + Socket.IO Server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const socketIO = io(socketUrl, {
      path: '/api/socket', // ✅ WICHTIG: Der Pfad wie in deinem Server definiert
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketIO.on('connect', () => {
      setIsConnected(true);
    });

    socketIO.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    socketIO.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      setIsConnected(false);
    });

    socketIO.on('reconnect', (attemptNumber) => {
    });

    socketIO.on('reconnect_failed', () => {
      console.error('💥 Socket reconnection failed completely');
    });

    // ✅ UNIFIED notification handler - NO FILTERING HERE
    socketIO.on('notification', (notification) => {

      
      // ✅ Add ALL notifications to state - filtering happens in UI
      setNotifications(prev => {
        // Prevent duplicates
        const exists = prev.some(n => 
          n.type === notification.type && 
          n.orderId === notification.orderId &&
          n.timestamp === notification.timestamp
        );
        
        if (exists) {
          return prev;
        }
        return [...prev, { ...notification, read: false }]; // ✅ New notifications are unread by default
      });

      // ✅ Show browser notification if tab is not active
      if (typeof window !== 'undefined' && 
          Notification.permission === 'granted' && 
          document.hidden) {
        new Notification('Pack & Go', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, []);

  // ✅ Sync currentAccount with ref
  useEffect(() => {
    currentAccountRef.current = currentAccount;
  }, [currentAccount]);

  const registerUser = useCallback((accountId, role) => {
    if (!accountId || !role) {
      console.error("❌ registerUser called without valid accountId or role");
      return;
    }
    setCurrentAccount({ accountId, role });
    
    // ✅ Don't clear notifications on registration - keep persisted ones
    // setNotifications([]); // ❌ REMOVED - This was clearing persisted notifications
  
    if (socket && socket.connected) {
      socket.emit('register-user', { accountId, role });
    } else {
      console.warn("⚠️ Socket not ready, delaying registration...");
  
      // ➕ Automatisch registrieren, sobald verbunden
      const tryRegister = () => {
        if (socket && socket.connected) {
          socket.emit('register-user', { accountId, role });
          socket.off('connect', tryRegister); // Cleanup
        }
      };
  
      socket?.on('connect', tryRegister);
    }
  }, [socket]);

  const emitOrderCreated = (orderId, companyId) => {
    if (socket && isConnected) {
      socket.emit('order-created', { orderId, companyId });
    }
  };

  const emitOrderConfirmed = (orderId, accountId) => {
    if (socket && isConnected) {
      socket.emit('order-confirmed', { orderId, accountId });
    }
  };

  const emitOrderCancelled = (orderId, accountId) => {
    if (socket && isConnected) {
      socket.emit('order-cancelled', { orderId, accountId });
    }
  };

  const emitOrderUserCancelled = (orderId, accountId, companyId) => {
    if (socket && isConnected) {
      socket.emit('order-user-cancelled', { orderId, accountId, companyId });
    } else {
      console.error('❌ Socket not connected - cannot emit user cancellation');
    }
  };

  const emitReviewSubmitted = (companyId, rating, orderId) => {
    if (socket && isConnected) {
      socket.emit('review-submitted', { companyId, rating, orderId });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    // ✅ Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pack-and-go-notifications');
    }
  };
  
  const removeNotification = (index) => {
    setNotifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      
      // ✅ Also update localStorage immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pack-and-go-notifications', JSON.stringify(updated));
        } catch (error) {
          console.error('❌ Error removing notification from localStorage:', error);
        }
      }
      
      return updated;
    });
  };

  // ✅ New function to mark notification as read
  const markNotificationAsRead = useCallback((index) => {
    setNotifications(prev => 
      prev.map((notification, i) => 
        i === index ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // ✅ New function to mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // ✅ New function to remove notification by ID or criteria (more reliable)
  const removeNotificationById = useCallback((orderId, type) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => 
        !(notification.orderId === orderId && notification.type === type)
      );
      return updated;
    });
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    currentAccount,
    registerUser,
    emitOrderCreated,
    emitOrderConfirmed,
    emitOrderCancelled,
    emitOrderUserCancelled,
    emitReviewSubmitted,
    clearNotifications,
    removeNotification,
    removeNotificationById,
    markNotificationAsRead,
    markAllAsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}