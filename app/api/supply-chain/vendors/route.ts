import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const res = await fetchWithAuth('/api/v1/supply-chain/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to add vendor' }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}
