'use client';

import Link from 'next/link';

export default function EnterprisePage() {
  return (
    <main className="bg-white">
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="container max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
            Enterprise Compliance Infrastructure
          </div>
          <h1 className="text-4xl lg:text-7xl font-black mb-6 leading-tight">
            Full Compliance Suite<br />
            <span className="text-[#10b981]">MAS + MTCS Ready</span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12">
            Beyond PDPA monitoring — comprehensive compliance infrastructure for 
            regulated organizations, procurement teams, and multi-subsidiary operations.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/demo" className="btn btn-primary px-10 py-5 text-xl font-bold">Book Enterprise Demo</Link>
            <a href="#pricing" className="btn btn-secondary border-white text-white px-10 py-5 text-xl font-bold hover:bg-white hover:text-[#0f172a] transition-all">View Pricing</a>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-[#0f172a]">Enterprise Compliance Suites</h2>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto">
              For organizations that need more than PDPA monitoring — 
              MAS operational workflows, unlimited notarizations, and dedicated support.
            </p>
          </div>

          {/* Enterprise Pricing */}
          <div id="pricing" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
            <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] transition-all">
              <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Standard Compliance Suite</h3>
              <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,299<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
              <p className="text-sm text-[#64748b] mb-8">MAS + MTCS operational workflows</p>
              
              <ul className="space-y-4 mb-10">
                <li className="font-bold text-[#0f172a] text-sm">Everything in PDPA Pro (SGD 799), plus:</li>
                {[
                  'MAS Technology Risk Management (TRM) workflows',
                  'Cyber Hygiene monitoring (MAS Notice 644)',
                  'Third-party risk tracking (MAS Notice 655)',
                  '5,000 blockchain notarizations/month included',
                  'Enterprise dashboard (real-time)',
                  'Compliance health scoring (0-100)',
                  'Audit trail export (PDF + CSV)',
                  'Evidence archive (12 months retention)',
                  'API access (RESTful + webhooks)',
                  'Priority support (4h SLA)'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                    <span className="text-[#10b981] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/demo" className="btn btn-primary w-full shadow-lg">Book Standard Suite Demo</Link>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl relative scale-105 z-10 hover:translate-y-[-5px] transition-all">
              <div className="absolute top-[-15px] right-10 bg-gradient-to-r from-[#0f172a] to-[#1e40af] text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Pro Suite</div>
              <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Pro Compliance Suite</h3>
              <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,999<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
              <p className="text-sm text-[#64748b] mb-8">Full enterprise evidence infrastructure</p>
              
              <ul className="space-y-4 mb-10">
                <li className="font-bold text-[#0f172a] text-sm">Everything in Standard Suite, plus:</li>
                {[
                  'Unlimited blockchain notarizations',
                  'Custom API endpoints & rate limits',
                  'Dedicated compliance manager (monthly calls)',
                  '24/7 priority support (2h SLA)',
                  'White-label reports (your company branding)',
                  'Multi-subsidiary management',
                  'Custom compliance frameworks',
                  'SSO integration (SAML/OAuth)',
                  'On-premise deployment option',
                  'Quarterly compliance strategy sessions',
                  'Regulatory filing assistance'
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                    <span className="text-[#10b981] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/demo" className="btn btn-primary w-full shadow-lg">Book Pro Suite Demo</Link>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col justify-between hover:translate-y-[-5px] transition-all">
              <div>
                <h3 className="text-xl font-bold mb-6 text-[#0f172a]">Custom Enterprise</h3>
                <div className="text-3xl font-bold text-[#0f172a] mb-8">Contact Us</div>
                <ul className="space-y-4 mb-8">
                  {[
                    '100,000+ notarizations/month',
                    'On-premise infrastructure',
                    'Air-gapped deployment',
                    'Custom SLAs (e.g., 99.99% uptime)',
                    'Dedicated account team',
                    'Custom integration development',
                    'Compliance team training',
                    'Government agency pricing'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/demo" className="btn btn-outline w-full">Contact Enterprise Sales</Link>
            </div>
          </div>

          {/* MAS Workflows */}
          <div className="bg-white p-8 lg:p-20 rounded-[3rem] shadow-2xl border border-[#e2e8f0] mb-24">
            <h2 className="text-3xl lg:text-4xl font-black mb-4 text-[#0f172a]">MAS Operational Workflows</h2>
            <p className="text-[#64748b] mb-12 text-lg">For financial institutions regulated by Monetary Authority of Singapore (MAS).</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  t: 'MAS Notice 626 — TRM',
                  d: 'Operational workflows to support Technology Risk Management requirements.',
                  f: ['Technology risk assessment logging', 'System availability tracking', 'Change management evidence', 'Vendor outsourcing documentation', 'Incident response workflows']
                },
                {
                  t: 'MAS Notice 644 — Cyber Hygiene',
                  d: 'Documentation infrastructure for mandatory cybersecurity controls.',
                  f: ['Access control monitoring logs', 'Security patch management', 'Vulnerability assessment tracking', 'Security awareness training', 'Privileged account activity logs']
                },
                {
                  t: 'MAS Notice 655 — Third Party Risk',
                  d: 'Vendor risk assessment and monitoring workflows.',
                  f: ['Vendor onboarding documentation', 'Outsourcing arrangement registers', 'Material service provider tracking', 'Vendor security assessments', 'Contract review evidence']
                }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-[#f8fafc] rounded-3xl border-l-[6px] border-[#10b981] shadow-sm">
                  <h4 className="text-xl font-bold mb-4 text-[#0f172a]">{item.t}</h4>
                  <p className="text-sm text-[#64748b] mb-6 leading-relaxed">{item.d}</p>
                  <ul className="space-y-3">
                    {item.f.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-[#475569] font-medium">
                        <span className="text-[#10b981] font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-[#fffbeb] p-8 rounded-2xl border-l-4 border-[#f59e0b]">
              <h4 className="font-bold text-[#b45309] mb-3 flex items-center gap-2">⚖️ Important Regulatory Note</h4>
              <p className="text-sm text-[#b45309] leading-relaxed">
                These workflows provide <strong>operational evidence generation tools</strong> to support your MAS compliance efforts. They do NOT constitute MAS approval, regulatory certification, or guarantee of compliance. Consult MAS guidance and qualified legal/compliance advisors for regulatory matters.
              </p>
            </div>
          </div>

          {/* Enterprise Features */}
          <div className="mb-24">
            <h2 className="text-3xl lg:text-5xl font-black mb-16 text-center text-[#0f172a]">Enterprise-Exclusive Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'SSO Integration', d: 'Single Sign-On via SAML 2.0 or OAuth 2.0. Integrate with Azure AD, Okta, Google Workspace, or custom identity providers.' },
                { t: 'Multi-Subsidiary Management', d: 'Separate dashboards for each subsidiary with consolidated group-level reporting. Perfect for holding companies.' },
                { t: 'White-Label Reports', d: 'Add your company logo, colors, and branding to all compliance reports and certificates.' },
                { t: 'Custom API Endpoints', d: 'We build custom API endpoints for your specific workflows. Higher rate limits and dedicated infrastructure.' },
                { t: 'Dedicated Manager', d: 'Monthly compliance strategy calls with your customer success manager. Quarterly roadmap reviews.' },
                { t: 'On-Premise Deployment', d: 'Deploy BOOPPA infrastructure within your own AWS/Azure environment for air-gapped compliance.' }
              ].map((item, i) => (
                <div key={i} className="bg-[#f8fafc] p-10 rounded-[2rem] border border-[#e2e8f0] hover:bg-white hover:shadow-xl transition-all group">
                  <h3 className="text-xl font-bold mb-4 text-[#10b981] group-hover:translate-x-1 transition-transform">{item.t}</h3>
                  <p className="text-[#64748b] leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Study */}
          <div className="bg-white p-12 lg:p-24 rounded-[4rem] shadow-2xl border border-[#e2e8f0] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-[80px]"></div>
            
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-[#10b981]/10 text-[#059669] rounded-full text-xs font-black uppercase tracking-widest mb-6">Case Study</span>
              <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] leading-tight">How RegTech Co Reduced Audit Prep<br />from 3 Weeks to 2 Days</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
              <div>
                <h4 className="text-xl font-black text-[#0f172a] mb-4">The Challenge</h4>
                <p className="text-[#64748b] leading-relaxed">
                  150-person FinTech company facing first MAS audit. No centralized compliance evidence system. Documentation scattered across Slack, email, and shared drives.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-black text-[#0f172a] mb-4">The Solution</h4>
                <p className="text-[#64748b] leading-relaxed mb-6">Implemented BOOPPA Pro Suite with:</p>
                <ul className="space-y-3">
                  {['Automated PDPA + MAS evidence collection', '3,000+ historical documents notarized', 'Slack integration for real-time alerts', 'White-labeled reports for audit committee'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#475569] font-medium">
                      <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span> {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { v: '93%', l: 'Reduction in Audit Prep Time' },
                { v: 'SGD 45k', l: 'Consultant Fees Saved' },
                { v: '100%', l: 'MAS Audit Pass Rate' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#0f172a] p-10 rounded-3xl text-center shadow-lg">
                  <div className="text-4xl font-black text-[#10b981] mb-2">{stat.v}</div>
                  <div className="text-white/60 text-sm font-medium">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[3rem] p-12 lg:p-24 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#10b981] opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-6xl font-black mb-8 leading-tight">Ready to Scale Your Compliance Infrastructure?</h2>
            <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto font-medium">Book a personalized demo to see how BOOPPA Enterprise fits your organization.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/demo" className="btn btn-primary px-12 py-6 text-2xl font-black shadow-2xl shadow-[#10b981]/20">Book Enterprise Demo</Link>
              <Link href="/support" className="btn btn-secondary border-white text-white px-12 py-6 text-xl font-bold hover:bg-white hover:text-[#0f172a] transition-all">Contact Sales Team</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
