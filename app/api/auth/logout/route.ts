import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { apiPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Sign out of this device.
 *
 * Clearing the cookies alone is not a logout: the refresh token stays valid
 * server-side for its full 30 days, so anyone holding a copy can keep minting
 * access tokens while the user believes the session ended. We revoke it at the
 * backend first, then clear.
 *
 * Backend failure must not block the local clear — a user who clicks "sign out"
 * has to end up signed out of this browser regardless.
 */
export async function POST() {
  const refreshToken = cookies().get('refreshToken')?.value

  if (refreshToken) {
    try {
      await fetch(apiPath('/auth/logout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      })
    } catch {
      // Best-effort: cookies are still cleared below.
    }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('token', '', { path: '/', maxAge: 0 })
  response.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
  response.cookies.set('vendor_plan', '', { path: '/', maxAge: 0 })
  return response
}
