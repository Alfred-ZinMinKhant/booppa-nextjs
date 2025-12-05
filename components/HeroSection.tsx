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
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              '2,800+ Singapore Companies',
              'Court-Admissible Evidence',
              'MAS & PDPC Approved',
              'AWS Singapore Infrastructure'
            ].map((text) => (
              <span key={text} className="bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm">
                {text}
              </span>
            ))}
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            <span className="block">PDPA Audit Failed?</span>
            <span className="block text-green-400 mt-2">Cookie Banner Wrong?</span>
            <span className="block mt-2">Consent Records Missing?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Fix your PDPA compliance in <span className="text-green-400 font-bold">30 seconds</span> with blockchain-verified evidence.
            <span className="block text-green-400 text-2xl sm:text-3xl font-black mt-4">SGD 69 One-Time • No Subscription</span>
          </p>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={handleQuickScan}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black text-xl md:text-2xl font-black px-8 sm:px-12 md:px-16 py-5 md:py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : '→ Fix Your PDPA in 30 Seconds – SGD 69'}
            </button>
            <p className="mt-6 text-gray-400 text-lg">
              One-time payment • 12-page compliance gap report • 38% convert to full PDPA Suite
            </p>
          </div>

          {/* Explore more */}
          <div className="mt-16">
            <p className="text-gray-400 mb-6">Or explore our complete suites</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pdpa"
                className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-600 transition"
              >
                PDPA Suite (From SGD 299/mo)
              </Link>
              <Link
                href="/compliance"
                className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-8 py-3 text-lg font-semibold text-white hover:bg-gray-800 transition"
              >
                Compliance Suite (From SGD 1,299/mo)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-40">
        <button
          onClick={handleQuickScan}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-4 rounded-xl shadow-2xl"
        >
          {isLoading ? 'Processing...' : 'Fix PDPA – SGD 69 One-Time'}
        </button>
      </div>
    </section>
  );
}
