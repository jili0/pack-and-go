// src/context/useSocket.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export const useSocket = () => {
  const { account } = useAuth();
  const { addNotification } = useNotification();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!account) return;

    const socketInstance = io(process.env.NODE_ENV === "production" ? "" : "http://localhost:3000", {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);

      // Send user info to server
      socketInstance.emit("register-user", {
        userId: account.id,
        role: account.role,
      });
    });

    socketInstance.on("notification", (notification) => {
      console.log("Notification received:", notification);
      addNotification({
        type: notification.type || "info",
        title: "New Notification",
        message: notification.message,
        link: notification.link || null,
        data: notification.data || null,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [account]);

  // Optional: emit helper functions
  const notifyOrderCreated = (orderId, companyId) => {
    socket?.emit("order-created", { orderId, companyId });
  };

  const notifyOrderConfirmed = (orderId, userId) => {
    socket?.emit("order-confirmed", { orderId, userId });
  };

  const notifyReviewSubmitted = (companyId, rating) => {
    socket?.emit("review-submitted", { companyId, rating });
  };

  return {
    socket,
    isConnected,
    notifyOrderCreated,
    notifyOrderConfirmed,
    notifyReviewSubmitted,
  };
};
