// src/lib/auth.js - Build-sicher
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ✅ Build-sichere JWT_SECRET Behandlung
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  
  // ✅ Fallback für Build-Zeit oder Demo
  console.warn('⚠️ JWT_SECRET nicht gefunden - verwende Demo-Secret');
  return 'demo-secret-key-for-railway-build-' + (process.env.NODE_ENV || 'development');
};

// JWT-Token erstellen
export const createToken = (accountId, role) => {
  const secret = getJwtSecret();
  return jwt.sign({ id: accountId, role }, secret, {
    expiresIn: "7d",
  });
};

// Token in Cookie speichern
export const setTokenCookie = (token) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  cookies().set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    sameSite: isProduction ? "lax" : "strict", // ✅ Railway-kompatibel
  });
};

// Token aus Cookie entfernen
export const removeTokenCookie = () => {
  cookies().delete("token");
};

// Token verifizieren
export const verifyToken = (token) => {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    console.warn('⚠️ Token verification failed:', error.message);
    return null;
  }
};

// Aktuelle Session abrufen
export const getSession = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.warn('⚠️ Session retrieval failed:', error.message);
    return null;
  }
};

// ✅ Modernisierte Auth-Middleware für App Router
export const authMiddleware = (handler, allowedRoles = []) => {
  return async (request) => {
    try {
      // ✅ Cookie aus Request Headers lesen (App Router Style)
      const cookieHeader = request.headers.get('cookie');
      let token = null;
      
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.token;
      }

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, message: "Nicht autorisiert" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return new Response(
          JSON.stringify({ success: false, message: "Ungültiger Token" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Rollenbasierte Zugriffskontrolle
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return new Response(
          JSON.stringify({ success: false, message: "Keine Berechtigung" }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // ✅ Account Info zu Request hinzufügen (für moderne API Routes)
      request.account = decoded;

      return handler(request);
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return new Response(
        JSON.stringify({ success: false, message: "Serverfehler" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
};