import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetchWithAuth('/api/v1/leads/activity')
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: res.status })
  }
  
  const data = await res.json()
  return NextResponse.json(data)
}
