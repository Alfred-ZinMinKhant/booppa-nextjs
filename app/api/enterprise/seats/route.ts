import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Seat-usage proxy for the team-management page.
 *
 * GET /api/enterprise/seats?org_id=...
 *   → { used, pending_invites, limit, remaining }
 * `limit: null` = unlimited.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const orgId = url.searchParams.get('org_id')
  if (!orgId) {
    return NextResponse.json({ error: 'org_id required' }, { status: 400 })
  }
  const token = cookies().get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const r = await fetch(
    `${config.apiUrl}/enterprise/organisations/${orgId}/seats`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  )
  const body = await r.json().catch(() => ({}))
  return NextResponse.json(body, { status: r.status })
}
