import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { tenderNo: string } }) {
  const res = await fetchWithAuth(
    `/api/v1/tender-intelligence/intents/${encodeURIComponent(params.tenderNo)}`,
    { method: 'DELETE' },
  )
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
