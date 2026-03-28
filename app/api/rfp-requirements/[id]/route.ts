import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetchWithAuth(`/rfp-requirements/${params.id}`, { method: 'DELETE' })
  if (!res.ok) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  return NextResponse.json(await res.json())
}
