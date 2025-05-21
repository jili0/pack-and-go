// src/middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Pfade, die keinen Authentifizierung erfordern
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/companies/search',
  '/pricing',
  '/guide',
  '/contact',
  '/about-us',
  '/privacy',
  '/imprint',
  '/terms',
  '/moving',
  '/international-moving',
  '/reviews',
  '/tips',
  '/checklist',
  '/cities',
  '/city',
  '/placeholder',
  '/not-found'
];

// Prüfen, ob ein Pfad öffentlich ist
const isPublicPath = (path) => {
  return publicPaths.some(publicPath => {
    return path === publicPath || path.startsWith(`${publicPath}/`);
  });
};

// Pfade, die spezifische Rollen erfordern
const roleBasedPaths = {
  '/user': ['user'],
  '/company': ['company'],
  '/admin': ['admin'],
  '/api/orders': ['user', 'company', 'admin'],
  '/api/company': ['company', 'admin'],
  '/api/admin': ['admin']
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Öffentliche Pfade überspringen
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Token aus Cookies abrufen
  const token = request.cookies.get('token')?.value;
  
  // Wenn kein Token vorhanden ist, zur Anmeldeseite umleiten
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Rollenbasierte Zugriffskontrolle
    for (const [path, roles] of Object.entries(roleBasedPaths)) {
      if (pathname.startsWith(path) && !roles.includes(decoded.role)) {
        // Benutzer hat nicht die erforderliche Rolle
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    
    // Bei erfolgreicher Authentifizierung weitermachen
    return NextResponse.next();
    
  } catch (error) {
    // Bei ungültigem Token zur Anmeldeseite umleiten
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

// Konfiguration für Middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/).*)'
  ]
};