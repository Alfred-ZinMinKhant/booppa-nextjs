import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/dashboard')
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: res.status })
  }
  
  const data = await res.json()
  return NextResponse.json(data)
}
