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
  
    // ✅ 1. Notification-Berechtigung anfordern
    useEffect(() => {
      if (typeof Notification !== "undefined" && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          console.log("🔔 Browser notification permission:", permission);
        });
      }
    }, []);
  
    // ✅ 2. Socket initialisieren
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
  
        if (Notification.permission === 'granted') {
          new Notification('Pack & Go', {
            body: notification.message,
            icon: '/favicon.ico',
          });
        } else {
          console.warn("🔕 Browser notifications not granted.");
        }
      });
  
      setSocket(socketIO);
  
      return () => {
        socketIO.disconnect();
      };
    }, []);
  

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

  const showNotification = (message, type = 'info') => {
    // Falls du ein UI-System wie setNotifications verwendest:
    setNotifications(prev => [...prev, { message, type }]);
  
    // Zusätzlich optional: Browser Notification
    if (Notification.permission === 'granted') {
      new Notification('Pack & Go', {
        body: message,
        icon: '/favicon.ico',
      });
    }
  
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  };
  useEffect(() => {
    if (!socket) return;

    // Event-Listener für Notifications
    socket.on('newBookingRequest', (data) => {
      console.log('Neue Buchungsanfrage:', data);
      showNotification('Neue Buchungsanfrage erhalten!', 'success');
    });

    socket.on('bookingConfirmed', (data) => {
      console.log('Buchung bestätigt:', data);
      showNotification('Deine Buchung wurde bestätigt!', 'success');
    });

    // Cleanup
    return () => {
      socket.off('newBookingRequest');
      socket.off('bookingConfirmed');
    };
  }, [socket]);
  
  const registerUser = (accountId, role) => {
    
    if (!accountId || !role) {
      console.error("❌ registerUser called without valid accountId or role");
      return;
    }
    if (socket && isConnected) {
      console.log(`📝 Registering user: ${accountId} as ${role}`);
      socket.emit('register-user', { accountId, role });
    }
  };

  const emitOrderCreated = (orderId, companyId) => {
    if (socket && isConnected) {
      console.log(`📦 Emitting order created: ${orderId} for company: ${companyId}`);
      socket.emit('order-created', { orderId, companyId });
    }
  };

  const emitOrderConfirmed = (orderId, accountId) => {
    if (socket && isConnected) {
      console.log(`✅ Emitting order confirmed: ${orderId} for user: ${accountId}`);
      socket.emit('order-confirmed', { orderId, accountId });
    }
  };

  const emitOrderCancelled = (orderId, accountId) => {
    if (socket && isConnected) {
      console.log(`❌ Emitting order cancelled: ${orderId} for user: ${accountId}`);
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