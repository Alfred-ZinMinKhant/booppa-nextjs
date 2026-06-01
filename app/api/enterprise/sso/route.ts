import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * BFF proxy for SSO config.
 *
 * GET  /api/enterprise/sso?org_id=...  → fetch current config + SP URLs
 * PUT  /api/enterprise/sso?org_id=...  → upsert config; returns ACS + metadata URLs
 *
 * The bearer token cookie is forwarded to the backend so RBAC works.
 */

function bearer(): Record<string, string> {
  const token = cookies().get('token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function resolveOrgId(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('org_id')
}

export async function GET(request: Request) {
  const orgId = resolveOrgId(request)
  if (!orgId) return NextResponse.json({ error: 'org_id required' }, { status: 400 })

  const r = await fetch(
    `${config.apiUrl}/enterprise/organisations/${orgId}/sso`,
    { headers: { ...bearer() }, cache: 'no-store' },
  )
  const body = await r.json().catch(() => ({}))
  return NextResponse.json(body, { status: r.status })
}

export async function PUT(request: Request) {
  const orgId = resolveOrgId(request)
  if (!orgId) return NextResponse.json({ error: 'org_id required' }, { status: 400 })

  const payload = await request.json().catch(() => ({}))
  const r = await fetch(
    `${config.apiUrl}/enterprise/organisations/${orgId}/sso`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearer() },
      body: JSON.stringify(payload),
    },
  )
  const body = await r.json().catch(() => ({}))
  return NextResponse.json(body, { status: r.status })
}
