/// src/components/SocketManager.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/useSocket';
import { useAuth } from '@/context/AuthContext';

export default function SocketManager() {
  const { socket, registerUser, isConnected } = useSocket(); // 'notifications' und zugehörige Funktionen werden hier NICHT mehr benötigt
  const { account } = useAuth();
  const [hasRegistered, setHasRegistered] = useState(false);

  // User Registration on Connection (OPTIMIERT)
  useEffect(() => {
    if (isConnected && account?.id && account?.role && !hasRegistered) {
      console.log("🧠 Registering user:", account.id, "as", account.role);
      registerUser(account.id, account.role);
      setHasRegistered(true);
    }
  }, [isConnected, account?.id, account?.role, hasRegistered, registerUser]); // registerUser als Abhängigkeit

  // Reset registration when account changes
  useEffect(() => {
    setHasRegistered(false);
  }, [account?.id]);

  // Debug Log (optional, zur Überwachung der Socket-Verbindung)
  console.log("🔍 Debug SocketManager:", {
    isConnected,
    accountRole: account?.role,
    accountId: account?.id,
    hasRegistered,
  });

 
  return null; 
}