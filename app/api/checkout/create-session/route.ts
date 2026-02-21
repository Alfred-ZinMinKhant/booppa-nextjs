import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { priceId, mode, metadata, successUrl, cancelUrl } = body

    const session = await stripe.checkout.sessions.create({
      mode: mode || 'payment', // 'payment' for one-time, 'subscription' for recurring
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      customer_email: metadata?.customer_email,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address for compliance
      billing_address_collection: 'required'
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('[Stripe Checkout Error]', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
