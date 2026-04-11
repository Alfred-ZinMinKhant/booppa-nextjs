import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/api/v1/vendor/badge')
  if (!res.ok) return NextResponse.json({ active: false, html: null }, { status: res.status })
  return NextResponse.json(await res.json())
}
