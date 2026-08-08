import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { apiPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Mints a SHORT-LIVED token the client can use to authenticate the WebSocket.
 *
 * Why this exists:
 *   The session JWT lives in an HttpOnly cookie, so document.cookie cannot see
 *   it, but the socket.io handshake needs a credential from JavaScript. This
 *   route reads the cookie server-side and exchanges it for a handshake token.
 *
 * Security:
 *   This used to return the session cookie's own value while describing it as
 *   short-lived. It was not: that token is valid for 7 days and grants full API
 *   access, so any XSS or logged handshake yielded a week of account access.
 *   We now exchange it at the backend for a `type: "ws"` token that expires in
 *   two minutes and is rejected everywhere except the socket handshake.
 *   The raw session token never reaches the browser.
 */
export async function GET() {
  const token = cookies().get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let r: Response
  try {
    r = await fetch(apiPath('/auth/ws-token'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json({ error: 'Token service unavailable' }, { status: 502 })
  }

  if (!r.ok) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: r.status })
  }

  const body = await r.json().catch(() => null)
  if (!body?.wsToken) {
    return NextResponse.json({ error: 'Token service unavailable' }, { status: 502 })
  }

  return NextResponse.json({ wsToken: body.wsToken, expiresIn: body.expiresIn ?? 120 })
}
