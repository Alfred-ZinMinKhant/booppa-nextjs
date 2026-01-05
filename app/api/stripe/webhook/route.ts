import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const sesClient = new SESClient({ 
  region: 'ap-southeast-1',
});

// Next.js 14+: use route segment config
export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json(
      { error: 'Missing Stripe signature header' },
      { status: 400 }
    );
  }
  const rawBody = await req.text(); // Get raw request body as string

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email;
  const productType = session.metadata?.product_type;

  if (customerEmail) {
    const productName = getProductName(productType || '');

    const sendEmailCommand = new SendEmailCommand({
      Source: "receipts@booppa.io",
      Destination: {
        ToAddresses: [customerEmail],
        BccAddresses: ["support@booppa.io"],
      },
      Message: {
        Subject: {
          Data: `Payment Confirmed - ${productName}`,
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body>
                  <h2>Thank you for your purchase!</h2>
                  <p>Your payment for <b>${productName}</b> has been confirmed.</p>
                  <p>Amount: SGD ${(session.amount_total || 0) / 100}</p>
                  <p>Transaction ID: ${session.id}</p>
                  <p>You will receive your service activation email shortly.</p>
                  <p>Best Regards,<br/>The BOOPPA Team</p>
                </body>
              </html>
            `,
          },
        },
      },
    });

    await sesClient.send(sendEmailCommand);
  }

  // Log to database or trigger other business logic
  console.log(`Payment successful for ${productType}, customer: ${customerEmail}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Handle subscription lifecycle events
  console.log(`Subscription ${subscription.status}: ${subscription.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerEmail = invoice.customer_email;

  if (customerEmail) {
    const sendEmailCommand = new SendEmailCommand({
      Source: "billing@booppa.io",
      Destination: {
        ToAddresses: [customerEmail],
        BccAddresses: ["support@booppa.io"],
      },
      Message: {
        Subject: {
          Data: `Payment Failed - Action Required`,
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body>
                  <h2>Payment Failed</h2>
                  <p>We were unable to process your latest payment.</p>
                  <p>Please update your payment method to avoid service interruption.</p>
                  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/billing">Update Payment Method</a></p>
                  <p>Best Regards,<br/>The BOOPPA Team</p>
                </body>
              </html>
            `,
          },
        },
      },
    });

    await sesClient.send(sendEmailCommand);
  }
}

function getProductName(productType: string): string {
  const map: Record<string, string> = {
    'pdpa_quick_scan': 'PDPA Quick Scan',
    'pdpa_basic': 'PDPA Basic Plan',
    'pdpa_pro': 'PDPA Pro Plan',
    'compliance_standard': 'Compliance Standard Suite',
    'compliance_pro': 'Compliance Pro Suite',
    'supply_chain_1': 'Compliance Notarization (1 Document)',
    'supply_chain_10': 'Compliance Notarization (10 Documents)',
    'supply_chain_50': 'Compliance Notarization (50 Documents)',
    'compliance_notarization_1': 'Compliance Notarization (1 Document)',
    'compliance_notarization_10': 'Compliance Notarization (10 Documents)',
    'compliance_notarization_50': 'Compliance Notarization (50 Documents)',
  };
  return map[productType] || 'Product';
}
