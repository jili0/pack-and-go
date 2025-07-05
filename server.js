// server.js (KORRIGIERT - mit korrekten targets)
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: dev ? 'http://localhost:3001' : 'https://pack-and-go.jingli.work',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('📡 Client connected:', socket.id);

    // ✅ User Registration
    socket.on('register-user', ({ accountId, role }) => {
      console.log(`🧠 Registering user: ${accountId} as ${role}`);
      
      socket.join(`user-${accountId}`);
      if (role === 'company') socket.join(`company-${accountId}`);
      if (role === 'admin') socket.join('admin');
      
      console.log(`✅ User ${accountId} joined room(s) as ${role}`);
    });

    // ✅ Order Created (Kunde stellt Anfrage) → COMPANY bekommt Benachrichtigung
    socket.on('order-created', ({ orderId, companyId }) => {
      console.log(`📦 Order created: ${orderId} for company: ${companyId}`);
      
      // ✅ Notification NUR für die Firma
      io.to(`company-${companyId}`).emit('notification', {
        type: 'order-created',
        message: `New booking request received! (ID: ${orderId})`,
        orderId,
        target: 'company', // ✅ Ziel: Company
        timestamp: new Date().toISOString(),
      });
      
      // ✅ Notification für Admins
      io.to('admin').emit('notification', {
        type: 'order-created',
        message: `Neue Bestellung erstellt (ID: ${orderId})`,
        orderId,
        target: 'admin', // ✅ Ziel: Admin
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Order Confirmed (Firma bestätigt) → USER bekommt Benachrichtigung
    socket.on('order-confirmed', ({ orderId, accountId }) => {
      console.log(`✅ Order confirmed: ${orderId} for user: ${accountId}`);
      
      // ✅ Notification NUR für den Kunden
      io.to(`user-${accountId}`).emit('notification', {
        type: 'order-confirmed',
        message: `Your booking has been confirmed! (ID: ${orderId})`,
        orderId,
        target: 'user', // ✅ Ziel: User
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to('admin').emit('notification', {
        type: 'order-confirmed',
        message: `Booking confirmed: ${orderId} for user: ${accountId}`,
        orderId,
        target: 'admin',
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Order Cancelled (Firma lehnt ab) → USER bekommt Benachrichtigung
    socket.on('order-cancelled', ({ orderId, accountId }) => {
      console.log(`❌ Order cancelled: ${orderId} for user: ${accountId}`);
      
      // ✅ Notification NUR für den Kunden
      io.to(`user-${accountId}`).emit('notification', {
        type: 'order-cancelled',
        message: `Your booking was declined. (ID: ${orderId})`,
        orderId,
        target: 'user', // ✅ Ziel: User
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to('admin').emit('notification', {
        type: 'order-cancelled',
        message: `Booking cancelled: ${orderId} for user: ${accountId}`,
        orderId,
        target: 'admin',
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Review Submitted (Kunde gibt Bewertung ab) → COMPANY bekommt Benachrichtigung
    socket.on('review-submitted', ({ companyId, rating, orderId }) => {
      console.log(`⭐ Review submitted for company: ${companyId} - ${rating}★`);
      
      // ✅ Notification NUR für die Firma
      io.to(`company-${companyId}`).emit('notification', {
        type: 'review-submitted',
        message: `New review received (${rating}★)!`,
        rating,
        orderId,
        target: 'company', // ✅ Ziel: Company
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to('admin').emit('notification', {
        type: 'review-submitted',
        message: `New review: ${rating}★ for company ${companyId}`,
        rating,
        orderId,
        target: 'admin',
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.IO server running on path: /api/socket`);
  });
});