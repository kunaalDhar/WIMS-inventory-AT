import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionData = request.cookies.get("wims-session-v4")
  const { pathname } = request.nextUrl

  // Check if user is authenticated
  const isAuthenticated = !!sessionData

  // Admin routes
  if (pathname.startsWith("/admin")) {
    // If trying to access login page while authenticated
    if (pathname === "/admin/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // If trying to access protected pages while not authenticated
    if (
      pathname !== "/admin/login" &&
      pathname !== "/admin/signup" &&
      !isAuthenticated
    ) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Salesman routes
  if (pathname.startsWith("/salesman")) {
    // If trying to access login page while authenticated
    if (pathname === "/salesman/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/salesman/dashboard", request.url))
    }

    // If trying to access protected pages while not authenticated
    if (
      pathname !== "/salesman/login" &&
      pathname !== "/salesman/signup" &&
      !isAuthenticated
    ) {
      return NextResponse.redirect(new URL("/salesman/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/salesman/:path*",
  ],
}