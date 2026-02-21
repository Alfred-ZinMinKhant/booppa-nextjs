import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('[Stripe] Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const scanUrl = session.metadata?.scan_url
        const customerEmail = session.customer_email || session.metadata?.customer_email
        const product = session.metadata?.product

        if (product === 'pdpa-snapshot' && scanUrl && customerEmail) {
          // Trigger scan pipeline (async via queue or direct API call)
          await triggerScanPipeline({
            url: scanUrl,
            email: customerEmail,
            payment_intent: session.payment_intent as string,
            amount_paid: session.amount_total! / 100, // convert from cents
            currency: session.currency || 'sgd'
          })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        // Update user's subscription status in database
        console.log('[Stripe] Subscription updated:', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        // Mark subscription as cancelled
        console.log('[Stripe] Subscription cancelled:', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('[Stripe] Invoice paid:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error('[Stripe] Invoice payment failed:', invoice.id)
        // Send email notification to customer
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function triggerScanPipeline(data: {
  url: string
  email: string
  payment_intent: string
  amount_paid: number
  currency: string
}) {
  try {
    // Call backend scan pipeline
    // This should be the Celery task from the backend
    const response = await fetch(`${process.env.API_URL}/api/scans/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
      },
      body: JSON.stringify({
        url: data.url,
        email: data.email,
        payment_reference: data.payment_intent,
        amount: data.amount_paid,
        currency: data.currency,
        scan_type: 'pdpa-snapshot',
        guest: true // no user_id, guest purchase
      })
    })

    if (!response.ok) {
      throw new Error(`Scan API returned ${response.status}`)
    }

    console.log('[Scan Pipeline] Triggered successfully for:', data.email)
  } catch (error) {
    console.error('[Scan Pipeline] Failed to trigger:', error)
    // In production: queue for retry, send alert
  }
}
