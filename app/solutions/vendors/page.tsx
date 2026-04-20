'use client';

import { useState } from 'react';
import Link from 'next/link';

function CheckItem({ text, color = 'text-[#10b981]' }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-[#64748b]">
      <span className={`${color} font-bold mt-0.5 flex-shrink-0`}>✓</span>
      <span>{text}</span>
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
    <main className="bg-[#f8fafc] min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981]/50 rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[#10b981]/10">
            For Vendors &amp; SMEs
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Verify your company.<br />
            <span className="text-[#10b981]">Prove your compliance.</span><br />
            Win more contracts.
          </h1>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Stop losing RFPs because of missing paperwork. Become procurement-ready in hours — not weeks.
          </p>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: '30,000+', label: 'Vendors listed' },
              { value: '1,000+', label: 'Live tenders' },
              { value: 'SGD 0', label: 'To get started' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-black text-[#10b981]">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free plan banner */}
      <section className="py-10 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#64748b] mr-3">Always free</span>
            <span className="text-lg font-bold text-[#0f172a]">Free Profile</span>
            <span className="ml-3 text-[#64748b] text-sm">— Claim your company profile, appear in vendor search, access the GeBIZ opportunity feed &amp; Tender Win Probability calculator.</span>
          </div>
          <Link href="/auth/register" className="shrink-0 px-6 py-3 border-2 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-bold rounded-xl transition text-sm whitespace-nowrap">
            Claim Free Profile →
          </Link>
        </div>
      </section>

      {/* Paid Plans */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Choose Your Plan</h2>
            <p className="text-[#64748b] max-w-lg mx-auto">Everything you need to become procurement-ready. No hidden fees. No &ldquo;contact sales&rdquo; gatekeeping.</p>
          </div>

          {/* Top row: Vendor Proof + Vendor Trust Pack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Vendor Proof */}
            <div className="bg-[#0f172a] p-8 rounded-3xl border-2 border-[#10b981] shadow-xl relative flex flex-col">
              <div className="absolute top-[-13px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Start Here
              </div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">Lifetime · one-time</span>
                  <h3 className="text-2xl font-black text-white mt-3">Vendor Proof</h3>
                  <p className="text-white/50 text-sm mt-1">Your verified badge on Booppa</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#10b981]">149</div>
                  <div className="text-white/50 text-xs">SGD · no renewal</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['Verified badge on your public profile', 'Appear in verified-only buyer searches', 'Compliance score baseline (30/100)', 'Embeddable trust badge for your website', 'CAL engine activated at Level 1'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <span className="text-[#10b981] font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-[#10b981]/20">
                Get Vendor Proof — SGD 149
              </Link>
            </div>

            {/* Vendor Trust Pack */}
            <div className="bg-white p-8 rounded-3xl border-2 border-[#10b981] shadow-lg flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">Bundle · 32% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">Vendor Trust Pack</h3>
                  <p className="text-[#64748b] text-sm mt-1">Complete compliance foundation</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#0f172a]">249</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 366</div>
                  <div className="text-[#10b981] text-xs font-bold">Save SGD 117</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['Vendor Proof (SGD 149)', 'PDPA Snapshot (SGD 79)', '2 Notarizations (SGD 138)', 'Complete trust foundation', 'Blockchain-anchored evidence'].map((f) => (
                  <CheckItem key={f} text={f} />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('vendor_trust_pack')}
                disabled={loadingProduct === 'vendor_trust_pack'}
                className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'vendor_trust_pack' ? 'Redirecting…' : 'Get Trust Pack — SGD 249'}
              </button>
            </div>
          </div>

          {/* Bottom row: RFP Accelerator + Enterprise Bid Kit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* RFP Accelerator */}
            <div className="bg-white p-8 rounded-3xl border-2 border-violet-400 shadow-lg relative flex flex-col">
              <div className="absolute top-[-13px] left-8 bg-violet-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">Bundle · 27% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">RFP Accelerator</h3>
                  <p className="text-[#64748b] text-sm mt-1">Win government tenders faster</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#0f172a]">449</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 615</div>
                  <div className="text-violet-500 text-xs font-bold">Save SGD 166</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['Everything in Vendor Trust Pack', 'RFP Express (SGD 249)', 'Tender Readiness Score', 'Strategy 6 shortlist alert', 'Blockchain-anchored bid kit'].map((f) => (
                  <CheckItem key={f} text={f} color="text-violet-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('rfp_accelerator')}
                disabled={loadingProduct === 'rfp_accelerator'}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'rfp_accelerator' ? 'Redirecting…' : 'Get RFP Accelerator — SGD 449'}
              </button>
            </div>

            {/* Enterprise Bid Kit */}
            <div className="bg-white p-8 rounded-3xl border-2 border-amber-400 shadow-lg flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Bundle · 31% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">Enterprise Bid Kit</h3>
                  <p className="text-[#64748b] text-sm mt-1">For contracts SGD 100k+</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#0f172a]">899</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 1,310</div>
                  <div className="text-amber-600 text-xs font-bold">Save SGD 411</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {['Vendor Trust Pack included', 'RFP Complete (SGD 599)', '5 extra Notarizations', 'Full procurement dossier', 'Priority support & review'].map((f) => (
                  <CheckItem key={f} text={f} color="text-amber-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('enterprise_bid_kit')}
                disabled={loadingProduct === 'enterprise_bid_kit'}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'enterprise_bid_kit' ? 'Redirecting…' : 'Get Enterprise Bid Kit — SGD 899'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">Not sure where to start?</h2>
          <p className="text-white/60 text-lg mb-10">Claim your free company profile. No credit card required.</p>
          <Link href="/auth/register" className="inline-block px-10 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-[#10b981]/20">
            Claim your Company Profile (Free) →
          </Link>
        </div>
      </section>

    </main>
  );
}
