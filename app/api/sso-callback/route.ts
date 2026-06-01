import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * BFF endpoint for SSO callbacks (SAML ACS, OIDC callback).
 *
 * The backend redirects the browser to /auth/sso-callback with tokens in the
 * URL fragment. The client page reads them out of `window.location.hash`,
 * POSTs them here, and we set the same HttpOnly cookies as the password-login
 * flow. URL-fragment tokens never reach server logs, referrers, or this
 * Next.js route's request URL.
 */
export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const isProduction = process.env.NODE_ENV === 'production'

    cookies().set({
      name: 'token',
      value: access_token,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      maxAge: config.tokenMaxAge,
      sameSite: 'lax',
    })

    cookies().set({
      name: 'refreshToken',
      value: refresh_token,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      maxAge: config.refreshTokenMaxAge,
      sameSite: 'lax',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
