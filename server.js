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
    // Log transport upgrades
    socket.conn.on("upgrade", () => {
    });

    // ✅ User Registration
    socket.on("register-user", ({ accountId, role }) => {
      
    let roomName;
      if (role === "company") {
        roomName = `company-${accountId}`;
      } else if (role === "admin") {
        roomName = "admin";
      } else {
        roomName = `user-${accountId}`;
      }
    
      socket.join(roomName);  
      const currentSocketsInRoom = io.sockets.adapter.rooms.get(roomName);
      if (currentSocketsInRoom) {
      } else {
      }
    });

    // ✅ Order Created (Kunde stellt Anfrage) → COMPANY bekommt Benachrichtigung
    socket.on("order-created", async ({ orderId, companyId }) => {
      const roomName = `company-${companyId}`;
      const companyRoomSockets = io.sockets.adapter.rooms.get(roomName);
      let notificationSentViaSocket = false;

      if (companyRoomSockets && companyRoomSockets.size > 0) {
        io.to(roomName).emit("notification", {
          type: "order-created",
          message: `New booking request received! (ID: ${orderId})`,
          orderId,
          target: "company",
          timestamp: new Date().toISOString(),
        });
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
      const userRoomSockets = io.sockets.adapter.rooms.get(`user-${accountId}`);
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
    // ✅ Order User-Cancelled (Kunde bricht selbst ab)
socket.on("order-user-cancelled", async ({ orderId, accountId, companyId }) => {
  const roomName = `company-${companyId}`;
  const companyRoomSockets = io.sockets.adapter.rooms.get(roomName);
  let notificationSentViaSocket = false;

  // Benachrichtigung an die Firma
  if (companyRoomSockets && companyRoomSockets.size > 0) {
    io.to(roomName).emit("notification", {
      type: "order-user-cancelled",
      message: `Customer cancelled their booking (ID: ${orderId})`,
      orderId,
      accountId,
      target: "company",
      timestamp: new Date().toISOString(),
    });
    notificationSentViaSocket = true;
  } else {
    console.warn(`SERVER WARNING: No sockets found in company room ${roomName}`);
  }

  // Fallback notification (falls Firma offline)
  if (!notificationSentViaSocket) {
    try {
      const response = await fetch(`http://localhost:${port}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "orderUserCancelled",
          orderId,
          companyId,
          accountId,
          message: `Customer cancelled booking (ID: ${orderId})`,
          target: "company"
        }),
      });
      const data = await response.json();
      if (data.success) {
      } else {
        console.error("SERVER: ❌ Fallback notification failed:", data.message);
      }
    } catch (fallbackError) {
      console.error("SERVER: ❌ Error sending fallback notification:", fallbackError);
    }
  }

  // Admin notification
  io.to("admin").emit("notification", {
    type: "order-user-cancelled",
    message: `User ${accountId} cancelled order ${orderId} for company ${companyId}`,
    orderId,
    accountId,
    companyId,
    target: "admin",
    timestamp: new Date().toISOString(),
  });
});

    // ✅ Review Submitted
    socket.on("review-submitted", ({ companyId, rating, orderId }) => {
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
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  // Enhanced server startup
  httpServer.listen(port, (err) => {
    if (err) throw err;
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