// src/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Benutzer beim ersten Laden prüfen
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Benutzer-Status überprüfen
  const checkUserLoggedIn = async () => {
    try {
      const res = await fetch('/api/auth/me');
      
      if (res.status === 401) {
        // Nicht authentifiziert
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error('Fehler beim Abrufen des Benutzers');
      }

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Registrierung
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Registrierung fehlgeschlagen' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Anmeldung fehlgeschlagen' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Selbst wenn der Server-Logout fehlschlägt, wollen wir den Client-Zustand zurücksetzen
      setUser(null);
      router.push('/');
    }
  };

  // Benutzer löschen
  const deleteAccount = async () => {
    if (!confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return { success: false };
    }

    try {
      const res = await fetch('/api/auth/delete', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        router.push('/');
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Kontolöschung fehlgeschlagen' 
        };
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      return { 
        success: false, 
        message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook für einfachen Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);