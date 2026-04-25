import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth, getServerSideUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Inject the logged-in user's email so the Stripe webhook always has it
    // for fulfillment (plan activation, email sending) even on subscriptions
    // where customer_details may be absent for returning Stripe customers.
    let enrichedBody = body
    if (!body.prefill_email && !body.customerEmail) {
      const user = await getServerSideUser()
      if (user?.email) {
        enrichedBody = { ...body, prefill_email: user.email }
      }
    }

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
  } catch (error: any) {
    console.error('[Checkout proxy error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
