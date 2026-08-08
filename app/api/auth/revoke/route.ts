import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { apiPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Sign out of EVERY device.
 *
 * Distinct from `/api/auth/logout`, which ends only this browser's session.
 * This drops all of the user's stored refresh tokens and stamps an access-token
 * cutoff, so the outstanding 24h access tokens other devices are holding stop
 * working immediately rather than lingering for a day.
 *
 * The backend endpoint (`POST /auth/revoke`) existed and worked but had no UI —
 * a user who suspected their account was compromised had no way to reach it.
 *
 * Unlike logout, a backend failure here MUST be surfaced: silently clearing the
 * local cookies would show "signed out everywhere" while every other session
 * stayed live, which is the one lie this control cannot afford to tell.
 */
export async function POST() {
  const token = cookies().get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let upstream: Response
  try {
    upstream = await fetch(apiPath('/auth/revoke'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json({ error: 'revoke_unavailable' }, { status: 502 })
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'revoke_failed' },
      { status: upstream.status === 401 ? 401 : 502 },
    )
  }

  // Only now is it true. This browser's own tokens were just revoked too, so
  // clear them rather than leaving the user on a dead session.
  const response = NextResponse.json({ ok: true })
  response.cookies.set('token', '', { path: '/', maxAge: 0 })
  response.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
  response.cookies.set('vendor_plan', '', { path: '/', maxAge: 0 })
  return response
}
