import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Vendor comparison → backend /compare/ (JWT-gated, procurement plan only).
// Must forward auth via fetchWithAuth — the backend now requires
// get_current_user + _require_procurement, so a bare fetch() 401s.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetchWithAuth('/api/v1/compare/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
