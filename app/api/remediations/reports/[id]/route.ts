import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Remediation proxy for a specific report.
 *
 *   GET  /api/remediations/reports/{id}  → list this report's remediations
 *   POST /api/remediations/reports/{id}  → create a remediation
 *
 * Both forward to the backend with the user's bearer token from the
 * HttpOnly `token` cookie. The body for POST must be:
 *   { finding_key: string, status: "fixed" | "wontfix" | "open", notes?: string }
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const r = await fetch(
    `${config.apiUrl}/api/remediations/reports/${params.id}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  )
  const body = await r.json().catch(() => ([]))
  return NextResponse.json(body, { status: r.status })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const payload = await request.json().catch(() => ({}))
  const r = await fetch(
    `${config.apiUrl}/api/remediations/reports/${params.id}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
  const body = await r.json().catch(() => ({}))
  return NextResponse.json(body, { status: r.status })
}
