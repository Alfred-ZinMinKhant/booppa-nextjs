import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = await fetchWithAuth('/api/v1/pdpa/rescan', { method: 'POST' })
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
