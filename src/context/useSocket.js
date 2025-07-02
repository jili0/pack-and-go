// src/context/useSocket.js
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "./NotificationContext";

export const useSocket = () => {
  const { account, initialCheckDone } = useAuth() || {}; // Sicheres Destructuring
  const { addNotification } = useNotification() || {};

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Skip if context not ready
    if (!account || !initialCheckDone || typeof addNotification !== "function") {
      console.warn("⏳ useSocket: Waiting for account or notification context...");
      return;
    }

    // Prevent duplicate connection
    if (socketRef.current) {
      return;
    }

    const socket = io(
      process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000",
      {
        path: "/api/socket",
        addTrailingSlash: false,
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);

      // Register user on backend
      socket.emit("register-user", {
        userId: account.id,
        role: account.role,
      });
    });

    socket.on("notification", (notification) => {
      console.log("📨 Notification received:", notification);
      if (typeof addNotification === "function") {
        addNotification({
          type: notification.type || "info",
          title: "New Notification",
          message: notification.message,
          link: notification.link || null,
          data: notification.data || null,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      console.log("🔌 Socket connection cleaned up");
    };
  }, [account, initialCheckDone, addNotification]);

  // Event Emitters
  const notifyOrderCreated = useCallback((orderId, companyId) => {
    socketRef.current?.emit("order-created", { orderId, companyId });
  }, []);

  const notifyOrderConfirmed = useCallback((orderId, userId) => {
    socketRef.current?.emit("order-confirmed", { orderId, userId });
  }, []);

  const notifyOrderCancelled = useCallback((orderId, userId) => {
    socketRef.current?.emit("order-cancelled", { orderId, userId });
  }, []);

  const notifyReviewSubmitted = useCallback((companyId, rating) => {
    socketRef.current?.emit("review-submitted", { companyId, rating });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    notifyOrderCreated,
    notifyOrderConfirmed,
    notifyOrderCancelled,
    notifyReviewSubmitted,
  };
};
