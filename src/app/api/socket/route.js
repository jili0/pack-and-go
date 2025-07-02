// app/api/socket/route.js
import { Server } from 'socket.io'

let io

export async function GET(req) {
  if (!io) {
    console.log('Initializing Socket.io server...')

    io = new Server({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? 'https://pack-and-go.jingli.work'
          : 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Benutzer registrieren
      socket.on('register-user', ({ userId, role }) => {
        socket.join(`user-${userId}`)
        if (role === 'company') socket.join(`company-${userId}`)
        if (role === 'admin') socket.join('admin')
        console.log(`User ${userId} joined room(s) as ${role}`)
      })

      // Neue Bestellung -> Firma & Admin benachrichtigen
      socket.on('order-created', ({ orderId, companyId }) => {
        io.to(`company-${companyId}`).emit('notification', {
          type: 'order-created',
          message: `Neue Anfrage erhalten (ID: ${orderId})`,
          orderId,
        })

        io.to('admin').emit('notification', {
          type: 'order-created',
          message: `Neue Bestellung erstellt (ID: ${orderId})`,
          orderId,
        })
      })

      // Auftrag bestätigt -> Kunde benachrichtigen
      socket.on('order-confirmed', ({ orderId, userId }) => {
        io.to(`user-${userId}`).emit('notification', {
          type: 'order-confirmed',
          message: `Deine Bestellung ${orderId} wurde bestätigt!`,
          orderId,
        })
      })

      // Bewertung abgegeben -> Firma benachrichtigen
      socket.on('review-submitted', ({ companyId, rating }) => {
        io.to(`company-${companyId}`).emit('notification', {
          type: 'review-submitted',
          message: `Neue Bewertung erhalten (${rating} Sterne)`
        })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  return new Response('Socket.io server initialized', { status: 200 })
}
