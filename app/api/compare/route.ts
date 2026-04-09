import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${config.apiUrl}/api/v1/compare/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.ok ? 200 : 500 })
}
