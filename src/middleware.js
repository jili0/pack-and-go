// // src/middleware.js
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export const runtime = 'nodejs';

// const protectedPaths = [
//   "/user",
//   "/company",
//   "/admin",
//   "/api/orders",
//   "/api/company",
//   "/api/user",
//   "/api/admin",
//   "/order/create",
//   "/order/confirmation",
// ];

// // Prüfen, ob ein Pfad geschützt ist und Authentifizierung erfordert
// const isProtectedPath = (path) => {
//   return protectedPaths.some((protectedPath) => {
//     return path === protectedPath || path.startsWith(`${protectedPath}/`);
//   });
// };

// // Pfade, die spezifische Rollen erfordern
// const roleBasedPaths = {
//   "/user": ["user"],
//   "/company": ["company"],
//   "/admin": ["admin"],
//   "/api/orders": ["user", "company", "admin"],
//   "/api/company": ["company", "admin"],
//   "/api/admin": ["admin"],
// };

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Für Protected Paths Authentifizierung prüfen
//   if (isProtectedPath(pathname)) {
//     // Token aus Cookies abrufen
//     const token = request.cookies.get("token")?.value;

//     console.log('=== Middleware Debug ===');
//     console.log('Path:', pathname);
//     console.log('Token exists:', !!token);
//     console.log('All cookies:', request.cookies.getAll());

//     // Wenn kein Token vorhanden ist, zur Anmeldeseite umleiten
//     if (!token) {
//        console.log('No token found, redirecting to login');
//       const url = new URL("/login", request.url);
//       url.searchParams.set("from", pathname);
//       return NextResponse.redirect(url);
//     }

//     try {
//       // Token verifizieren
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log('Token decoded successfully:', { userId: decoded.userId || decoded.id, role: decoded.role });

//       // Rollenbasierte Zugriffskontrolle
//       for (const [path, roles] of Object.entries(roleBasedPaths)) {
//         if (pathname.startsWith(path) && !roles.includes(decoded.role)) {
//           // Benutzer hat nicht die erforderliche Rolle
//           return NextResponse.redirect(new URL("/", request.url));
//         }
//       }

//       // Bei erfolgreicher Authentifizierung weitermachen
//       return NextResponse.next();
//     } catch (error) {
//       console.log('Token verification failed:', error.message);
//       // Bei ungültigem Token zur Anmeldeseite umleiten
//       const url = new URL("/login", request.url);
//       url.searchParams.set("from", pathname);
//       return NextResponse.redirect(url);
//     }
//   }
//   // Für alle anderen Pfade normal weitermachen
//   // und die Next.js-eigene not-found Behandlung einsetzen lassen
//   return NextResponse.next();
// }

// // Konfiguration für Middleware
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)",
//   ],
// };

// src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

    console.log('=== Middleware Debug ===');
    console.log('Path:', pathname);
    console.log('Token exists:', !!token);

    // Wenn kein Token vorhanden ist, zur Anmeldeseite umleiten
    if (!token) {
      console.log('No token found, redirecting to login');
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // JWT Secret als TextEncoder für jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      
      // Token verifizieren mit jose
      const { payload: decoded } = await jwtVerify(token, secret);
      
      console.log('Token decoded successfully:', { userId: decoded.id, role: decoded.role });

      // Rollenbasierte Zugriffskontrolle
      for (const [path, roles] of Object.entries(roleBasedPaths)) {
        if (pathname.startsWith(path) && !roles.includes(decoded.role)) {
          console.log(`Access denied: User role ${decoded.role} not allowed for path ${path}`);
          // Benutzer hat nicht die erforderliche Rolle
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      console.log('Access granted for user:', decoded.role);
      // Bei erfolgreicher Authentifizierung weitermachen
      return NextResponse.next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      // Bei ungültigem Token zur Anmeldeseite umleiten
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  // Für alle anderen Pfade normal weitermachen
  return NextResponse.next();
}

// Konfiguration für Middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$).*)",
  ],
};