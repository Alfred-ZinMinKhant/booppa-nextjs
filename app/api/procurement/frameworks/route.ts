import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/procurement/frameworks')
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to load frameworks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const res = await fetchWithAuth('/api/v1/procurement/frameworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to create framework' }, { status: 500 })
  }
}
