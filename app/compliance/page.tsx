import Link from 'next/link';

export default function CompliancePage() {
  return (
    <main className="bg-white">
      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-black mb-6 text-[#0f172a]">PDPA Compliance Monitoring</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              Operational workflows for continuous PDPA compliance tracking, 
              DSAR handling, and audit evidence generation.
            </p>
          </div>

          <div className="bg-[#f8fafc] p-10 rounded-3xl border-2 border-[#10b981] mb-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">📊 From Point-in-Time Scans to Continuous Monitoring</h3>
            <p className="text-[#64748b] mb-4">
              PDPA Snapshot (SGD 79) gives you a one-time assessment.
              Compliance monitoring plans provide ongoing operational infrastructure.
            </p>
            <p className="text-[#64748b]">
              <strong>Use case:</strong> "We need to track consent changes, handle DSAR requests, 
              and maintain audit trails for PDPC inquiries."
            </p>
          </div>

          {/* Pricing Comparison */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#0f172a]">Choose Your Monitoring Level</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* One-time scan */}
              <div className="bg-white p-10 rounded-3xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">PDPA Snapshot</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 79<span className="text-xl text-[#64748b] font-normal"> one-time</span></div>
                <p className="text-sm text-[#64748b] mb-8">Point-in-time PDPA compliance scan</p>

                <ul className="space-y-4 mb-8">
                  {[
                    '8-dimension PDPA evaluation',
                    'Risk severity report',
                    'Legislation references',
                    'Blockchain-timestamped PDF',
                    'QR verification link',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">
                  <strong>Best for:</strong> One-off compliance checks before an audit or RFP submission
                </p>

                <Link href="/pdpa" className="block text-center px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors w-full">
                  Run PDPA Scan
                </Link>
              </div>

              {/* PDPA Monitor subscription */}
              <div className="bg-white p-10 rounded-3xl border-2 border-[#10b981] shadow-xl relative scale-105 z-10 hover:translate-y-[-5px] hover:shadow-2xl transition-all">
                <div className="absolute top-[-15px] right-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-xl font-bold mb-4 text-[#0f172a]">PDPA Monitor</h3>
                <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 49<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
                <p className="text-sm text-[#64748b] mb-8">Continuous monitoring with quarterly re-scans</p>

                <ul className="space-y-4 mb-8">
                  <li className="font-bold text-[#0f172a] text-sm">Everything in Snapshot, plus:</li>
                  {[
                    'Quarterly automatic PDPA re-scan (SGD 79 value)',
                    'Monthly PDPC regulatory alerts',
                    'Running compliance score chart',
                    'Always-current PDF for buyers',
                    'Annual plan: SGD 490 (2 months free)',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">
                  <strong>Best for:</strong> Companies that need to show continuous compliance to buyers and auditors
                </p>

                <Link href="/pricing" className="block text-center px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors w-full">
                  Subscribe — SGD 49/mo
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-[#e2e8f0] flex flex-col justify-center items-center text-center hover:bg-[#f8fafc] transition-all">
                <h3 className="text-xl font-bold mb-6 text-[#0f172a]">Enterprise</h3>
                <p className="text-[#64748b] mb-6">
                  Full compliance suite for regulated businesses — includes PDPA Monitor, Vendor Proof, and RFP tools.
                  See <Link href="/enterprise" className="text-[#10b981] font-bold hover:underline">Enterprise Solutions</Link>.
                </p>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Enterprise: SGD 299/mo<br />
                  Enterprise Pro: SGD 599/mo
                </p>
              </div>
            </div>
          </div>

          {/* Feature Deep Dive */}
          <div className="bg-white p-8 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#e2e8f0] mb-20">
            <h2 className="text-3xl font-black mb-12 text-[#0f172a]">What's Included: Detailed Breakdown</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {[
                {
                  t: 'Compliance Dashboard',
                  d: 'Real-time view of your compliance health score (0-100), recent scans, active DSAR requests, and consent log activity.',
                  f: ['Compliance health score with trend analysis', 'Recent scan results and issue tracking', 'DSAR queue status and aging', 'Consent activity heatmaps', 'Blockchain notarization history']
                },
                {
                  t: 'DSAR Workflow Management',
                  d: 'Data Subject Access Request handling with 30-day deadline tracking (PDPA Section 21 requirement).',
                  f: ['DSAR intake form (public-facing)', 'Internal workflow assignment', '30-day countdown timer', 'Response template library', 'Completion evidence export (PDF + blockchain timestamp)'],
                  note: 'Basic: 10 DSARs/month | Pro: Unlimited'
                },
                {
                  t: 'Consent Activity Logging',
                  d: 'Track when users give/withdraw consent for marketing, analytics, etc. Supports PDPA Section 13 consent obligation.',
                  f: ['Timestamped consent events', 'Purpose-specific tracking (marketing, analytics, sharing)', 'Withdrawal records', 'Source tracking (web form, email, phone)', 'Exportable consent audit trail']
                },
                {
                  t: 'Monthly Compliance Reports',
                  d: 'Auto-generated monthly summary of compliance activities, suitable for internal audit committees or board reporting.',
                  f: ['Compliance health score trend (last 6 months)', 'DSAR response time metrics', 'New consents vs withdrawals', 'Security incident tracker', 'Blockchain notarization summary', 'PDF export + email delivery']
                },
                {
                  t: 'Privacy Policy Templates',
                  d: 'Singapore-specific privacy policy templates aligned with PDPA requirements.',
                  f: ['Website privacy policy (PDPA-compliant)', 'Mobile app privacy policy', 'Cookie policy', 'DSAR request form template', 'Data breach notification template'],
                  warning: 'Templates are starting points, not legal advice. Have legal counsel review before publication.'
                },
                {
                  t: 'Integrations (Pro Plan)',
                  d: 'Connect compliance workflows to your existing tools.',
                  f: ['Slack: DSAR notifications, alerts', 'Jira: Auto-create tickets', 'MS Teams: Channel notifications', 'Webhooks: Custom endpoints', 'API: RESTful access']
                }
              ].map((item, i) => (
                <div key={i} className="group">
                  <h3 className="text-2xl font-black text-[#10b981] mb-4 group-hover:translate-x-2 transition-transform tracking-tight">{item.t}</h3>
                  <p className="text-[#64748b] mb-6 leading-relaxed">{item.d}</p>
                  <ul className="space-y-3 mb-6">
                    {item.f.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-[#475569]">
                        <span className="text-[#10b981] font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {item.note && <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{item.note}</p>}
                  {item.warning && <p className="p-4 bg-[#fef3c7] rounded-lg text-xs text-[#92400e] border border-[#fde68a]">⚠️ {item.warning}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-[#0f172a] p-12 lg:p-24 rounded-[3rem] text-white mb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981] opacity-5 blur-[120px]"></div>
            <h2 className="text-3xl lg:text-5xl font-black mb-16 relative z-10">How Monitoring Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              {[
                { n: 1, t: 'Initial Setup (Day 1)', d: 'Run baseline PDPA scan, configure DSAR intake form, set up consent tracking snippets for your website.' },
                { n: 2, t: 'Continuous Logging', d: 'System tracks consent changes, DSAR submissions, and compliance activities automatically.' },
                { n: 3, t: 'Monthly Reports', d: 'Auto-generated compliance summary delivered to your inbox, with blockchain-anchored evidence.' },
                { n: 4, t: 'Audit-Ready Evidence', d: 'When PDPC inquiries arrive, export full compliance history with cryptographic timestamps in minutes, not days.' }
              ].map((item) => (
                <div key={item.n} className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg rotate-3">{item.n}</div>
                  <div>
                    <h4 className="text-xl font-bold mb-3">{item.t}</h4>
                    <p className="text-white/70 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#0f172a]">Real-World Use Cases</h2>
            
            <div className="space-y-6">
              {[
                {
                  t: 'FinTech Startup (50 employees)',
                  q: 'We\'re raising Series A. Investors want proof we\'re PDPA-compliant. BOOPPA Pro gives us monthly compliance reports we can share in data room.',
                  r: 'Plan: PDPA Pro (SGD 799/mo) | ROI: Investor confidence + no compliance consultant fees (SGD 5k saved)'
                },
                {
                  t: 'E-commerce Company (150 employees)',
                  q: 'We get 20-30 DSAR requests per month. Manual tracking in spreadsheets was taking 15 hours/month. BOOPPA workflow cut it to 2 hours.',
                  r: 'Plan: PDPA Pro (SGD 799/mo) | ROI: 13 hours/month saved (SGD 1,300+ value at SGD 100/hr)'
                },
                {
                  t: 'SaaS Startup (20 employees)',
                  q: 'Enterprise customers ask "Are you PDPA compliant?" We show them our BOOPPA dashboard. Deal closes faster.',
                  r: 'Plan: PDPA Basic (SGD 299/mo) | ROI: Sales enablement tool (1 deal = 10x annual cost)'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border-l-8 border-[#10b981] shadow-xl hover:translate-x-2 transition-all">
                  <h4 className="text-xl font-bold mb-4 text-[#0f172a]">{item.t}</h4>
                  <p className="text-lg italic text-[#475569] mb-4">"{item.q}"</p>
                  <p className="text-sm font-bold text-[#10b981] uppercase tracking-wider">{item.r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-[#fef2f2] p-12 rounded-[2rem] border-2 border-[#fecaca] mb-20">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#991b1b]">⚖️ What This Service Is (and Isn't)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
              <div>
                <h4 className="font-bold text-[#065f46] mb-4 text-xl tracking-tight">✅ What We Provide</h4>
                <ul className="space-y-3">
                  {['Operational workflow automation', 'Evidence documentation system', 'DSAR handling infrastructure', 'Compliance activity logging'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#065f46] font-medium">
                      <span className="font-bold">✓</span>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-[#991b1b] mb-4 text-xl tracking-tight">❌ What We Don't Provide</h4>
                <ul className="space-y-3">
                  {['Legal advice or representation', 'PDPC certification or approval', 'Guarantee of regulatory compliance', 'Substitute for Data Protection Officer'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#991b1b] font-medium">
                      <span className="font-bold">✕</span>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="bg-white/50 p-6 rounded-xl text-sm text-[#7f1d1d] leading-relaxed border border-[#fee2e2]">
              BOOPPA provides operational tools to support your compliance efforts. 
              Your organization remains responsible for PDPA compliance. 
              For regulatory guidance, consult PDPC Helpline (+65 6377 3131) or qualified legal counsel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[3rem] p-12 lg:p-24 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#10b981] opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">Ready to Automate Your Compliance Operations?</h2>
            <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto font-medium">Start with a one-time PDPA Snapshot or subscribe to PDPA Monitor for continuous coverage.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/pdpa" className="btn btn-primary px-10 py-5 text-xl font-bold">Run PDPA Scan — SGD 79</Link>
              <Link href="/pricing" className="btn btn-secondary bg-white text-[#0f172a] px-10 py-5 text-xl font-bold hover:bg-white/90 border-0 transition-colors">View All Plans</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
