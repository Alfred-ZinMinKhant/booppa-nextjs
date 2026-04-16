import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetchWithAuth('/api/v1/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Checkout failed' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Checkout proxy error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
