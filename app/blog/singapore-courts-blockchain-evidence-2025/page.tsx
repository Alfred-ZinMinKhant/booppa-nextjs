"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Calendar } from 'lucide-react';

const PRICE_ENV = process.env.NEXT_PUBLIC_STRIPE_PDPA_QUICK_SCAN;

export default function AuthorityPost() {
  const handlePrimary = async () => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: 'authority-layer', cta: 'primary', action: 'click' }),
      });

      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/stripe/checkout`, {
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
        body: JSON.stringify({ article: 'authority-layer', cta: 'secondary', action: 'click' }),
      });
    } catch (err) {
      console.error('track secondary error', err);
    }
    // Navigate to the book-demo page
    window.location.href = '/book-demo';
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-4xl mx-auto p-6">
        <div className="overflow-hidden rounded-lg">
          <Image
            src="/1-Authority.jpg"
            alt="Gavel and scales - authority"
            width={1600}
            height={900}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        <h1 className="mt-6 text-4xl font-bold">Singapore Courts and Blockchain Evidence: 2025 Updates on Admissibility and Provenance</h1>

        <article className="mt-6 prose prose-invert max-w-none">
          <p>
            The legal landscape in Singapore has reached a turning point in 2025. It is no longer a question of <em>if</em> blockchain can be used in court, but <em>how</em> the integrity of the data is presented.
          </p>

          <h2>The Shift in Judicial Acceptance</h2>
          <p>
            Recent rulings from the High Court, specifically the case <a className="text-booppa-blue underline" href="https://www.google.com/search?q=2025+SGHC+104" target="_blank" rel="noreferrer">[2025] SGHC 104</a>, have confirmed that blockchain records are admissible as primary evidence when the integrity and chain of custody are demonstrable through immutable hashes and timestamps. This ruling follows the evolution of Singaporean case law, building on seminal discussions from the <a href="https://lawgazette.com.sg/feature/blockchain-records-under-singapore-law/" target="_blank" rel="noreferrer" className="text-booppa-blue underline">Singapore Law Gazette (2018)</a> which paved the way for accepting distributed records as original documents.
          </p>

          <h2>What Courts Require in 2025</h2>
          <p>For compliance teams, internal logs are no longer sufficient to withstand judicial scrutiny. Singapore judges now demand:</p>
          <ol>
            <li>Demonstrable Integrity: Proof that the data has not been altered since the moment of creation.</li>
            <li>Certain Provenance: Clear evidence of who generated the record and exactly when.</li>
            <li>Verifiable Custody: A notarized trail on a public blockchain like Polygon provides the standard now expected in courtrooms.</li>
          </ol>

          <h2>Action Required</h2>
          <p>
            Recent rulings confirm that blockchain evidence is admissible when integrity is demonstrable. Booppa implements exactly these standards.
          </p>
        </article>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePrimary}
            aria-label="Buy SGD 69 compliance fix"
            className="inline-flex items-center justify-center gap-3 bg-booppa-green hover:bg-booppa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-booppa-green/40 text-black font-semibold px-6 py-3 rounded-lg shadow-sm transition w-full sm:w-auto"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Prepare your next compliance log for court scrutiny (SGD 69)</span>
          </button>

          <button
            onClick={handleSecondary}
            aria-label="Schedule legal compliance demo"
            className="inline-flex items-center gap-2 justify-center px-4 py-3 w-full sm:w-auto bg-white/5 hover:bg-white/10 ring-1 ring-booppa-blue/20 hover:ring-booppa-blue/40 text-booppa-blue rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-booppa-blue/40"
          >
            <Calendar className="w-5 h-5" />
            <span>Schedule a legal compliance demo with our experts</span>
          </button>
        </div>
      </section>
    </main>
  );
}
