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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">PDPA Snapshot</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 69</div>
                <p className="text-sm text-[#64748b] mb-8">One-time technical scan</p>
                <ul className="space-y-4 mb-10">
                  {[
                    '8-section PDPA assessment',
                    'Risk severity report',
                    'Specific legislation references',
                    'Blockchain-anchored timestamp',
                    'QR verification link',
                    'Downloadable PDF evidence'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pdpa" className="btn btn-primary w-full shadow-lg">Start Scan</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Vendor Proof</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 69</div>
                <p className="text-sm text-[#64748b] mb-8">Reusable procurement evidence</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Complete PDPA evidence scan',
                    'Blockchain notarization',
                    'QR verification portal',
                    'Polygonscan proof URL',
                    'Valid for 12 months',
                    'Reusable for RFPs'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/vendor" className="btn btn-primary w-full shadow-lg">Create Proof</Link>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Document Notarization</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 69</div>
                <p className="text-sm text-[#64748b] mb-8">Single document</p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Immutable SHA-256 hash',
                    'Blockchain timestamp',
                    'QR verification link',
                    'Court-admissible proof',
                    'Polygonscan URL'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8 leading-relaxed">
                  Batch pricing: 10 docs (SGD 390) | 50 docs (SGD 1,750)
                </p>
                <Link href="/notarization" className="btn btn-outline w-full">View Packages</Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
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
