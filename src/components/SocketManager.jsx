"use client";

import { useSocket } from "@/context/useSocket";

export default function SocketManager() {
  useSocket(); // Startet Socket-Verbindung
  return null; // Kein sichtbares Element
}
