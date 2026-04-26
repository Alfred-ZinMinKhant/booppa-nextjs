'use client';

import { useState, useEffect } from 'react';
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

const WIZARD_QS = [
  {
    q: 'Are you currently bidding on a government tender?',
    options: ['Yes, I have an active tender', "Not yet — I'm building my profile"],
  },
  {
    q: 'Do you already have compliance documentation?',
    options: ['Yes, I have ISO / PDPA docs', "No, I'm starting from scratch"],
  },
  {
    q: 'What is your main goal right now?',
    options: ['Get verified & visible to buyers', 'Build trust & credibility', 'Win a specific tender', 'Scale to enterprise'],
  },
];

function getRecommendation(answers: (number | null)[]) {
  const [a1, a2, a3] = answers;
  if (a3 === 3) return { plan: 'Enterprise Bid Kit', step: 'Step 4', stepNum: '4', price: 'SGD 899', cta: 'Go Enterprise →', href: '#enterprise-bid-kit', desc: 'Full submission pack — built for contracts over SGD 100k.', color: '#d97706' };
  if (a1 === 0 && a3 === 2) return { plan: 'RFP Accelerator', step: 'Step 3', stepNum: '3', price: 'SGD 449', cta: 'Win More Tenders →', href: '#rfp-accelerator', desc: 'Trust Pack + RFP Express bundled — 27% off. The fastest path from new vendor to winning bid.', color: '#7c3aed' };
  if (a1 === 0) return { plan: 'RFP Accelerator', step: 'Step 3', stepNum: '3', price: 'SGD 449', cta: 'Win This Tender →', href: '#rfp-accelerator', desc: 'Trust foundation + Tender Readiness PDF + Strategy 6 alert, in one bundle.', color: '#7c3aed' };
  if (a2 === 1) return { plan: 'Vendor Trust Pack', step: 'Step 2', stepNum: '2', price: 'SGD 249', cta: 'Build Trust →', href: '#vendor-trust-pack', desc: 'Vendor Proof + PDPA Scan + 2 Notarizations — your complete credibility foundation.', color: '#10b981' };
  return { plan: 'Vendor Proof', step: 'Step 1', stepNum: '1', price: 'SGD 149', cta: 'Get Verified →', href: '#vendor-proof', desc: 'Get your verified badge and appear in buyer-only searches immediately.', color: '#10b981' };
}

const JOURNEY_STEPS = [
  { n: '1', label: 'Get Verified',       color: '#10b981', bg: '#f0fdf4' },
  { n: '2', label: 'Build Credibility',  color: '#3b82f6', bg: '#eff6ff' },
  { n: '3', label: 'Win Tenders',        color: '#7c3aed', bg: '#f5f3ff' },
  { n: '4', label: 'Go Enterprise',      color: '#d97706', bg: '#fffbeb' },
];

