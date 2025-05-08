import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ["/new-story", "/profile", "/bookmarks"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Define auth routes
  const authRoutes = ["/signin", "/signup"]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If trying to access a protected route without being logged in
  if (isProtectedRoute && !token) {
    const url = new URL("/signin", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // If trying to access auth routes while logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/new-story/:path*", "/profile/:path*", "/bookmarks/:path*", "/signin", "/signup"],
}
