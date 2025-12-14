import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = [
  // "/user",
  "/account",
  "/company",
  "/admin",
  "/api/orders",
  "/api/company",
  // "/api/user",
  "/api/account",
  "/api/admin",
  "/order/create",
  "/order/confirmation",
];

// Public admin paths that don't require authentication
const publicAdminPaths = ["/admin/login"];

const isProtectedPath = (path) => {
  // Check if it's a public admin path first
  if (
    publicAdminPaths.some(
      (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
    )
  ) {
    return false;
  }

  return protectedPaths.some((protectedPath) => {
    return path === protectedPath || path.startsWith(`${protectedPath}/`);
  });
};

const roleBasedPaths = {
  // "/user": ["user"],
  "/account": ["user"],
  "/company": ["company"],
  "/admin": ["admin"],
  "/api/orders": ["user", "company", "admin"],
  "/api/company": ["company", "admin"],
  "/api/admin": ["admin"],
};

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // For Protected Paths check authentication
  if (isProtectedPath(pathname)) {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    console.log("=== Proxy Debug ===");
    console.log("Path:", pathname);
    console.log("Token exists:", !!token);

    // If no token is present, redirect to login page
    if (!token) {
      console.log("No token found, redirecting to login");
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // JWT Secret as TextEncoder for jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      // Verify token with jose
      const { payload: decoded } = await jwtVerify(token, secret);

      console.log("Token decoded successfully:", {
        accountId: decoded.id,
        role: decoded.role,
      });

      // Role-based access control
      for (const [path, roles] of Object.entries(roleBasedPaths)) {
        if (pathname.startsWith(path) && !roles.includes(decoded.role)) {
          console.log(
            `Access denied: Account role ${decoded.role} not allowed for path ${path}`
          );
          // Account doesn't have the required role
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      console.log("Access granted for account:", decoded.role);
      // Continue with successful authentication
      return NextResponse.next();
    } catch (error) {
      console.log("Token verification failed:", error.message);
      // Redirect to login page for invalid token
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }
  // Continue normally for all other paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.webp$|api/auth/).*)",
  ],
};
