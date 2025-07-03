"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoading } from "./LoadingContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
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
        credentials: "include", // Send cookies
      });

      if (res.status === 401) {
        setAccount(null);
        setInitialCheckDone(true);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        setInitialCheckDone(true);
        return { success: true, account: data.account };
      } else {
        setAccount(null);
        setInitialCheckDone(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAccount(null);
      setInitialCheckDone(true);
    } finally {
      authCheck.setLoading(false);
    }
  };

  const register = async (accountData) => {
    authRegister.setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setAccount(data.account);
        return { success: true, account: data.account };
      } else {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
      };
    } finally {
      authLogin.setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
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
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return { success: false };
    }

    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setAccount(null);
        router.push("/");
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Account deletion failed",
        };
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
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
        initialCheckDone,
        register,
        login,
        logout,
        deleteAccount,
        checkAccountLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
