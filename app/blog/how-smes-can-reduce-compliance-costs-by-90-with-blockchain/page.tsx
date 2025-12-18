"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Calendar } from 'lucide-react';

const PRICE_ENV = process.env.NEXT_PUBLIC_STRIPE_PDPA_QUICK_SCAN;

export default function ConversionPost() {
  const handlePrimary = async () => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: 'conversion-layer', cta: 'primary', action: 'click' }),
      });

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRICE_ENV, productType: 'quick_fix' }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('checkout error', err);
    }
  };

  const handleSecondary = async () => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: 'conversion-layer', cta: 'secondary', action: 'click' }),
      });
    } catch (err) {
      console.error('track secondary error', err);
    }
    window.location.href = '/book-demo';
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-4xl mx-auto p-6">
        <div className="overflow-hidden rounded-lg">
          <Image
            src="/2-Conversion-Layer.jpg"
            alt="SME compliance cost graph"
            width={1600}
            height={900}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        <h1 className="mt-6 text-4xl font-bold">How SMEs Can Reduce Compliance Costs by 90% with Blockchain</h1>

        <article className="mt-6 prose prose-invert max-w-none">
          <p>
            For a Small and Medium Enterprise (SME) in Singapore, compliance often feels like an expensive luxury. Between complex software subscriptions and legal consultations, costs can paralyze growth. However, new PDPC guidelines and blockchain technology are changing the rules.
          </p>

          <h2>The End of Subscription Fatigue</h2>
          <p>
            The Singapore authorities, through their <a className="text-booppa-blue underline" href="https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/other-guides/blockchain-guide_final.pdf" target="_blank" rel="noreferrer">Blockchain Guide</a>, have clarified that using cryptography and on-chain notarization is an excellent method for ensuring data integrity without maintaining expensive legacy infrastructure.
          </p>

          <h3>Why SMEs are moving away from traditional models</h3>
          <ul>
            <li>Hidden Costs: Most Enterprise tools impose unused features and high monthly fees.</li>
            <li>Regulatory Risk: Mishandling consent logs can lead to heavy fines from the PDPC.</li>
            <li>The Booppa Solution: Notarizing a consent record once costs a fraction of a manual audit or an administrative penalty.</li>
          </ul>

          <p>
            By leveraging AWS Singapore for data residency and the <strong>Polygon network</strong> for notarization, Booppa allows companies to pay only for what they actually notarize, eliminating "subscription fatigue".
          </p>

          <h2>Ready to Optimize?</h2>
          <p>Compliance does not need subscriptions or complexity. It needs proof—once.</p>
        </article>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePrimary}
            aria-label="Buy SGD 69 compliance fix"
            className="inline-flex items-center justify-center gap-3 bg-booppa-green hover:bg-booppa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-booppa-green/40 text-black font-semibold px-6 py-3 rounded-lg shadow-sm transition w-full sm:w-auto"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Fix your first compliance document for SGD 69 (one-time)</span>
          </button>

          <button
            onClick={handleSecondary}
            aria-label="Book cost-reduction consultation"
            className="inline-flex items-center gap-2 justify-center px-4 py-3 w-full sm:w-auto bg-white/5 hover:bg-white/10 ring-1 ring-booppa-blue/20 hover:ring-booppa-blue/40 text-booppa-blue rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-booppa-blue/40"
          >
            <Calendar className="w-5 h-5" />
            <span>Book a cost-reduction consultation for your business</span>
          </button>
        </div>
      </section>
    </main>
  );
}
