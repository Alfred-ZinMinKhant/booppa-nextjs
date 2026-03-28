import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public vendor/user routes — no `token` cookie required
const publicRoutes = [
  '/', '/login', '/register', '/forgot-password',
  '/trial', '/pricing', '/faq', '/support', '/book-demo',
  '/privacy', '/terms', '/security', '/dpo', '/cookies',
  '/acceptable-use', '/disclaimer',
  '/compare', '/rankings', '/insight-dome',
  '/notarization', '/pdpa', '/compliance', '/supply-chain',
  '/rfp-acceleration', '/enterprise', '/enterprise-briefing',
  '/demo', '/thank-you', '/qr-scan',
  '/tender-check',
]
const publicPrefixes = ['/verify', '/vendors', '/blog']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes handle their own auth
  if (pathname.startsWith('/api')) return NextResponse.next()

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value

    // /admin/login is always accessible; redirect to dashboard if already authed
    if (pathname === '/admin/login') {
      if (adminToken) return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      return NextResponse.next()
    }

    // All other /admin/* routes require admin_token
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }

  // ── Vendor / user routes ─────────────────────────────────────────────────
  const token = request.cookies.get('token')?.value
  const isPublicPrefix = publicPrefixes.some(p => pathname.startsWith(p))
  const isPublicRoute  = publicRoutes.some(r => pathname === r || (r !== '/' && pathname.startsWith(r)))

  if (isPublicPrefix || isPublicRoute) {
    // If already logged in and trying to hit login/register, send to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protected route — must have token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)'],
}
