// lib/socketServer.js
import { Server } from "socket.io";

let io;

export function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("✅ New socket connection:", socket.id);

      socket.on("register-user", ({ userId }) => {
        socket.join(userId); // 🔒 User gets their own room
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });
  }
  return io;
}

export { io };
