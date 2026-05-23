import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const qs = new URL(req.url).search
  const res = await fetchWithAuth(`/api/v1/vendor-pro/competitor-signals${qs}`)
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
