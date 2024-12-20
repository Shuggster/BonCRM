import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public paths
        if (req.nextUrl.pathname.startsWith('/login')) return true
        if (req.nextUrl.pathname === '/') return true
        
        // Must be authenticated for all other paths
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!login|_next/static|_next/image|favicon.ico).*)',
    '/settings/:path*',
    '/contacts/:path*',
    '/tasks/:path*',
    '/calendar/:path*',
  ],
}
