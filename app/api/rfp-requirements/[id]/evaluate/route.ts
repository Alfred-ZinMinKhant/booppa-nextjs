import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const res = await fetchWithAuth(`/rfp-requirements/${params.id}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json(await res.json())
}
