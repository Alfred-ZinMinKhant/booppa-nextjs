import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/api/v1/leads/stats')
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: res.status })
  }
  
  const data = await res.json()
  return NextResponse.json(data)
}
