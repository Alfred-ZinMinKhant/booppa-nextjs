import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth, getServerSideUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Require sign-in: notarization upload, PDPA scan, and bundle fulfillment
    // all need an authenticated user account. Block checkout for guests.
    const user = await getServerSideUser()
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to purchase.' },
        { status: 401 }
      )
    }
    const enrichedBody = body.prefill_email || body.customerEmail
      ? body
      : { ...body, prefill_email: user.email }

    const res = await fetchWithAuth('/api/v1/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedBody),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Checkout failed' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Checkout proxy error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
