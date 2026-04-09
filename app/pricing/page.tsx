'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'oneoff' | 'monthly' | 'enterprise'>('oneoff');

  return (
    <main className="bg-white min-h-screen">
      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0f172a]">Transparent Pricing</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              No hidden fees. No "contact sales" gatekeeping. Clear costs for Singapore compliance infrastructure.
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <div className="bg-[#f8fafc] p-1.5 rounded-full border border-[#e2e8f0] flex gap-2">
              {(['oneoff', 'monthly', 'enterprise'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-[#10b981] text-white shadow-lg'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {tab === 'oneoff' ? 'One-Time' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ONE-TIME PRICING */}
          {activeTab === 'oneoff' && (
            <div className="mb-20 space-y-6">

              {/* Step 1 label */}
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#10b981] text-white text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">Start here — Claim & Verify</h3>
              </div>

              {/* Row 1: Free + Vendor Proof side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* FREE */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-3px] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#0f172a]">Free Profile</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#64748b]">Always free</span>
                  </div>
                  <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 0</div>
                  <p className="text-sm text-[#64748b] mb-6">Claim your presence on Booppa</p>
                  <ul className="space-y-3 mb-8">
                    {['Claim your company profile', 'Basic public listing', 'Appear in vendor search', 'GeBIZ opportunity feed'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#64748b]">
                        <span className="text-[#10b981] font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="btn btn-outline w-full">Claim Profile</Link>
                </div>

                {/* VENDOR PROOF — PRIMARY */}
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-[#10b981] shadow-2xl relative hover:translate-y-[-3px] transition-all">
                  <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    Start Here
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Vendor Proof</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">Lifetime</span>
                  </div>
                  <div className="text-4xl font-black text-[#10b981] mb-1">SGD 149</div>
                  <p className="text-sm text-white/60 mb-6">One-time payment, no renewal</p>
                  <ul className="space-y-3 mb-8">
                    {['Verified status badge', 'Procurement filter visibility', 'Compliance score activated', 'Embeddable trust badge', 'CAL engine unlocked', 'Foundation for all products'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                        <span className="text-[#10b981] font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-[#10b981]/30">
                    Get Vendor Proof — SGD 149
                  </Link>
                </div>
              </div>

              {/* Step 2 label */}
              <div className="flex items-center gap-3 pt-4">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#e2e8f0] text-[#64748b] text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">Add compliance tools — mix & match</h3>
              </div>

              {/* Row 2: PDPA + Notarization + RFP Express + RFP Complete */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                <div className="bg-white p-7 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-3px] hover:border-[#10b981] transition-all">
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">PDPA Snapshot</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 79</div>
                  <p className="text-xs text-[#64748b] mb-5">One-time scan</p>
                  <ul className="space-y-2 mb-6">
                    {['8-section PDPA assessment', 'Risk severity report', 'Legislation references', 'Blockchain timestamp', 'Downloadable PDF'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                        <span className="text-[#10b981] font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pdpa" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Start Scan
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-3px] hover:border-[#10b981] transition-all">
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">Notarization</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 69</div>
                  <p className="text-xs text-[#64748b] mb-5">Per document</p>
                  <ul className="space-y-2 mb-3">
                    {['Immutable SHA-256 hash', 'Blockchain timestamp', 'QR verification link', 'Court-admissible proof', 'Polygonscan URL'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                        <span className="text-[#10b981] font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-[#94a3b8] mb-5">Batch: 10 docs SGD 390 · 50 docs SGD 1,750</p>
                  <Link href="/notarization" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    View Packages
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border-2 border-violet-400 shadow-xl relative hover:translate-y-[-3px] transition-all">
                  <div className="absolute top-[-12px] right-5 bg-violet-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">GeBIZ Ready</div>
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">RFP Kit Express</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 249</div>
                  <p className="text-xs text-[#64748b] mb-5">2-page evidence cert</p>
                  <ul className="space-y-2 mb-6">
                    {['5 PDPA Q&A answers', 'AI sector-tailored', 'Blockchain-anchored PDF', 'GeBIZ submission ready', 'Delivered in minutes'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                        <span className="text-violet-500 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/rfp" className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Get RFP Express
                  </Link>
                </div>

                <div className="bg-white p-7 rounded-[2rem] border-2 border-emerald-400 shadow-xl relative hover:translate-y-[-3px] transition-all">
                  <div className="absolute top-[-12px] right-5 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Best Value</div>
                  <h3 className="text-lg font-bold mb-3 text-[#0f172a]">RFP Kit Complete</h3>
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD 599</div>
                  <p className="text-xs text-[#64748b] mb-5">Full 15-question evidence pack</p>
                  <ul className="space-y-2 mb-6">
                    {['15 PDPA Q&A answers', 'Editable DOCX + PDF', 'Deep sector analysis', 'Blockchain evidence', 'Executive summary'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                        <span className="text-emerald-500 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/rfp" className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                    Get RFP Complete
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY PRICING */}
          {activeTab === 'monthly' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">PDPA Basic</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 299<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">Operational compliance monitoring</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Compliance dashboard',
                    '10 DSAR workflows/month',
                    'Consent activity logging',
                    'Monthly compliance reports',
                    'Privacy policy templates',
                    'Email support'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">Best for: SMEs, digital companies</p>
                <Link href="/demo" className="btn btn-primary w-full shadow-lg">Start Trial</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-xl relative scale-105 z-10 hover:translate-y-[-5px] transition-all">
                <div className="absolute top-[-15px] right-10 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">PDPA Pro</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 799<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">Advanced compliance operations</p>
                <ul className="space-y-4 mb-10">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in Basic, plus:</li>
                  {[
                    'Unlimited DSAR workflows',
                    'Advanced reporting & analytics',
                    'Workflow automation',
                    'Internal integrations (Slack, Jira)',
                    'Priority support (4h response)',
                    'Quarterly compliance review calls'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">Best for: Growth-stage companies, regulated entities</p>
                <Link href="/demo" className="btn btn-primary w-full shadow-lg">Book Demo</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Standard Suite</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,299<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">MAS + MTCS ready</p>
                <ul className="space-y-4 mb-10">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in PDPA Pro, plus:</li>
                  {[
                    'MAS operational workflows (TRM, Notice 644)',
                    '5,000 notarizations/month included',
                    'Enterprise dashboard',
                    'Realtime audit trail',
                    'Compliance health score',
                    'Evidence export API'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">Best for: Mid-market enterprises, FinTech</p>
                <Link href="/demo" className="btn btn-outline w-full">Contact Sales</Link>
              </div>
            </div>
          )}

          {/* ENTERPRISE PRICING */}
          {activeTab === 'enterprise' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {/* Enterprise Pro */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Enterprise Pro</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,499<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">Dedicated account management</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Dedicated account manager',
                    'SLA on data freshness (24h refresh)',
                    'Unlimited blockchain notarizations',
                    'Custom API access',
                    'White-label compliance reports',
                    'Priority 2h support response',
                    'Quarterly strategy calls'
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">Best for: Mid-market enterprises, procurement teams</p>
                <Link href="/demo" className="btn btn-outline w-full">Book Demo</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-xl hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Pro Suite</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,999<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">Full evidence infrastructure</p>
                <ul className="space-y-4 mb-10">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in Standard Suite, plus:</li>
                  {[
                    'Unlimited blockchain notarizations',
                    'Custom API access (RESTful + webhooks)',
                    'Dedicated compliance manager',
                    '24/7 priority support',
                    'White-label reports (your branding)',
                    'Monthly compliance strategy calls',
                    'SLA guarantees (99.9% uptime)'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">Best for: Enterprise procurement teams, regulated organizations</p>
                <Link href="/demo" className="btn btn-primary w-full shadow-lg">Book Enterprise Demo</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-6 text-[#0f172a]">Custom Enterprise</h3>
                  <div className="text-3xl font-bold text-[#0f172a] mb-8">Contact Us</div>
                  <ul className="space-y-4 mb-8">
                    {[
                      '100,000+ notarizations/month',
                      'On-premise deployment option',
                      'Custom compliance frameworks',
                      'Multi-subsidiary management',
                      'Dedicated infrastructure',
                      'Custom SLAs',
                      'Regulatory filing assistance',
                      'Compliance team training'
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                        <span className="text-[#10b981] font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/demo" className="btn btn-outline w-full mt-auto">Contact Enterprise Sales</Link>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-[#f8fafc] p-8 lg:p-24 rounded-[4rem] border border-[#e2e8f0]">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 text-center text-[#0f172a]">Pricing FAQ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">
              {[
                { q: 'Is this PDPC-approved certification?', a: 'No. BOOPPA provides technical evidence and documentation tools. This is not regulatory certification or legal advice. We help you generate operational compliance evidence — you remain responsible for actual compliance.' },
                { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans are cancel-anytime with no long-term contracts. Your historical evidence remains accessible for 90 days after cancellation.' },
                { q: 'Do you offer refunds?', a: 'For one-time scans: Yes, if we\'re unable to successfully scan your website due to technical issues (within 7 days). For monthly plans: Pro-rated refunds for first month only.' },
                { q: 'What payment methods do you accept?', a: 'All payments processed via Stripe: Credit/debit cards (Visa, Mastercard, Amex), PayNow for Singapore customers, and invoicing for Enterprise (SGD 1,999+ plans).' },
                { q: 'Is GST included?', a: 'Prices shown exclude GST. 9% GST will be added for Singapore-registered businesses at checkout. International customers: check your local tax requirements.' },
                { q: 'Can I upgrade/downgrade plans?', a: 'Yes. Upgrades take effect immediately (pro-rated billing). Downgrades take effect at next billing cycle. Contact support@booppa.com for plan changes.' }
              ].map((faq, i) => (
                <div key={i}>
                  <h4 className="text-lg font-bold mb-3 text-[#0f172a] tracking-tight">{faq.q}</h4>
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
