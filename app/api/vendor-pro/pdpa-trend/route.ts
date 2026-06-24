import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetchWithAuth(`/api/v1/vendor-pro/pdpa-trend`)
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
