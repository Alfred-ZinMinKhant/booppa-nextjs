import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const res = await fetchWithAuth(
      `/api/v1/rfp-intake/${encodeURIComponent(params.id)}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Submission failed' },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[rfp-intake submit proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
