// src/context/useSocket.js (KORRIGIERT)
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

  // ✅ Initialize socket ONLY ONCE
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const socketIO = io({
      path: '/api/socket',
      autoConnect: true,
    });

    socketIO.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setIsConnected(true);
    });

    socketIO.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsConnected(false);
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
    
    console.log(`📝 Registering user: ${accountId} as ${role}`);
    
    // ✅ Set current account
    setCurrentAccount({ accountId, role });
    
    // ✅ Clear old notifications when switching accounts
    setNotifications([]);
    
    if (socket && isConnected) {
      socket.emit('register-user', { accountId, role });
    }
  }, [socket, isConnected]);

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

  const emitReviewSubmitted = (companyId, rating) => {
    if (socket && isConnected) {
      console.log(`⭐ Emitting review submitted for company: ${companyId} - ${rating}★`);
      socket.emit('review-submitted', { companyId, rating });
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