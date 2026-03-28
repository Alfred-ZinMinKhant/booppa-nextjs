import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/rfp-requirements')
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: res.status })
  return NextResponse.json(await res.json())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetchWithAuth('/rfp-requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json(await res.json())
}