export default function SolutionsVendorsPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasClaimedProfile, setHasClaimedProfile] = useState(false);

  // Wizard state
  const [wizardOpen, setWizardOpen]   = useState(false);
  const [wizardStep, setWizardStep]   = useState(0);
  const [wAnswers,   setWAnswers]     = useState<(number | null)[]>([null, null, null]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.is_verified) setIsVerified(true);
        if (data.has_claimed_profile) setHasClaimedProfile(true);
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(productType: string) {
    setLoadingProduct(productType);
    await startCheckout(productType);
    setLoadingProduct(null);
  }

  function handleWizardAnswer(qi: number, ai: number) {
    const next = [...wAnswers];
    next[qi] = ai;
    setWAnswers(next);
    setWizardStep(qi + 1);
  }

  function resetWizard() {
    setWAnswers([null, null, null]);
    setWizardStep(0);
  }

  return (
    <main className="bg-[#f8fafc] min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981]/50 rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[#10b981]/10">
            For Vendors &amp; SMEs
          </div>
          <h1 className="text-4xl lg:text-6xl font-black  text-white mb-6 leading-tight">
            Verify your company.<br />
            <span className="text-[#10b981]">Prove your compliance.</span><br />
            Win more contracts.
          </h1>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Stop losing RFPs because of missing paperwork. Become procurement-ready in hours — not weeks.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: '30,000+', label: 'Vendors listed' },
              { value: '1,000+',  label: 'Live tenders' },
              { value: 'SGD 0',   label: 'To get started' },
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
      {!hasClaimedProfile && (
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
      )}

      {/* Plans */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Your Path to Procurement-Ready</h2>
            <p className="text-[#64748b] max-w-lg mx-auto">Each plan is a step in your journey. Start small — upgrade as you grow.</p>
          </div>

          {/* Journey path */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-6 py-5 mb-8">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {JOURNEY_STEPS.map((s, i, arr) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: s.color + '40', background: s.bg }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: s.color }}>{s.n}</div>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <span className="text-[#cbd5e1] font-bold text-sm">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Find My Plan wizard */}
          <div className="bg-white rounded-2xl border-2 border-[#e2e8f0] overflow-hidden mb-8">
            <button
              type="button"
              onClick={() => setWizardOpen(o => !o)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f8fafc] transition-colors"
            >
              <div>
                <p className="text-xs font-black text-[#10b981] uppercase tracking-widest mb-0.5">Find My Plan</p>
                <p className="text-base font-bold text-[#0f172a]">Not sure where to start? Answer 3 quick questions →</p>
              </div>
              <span className="text-[#94a3b8] text-xl font-light ml-4">{wizardOpen ? '−' : '+'}</span>
            </button>

            {wizardOpen && (
              <div className="px-6 pb-6 border-t border-[#e2e8f0]">
                {wizardStep < 3 && (
                  <div className="pt-5">
                    <div className="flex gap-1 mb-4">
                      {(['q1', 'q2', 'q3'] as const).map((id, i) => (
                        <div key={id} className={`h-1 flex-1 rounded-full transition-colors ${i <= wizardStep ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Question {wizardStep + 1} of 3</p>
                    <p className="text-lg font-bold text-[#0f172a] mb-4">{WIZARD_QS[wizardStep].q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {WIZARD_QS[wizardStep].options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleWizardAnswer(wizardStep, WIZARD_QS[wizardStep].options.indexOf(opt))}
                          className="text-left px-4 py-3 rounded-xl border-2 border-[#e2e8f0] hover:border-[#10b981] hover:bg-[#f0fdf4] text-sm font-semibold text-[#0f172a] transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {wizardStep === 3 && (() => {
                  const rec = getRecommendation(wAnswers);
                  return (
                    <div className="pt-5">
                      <p className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-3">Your Recommended Plan</p>
                      <div className="rounded-xl border-2 p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderColor: rec.color + '50', background: rec.color + '08' }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ background: rec.color }}>{rec.step}</span>
                            <span className="text-lg font-black text-[#0f172a]">{rec.plan}</span>
                            <span className="text-base font-bold" style={{ color: rec.color }}>{rec.price}</span>
                          </div>
                          <p className="text-sm text-[#64748b]">{rec.desc}</p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <a href={rec.href} className="px-5 py-2.5 rounded-xl text-white text-sm font-bold text-center transition hover:opacity-90" style={{ background: rec.color }}>
                            {rec.cta}
                          </a>
                          <button type="button" onClick={resetWizard} className="text-xs text-[#94a3b8] hover:text-[#64748b] text-center">
                            ← Start over
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Step 1: Get Verified */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-black flex-shrink-0">1</div>
              <div>
                <p className="text-xs font-black text-[#10b981] uppercase tracking-widest">Step 1 · Get Verified</p>
                <p className="text-sm font-bold text-[#0f172a]">Establish your verified presence on Booppa</p>
              </div>
            </div>
          </div>

          {/* Row 1: Vendor Proof + Vendor Trust Pack */}
          <div id="vendor-proof" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Vendor Proof */}
            <div className="bg-[#0f172a] p-8 rounded-3xl border-2 border-[#10b981] shadow-xl relative flex flex-col">
              <div className="absolute top-[-13px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Start Here
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">Step 1 · Lifetime</span>
                  <h3 className="text-2xl font-black text-white mt-3">Vendor Proof</h3>
                  <p className="text-white/50 text-sm mt-1">Best for: New vendors establishing their first verified presence</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-4xl font-black text-[#10b981]">149</div>
                  <div className="text-white/50 text-xs">SGD · no renewal</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 mt-4">
                {[
                  'Verified badge on your public profile',
                  'Appear in verified-only buyer searches',
                  'Compliance score baseline (30/100)',
                  'Embeddable trust badge for your website',
                  'CAL engine activated at Level 1',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                    <span className="text-[#10b981] font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isVerified ? (
                <Link href="/vendor/dashboard" className="block w-full text-center bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] font-bold py-3.5 rounded-xl transition">
                  Verified — Go to Dashboard
                </Link>
              ) : (
                <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-[#10b981]/20">
                  Get Verified →
                </Link>
              )}
            </div>

            {/* Vendor Trust Pack */}
            <div id="vendor-trust-pack" className="bg-white p-8 rounded-3xl border-2 border-[#10b981] shadow-lg flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">Step 1+2 · Bundle · 32% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">Vendor Trust Pack</h3>
                  <p className="text-[#64748b] text-sm mt-1">Best for: Vendors starting from scratch who want a verified, documented foundation in one purchase</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-4xl font-black text-[#0f172a]">249</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 366</div>
                  <div className="text-[#10b981] text-xs font-bold">Save SGD 117</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 mt-4">
                {[
                  'Vendor Proof (SGD 149) — verified badge',
                  'PDPA Snapshot (SGD 79) — 8-dim compliance scan',
                  '2 Notarizations (SGD 138) — blockchain-anchored docs',
                  'Complete trust foundation in one payment',
                  'Begins DEEP verification progression',
                ].map((f) => (
                  <CheckItem key={f} text={f} />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('vendor_trust_pack')}
                disabled={loadingProduct === 'vendor_trust_pack'}
                className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'vendor_trust_pack' ? 'Redirecting…' : 'Build Trust →'}
              </button>
            </div>
          </div>

          {/* Connector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e2e8f0]" />
            <p className="text-xs font-bold text-[#94a3b8] whitespace-nowrap">Bidding on a tender? Activate your winning edge ↓</p>
            <div className="flex-1 h-px bg-[#e2e8f0]" />
          </div>

          {/* Step 3+4 header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-black flex-shrink-0">3</div>
              <div>
                <p className="text-xs font-black text-[#7c3aed] uppercase tracking-widest">Step 3 · Win Tenders</p>
                <p className="text-sm font-bold text-[#0f172a]">Target active GeBIZ opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#d97706] flex items-center justify-center text-white text-xs font-black flex-shrink-0">4</div>
              <div>
                <p className="text-xs font-black text-[#d97706] uppercase tracking-widest">Step 4 · Go Enterprise</p>
                <p className="text-sm font-bold text-[#0f172a]">Scale to high-value contracts</p>
              </div>
            </div>
          </div>

          {/* Row 2: RFP Accelerator + Enterprise Bid Kit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* RFP Accelerator */}
            <div id="rfp-accelerator" className="bg-white p-8 rounded-3xl border-2 border-violet-400 shadow-lg relative flex flex-col">
              <div className="absolute top-[-13px] left-8 bg-violet-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600">Step 1→3 · Bundle · 27% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">RFP Accelerator</h3>
                  <p className="text-[#64748b] text-sm mt-1">Best for: Vendors with an active GeBIZ tender who want verification + a winning bid in one</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-4xl font-black text-[#0f172a]">449</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 615</div>
                  <div className="text-violet-500 text-xs font-bold">Save SGD 166</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 mt-4">
                {[
                  'Everything in Vendor Trust Pack',
                  'RFP Express (SGD 249) — Tender Readiness PDF',
                  'Tender Readiness Score (0–100)',
                  'Strategy 6 shortlist alert fires',
                  'Blockchain-anchored bid kit',
                ].map((f) => (
                  <CheckItem key={f} text={f} color="text-violet-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('rfp_accelerator')}
                disabled={loadingProduct === 'rfp_accelerator'}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'rfp_accelerator' ? 'Redirecting…' : 'Win More Tenders →'}
              </button>
            </div>

            {/* Enterprise Bid Kit */}
            <div id="enterprise-bid-kit" className="bg-white p-8 rounded-3xl border-2 border-amber-400 shadow-lg flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Step 1→4 · Bundle · 31% off</span>
                  <h3 className="text-2xl font-black text-[#0f172a] mt-3">Enterprise Bid Kit</h3>
                  <p className="text-[#64748b] text-sm mt-1">Best for: Enterprise vendors targeting high-value contracts of SGD 100k+</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-4xl font-black text-[#0f172a]">899</div>
                  <div className="text-[#94a3b8] line-through text-xs">SGD 1,310</div>
                  <div className="text-amber-600 text-xs font-bold">Save SGD 411</div>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 mt-4">
                {[
                  'Vendor Trust Pack included (Steps 1+2)',
                  'RFP Complete (SGD 599) — full dossier',
                  '5 extra Notarizations — toward CERTIFIED',
                  'Enterprise-tier visibility & multi-sector',
                  'Priority support & review',
                ].map((f) => (
                  <CheckItem key={f} text={f} color="text-amber-500" />
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('enterprise_bid_kit')}
                disabled={loadingProduct === 'enterprise_bid_kit'}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition"
              >
                {loadingProduct === 'enterprise_bid_kit' ? 'Redirecting…' : 'Go Enterprise →'}
              </button>
            </div>
          </div>

          {/* Progression note */}
          <p className="text-center text-xs text-[#94a3b8] mt-6">
            Start small → upgrade as you grow. Every plan builds on the previous one.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          {hasClaimedProfile ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">You're all set</h2>
              <p className="text-white/60 text-lg mb-10">Manage your vendor profile and explore opportunities from your dashboard.</p>
              <Link href="/vendor/dashboard" className="inline-block px-10 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-[#10b981]/20">
                Go to Dashboard →
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Start with a free profile. Upgrade when you're ready.</h2>
              <p className="text-white/60 text-lg mb-10">No credit card required. Every step is self-serve and instant.</p>
              <Link href="/auth/register" className="inline-block px-10 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-[#10b981]/20">
                Claim your Company Profile (Free) →
              </Link>
            </>
          )}
        </div>
      </section>

    </main>
  );
}
