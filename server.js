// server.js (KORRIGIERT - mit korrekten targets)
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
  });

  io.on("connection", (socket) => {
    console.log("📡 Client connected:", socket.id);

    // ✅ User Registration
    socket.on("register-user", ({ accountId, role }) => {
      console.log(`🧠 Registering user: ${accountId} as ${role}`);
    
      let roomName;
      if (role === "company") {
        roomName = `company-${accountId}`;
      } else if (role === "admin") {
        roomName = "admin"; // Admin hat einen allgemeinen Raum
      } else { // Standardmäßig "user" oder jede andere Rolle
        roomName = `user-${accountId}`;
      }
    
      socket.join(roomName);
      console.log(`✅ User ${accountId} joined room(s) as ${role} in room: ${roomName}`);
    
      // Optionaler Debug-Log, um zu sehen, wer wirklich im Raum ist
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
      console.log(`SERVER DEBUG: Received order-created event from socket ${socket.id}`); // Diese Zeile fehlt
      console.log(`SERVER DEBUG: Target company for order-created notification: ${companyId}`); // Diese Zeile fehlt
    
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

  // Hier kommt der Fallback auf dem Server ins Spiel:
  if (!notificationSentViaSocket) {
    try {
      // Annahme: Du hast eine interne Funktion oder einen Service, der E-Mails oder DB-Notifications sendet
      // oder rufst deine eigene API-Route /api/notifications auf.
      // Für einen schnellen Test könntest du hier einen fetch-Aufruf zu deiner /api/notifications Route machen.
      // EINE BESSERE LÖSUNG IST EINE INTERNE FUNKTION, KEIN ZWEITER HTTP-REQUEST INNERHALB DES SERVERS!
      
      // Beispiel für einen internen Service (bevorzugt):
      // await NotificationService.sendPersistentNotification({
      //   type: "order-created",
      //   orderId,
      //   companyId,
      //   message: `New booking request for your company (ID: ${orderId})`
      // });
      
      // Beispiel für HTTP-Request zu eigener API (nur zur Demonstration, nicht ideal für Prod):
      const response = await fetch(`http://localhost:3000/api/notifications`, { // Passe die URL an deine Umgebung an!
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "orderCreated", // Konsistent mit deinem Client-Fallback
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

  // ... (Rest deiner Admin-Benachrichtigungslogik hier)
  io.to("admin").emit("notification", {
    type: "order-created",
    message: `Neue Bestellung erstellt (ID: ${orderId})`,
    orderId,
    target: "admin",
    timestamp: new Date().toISOString(),
  });
});

    // ✅ Order Confirmed (Firma bestätigt) → USER bekommt Benachrichtigung
    socket.on("order-confirmed", ({ orderId, accountId }) => {
      console.log(`✅ Order confirmed: ${orderId} for user: ${accountId}`);
      console.log(`SERVER: Received order-confirmed from socket ${socket.id}`);
    console.log(`SERVER: Target user for notification: ${accountId}`);
    const userRoomSockets = io.sockets.adapter.rooms.get(`user-${accountId}`);
    console.log(`SERVER: Sockets in user-${accountId} room:`, userRoomSockets ? Array.from(userRoomSockets) : 'None');

    // Optional: Prüfe, ob der sendende Socket im User-Raum ist (sollte er NICHT sein)
    if (userRoomSockets && userRoomSockets.has(socket.id)) {
        console.warn(`SERVER WARNING: Sending socket ${socket.id} (Company) is unexpectedly in User room ${accountId}!`);
    }

      // ✅ Notification NUR für den Kunden
      io.to(`user-${accountId}`).emit("notification", {
        type: "order-confirmed",
        message: `Your booking has been confirmed! (ID: ${orderId})`,
        orderId,
        target: "user", // ✅ Ziel: User
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to("admin").emit("notification", {
        type: "order-confirmed",
        message: `Booking confirmed: ${orderId} for user: ${accountId}`,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Order Cancelled (Firma lehnt ab) → USER bekommt Benachrichtigung
    socket.on("order-cancelled", ({ orderId, accountId }) => {
      console.log(`❌ Order cancelled: ${orderId} for user: ${accountId}`);

      // ✅ Notification NUR für den Kunden
      io.to(`user-${accountId}`).emit("notification", {
        type: "order-cancelled",
        message: `Your booking was declined. (ID: ${orderId})`,
        orderId,
        target: "user", // ✅ Ziel: User
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to("admin").emit("notification", {
        type: "order-cancelled",
        message: `Booking cancelled: ${orderId} for user: ${accountId}`,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Review Submitted (Kunde gibt Bewertung ab) → COMPANY bekommt Benachrichtigung
    socket.on("review-submitted", ({ companyId, rating, orderId }) => {
      console.log(`⭐ Review submitted for company: ${companyId} - ${rating}★`);

      // ✅ Notification NUR für die Firma
      io.to(`company-${companyId}`).emit("notification", {
        type: "review-submitted",
        message: `New review received (${rating}★)!`,
        rating,
        orderId,
        target: "company", // ✅ Ziel: Company
        timestamp: new Date().toISOString(),
      });

      // ✅ Notification für Admins
      io.to("admin").emit("notification", {
        type: "review-submitted",
        message: `New review: ${rating}★ for company ${companyId}`,
        rating,
        orderId,
        target: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.IO server running on path: /api/socket`);
  });
});
