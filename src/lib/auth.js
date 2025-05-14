// src/lib/auth.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT-Token erstellen
export const createToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Token in Cookie speichern
export const setTokenCookie = (token) => {
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    sameSite: 'strict'
  });
};

// Token aus Cookie entfernen
export const removeTokenCookie = () => {
  cookies().delete('token');
};

// Token verifizieren
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Aktuelle Session abrufen
export const getSession = () => {
  const token = cookies().get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
};

// Auth-Middleware für API-Routen
export const authMiddleware = (handler, allowedRoles = []) => {
  return async (req, res) => {
    try {
      const token = req.cookies.token;
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'Nicht autorisiert' });
      }
      
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Ungültiger Token' });
      }
      
      // Rollenbasierte Zugriffskontrolle
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
      }
      
      // Benutzerinformationen an Request anhängen
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Serverfehler' });
    }
  };
};