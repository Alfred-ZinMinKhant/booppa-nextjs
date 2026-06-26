import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetchWithAuth('/api/v1/tender-intelligence/intents')
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}))
  const res = await fetchWithAuth('/api/v1/tender-intelligence/intents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
