import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/vendor/sector-pressure')
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch sector pressure' }, { status: res.status })
  return NextResponse.json(await res.json())
}
