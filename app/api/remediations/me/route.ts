import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/remediations/me
 *   → full remediation history for the authenticated user,
 *     newest first. Used by the /vendor/remediations page.
 */
export async function GET() {
  const token = cookies().get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const r = await fetch(
    `${config.apiUrl}/api/remediations/me`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  )
  const body = await r.json().catch(() => ([]))
  return NextResponse.json(body, { status: r.status })
}
