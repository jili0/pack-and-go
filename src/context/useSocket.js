"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "./NotificationContext";

export const useSocket = () => {
  const auth = useAuth();
  const notify = useNotification();

  const account = auth?.account;
  const addNotification = notify?.addNotification;

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Ensure context is available
    if (!account || typeof addNotification !== "function") {
      console.warn("useSocket: Missing account or notification context.");
      return;
    }

    if (socketRef.current) {
      console.log("Socket already connected");
      return;
    }

    const socketInstance = io(
      process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
      {
        path: "/api/socket",
        addTrailingSlash: false,
      }
    );

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);

      // Register user on server
      socketInstance.emit("register-user", {
        userId: account.id,
        role: account.role,
      });
    });

    socketInstance.on("notification", (notification) => {
      console.log("📨 Notification received:", notification);
      addNotification?.({
        type: notification.type || "info",
        title: "New Notification",
        message: notification.message,
        link: notification.link || null,
        data: notification.data || null,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      console.log("🔌 Socket connection cleaned up");
    };
  }, [account, addNotification]);

  // Emit helpers
  const notifyOrderCreated = useCallback((orderId, companyId) => {
    socketRef.current?.emit("order-created", { orderId, companyId });
  }, []);

  const notifyOrderConfirmed = useCallback((orderId, userId) => {
    socketRef.current?.emit("order-confirmed", { orderId, userId });
  }, []);

  const notifyReviewSubmitted = useCallback((companyId, rating) => {
    socketRef.current?.emit("review-submitted", { companyId, rating });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    notifyOrderCreated,
    notifyOrderConfirmed,
    notifyReviewSubmitted,
  };
};
