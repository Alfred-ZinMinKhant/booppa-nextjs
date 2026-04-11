'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'oneoff' | 'bundles' | 'subscriptions' | 'enterprise';

function CheckItem({ text, color = 'text-[#10b981]' }: { text: string; color?: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-[#64748b]">
      <span className={`${color} font-bold flex-shrink-0`}>✓</span>{text}
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

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('oneoff');
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  async function handleCheckout(productType: string) {
    setLoadingProduct(productType);
    await startCheckout(productType);
    setLoadingProduct(null);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'oneoff',        label: 'One-Time' },
    { id: 'bundles',       label: 'Bundles' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'enterprise',    label: 'Enterprise' },
  ];

  return (
    <main className="bg-white min-h-screen">
      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">

          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0f172a]">Transparent Pricing</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              No hidden fees. No "contact sales" gatekeeping. Clear costs for Singapore B2B procurement trust infrastructure.
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex justify-center mb-16">
            <div className="bg-[#f8fafc] p-1.5 rounded-full border border-[#e2e8f0] flex gap-1 flex-wrap justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#10b981] text-white shadow-lg'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── ONE-TIME ─────────────────────────────────────────────────── */}
          {activeTab === 'oneoff' && (
            <div className="space-y-8">
              {/* Free + Vendor Proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#0f172a]">Free Profile</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#64748b]">Always free</span>
                  </div>
                  <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 0</div>
                  <p className="text-sm text-[#64748b] mb-6">Claim your presence on Booppa</p>
                  <ul className="space-y-2 mb-8">
                    {['Claim your company profile', 'Basic public listing', 'Appear in vendor search', 'GeBIZ opportunity feed', 'Tender Win Probability calculator'].map((f) => (
                      <CheckItem key={f} text={f} />
                    ))}
                  </ul>
                  <Link href="/auth/register" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm">
                    Claim Profile
                  </Link>
                </div>

                <div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-[#10b981] shadow-2xl relative hover:-translate-y-1 transition-all">
                  <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    Start Here
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Vendor Proof</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">Lifetime</span>
                  </div>
                  <div className="text-4xl font-black text-[#10b981] mb-1">SGD 149</div>
                  <p className="text-sm text-white/60 mb-6">One-time payment, no renewal</p>
                  <ul className="space-y-2 mb-8">
                    {['Verified badge on public profile', 'Visible in verified-only buyer searches', 'complianceScore baseline (30/100)', 'Embeddable trust badge', 'CAL engine activated at Level 1', 'Reachable by Strategy 6 shortlist alerts'].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-[#10b981] font-bold flex-shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-[#10b981]/30">
                    Get Vendor Proof — SGD 149
                  </Link>
                </div>
              </div>

              {/* PDPA + Notarization + RFP row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-7 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 hover:border-[#10b981] transition-all">
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">PDPA Snapshot</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 79</div>
                  <p className="text-xs text-[#64748b] mb-5">One-time scan</p>
                  <ul className="space-y-2 mb-6">
                    {['8-dimension PDPA evaluation', 'Risk severity report', 'Legislation references', 'Blockchain timestamp', 'Downloadable PDF', '+8 to +25 pts to complianceScore'].map((f) => (
                      <CheckItem key={f} text={f} />
                    ))}
                  </ul>
                  <Link href="/pdpa" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Start Scan
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 hover:border-[#10b981] transition-all">
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">Notarization</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 69</div>
                  <p className="text-xs text-[#64748b] mb-5">Per document</p>
                  <ul className="space-y-2 mb-3">
                    {['SHA-256 cryptographic hash', 'Blockchain timestamp anchor', 'QR verification link', 'Progression toward DEEP/CERTIFIED', 'Polygonscan URL'].map((f) => (
                      <CheckItem key={f} text={f} />
                    ))}
                  </ul>
                  <p className="text-xs text-[#94a3b8] mb-5">Batch: 10 docs SGD 390 · 50 docs SGD 1,750</p>
                  <Link href="/notarization" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    View Packages
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border-2 border-violet-400 shadow-xl relative hover:-translate-y-1 transition-all">
                  <div className="absolute top-[-12px] right-5 bg-violet-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">GeBIZ Ready</div>
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">RFP Express</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 249</div>
                  <p className="text-xs text-[#64748b] mb-5">Per RFP, delivered in minutes</p>
                  <ul className="space-y-2 mb-6">
                    {['Tender Readiness Score (0–100)', 'Structured evidence checklist PDF', 'Strategy 6 fires — sector shortlist alert', 'Blockchain-anchored', 'AutoActivation counter +1'].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#64748b]">
                        <span className="text-violet-500 font-bold flex-shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/rfp" className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Get RFP Express
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border-2 border-emerald-400 shadow-xl relative hover:-translate-y-1 transition-all">
                  <div className="absolute top-[-12px] right-5 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">High-Value Bids</div>
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">RFP Complete</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 599</div>
                  <p className="text-xs text-[#64748b] mb-5">Per RFP, full procurement dossier</p>
                  <ul className="space-y-2 mb-6">
                    {['Full procurement dossier', 'Enterprise-tier visibility', 'Multi-sector matching', 'COMPLETE evidence package tier', 'AutoActivation counter +1'].map((f) => (
                      <CheckItem key={f} text={f} color="text-emerald-500" />
                    ))}
                  </ul>
                  <Link href="/rfp" className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Get RFP Complete
                  </Link>
                </div>
              </div>

              {/* Tender Win Probability */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Free Tool</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a]">Tender Win Probability Calculator</h3>
                  <p className="text-sm text-[#64748b] mt-1">Enter a GeBIZ tender number. See your current win probability vs what you'd achieve with RFP Express or RFP Complete.</p>
                </div>
                <Link href="/tender-check" className="flex-shrink-0 px-5 py-2.5 bg-[#0f172a] text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] transition">
                  Try Free Calculator →
                </Link>
              </div>
            </div>
          )}

          {/* ── BUNDLES ──────────────────────────────────────────────────── */}
          {activeTab === 'bundles' && (
            <div className="space-y-6">
              <p className="text-center text-[#64748b] max-w-2xl mx-auto">
                Bundles collapse multiple purchase decisions into one. Every bundle is a one-time payment. All components activate immediately on payment confirmation.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Vendor Trust Pack */}
                <div className="bg-white rounded-[2rem] border-2 border-[#10b981] shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
                  <div className="bg-[#10b981] px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Bundle · 32% off</p>
                    <h3 className="text-2xl font-black text-white">Vendor Trust Pack</h3>
                    <p className="text-white/80 text-sm mt-1">Complete trust foundation in one purchase</p>
                  </div>
                  <div className="p-7">
                    <div className="flex items-end gap-3 mb-1">
                      <span className="text-4xl font-black text-[#0f172a]">SGD 249</span>
                      <span className="text-[#94a3b8] line-through text-lg mb-1">SGD 366</span>
                    </div>
                    <p className="text-sm text-[#10b981] font-semibold mb-6">Save SGD 117</p>

                    <div className="space-y-3 mb-6">
                      <div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ Vendor Proof <span className="text-[#94a3b8] font-normal">(SGD 149)</span></p>
                        <p className="text-xs text-[#64748b]">VerifyRecord ACTIVE, verified badge, procurement filter</p>
                      </div>
                      <div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ PDPA Snapshot <span className="text-[#94a3b8] font-normal">(SGD 79)</span></p>
                        <p className="text-xs text-[#64748b]">8-dimension scan, PDF report, +8–25 pts compliance</p>
                      </div>
                      <div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ 2 Notarizations <span className="text-[#94a3b8] font-normal">(SGD 138)</span></p>
                        <p className="text-xs text-[#64748b]">2 documents certified, begins DEEP progression</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] mb-5">
                      Same price as standalone RFP Express — get the full verification foundation instead.
                    </p>

                    <button
                      onClick={() => handleCheckout('vendor_trust_pack')}
                      disabled={loadingProduct === 'vendor_trust_pack'}
                      className="block w-full text-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/20"
                    >
                      {loadingProduct === 'vendor_trust_pack' ? 'Redirecting…' : 'Get Trust Pack — SGD 249'}
                    </button>
                  </div>
                </div>

                {/* RFP Accelerator */}
                <div className="bg-[#0f172a] rounded-[2rem] border-2 border-violet-400 shadow-2xl overflow-hidden hover:-translate-y-1 transition-all relative">
                  <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-violet-500 text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    Most Popular
                  </div>
                  <div className="bg-violet-600 px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Bundle · 27% off</p>
                    <h3 className="text-2xl font-black text-white">RFP Accelerator</h3>
                    <p className="text-white/80 text-sm mt-1">For vendors with an active tender right now</p>
                  </div>
                  <div className="p-7">
                    <div className="flex items-end gap-3 mb-1">
                      <span className="text-4xl font-black text-white">SGD 449</span>
                      <span className="text-white/40 line-through text-lg mb-1">SGD 615</span>
                    </div>
                    <p className="text-sm text-violet-400 font-semibold mb-6">Save SGD 166</p>

                    <div className="space-y-3 mb-6">
                      <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-white">✓ Vendor Trust Pack <span className="text-white/40 font-normal">(SGD 366)</span></p>
                        <p className="text-xs text-white/50">VP + PDPA + 2 Notarizations</p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-white">✓ RFP Express <span className="text-white/40 font-normal">(SGD 249)</span></p>
                        <p className="text-xs text-white/50">Tender Readiness PDF + Strategy 6 fires</p>
                      </div>
                    </div>

                    <p className="text-xs text-white/40 mb-5">
                      For vendors who arrive on Booppa with an active tender already in mind — the highest-intent segment.
                    </p>

                    <button
                      onClick={() => handleCheckout('rfp_accelerator')}
                      disabled={loadingProduct === 'rfp_accelerator'}
                      className="block w-full text-center bg-violet-500 hover:bg-violet-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                    >
                      {loadingProduct === 'rfp_accelerator' ? 'Redirecting…' : 'Get RFP Accelerator — SGD 449'}
                    </button>
                  </div>
                </div>

                {/* Enterprise Bid Kit */}
                <div className="bg-white rounded-[2rem] border-2 border-amber-400 shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
                  <div className="bg-amber-500 px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Bundle · 31% off</p>
                    <h3 className="text-2xl font-black text-white">Enterprise Bid Kit</h3>
                    <p className="text-white/90 text-sm mt-1">For contracts of SGD 100,000 or more</p>
                  </div>
                  <div className="p-7">
                    <div className="flex items-end gap-3 mb-1">
                      <span className="text-4xl font-black text-[#0f172a]">SGD 899</span>
                      <span className="text-[#94a3b8] line-through text-lg mb-1">SGD 1,310</span>
                    </div>
                    <p className="text-sm text-amber-600 font-semibold mb-6">Save SGD 411</p>

                    <div className="space-y-3 mb-6">
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ Vendor Trust Pack <span className="text-[#94a3b8] font-normal">(SGD 366)</span></p>
                        <p className="text-xs text-[#64748b]">VP + PDPA + 2 Notarizations</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ RFP Complete <span className="text-[#94a3b8] font-normal">(SGD 599)</span></p>
                        <p className="text-xs text-[#64748b]">Full procurement dossier, enterprise visibility</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                        <p className="text-sm font-semibold text-[#0f172a]">✓ 5 Notarizations <span className="text-[#94a3b8] font-normal">(SGD 345)</span></p>
                        <p className="text-xs text-[#64748b]">7 total docs — pushes toward DEEP/CERTIFIED</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] mb-5">
                      0.18% of a SGD 500k contract. Combined with Tender Win Probability showing 19% → 67% uplift, the decision is immediate.
                    </p>

                    <button
                      onClick={() => handleCheckout('enterprise_bid_kit')}
                      disabled={loadingProduct === 'enterprise_bid_kit'}
                      className="block w-full text-center bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                    >
                      {loadingProduct === 'enterprise_bid_kit' ? 'Redirecting…' : 'Get Enterprise Bid Kit — SGD 899'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Savings table */}
              <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0]">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <tr>
                      {['Bundle', 'Includes', 'Separate Value', 'Bundle Price', 'Saving'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold text-[#0f172a] text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {[
                      { name: 'Vendor Trust Pack', includes: 'VP + PDPA + 2 Notarizations', separate: 'SGD 366', bundle: 'SGD 249', saving: 'SGD 117 (32%)' },
                      { name: 'RFP Accelerator',   includes: 'Trust Pack + RFP Express',    separate: 'SGD 615', bundle: 'SGD 449', saving: 'SGD 166 (27%)' },
                      { name: 'Enterprise Bid Kit', includes: 'Trust Pack + RFP Complete + 5 Notarizations', separate: 'SGD 1,310', bundle: 'SGD 899', saving: 'SGD 411 (31%)' },
                    ].map((row) => (
                      <tr key={row.name} className="hover:bg-[#f8fafc]">
                        <td className="px-5 py-4 font-semibold text-[#0f172a]">{row.name}</td>
                        <td className="px-5 py-4 text-[#64748b]">{row.includes}</td>
                        <td className="px-5 py-4 text-[#94a3b8] line-through">{row.separate}</td>
                        <td className="px-5 py-4 font-bold text-[#0f172a]">{row.bundle}</td>
                        <td className="px-5 py-4 text-[#10b981] font-semibold">{row.saving}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ─────────────────────────────────────────────── */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <p className="text-center text-[#64748b] max-w-2xl mx-auto">
                Subscriptions provide continuous monthly value — not just access to a static badge. Each delivers something new every month.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Vendor Active */}
                <div className="bg-white rounded-[2rem] border-2 border-[#10b981] shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
                  <div className="px-8 py-6 border-b border-[#e2e8f0]">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-[#0f172a]">Vendor Active</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">For Vendors</span>
                    </div>
                    <div className="flex items-end gap-4">
                      <div>
                        <span className="text-4xl font-black text-[#0f172a]">SGD 39</span>
                        <span className="text-[#64748b]">/mo</span>
                      </div>
                      <div className="text-sm text-[#64748b]">or SGD 390/yr <span className="text-[#10b981] font-semibold">(2 months free)</span></div>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-sm font-semibold text-[#0f172a] mb-4">What you receive every month:</p>
                    <ul className="space-y-3 mb-8">
                      {[
                        'Profile health check — auto re-evaluation of complianceScore',
                        'Competitor alert when a sector peer improves verificationDepth',
                        'Shortlist priority — ordered ahead of equivalent STANDARD vendors in Strategy 1 and Strategy 6',
                        'Monthly metrics — search appearances, sector views, movement vs prior month',
                      ].map((f) => <CheckItem key={f} text={f} />)}
                    </ul>
                    <p className="text-xs text-[#94a3b8] mb-6">
                      Vendor Proof (SGD 149) is the entry credential. Vendor Active is the ongoing monitoring layer. Both can coexist.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleCheckout('vendor_active_monthly')}
                        disabled={loadingProduct === 'vendor_active_monthly'}
                        className="block w-full text-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                      >
                        {loadingProduct === 'vendor_active_monthly' ? 'Redirecting…' : 'Start Monthly — SGD 39/mo'}
                      </button>
                      <button
                        onClick={() => handleCheckout('vendor_active_annual')}
                        disabled={loadingProduct === 'vendor_active_annual'}
                        className="block w-full text-center border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5 disabled:opacity-60 font-semibold py-3 rounded-xl transition text-sm"
                      >
                        {loadingProduct === 'vendor_active_annual' ? 'Redirecting…' : 'Annual — SGD 390/yr (save SGD 78)'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDPA Monitor */}
                <div className="bg-white rounded-[2rem] border-2 border-blue-400 shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
                  <div className="px-8 py-6 border-b border-[#e2e8f0]">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-[#0f172a]">PDPA Monitor</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">Compliance</span>
                    </div>
                    <div className="flex items-end gap-4">
                      <div>
                        <span className="text-4xl font-black text-[#0f172a]">SGD 49</span>
                        <span className="text-[#64748b]">/mo</span>
                      </div>
                      <div className="text-sm text-[#64748b]">or SGD 490/yr <span className="text-blue-500 font-semibold">(2 months free)</span></div>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-sm font-semibold text-[#0f172a] mb-4">What you receive every month:</p>
                    <ul className="space-y-3 mb-8">
                      {[
                        'Quarterly automatic re-scan — full PDPA Snapshot every 3 months (SGD 79 value each)',
                        'Monthly regulatory alert — plain-language summary of new PDPC guidelines relevant to your sector',
                        'Score trending — running chart of complianceScore over time on your dashboard',
                        'Current PDF report available for download and sharing with buyers at any time',
                      ].map((f) => <CheckItem key={f} text={f} color="text-blue-500" />)}
                    </ul>
                    <p className="text-xs text-[#94a3b8] mb-6">
                      Quarterly re-scans: SGD 237/yr underlying value. Annual plan: SGD 490. For vendors in healthcare, fintech, HR tech, or professional services.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleCheckout('pdpa_monitor_monthly')}
                        disabled={loadingProduct === 'pdpa_monitor_monthly'}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                      >
                        {loadingProduct === 'pdpa_monitor_monthly' ? 'Redirecting…' : 'Start Monthly — SGD 49/mo'}
                      </button>
                      <button
                        onClick={() => handleCheckout('pdpa_monitor_annual')}
                        disabled={loadingProduct === 'pdpa_monitor_annual'}
                        className="block w-full text-center border border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-60 font-semibold py-3 rounded-xl transition text-sm"
                      >
                        {loadingProduct === 'pdpa_monitor_annual' ? 'Redirecting…' : 'Annual — SGD 490/yr (save SGD 98)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription value table */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6">
                <h3 className="font-semibold text-[#0f172a] mb-4">Annual plan comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {['', 'Monthly', 'Annual', 'Annual/mo', 'Annual saving'].map((h) => (
                          <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-[#64748b]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {[
                        { name: 'Vendor Active', monthly: 'SGD 39', annual: 'SGD 390', permo: 'SGD 32.50', saving: 'SGD 78 (17%)' },
                        { name: 'PDPA Monitor',  monthly: 'SGD 49', annual: 'SGD 490', permo: 'SGD 40.83', saving: 'SGD 98 (17%)' },
                      ].map((r) => (
                        <tr key={r.name}>
                          <td className="py-3 px-3 font-medium text-[#0f172a]">{r.name}</td>
                          <td className="py-3 px-3 text-[#64748b]">{r.monthly}</td>
                          <td className="py-3 px-3 font-semibold text-[#0f172a]">{r.annual}</td>
                          <td className="py-3 px-3 text-[#64748b]">{r.permo}</td>
                          <td className="py-3 px-3 text-[#10b981] font-semibold">{r.saving}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ENTERPRISE ───────────────────────────────────────────────── */}
          {activeTab === 'enterprise' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Enterprise</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 499<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">For procurement teams evaluating vendors</p>
                <ul className="space-y-3 mb-10">
                  {[
                    'Full procurement analytics dashboard',
                    'Vendor comparison engine — weighted composite scoring',
                    'Configurable procurement ordering presets',
                    'Vendor risk signals and compliance posture',
                    'Self-service billing portal',
                    'Access to /api/procurement/* routes',
                  ].map((f) => <CheckItem key={f} text={f} />)}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">For institutional procurement teams, GLCs, statutory boards</p>
                <Link href="/demo" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm">
                  Book Demo
                </Link>
              </div>

              <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl hover:-translate-y-1 transition-all relative">
                <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  Recommended
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Enterprise Pro</h3>
                <div className="text-4xl font-bold text-[#10b981] mb-2">SGD 1,499<span className="text-xl text-white/60 font-normal">/mo</span></div>
                <p className="text-sm text-white/60 mb-8">Dedicated account + SLA + multi-sector</p>
                <ul className="space-y-3 mb-10">
                  <li className="text-sm font-semibold text-white">Everything in Enterprise, plus:</li>
                  {[
                    'Dedicated account manager with monthly review call',
                    'SLA on data freshness and report turnaround',
                    'Multi-sector procurement views simultaneously',
                    'Advanced reporting — exportable datasets, custom filters',
                    'Historical trend analysis',
                    'Priority support response',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-[#10b981] font-bold flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-white/10 text-xs text-white/40 mb-8">For MNCs and government-linked companies with structured supplier management obligations</p>
                <Link href="/demo" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/30">
                  Book Enterprise Pro Demo
                </Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-6 text-[#0f172a]">Custom Enterprise</h3>
                  <div className="text-3xl font-bold text-[#0f172a] mb-8">Contact Us</div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'On-premise deployment option',
                      'Custom compliance frameworks',
                      'Multi-subsidiary management',
                      'Dedicated infrastructure',
                      'Custom SLAs',
                      'Compliance team training',
                      'Regulatory filing assistance',
                    ].map((f) => <CheckItem key={f} text={f} />)}
                  </ul>
                </div>
                <Link href="/demo" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto">
                  Contact Enterprise Sales
                </Link>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="mt-20 bg-[#f8fafc] p-8 lg:p-16 rounded-[3rem] border border-[#e2e8f0]">
            <h2 className="text-3xl font-black mb-12 text-center text-[#0f172a]">Pricing FAQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-5xl mx-auto">
              {[
                { q: 'Is this PDPC-approved certification?', a: 'No. BOOPPA provides technical evidence and documentation tools. This is not regulatory certification or legal advice. We help you generate operational compliance evidence — you remain responsible for actual compliance.' },
                { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans are cancel-anytime with no long-term contracts. Your historical evidence and certificates remain accessible for 90 days after cancellation.' },
                { q: 'Do bundles require Vendor Proof first?', a: 'No — all three bundles include Vendor Proof as a component. One purchase activates everything simultaneously.' },
                { q: 'What payment methods do you accept?', a: 'All payments via Stripe: Visa, Mastercard, Amex. PayNow available for Singapore customers. Invoicing available for Enterprise plans.' },
                { q: 'Is GST included?', a: 'Prices shown exclude GST. 9% GST will be added for Singapore-registered businesses at checkout.' },
                { q: 'When does Strategy 6 fire?', a: 'Strategy 6 fires automatically when RFP Express is purchased (standalone or as part of the RFP Accelerator bundle). It does not fire for RFP Complete — that is a vendor-side credibility tool, not a lead generation mechanism.' },
              ].map((faq) => (
                <div key={faq.q}>
                  <h4 className="text-base font-bold mb-2 text-[#0f172a]">{faq.q}</h4>
                  <p className="text-[#64748b] text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
