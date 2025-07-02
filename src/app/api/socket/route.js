// app/api/socket/route.js
import { Server } from 'socket.io';

let io;

export async function GET(req) {
  if (!io) {
    console.log('Initializing Socket.io server...');

    io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? 'https://pack-and-go.jingli.work'
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
      
        socket.on('register-user', ({ userId, role }) => {
          socket.join(`user-${userId}`);
          if (role === 'company') socket.join(`company-${userId}`);
          if (role === 'admin') socket.join('admin');
          console.log(`User ${userId} joined room(s) as ${role}`);
        });
      
        // Wenn Kunde Anfrage stellt
        socket.on('order-created', ({ orderId, companyId }) => {
          io.to(`company-${companyId}`).emit('notification', {
            type: 'order-created',
            message: `New request received (ID: ${orderId})`,
            orderId,
          });
      
          io.to('admin').emit('notification', {
            type: 'order-created',
            message: `New order created (ID: ${orderId})`,
            orderId,
          });
        });
      
        // ✅ Wenn Firma bestätigt
        socket.on("order-confirmed", ({ orderId, userId }) => {
          io.to(`user-${userId}`).emit("notification", {
            type: "order-confirmed",
            message: `Your order ${orderId} has been confirmed.`,
            orderId,
          });
        });
      
        // ✅ Wenn Firma storniert
        socket.on("order-cancelled", ({ orderId, userId }) => {
          io.to(`user-${userId}`).emit("notification", {
            type: "order-cancelled",
            message: `Your order ${orderId} has been cancelled.`,
            orderId,
          });
        });
      
        socket.on('review-submitted', ({ companyId, rating }) => {
          io.to(`company-${companyId}`).emit('notification', {
            type: 'review-submitted',
            message: `New review received (${rating} stars)`,
          });
        });
      
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });
      
    }
  
    return new Response('Socket.io server initialized', { status: 200 });
  }
  