// 1. server.js (Root-Level - neben package.json)
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

    socket.on('register-user', ({ userId, role }) => {
      socket.join(`user-${userId}`);
      if (role === 'company') socket.join(`company-${userId}`);
      if (role === 'admin') socket.join('admin');
      console.log(`User ${userId} joined room(s) as ${role}`);
    });

    socket.on('order-created', ({ orderId, companyId }) => {
      console.log(`📦 Order created: ${orderId} for company: ${companyId}`);
      io.to(`company-${companyId}`).emit('notification', {
        type: 'order-created',
        message: `New order received (ID: ${orderId})`,
        orderId,
        timestamp: new Date().toISOString(),
      });
      io.to('admin').emit('notification', {
        type: 'order-created',
        message: `New order created (ID: ${orderId})`,
        orderId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('order-confirmed', ({ orderId, userId }) => {
      console.log(`✅ Order confirmed: ${orderId} for user: ${userId}`);
      io.to(`user-${userId}`).emit('notification', {
        type: 'order-confirmed',
        message: `Your order ${orderId} has been confirmed.`,
        orderId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('order-cancelled', ({ orderId, userId }) => {
      console.log(`❌ Order cancelled: ${orderId} for user: ${userId}`);
      io.to(`user-${userId}`).emit('notification', {
        type: 'order-cancelled',
        message: `Your order ${orderId} was declined.`,
        orderId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('review-submitted', ({ companyId, rating }) => {
      console.log(`⭐ Review submitted for company: ${companyId} - ${rating}★`);
      io.to(`company-${companyId}`).emit('notification', {
        type: 'review-submitted',
        message: `New review submitted (${rating}★).`,
        rating,
        timestamp: new Date().toISOString(),
      });
    });

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
