import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("access_token")?.value;
  const sessionActive = req.cookies.get("session_active")?.value;
  const { pathname } = req.nextUrl;

  // Allow access to sign in and public routes
  if (
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/verify-account" ||
    pathname.startsWith("/verify-account") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If no token, redirect to signin
  if (!token && !sessionActive) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"], // protect all pages except /api
};
