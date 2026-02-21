import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotte accessibili senza autenticazione
const publicRoutes  = ['/login', '/register', '/forgot-password', '/', '/trial', '/enterprise-briefing', '/admin/intelligence']
const publicPrefixes = ['/verify']

export function middleware(request: NextRequest) {
  const token              = request.cookies.get('token')?.value
  const { pathname }       = request.nextUrl
  const isPublicPrefix     = publicPrefixes.some(p => pathname.startsWith(p))
  const isPublicRoute      = publicRoutes.some(r => pathname.startsWith(r))
  const isApiRoute         = pathname.startsWith('/api')

  // Le route API gestiscono autonomamente l'autenticazione
  if (isApiRoute) return NextResponse.next()

  // Verify portal è sempre pubblico (token nell'URL, non nel cookie)
  if (isPublicPrefix) return NextResponse.next()

  // Autenticato → se prova ad accedere a login, vai a dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url))
  }

  // Non autenticato → redirect al login, salvando la rotta di provenienza
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
