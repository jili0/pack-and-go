"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/useSocket";

export default function SocketManager() {
  useSocket(); // Startet die Verbindung & registriert den Benutzer

  useEffect(() => {
    // Initialisiert Socket.io-Server auf /api/socket
    fetch("/api/socket").catch((err) => {
      console.error("Failed to initialize socket server:", err);
    });
  }, []);

  return null; // Kein sichtbares UI-Element
}
