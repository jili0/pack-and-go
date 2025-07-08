// server.js (Enhanced with better WebSocket configuration)
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pack-and-go.jingli.work",
  ];

  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Enhanced WebSocket configuration
    transports: ["websocket", "polling"],
    allowEIO3: true, // Allow Engine.IO v3 clients
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    upgradeTimeout: 10000, // 10 seconds
    maxHttpBufferSize: 1e6, // 1MB
  });

  globalThis.io = io;

  // Enhanced connection handling
  io.on("connection", (socket) => {
    console.log("📡 Client connected:", socket.id, "Transport:", socket.conn.transport.name);
    
    // Log transport upgrades
    socket.conn.on("upgrade", () => {
      console.log("🔄 Transport upgraded to:", socket.conn.transport.name);
    });

    // ✅ User Registration
    socket.on("register-user", ({ accountId, role }) => {
      console.log(`🧠 Registering user: ${accountId} as ${role}`);
    
      let roomName;
      if (role === "company") {
        roomName = `company-${accountId}`;
      } else if (role === "admin") {
        roomName = "admin";
      } else {
        roomName = `user-${accountId}`;
      }
    
      socket.join(roomName);
      console.log(`✅ User ${accountId} joined room(s) as ${role} in room: ${roomName}`);
    
      const currentSocketsInRoom = io.sockets.adapter.rooms.get(roomName);
      if (currentSocketsInRoom) {
        console.log(`SERVER DEBUG: AFTER JOIN, Sockets in ${roomName} room:`, Array.from(currentSocketsInRoom));
      } else {
        console.log(`SERVER DEBUG: AFTER JOIN, Room ${roomName} is empty or not yet created.`);
      }
    });

    // ✅ Order Created (Kunde stellt Anfrage) → COMPANY bekommt Benachrichtigung
    socket.on("order-created", async ({ orderId, companyId }) => {
      console.log(`📦 Order created: ${orderId} for company: ${companyId}`);
      console.log(`SERVER DEBUG: Received order-created event from socket ${socket.id}`);
      console.log(`SERVER DEBUG: Target company for order-created notification: ${companyId}`);
    
      const roomName = `company-${companyId}`;
      const companyRoomSockets = io.sockets.adapter.rooms.get(roomName);
      console.log(`SERVER DEBUG: Sockets in ${roomName} room:`, companyRoomSockets ? Array.from(companyRoomSockets) : 'None'); 
      let notificationSentViaSocket = false;

      if (companyRoomSockets && companyRoomSockets.size > 0) {
        io.to(roomName).emit("notification", {
          type: "order-created",
          message: `New booking request received! (ID: ${orderId})`,
          orderId,
          target: "company",
          timestamp: new Date().toISOString(),
        });
        console.log(`SERVER: ✅ 'order-created' notification emitted to company room: ${companyId}`);
        notificationSentViaSocket = true;
      } else {
        console.warn(`SERVER WARNING: No sockets found in company room ${roomName}. Notification not sent via Socket.IO.`);
      }

      // Fallback notification
      if (!notificationSentViaSocket) {
        try {
          const response = await fetch(`http://localhost:${port}/api/notifications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "orderCreated",
              orderId,
              companyId,
              message: `New booking request for your company (ID: ${orderId})`,
              target: "company"
            }),
          });
          const data = await response.json();
          if (data.success) {
            console.log("SERVER: ✅ Fallback notification (via API) sent successfully.");
          } else {
            console.error("SERVER: ❌ Fallback notification (via API) failed:", data.message);
          }
        } catch (fallbackError) {
          console.error("SERVER: ❌ Error sending fallback notification:", fallbackError);
        }
      }

      // Admin notification
      io.to("admin").emit("notification", {
        type: "order-created",
        message: `Neue Bestellung erstellt (ID: ${orderId})`,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Order Confirmed
    socket.on("order-confirmed", ({ orderId, accountId }) => {
      console.log(`✅ Order confirmed: ${orderId} for user: ${accountId}`);
      console.log(`SERVER: Received order-confirmed from socket ${socket.id}`);
      console.log(`SERVER: Target user for notification: ${accountId}`);
      const userRoomSockets = io.sockets.adapter.rooms.get(`user-${accountId}`);
      console.log(`SERVER: Sockets in user-${accountId} room:`, userRoomSockets ? Array.from(userRoomSockets) : 'None');

      if (userRoomSockets && userRoomSockets.has(socket.id)) {
          console.warn(`SERVER WARNING: Sending socket ${socket.id} (Company) is unexpectedly in User room ${accountId}!`);
      }

      io.to(`user-${accountId}`).emit("notification", {
        type: "order-confirmed",
        message: `Your booking has been confirmed! (ID: ${orderId})`,
        orderId,
        target: "user",
        timestamp: new Date().toISOString(),
      });

      io.to("admin").emit("notification", {
        type: "order-confirmed",
        message: `Booking confirmed: ${orderId} for user: ${accountId}`,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Order Cancelled
    socket.on("order-cancelled", ({ orderId, accountId }) => {
      console.log(`❌ Order cancelled: ${orderId} for user: ${accountId}`);

      io.to(`user-${accountId}`).emit("notification", {
        type: "order-cancelled",
        message: `Your booking was declined. (ID: ${orderId})`,
        orderId,
        target: "user",
        timestamp: new Date().toISOString(),
      });

      io.to("admin").emit("notification", {
        type: "order-cancelled",
        message: `Booking cancelled: ${orderId} for user: ${accountId}`,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Review Submitted
    socket.on("review-submitted", ({ companyId, rating, orderId }) => {
      console.log(`⭐ Review submitted for company: ${companyId} - ${rating}★`);

      io.to(`company-${companyId}`).emit("notification", {
        type: "review-submitted",
        message: `New review received (${rating}★)!`,
        rating,
        orderId,
        target: "company",
        timestamp: new Date().toISOString(),
      });

      io.to("admin").emit("notification", {
        type: "review-submitted",
        message: `New review: ${rating}★ for company ${companyId}`,
        rating,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // Enhanced disconnect handling
    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, "Reason:", reason);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  // Enhanced server startup
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.IO server running on path: /api/socket`);
    console.log(`🔧 Allowed origins:`, allowedOrigins);
  });

  // Handle server errors
  httpServer.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use. Please kill the existing process or use a different port.`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", error);
    }
  });
});