import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  console.log('Middleware - Current path:', req.nextUrl.pathname)
  console.log('Middleware - Session exists:', !!session)

  // If not logged in and trying to access protected route, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/(authenticated)')) {
    console.log('Middleware - Redirecting to login')
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl.toString())
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (session && req.nextUrl.pathname === '/login') {
    console.log('Middleware - Redirecting to dashboard')
    const baseUrl = req.nextUrl.origin
    return NextResponse.redirect(`${baseUrl}/(authenticated)/dashboard`)
  }

  return res
}

export const config = {
  matcher: [
    '/login',
    '/(authenticated)/:path*',
  ]
} 