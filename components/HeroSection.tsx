'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickScan = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PDPA_QUICK_SCAN,
          productType: 'pdpa_quick_scan'
        })
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Trust badges (updated) */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              '2,800+ Singapore Companies',
              'AI-Powered Insights + Polygon Blockchain',
              'Polygon Blockchain-Verified Records',
              'PDPA & MAS Regulatory Aligned',
              'AWS Singapore Infrastructure'
            ].map((text) => (
              <span key={text} className="bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm">
                {text}
              </span>
            ))}
          </div>

          {/* Main headline (unchanged) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            <span className="block">PDPA Audit Failed?</span>
            <span className="block text-green-400 mt-2">Cookie Banner Wrong?</span>
            <span className="block mt-2">Consent Records Missing?</span>
          </h1>

          {/* Subheadline (updated) */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Fix your PDPA compliance in <span className="text-green-400 font-bold">30 seconds</span> with AI-powered insights and Polygon blockchain-verified records, designed to generate court-admissible evidence <span className="italic">(subject to judicial acceptance)</span>. Supported by detailed evidence packs linking on-chain proofs to originals.
          </p>

          {/* Pricing and CTA (unchanged) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <span className="text-lg font-bold text-white bg-green-700/80 px-6 py-2 rounded-full shadow">
              SGD 69 One-Time • No Subscription
            </span>
            <button
              className="bg-booppa-green hover:bg-green-500 text-black font-bold px-8 py-3 rounded-full transition-colors text-lg shadow-lg disabled:opacity-60"
              onClick={handleQuickScan}
              disabled={isLoading}
            >
              {isLoading ? 'Redirecting…' : 'Fix Your PDPA in 30 Seconds – SGD 69'}
            </button>
            <Link
              href="/qr-scan"
              className="bg-white hover:bg-gray-100 text-green-700 font-bold px-8 py-3 rounded-full transition-colors text-lg shadow-lg border border-green-700"
            >
              Free Instant PDPA Scan
            </Link>
          </div>

          {/* Legal disclaimer (new) */}
          <p className="text-xs text-gray-400 mt-2 max-w-2xl mx-auto">
            Designed to align with Singapore's PDPA and MAS regulatory requirements. Booppa is not endorsed, approved, or certified by MAS or PDPC. Evidence admissibility is subject to judicial acceptance.
          </p>
        </div>
      </div>
    </section>
  );
}
