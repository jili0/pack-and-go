// src/context/useSocket.js (KORRIGIERT für Next.js Integration)
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

  // ✅ Request notification permission ONCE
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Notification !== "undefined" && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        console.log("🔔 Browser notification permission:", permission);
      });
    }
  }, []);

  // ✅ Initialize socket ONLY ONCE - FÜR NEXT.JS INTEGRATION
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // ✅ KORREKTE Konfiguration für Next.js + Socket.IO Server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    console.log("🔌 Connecting to Next.js Socket server:", socketUrl);

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
      console.log('✅ Connected to Next.js Socket.IO server:', socketIO.id);
      setIsConnected(true);
    });

    socketIO.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
    });

    socketIO.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error);
      setIsConnected(false);
    });

    socketIO.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
    });

    socketIO.on('reconnect_failed', () => {
      console.error('💥 Socket reconnection failed completely');
    });

    // ✅ UNIFIED notification handler - NO FILTERING HERE
    socketIO.on('notification', (notification) => {
      console.log('📬 Received unified notification:', notification);
      
      // ✅ Add ALL notifications to state - filtering happens in UI
      setNotifications(prev => {
        // Prevent duplicates
        const exists = prev.some(n => 
          n.type === notification.type && 
          n.orderId === notification.orderId &&
          n.timestamp === notification.timestamp
        );
        
        if (exists) {
          console.log('🚫 Duplicate notification prevented');
          return prev;
        }
        
        console.log('✅ Adding notification to state');
        return [...prev, notification];
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
      console.log("🔌 Cleaning up socket connection");
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
  
    console.log(`🧠 registerUser CALLED: ${accountId}, role: ${role}`);
    setCurrentAccount({ accountId, role });
    setNotifications([]);
  
    if (socket && socket.connected) {
      console.log("📨 Emitting register-user");
      socket.emit('register-user', { accountId, role });
    } else {
      console.warn("⚠️ Socket not ready, delaying registration...");
  
      // ➕ Automatisch registrieren, sobald verbunden
      const tryRegister = () => {
        if (socket && socket.connected) {
          console.log("✅ Late registration after connect:", accountId, role);
          socket.emit('register-user', { accountId, role });
          socket.off('connect', tryRegister); // Cleanup
        }
      };
  
      socket?.on('connect', tryRegister);
    }
  }, [socket]);
  

  const emitOrderCreated = (orderId, companyId) => {
    if (socket && isConnected) {
      console.log(`📦 Emitting order created: ${orderId} for company: ${companyId}`);
      socket.emit('order-created', { orderId, companyId });
    }
  };

  const emitOrderConfirmed = (orderId, accountId) => {
    if (socket && isConnected) {
      console.log(`✅ Emitting order confirmed: ${orderId} for account: ${accountId}`);
      socket.emit('order-confirmed', { orderId, accountId });
    }
  };

  const emitOrderCancelled = (orderId, accountId) => {
    if (socket && isConnected) {
      console.log(`❌ Emitting order cancelled: ${orderId} for account: ${accountId}`);
      socket.emit('order-cancelled', { orderId, accountId });
    }
  };
  const emitOrderUserCancelled = (orderId, accountId, companyId) => {
    if (socket && isConnected) {
      console.log(`🚫 Emitting user cancelled order: ${orderId} by user: ${accountId} for company: ${companyId}`);
      socket.emit('order-user-cancelled', { orderId, accountId, companyId });
    } else {
      console.error('❌ Socket not connected - cannot emit user cancellation');
    }
  };

  const emitReviewSubmitted = (companyId, rating, orderId) => {
    if (socket && isConnected) {
      console.log(`⭐ Emitting review submitted for company: ${companyId} - ${rating}★`);
      socket.emit('review-submitted', { companyId, rating, orderId });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

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
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}