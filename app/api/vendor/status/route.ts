import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/vendor/status')
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch vendor status' }, { status: res.status })
  return NextResponse.json(await res.json())
}
