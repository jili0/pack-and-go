"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "./LoadingContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false); // NEU: Track ob initial check fertig ist
  const router = useRouter();
  const [authInitialized, setAuthInitialized] = useState(false);

  const authCheck = useLoading("auth", "check");
  const authLogin = useLoading("auth", "login");
  const authRegister = useLoading("auth", "register");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkAccountLoggedIn();
  }, []);

  const checkAccountLoggedIn = async () => {
    authCheck.setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: 'include' // Wichtig: Cookies mitsenden
      });

      if (res.status === 401) {
        setAccount(null);
        setInitialCheckDone(true); // Check ist fertig
        return;
      }

      if (!res.ok) {
        throw new Error("Fehler beim Abrufen des Benutzers");
      }

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        setInitialCheckDone(true); // Check ist fertig
        return { success: true, account: data.account };
      } else {
        setAccount(null);
        setInitialCheckDone(true); // Check ist fertig
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAccount(null);
      setInitialCheckDone(true); // Check ist fertig, auch bei Fehler
    } finally {
      authCheck.setLoading(false);
    }
  };

  const register = async (accountData) => {
    authRegister.setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
        credentials: 'include'
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
      authRegister.setLoading(false);
    }
  };

  const login = async (email, password) => {
    authLogin.setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
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
      authLogin.setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setAccount(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setAccount(null);
      router.push("/");
    }
  };

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
        credentials: 'include'
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
        loading:
          authCheck.isLoading || authLogin.isLoading || authRegister.isLoading,
        checkLoading: authCheck.isLoading,
        loginLoading: authLogin.isLoading,
        registerLoading: authRegister.isLoading,
        initialCheckDone, // NEU: Gibt an ob der initiale Auth-Check fertig ist
        register,
        login,
        logout,
        deleteAccount,
        checkAccountLoggedIn, // Für manuellen Re-Check
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);