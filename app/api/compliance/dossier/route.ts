import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = await fetchWithAuth('/api/v1/compliance/dossier/generate', { method: 'POST' })
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to generate dossier' }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}
