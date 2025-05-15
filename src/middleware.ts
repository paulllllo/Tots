import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user is authenticated (e.g., by checking for a session cookie or token)
  const isAuthenticated = request.cookies.has('session'); // Example: check for a session cookie

  // Define protected routes
  const protectedRoutes = ['/ideas', '/liked', '/profile', '/users'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect unauthenticated users to the signup page
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ideas/:path*', '/liked', '/profile', '/users/:path*/edit'],
}; 