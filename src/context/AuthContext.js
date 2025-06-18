// src/context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // 给 AuthContext 一些时间来初始化
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Benutzer beim ersten Laden prüfen
  useEffect(() => {
    checkAccountLoggedIn();
  }, []);

  // Benutzer-Status überprüfen
  const checkAccountLoggedIn = async () => {
    try {
      const res = await fetch("/api/auth/me");

      if (res.status === 401) {
        // Nicht authentifiziert
        setAccount(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Fehler beim Abrufen des Benutzers");
      }

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        return { success: true, account: data.account };
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  // Registrierung
  const register = async (accountData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Registrierung fehlgeschlagen",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message:
          "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        return { success: true, account: data.account };
      } else {
        return {
          success: false,
          message: data.message || "Anmeldung fehlgeschlagen",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setAccount(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Selbst wenn der Server-Logout fehlschlägt, wollen wir den Client-Zustand zurücksetzen
      setAccount(null);
      router.push("/");
    }
  };

  // Benutzer löschen
  const deleteAccount = async () => {
    if (
      !confirm(
        "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
      )
    ) {
      return { success: false };
    }

    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setAccount(null);
        router.push("/");
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Kontolöschung fehlgeschlagen",
        };
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      return {
        success: false,
        message:
          "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        loading,
        register,
        login,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook für einfachen Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);
