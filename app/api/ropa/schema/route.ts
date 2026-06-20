import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

// Public schema — no auth required. Proxied so the frontend uses a single
// same-origin /api/ropa/* surface (mirrors the other ROPA proxy routes).
export async function GET() {
  const res = await fetch(`${config.apiUrl}/api/v1/ropa/schema`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
