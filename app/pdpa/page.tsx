'use client';

import { useState } from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return url;
  // Strip leading slashes or whitespace
  url = url.replace(/^\/+/, '');
  // If it doesn't start with a protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

export default function PDPAPage() {
  const [isLoading, setIsLoading] = useState(false);
  const apiBase = config.apiUrl;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const website = normalizeUrl(formData.get('website') as string || '');
    const email = (formData.get('email') as string || '').trim();
    const company = (formData.get('company') as string || '').trim();

    if (!website) {
      alert('Please enter a website URL');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create report
      const reportRes = await fetch(`${apiBase}/api/reports/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: 'pdpa_quick_scan',
          company_name: company || 'Quick Scan',
          website,
          assessment_data: { contact_email: email },
          contact_email: email,
        }),
      });

      if (!reportRes.ok) {
        const text = await reportRes.text();
        throw new Error(`Failed to create report: ${text}`);
      }

      const { report_id } = await reportRes.json();

      // 2. Create Stripe checkout session
      const checkoutRes = await fetch(`${apiBase}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'pdpa_quick_scan',
          reportId: report_id,
          customerEmail: email,
        }),
      });

      if (!checkoutRes.ok) {
        const text = await checkoutRes.text();
        throw new Error(`Failed to start checkout: ${text}`);
      }

      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-black mb-6 text-[#0f172a]">PDPA Evidence Scan</h1>
            <p className="text-xl text-[#64748b] max-w-2xl mx-auto leading-relaxed">
              Automated technical assessment of PDPA compliance indicators.
              Not regulatory certification — operational evidence generation.
            </p>
          </div>

          {/* Scan Form */}
          <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-[#e2e8f0] mb-12">
            <h2 className="text-2xl font-bold mb-8 text-[#0f172a]">Run Instant Scan — SGD 79</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="website">
                  Website URL *
                </label>
                <input 
                  type="text" 
                  id="website" 
                  name="website" 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all" 
                  placeholder="booppa.io"
                  required
                />
                <p className="mt-2 text-xs text-[#94a3b8]">
                  We'll scan for PDPA compliance indicators across 8 obligations
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="email">
                  Business Email *
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all" 
                  placeholder="your@company.sg"
                  required
                />
                <p className="mt-2 text-xs text-[#94a3b8]">
                  Report + blockchain verification will be sent here
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="company">
                  Company Name (Optional)
                </label>
                <input 
                  type="text" 
                  id="company" 
                  name="company" 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all" 
                  placeholder="Your Company Pte Ltd"
                />
                <p className="mt-2 text-xs text-[#94a3b8]">
                  For tax invoice purposes
                </p>
              </div>

              <div className="bg-[#f8fafc] p-6 rounded-xl border-l-4 border-[#10b981] mb-8">
                <h4 className="font-bold text-[#0f172a] mb-3">What You'll Receive (15 minutes)</h4>
                <ul className="space-y-2">
                  {[
                    'Technical PDPA risk assessment (8 sections)',
                    'Severity-graded findings (CRITICAL/HIGH/MEDIUM/LOW)',
                    'Specific legislation references (PDPA Sections 11-26)',
                    'Blockchain-anchored timestamp (Polygon mainnet)',
                    'QR verification link (court-admissible proof)',
                    'Downloadable PDF evidence report'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#64748b]">
                      <span className="text-[#10b981] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn btn-primary w-full py-4 text-lg font-black shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Run Scan — Pay SGD 79 (Stripe Checkout)'}
              </button>

              <p className="text-center text-[#94a3b8] text-xs mt-4">
                Secure payment via Stripe. Instant report delivery.
              </p>
              <p className="text-center mt-4">
                <Link href="/pdpa/free-scan" className="text-[#10b981] text-sm font-medium hover:underline">
                  Not ready to pay? Try our free quick check first
                </Link>
              </p>
            </form>
          </div>

          {/* PDPA Monitor subscription upsell */}
          <div className="mb-12 p-8 rounded-3xl border-2 border-blue-200 bg-blue-50 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Subscription alternative</p>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">PDPA Monitor — SGD 49/mo</h3>
              <p className="text-sm text-[#475569] mb-3">
                Instead of a one-off scan, get <strong>quarterly automatic re-scans</strong> (SGD 79 value each),
                monthly PDPC regulatory alerts, and a running compliance score chart —
                all for less than one standalone scan per month.
              </p>
              <ul className="text-sm text-[#475569] space-y-1">
                <li>✓ Quarterly PDPA re-scan included (4× per year = SGD 316 value)</li>
                <li>✓ Monthly plain-language PDPC guideline alerts</li>
                <li>✓ Always-current PDF ready to share with buyers</li>
                <li className="text-blue-600 font-medium">Annual plan: SGD 490/yr — saves SGD 98</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ productType: 'pdpa_monitor_monthly' }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm whitespace-nowrap"
              >
                Subscribe — SGD 49/mo
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ productType: 'pdpa_monitor_annual' }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className="px-6 py-3 border border-blue-400 text-blue-600 hover:bg-blue-100 font-semibold rounded-xl transition text-sm whitespace-nowrap"
              >
                Annual — SGD 490/yr
              </button>
            </div>
          </div>

          {/* What We Check */}
          <div className="bg-[#f8fafc] p-12 rounded-3xl mb-12 border border-[#e2e8f0]">
            <h2 className="text-2xl font-bold mb-10 text-[#0f172a]">What Our Scanner Checks</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { n: 1, t: 'Section 11: Openness Obligation', d: 'Checks for published privacy policy and data protection documentation' },
                { n: 2, t: 'Section 13: Consent Obligation', d: 'Analyzes cookie consent mechanisms and data collection forms' },
                { n: 3, t: 'Section 18: Purpose Limitation', d: 'Verifies purpose notification and NRIC collection practices' },
                { n: 4, t: 'Section 21: Access & Correction Rights', d: 'Looks for DSAR (Data Subject Access Request) procedures' },
                { n: 5, t: 'Section 24: Protection Obligation', d: 'Tests for HTTPS, security headers, encryption indicators' },
                { n: 6, t: 'DPO Requirements', d: 'Searches for Data Protection Officer contact information' },
                { n: 7, t: 'NRIC Advisory Compliance (2018)', d: 'Detects unauthorized NRIC collection (most common violation)' },
                { n: 8, t: 'Do Not Call (DNC) Registry', d: 'Checks for DNC registry references for marketing communications' },
              ].map((item) => (
                <div key={item.n} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white font-bold">{item.n}</div>
                  <div>
                    <h4 className="font-bold text-[#0f172a] mb-1">{item.t}</h4>
                    <p className="text-sm text-[#64748b] leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-white p-8 lg:p-12 rounded-3xl border-2 border-[#dc2626] shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">⚖️ Important Legal Disclaimer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              <div>
                <h4 className="font-bold text-[#059669] mb-4 text-lg">✓ What This Is</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Technical website scanning tool</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Evidence documentation system</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Operational compliance support</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Blockchain timestamping service</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-[#dc2626] mb-4 text-lg">✗ What This Is NOT</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Legal advice or representation</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> PDPC certification or approval</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Guarantee of regulatory compliance</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Substitute for qualified counsel</li>
                </ul>
              </div>
            </div>

            <p className="bg-[#f8fafc] p-6 rounded-xl text-sm text-[#64748b] leading-relaxed">
              Your organization remains responsible for PDPA compliance. This scan provides 
              technical evidence and documentation to support your compliance efforts. 
              For regulatory guidance, consult PDPC Helpline (+65 6377 3131) or legal counsel.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
