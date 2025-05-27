// src/middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const protectedPaths = [
  "/user",
  "/company",
  "/admin",
  "/api/orders",
  "/api/company",
  "/api/user",
  "/api/admin",
  "/order/create",
  "/order/confirmation",
];

// Prüfen, ob ein Pfad geschützt ist und Authentifizierung erfordert
const isProtectedPath = (path) => {
  return protectedPaths.some((protectedPath) => {
    return path === protectedPath || path.startsWith(`${protectedPath}/`);
  });
};

// Pfade, die spezifische Rollen erfordern
const roleBasedPaths = {
  "/user": ["user"],
  "/company": ["company"],
  "/admin": ["admin"],
  "/api/orders": ["user", "company", "admin"],
  "/api/company": ["company", "admin"],
  "/api/admin": ["admin"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Für Protected Paths Authentifizierung prüfen
  if (isProtectedPath(pathname)) {
    // Token aus Cookies abrufen
    const token = request.cookies.get("token")?.value;

    // Wenn kein Token vorhanden ist, zur Anmeldeseite umleiten
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Token verifizieren
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Rollenbasierte Zugriffskontrolle
      for (const [path, roles] of Object.entries(roleBasedPaths)) {
        if (pathname.startsWith(path) && !roles.includes(decoded.role)) {
          // Benutzer hat nicht die erforderliche Rolle
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      // Bei erfolgreicher Authentifizierung weitermachen
      return NextResponse.next();
    } catch (error) {
      // Bei ungültigem Token zur Anmeldeseite umleiten
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  // Für alle anderen Pfade normal weitermachen
  // und die Next.js-eigene not-found Behandlung einsetzen lassen
  return NextResponse.next();
}

// Konfiguration für Middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)",
  ],
};
