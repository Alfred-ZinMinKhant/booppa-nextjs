import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetchWithAuth(`/api/v1/rfp-intake/${encodeURIComponent(params.id)}`)
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Intake not found' },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[rfp-intake/[id] proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
