import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/rfp-intake/pending')
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Unable to load pending RFP intakes' },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[rfp-intake/pending proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
