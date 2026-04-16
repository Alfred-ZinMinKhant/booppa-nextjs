import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${config.apiUrl}/api/v1/funnel/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)

  if (!res) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
}
