import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetchWithAuth(`/rfp-requirements/${params.id}/flags${qs}`)
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json(await res.json())
}
