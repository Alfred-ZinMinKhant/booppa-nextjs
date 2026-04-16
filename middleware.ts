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
  '/rfp-acceleration', '/rfp', '/enterprise', '/enterprise-briefing',
  '/demo', '/thank-you', '/qr-scan',
  '/tender-check', '/vendor-proof', '/opportunities',
  '/insights', '/resources', '/check-status',
  '/compliance-notarization',
]
const publicPrefixes = ['/verify', '/vendors', '/blog', '/solutions', '/auth']

// Routes that require a paid plan (pro or enterprise).
const proPrefixes = ['/vendor/evidence', '/vendor/rfp']

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
    // If already logged in, redirect away from auth/marketing entry points
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

  // ── Paywall: PRO-only routes ──────────────────────────────────────────────
  const isProRoute = proPrefixes.some(p => pathname.startsWith(p))
  if (isProRoute) {
    const plan = request.cookies.get('vendor_plan')?.value || 'free'
    if (plan === 'free') {
      const pricingUrl = new URL('/pricing', request.url)
      pricingUrl.searchParams.set('upgrade', '1')
      pricingUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(pricingUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)'],
}
