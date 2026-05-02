import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/vendor/dashboard-alerts')
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch dashboard alerts' }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard alerts' }, { status: 500 })
  }
}
