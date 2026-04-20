'use client';

import { useState } from 'react';
import Link from 'next/link';

function CheckItem({ text, color = 'text-[#10b981]' }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-[#64748b]">
      <span className={`${color} font-bold flex-shrink-0`}>&#10003;</span>{text}
    </li>
  );
}

async function startCheckout(productType: string): Promise<void> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productType }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || 'Unable to start checkout. Please try again.');
    }
  } catch {
    alert('Unable to start checkout. Please try again.');
  }
}

export default function SolutionsVendorsPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  async function handleCheckout(productType: string) {
    setLoadingProduct(productType);
    await startCheckout(productType);
    setLoadingProduct(null);
  }

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[rgba(16,185,129,0.1)]">
            For Vendors
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Verify your company.<br />
            <span className="text-[#10b981]">Prove your compliance.</span><br />
            Win more contracts.
          </h1>
          <p className="text-xl text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed">
            Stop losing RFPs because of missing paperwork. Choose the plan that fits your needs and become procurement-ready in hours &mdash; not weeks.
          </p>
        </div>
      </section>

      {/* 5 Vendor Cards */}
      <section className="py-20 px-6">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Choose Your Plan</h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">Everything you need to become procurement-ready. No hidden fees. No &ldquo;contact sales&rdquo; gatekeeping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

            {/* 1 — Free Profile */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#64748b] self-start mb-4">Always free</span>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Free Profile</h3>
              <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 0</div>
              <p className="text-xs text-[#64748b] mb-5">Claim your presence on Booppa</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Claim your company profile', 'Basic public listing', 'Appear in vendor search', 'GeBIZ opportunity feed', 'Tender Win Probability calculator'].map((f) => (
                  <CheckItem key={f} text={f} />
                ))}
              </ul>
              <Link href="/auth/register" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm">
                Claim Profile
              </Link>
            </div>

            {/* 2 — Vendor Proof */}
            <div className="bg-[#0f172a] p-6 rounded-[2rem] border-2 border-[#10b981] shadow-xl relative hover:-translate-y-1 transition-all flex flex-col">
              <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-4 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Start Here
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] self-start mb-4">Lifetime</span>
              <h3 className="text-lg font-bold text-white mb-2">Vendor Proof</h3>
              <div className="text-3xl font-black text-[#10b981] mb-1">SGD 149</div>
              <p className="text-xs text-white/60 mb-5">One-time payment, no renewal</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Verified badge on public profile', 'Visible in verified-only buyer searches', 'complianceScore baseline (30/100)', 'Embeddable trust badge', 'CAL engine activated at Level 1'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-[#10b981] font-bold flex-shrink-0">&#10003;</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/30 text-sm">
                Get Vendor Proof &mdash; SGD 149
              </Link>
            </div>

            {/* 3 — Vendor Trust Pack */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-[#10b981] shadow-lg hover:-translate-y-1 transition-all flex flex-col">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] self-start mb-4">Bundle &middot; 32% off</span>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Vendor Trust Pack</h3>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-black text-[#0f172a]">SGD 249</span>
                <span className="text-[#94a3b8] line-through text-sm mb-1">SGD 366</span>
              </div>
              <p className="text-xs text-[#10b981] font-semibold mb-5">Save SGD 117</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Vendor Proof (SGD 149)', 'PDPA Snapshot (SGD 79)', '2 Notarizations (SGD 138)', 'Complete trust foundation', 'Blockchain-anchored evidence'].map((f) => (
                  <CheckItem key={f} text={f} />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('vendor_trust_pack')}
                disabled={loadingProduct === 'vendor_trust_pack'}
                className="block w-full text-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loadingProduct === 'vendor_trust_pack' ? 'Redirecting\u2026' : 'Get Trust Pack \u2014 SGD 249'}
              </button>
            </div>

            {/* 4 — RFP Accelerator */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-violet-400 shadow-lg relative hover:-translate-y-1 transition-all flex flex-col">
              <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-violet-500 text-white px-4 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Most Popular
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 self-start mb-4">Bundle &middot; 27% off</span>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">RFP Accelerator</h3>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-black text-[#0f172a]">SGD 449</span>
                <span className="text-[#94a3b8] line-through text-sm mb-1">SGD 615</span>
              </div>
              <p className="text-xs text-violet-500 font-semibold mb-5">Save SGD 166</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Everything in Trust Pack', 'RFP Express (SGD 249)', 'Tender Readiness Score', 'Strategy 6 shortlist alert', 'Blockchain-anchored kit'].map((f) => (
                  <CheckItem key={f} text={f} color="text-violet-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('rfp_accelerator')}
                disabled={loadingProduct === 'rfp_accelerator'}
                className="block w-full text-center bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loadingProduct === 'rfp_accelerator' ? 'Redirecting\u2026' : 'Get RFP Accelerator \u2014 SGD 449'}
              </button>
            </div>

            {/* 5 — Enterprise Bid Kit */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-amber-400 shadow-lg hover:-translate-y-1 transition-all flex flex-col">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 self-start mb-4">Bundle &middot; 31% off</span>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Enterprise Bid Kit</h3>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-black text-[#0f172a]">SGD 899</span>
                <span className="text-[#94a3b8] line-through text-sm mb-1">SGD 1,310</span>
              </div>
              <p className="text-xs text-amber-600 font-semibold mb-5">Save SGD 411</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Vendor Trust Pack included', 'RFP Complete (SGD 599)', '5 extra Notarizations', 'Full procurement dossier', 'For contracts SGD 100k+'].map((f) => (
                  <CheckItem key={f} text={f} color="text-amber-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('enterprise_bid_kit')}
                disabled={loadingProduct === 'enterprise_bid_kit'}
                className="block w-full text-center bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                {loadingProduct === 'enterprise_bid_kit' ? 'Redirecting\u2026' : 'Get Enterprise Bid Kit \u2014 SGD 899'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">Not sure where to start?</h2>
          <p className="text-white/70 text-xl mb-10">Claim your free company profile. No credit card required.</p>
          <Link href="/auth/register" className="inline-block px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xl rounded-2xl transition-colors shadow-lg">
            Claim your Company Profile (Free)
          </Link>
        </div>
      </section>

    </main>
  );
}
