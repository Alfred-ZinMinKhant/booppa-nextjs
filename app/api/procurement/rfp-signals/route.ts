import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const qs = searchParams.toString()
  const url = `/api/v1/procurement/rfp-signals${qs ? `?${qs}` : ''}`

  try {
    const res = await fetchWithAuth(url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch RFP signals' }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to fetch RFP signals' }, { status: 500 })
  }
}
