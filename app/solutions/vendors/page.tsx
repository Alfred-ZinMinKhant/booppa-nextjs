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

const JOURNEY_STEPS = [
  { n: '1', label: 'Get Verified',       color: '#10b981', bg: '#f0fdf4' },
  { n: '2', label: 'Build Credibility',  color: '#3b82f6', bg: '#eff6ff' },
  { n: '3', label: 'Win Tenders',        color: '#7c3aed', bg: '#f5f3ff' },
  { n: '4', label: 'Go Enterprise',      color: '#d97706', bg: '#fffbeb' },
];

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k+';
  return n.toLocaleString();
}

export default function SolutionsVendorsPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasClaimedProfile, setHasClaimedProfile] = useState(false);
  const [stats, setStats] = useState({ vendorsIndexed: 0, verifiedEntities: 0, openTenders: 0 });
  const [loggedIn, setLoggedIn] = useState(false);
  const [billingTab, setBillingTab] = useState<'one-time' | 'subscription'>('one-time');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setLoggedIn(true);
        if (data.is_verified) setIsVerified(true);
        if (data.has_claimed_profile) setHasClaimedProfile(true);
      })
      .catch(() => {});

    fetch('/api/platform-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  async function handleCheckout(productType: string) {
    if (!loggedIn) {
        window.location.href = "/login?from=/solutions/vendors";
        return;
    }
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
          <h1 className="text-4xl lg:text-6xl font-black  text-white mb-6 leading-tight">
            Verify your company.<br />
            <span className="text-[#10b981]">Prove your compliance.</span><br />
            Win more contracts.
          </h1>
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Stop losing RFPs because of missing paperwork. Become procurement-ready in hours — not weeks.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: stats.vendorsIndexed ? formatNumber(stats.vendorsIndexed) : '...', label: 'Singapore vendors indexed' },
              { value: stats.verifiedEntities ? formatNumber(stats.verifiedEntities) : '...', label: 'Booppa-verified entities' },
              { value: stats.openTenders ? formatNumber(stats.openTenders) : '...', label: 'GeBIZ tenders tracked live' },
              { value: 'S$0', label: 'Cost to government agencies' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-black text-[#10b981]">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Profile Ribbon */}
      <section className="py-8 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center text-xl">🛡️</div>
            <div>
              <h3 className="text-lg font-bold text-[#0f172a]">Free Company Profile</h3>
              <p className="text-sm text-[#64748b]">Claim your presence, appear in searches, and track opportunities at no cost.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full">Always Free</span>
            <Link href={loggedIn ? "/vendor/dashboard" : "/auth/register"} className="px-6 py-3 bg-[#0f172a] text-white font-bold rounded-xl hover:bg-[#1e293b] transition shadow-lg text-sm whitespace-nowrap">
                {loggedIn ? "Go to Dashboard" : "Claim Profile"} →
            </Link>
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Your Path to Procurement-Ready</h2>
            <p className="text-[#64748b] max-w-lg mx-auto">Each plan is a step in your journey. Start small — upgrade as you grow.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-6 py-5 mb-16">
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

          {/* Billing-type toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setBillingTab('one-time')}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billingTab === 'one-time' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setBillingTab('subscription')}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billingTab === 'subscription' ? 'bg-[#10b981] text-white shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                Subscription
              </button>
            </div>
          </div>

          {/* One-Time Packages */}
          {billingTab === 'one-time' && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-black">1</div>
              <h2 className="text-2xl font-black text-[#0f172a]">One-Time Packages</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Vendor Proof */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">RFP Complete</h3>
                <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 599</div>
                <p className="text-xs text-[#64748b] mb-6">Per RFP · Compliance &amp; security answers</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Full compliance dossier (15 Q&A)", "PDF + editable DOCX deliverable", "Generated in under 2 minutes", "Answers verified against ACRA, PDPC, SSL, GeBIZ"].map(f => <CheckItem key={f} text={f} color="text-[#10b981]" />)}
                </ul>
                <button 
                  disabled={loadingProduct === "rfp_complete"}
                  onClick={() => handleCheckout("rfp_complete")} 
                  className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
                >
                  {loadingProduct === "rfp_complete" ? "Redirecting..." : "Generate Compliance Pack →"}
                </button>
              </div>

              {/* Compliance Bundle */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-500 shadow-xl relative flex flex-col">
                <div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Best Value</div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">Compliance Bundle</h3>
                <div className="text-4xl font-black text-blue-600 mb-1">SGD 799</div>
                <p className="text-xs text-[#64748b] mb-6">One-time bundle · <span className="text-blue-600 font-bold">Save over SGD 300</span></p>
                <p className="text-sm text-[#475569] mb-6 leading-relaxed">The ultimate foundation for winning large-scale enterprise and government contracts — a full PDPA governance set grounded in a live scan of your site.</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["7-document PDPA Governance Pack (DPMP, ROPA, Data Inventory, Vendor/DPA Register, Breach Runbook, Training, Security Review Log)", "PDPA Scan (Full)", "RFP Complete Kit", "Blockchain Cover Sheet", "Full Evidence Archive"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
                </ul>
                <button 
                  disabled={loadingProduct === "compliance_evidence_pack"}
                  onClick={() => handleCheckout("compliance_evidence_pack")} 
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loadingProduct === "compliance_evidence_pack" ? "Redirecting..." : "Get Bundle →"}
                </button>
              </div>

              {/* PDPA Snapshot */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">PDPA Snapshot</h3>
                <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 299</div>
                <p className="text-xs text-[#64748b] mb-6">One-time scan · Full risk report</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["11-dimension PDPA scan", "Risk severity breakdown", "PDPC enforcement precedents per finding", "Remediation guide", "Audit-ready PDF report"].map(f => <CheckItem key={f} text={f} color="text-blue-500" />)}
                </ul>
                <button 
                  disabled={loadingProduct === "pdpa_quick_scan"}
                  onClick={() => handleCheckout("pdpa_quick_scan")} 
                  className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
                >
                  {loadingProduct === "pdpa_quick_scan" ? "Redirecting..." : "Run Scan →"}
                </button>
              </div>

              {/* Vendor Proof */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">Vendor Proof</h3>
                <div className="text-4xl font-black text-[#10b981] mb-1">SGD 149</div>
                <p className="text-xs text-[#64748b] mb-6">One-time payment · Lifetime verified badge</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Verified badge on profile", "Appear in verified searches", "Trust scores activation", "Embeddable trust badge"].map(f => <CheckItem key={f} text={f} />)}
                </ul>
                <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition shadow-lg">
                  Get Verified →
                </Link>
              </div>
            </div>
          </div>
          )}

          {/* Subscriptions */}
          {billingTab === 'subscription' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-black">2</div>
              <h2 className="text-2xl font-black text-[#0f172a]">Ongoing Subscriptions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Vendor Active */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">Vendor Active</h3>
                <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 39<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                <p className="text-xs text-[#64748b] mb-6">Your monthly procurement intelligence layer</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Monthly intelligence report — emailed branded PDF", "Personalized tender matches (BID / WATCH / PASS)", "Sector benchmark + Trust-score trend", "Priority placement & Active badge", "Unlimited win-probability checks"].map(f => <CheckItem key={f} text={f} />)}
                </ul>
                <button
                  disabled={loadingProduct === "vendor_active_monthly"}
                  onClick={() => handleCheckout("vendor_active_monthly")}
                  className="w-full border-2 border-blue-500 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-500 hover:text-white transition disabled:opacity-50"
                >
                  {loadingProduct === "vendor_active_monthly" ? "Redirecting..." : "Subscribe"}
                </button>
              </div>

              {/* Vendor Pro — bridge tier */}
              <div className="bg-white p-8 rounded-[2rem] border-2 border-violet-500 shadow-md relative flex flex-col">
                <div className="absolute top-[-14px] left-8 bg-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New</div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">Vendor Pro</h3>
                <div className="text-4xl font-black text-violet-600 mb-1">SGD 99<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                <p className="text-xs text-[#64748b] mb-6">Full procurement intelligence for growing vendors</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Vendor Active",
                    "Consolidated monthly Intelligence Report (PDF)",
                    "Win-probability tender pipeline",
                    "Sector competitor intelligence",
                    "Quarterly PDPA Snapshot with drift tracking",
                    "1 notarization/month (SGD 69 value)",
                    "Priority email support",
                  ].map(f => <CheckItem key={f} text={f} color="text-violet-600" />)}
                </ul>
                <button
                  type="button"
                  disabled={loadingProduct === "vendor_pro_monthly"}
                  onClick={() => handleCheckout("vendor_pro_monthly")}
                  className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {loadingProduct === "vendor_pro_monthly" ? "Redirecting..." : "Subscribe (SGD 99/mo)"}
                </button>
                <button
                  type="button"
                  disabled={loadingProduct === "vendor_pro_annual"}
                  onClick={() => handleCheckout("vendor_pro_annual")}
                  className="w-full mt-2 border border-violet-500 text-violet-600 font-semibold py-2 rounded-xl hover:bg-violet-50 transition disabled:opacity-50 text-sm"
                >
                  {loadingProduct === "vendor_pro_annual" ? "Redirecting..." : "Annual SGD 1,099 · save 2 mo"}
                </button>
              </div>

              {/* PDPA Monitor */}
              <div className="bg-white p-8 rounded-[2rem] border-2 border-blue-500 shadow-md relative flex flex-col">
                <div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Recommended</div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">PDPA Monitor</h3>
                <div className="text-4xl font-black text-blue-600 mb-1">SGD 299<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                <p className="text-xs text-[#64748b] mb-6">Automated data protection compliance</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Monthly automated scans", "Continuous risk monitoring", "Drift alerts & notifications", "Updated audit logs"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
                </ul>
                <button
                  type="button"
                  disabled={loadingProduct === "pdpa_monitor_monthly"}
                  onClick={() => handleCheckout("pdpa_monitor_monthly")}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loadingProduct === "pdpa_monitor_monthly" ? "Redirecting..." : "Start Monitoring"}
                </button>
              </div>

              {/* Compliance Evidence */}
              <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">Compliance Evidence</h3>
                <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 499<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                <p className="text-xs text-[#64748b] mb-6">Automated evidence & bid readiness</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["All-in-one PDF/Docs evidence", "PDPA + RFP data coverage", "Blockchain-anchored cover sheets", "Priority procurement support"].map(f => <CheckItem key={f} text={f} color="text-violet-500" />)}
                </ul>
                <button
                  type="button"
                  disabled={loadingProduct === "compliance_evidence_monthly"}
                  onClick={() => handleCheckout("compliance_evidence_monthly")}
                  className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
                >
                  {loadingProduct === "compliance_evidence_monthly" ? "Redirecting..." : "Select Plan"}
                </button>
              </div>
            </div>

            {/* Tender Intelligence — vendor-side GeBIZ analytics. Wide tile
                below the standard subscription grid because the feature list
                is longer and the value-prop is distinct (analytics, not
                evidence generation). */}
            <div className="mt-6">
              <div className="bg-white p-8 rounded-[2rem] border-2 border-violet-500 shadow-md relative flex flex-col lg:flex-row gap-8 items-start">
                <div className="absolute top-[-14px] left-8 bg-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0f172a] mb-1">Tender Intelligence</h3>
                  <div className="flex items-baseline gap-3 mb-1">
                    <div className="text-4xl font-black text-violet-600">SGD 149<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                    <div className="text-sm text-[#64748b]">or SGD 1,499/yr · save SGD 289</div>
                  </div>
                  <p className="text-xs text-[#64748b] mb-6">Win the right bids — GeBIZ tender analytics in one subscription</p>
                  <ul className="space-y-3 mb-2">
                    {[
                      "Monthly sector trend reports (win-rate by agency × sector × contract size)",
                      "Historical award lookup — winners, prices, dates",
                      "AI bid / watch / pass timing per live tender",
                      "Per-supplier benchmarking dashboard",
                      "Monthly digest email with PDF report",
                    ].map(f => <CheckItem key={f} text={f} color="text-violet-600" />)}
                  </ul>
                </div>
                <div className="w-full lg:w-72 flex flex-col gap-3 lg:pt-2">
                  <button
                    type="button"
                    disabled={loadingProduct === "tender_intelligence_monthly"}
                    onClick={() => handleCheckout("tender_intelligence_monthly")}
                    className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
                  >
                    {loadingProduct === "tender_intelligence_monthly" ? "Redirecting..." : "Subscribe monthly"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingProduct === "tender_intelligence_annual"}
                    onClick={() => handleCheckout("tender_intelligence_annual")}
                    className="w-full border-2 border-violet-500 text-violet-600 hover:bg-violet-50 font-bold py-3.5 rounded-xl transition disabled:opacity-50"
                  >
                    {loadingProduct === "tender_intelligence_annual" ? "Redirecting..." : "Annual · save 2 mo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">Ready to win more contracts?</h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">Start with a free profile and upgrade as you grow. No credit card required to claim your presence.</p>
          <Link href="/auth/register" className="inline-block px-10 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black text-lg rounded-2xl transition shadow-lg shadow-[#10b981]/20">
            Claim Free Profile →
          </Link>
        </div>
      </section>

    </main>
  );
}
