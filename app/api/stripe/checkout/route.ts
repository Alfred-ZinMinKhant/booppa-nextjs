import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize rate limiter: 5 requests per 60 seconds per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Price ID mapping based on product type
const PRICE_MAP: Record<string, string> = {
  'pdpa_quick_scan': process.env.STRIPE_PDPA_QUICK_SCAN!,
  'pdpa_basic': process.env.STRIPE_PDPA_BASIC!,
  'pdpa_pro': process.env.STRIPE_PDPA_PRO!,
  'compliance_standard': process.env.STRIPE_COMPLIANCE_STANDARD!,
  'compliance_pro': process.env.STRIPE_COMPLIANCE_PRO!,
  'supply_chain_1': process.env.STRIPE_SUPPLY_CHAIN_1!,
  'supply_chain_10': process.env.STRIPE_SUPPLY_CHAIN_10!,
  'supply_chain_50': process.env.STRIPE_SUPPLY_CHAIN_50!,
};

// Mode mapping
const MODE_MAP: Record<string, 'payment' | 'subscription'> = {
  'pdpa_quick_scan': 'payment',
  'pdpa_basic': 'subscription',
  'pdpa_pro': 'subscription',
  'compliance_standard': 'subscription',
  'compliance_pro': 'subscription',
  'supply_chain_1': 'payment',
  'supply_chain_10': 'payment',
  'supply_chain_50': 'payment',
};

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Rate limiting
  try {
    await rateLimiter.consume(clientIP);
  } catch (rateLimitError) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { productType } = body;

    if (!productType || !PRICE_MAP[productType]) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[productType];
    const mode = MODE_MAP[productType];

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}&product=${productType}",
      cancel_url: "${process.env.NEXT_PUBLIC_BASE_URL}/${getCancelUrl(productType)}",
      payment_method_types: ['card'],
      metadata: {
        product_type: productType,
        client_ip: clientIP,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

function getCancelUrl(productType: string): string {
  if (productType.includes('pdpa')) return 'pdpa';
  if (productType.includes('compliance')) return 'compliance';
  if (productType.includes('supply_chain')) return 'supply-chain';
  return '';
}
