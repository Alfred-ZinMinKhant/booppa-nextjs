import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/api/v1/vendor/dashboard-cal')
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch CAL dashboard' }, { status: res.status })
  return NextResponse.json(await res.json())
}
