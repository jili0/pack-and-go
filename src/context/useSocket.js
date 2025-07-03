// 2. src/context/useSocket.js (Neuer Socket Context)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
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

    socketIO.on('notification', (notification) => {
      console.log('📬 Received notification:', notification);
      setNotifications(prev => [...prev, notification]);
      
      // Optional: Show browser notification
      if (Notification.permission === 'granted') {
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

  const registerUser = (userId, role) => {
    if (socket && isConnected) {
      console.log(`📝 Registering user: ${userId} as ${role}`);
      socket.emit('register-user', { userId, role });
    }
  };

  const emitOrderCreated = (orderId, companyId) => {
    if (socket && isConnected) {
      console.log(`📦 Emitting order created: ${orderId} for company: ${companyId}`);
      socket.emit('order-created', { orderId, companyId });
    }
  };

  const emitOrderConfirmed = (orderId, userId) => {
    if (socket && isConnected) {
      console.log(`✅ Emitting order confirmed: ${orderId} for user: ${userId}`);
      socket.emit('order-confirmed', { orderId, userId });
    }
  };

  const emitOrderCancelled = (orderId, userId) => {
    if (socket && isConnected) {
      console.log(`❌ Emitting order cancelled: ${orderId} for user: ${userId}`);
      socket.emit('order-cancelled', { orderId, userId });
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

  const value = {
    socket,
    isConnected,
    notifications,
    registerUser,
    emitOrderCreated,
    emitOrderConfirmed,
    emitOrderCancelled,
    emitReviewSubmitted,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}