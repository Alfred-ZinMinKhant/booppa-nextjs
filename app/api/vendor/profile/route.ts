import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/auth/me')
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: res.status })
  }
  return NextResponse.json(await res.json())
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const res = await fetchWithAuth('/vendor/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
