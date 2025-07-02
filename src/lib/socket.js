// lib/socket.js
import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });

  // User Management
  const connectedUsers = new Map();
  const userRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    // User Authentication und Room-Joining
    socket.on('authenticate', (data) => {
      const { userId, userRole, userName } = data;
      
      // User Info speichern
      connectedUsers.set(socket.id, {
        userId,
        userRole,
        userName,
        connectedAt: new Date()
      });

      // User zu entsprechenden Rooms hinzufügen
      socket.join(userId); // Persönlicher Room
      socket.join(userRole); // Role-based Room (company, user, admin)
      
      userRooms.set(userId, socket.id);

      console.log(`User ${userName} (${userRole}) authenticated and joined rooms`);
      
      // Bestätigung senden
      socket.emit('authenticated', {
        message: 'Successfully connected',
        userId,
        userRole
      });

      // Online-Status an andere senden (optional)
      socket.broadcast.emit('user-online', {
        userId,
        userName,
        userRole
      });
    });

    // Benachrichtigung an spezifischen User
    socket.on('send-notification', (data) => {
      const { targetUserId, notification } = data;
      
      if (targetUserId) {
        io.to(targetUserId).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString(),
          from: connectedUsers.get(socket.id)?.userName || 'System'
        });
      }
    });

    // Benachrichtigung an alle User einer Rolle
    socket.on('send-role-notification', (data) => {
      const { targetRole, notification } = data;
      
      if (targetRole) {
        io.to(targetRole).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString(),
          from: connectedUsers.get(socket.id)?.userName || 'System'
        });
      }
    });

    // Order-spezifische Events
    socket.on('order-created', (orderData) => {
      // Benachrichtigung an alle Companies
      io.to('company').emit('notification', {
        type: 'order',
        title: 'Neue Bestellung',
        message: `Neue Umzugsanfrage von ${orderData.customerName}`,
        data: orderData,
        link: '/company/dashboard',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('order-updated', (orderData) => {
      const { customerId, companyId, status, customerName, companyName } = orderData;
      
      if (status === 'confirmed') {
        // Benachrichtigung an Kunden
        io.to(customerId).emit('notification', {
          type: 'success',
          title: 'Bestellung bestätigt',
          message: `Ihre Anfrage wurde von ${companyName} bestätigt`,
          data: orderData,
          link: `/user/orders/${orderData.orderId}`,
          timestamp: new Date().toISOString()
        });
      } else if (status === 'cancelled') {
        // Benachrichtigung an Kunden
        io.to(customerId).emit('notification', {
          type: 'warning',
          title: 'Bestellung abgelehnt',
          message: `Ihre Anfrage wurde von ${companyName} abgelehnt`,
          data: orderData,
          link: '/user/orders',
          timestamp: new Date().toISOString()
        });
      } else if (status === 'completed') {
        // Benachrichtigung an Kunden
        io.to(customerId).emit('notification', {
          type: 'success',
          title: 'Umzug abgeschlossen',
          message: `Ihr Umzug wurde erfolgreich abgeschlossen`,
          data: orderData,
          link: `/user/orders/${orderData.orderId}`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`User ${user.userName} disconnected`);
        
        // Online-Status Update
        socket.broadcast.emit('user-offline', {
          userId: user.userId,
          userName: user.userName
        });
        
        // Cleanup
        connectedUsers.delete(socket.id);
        userRooms.delete(user.userId);
      }
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Server-seitige Utility Functions
  io.sendNotificationToUser = (userId, notification) => {
    io.to(userId).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  };

  io.sendNotificationToRole = (role, notification) => {
    io.to(role).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  };

  io.getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;