'use client';

import { useState } from 'react';

export default function PDPAPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Original logic was redirecting to Stripe
    const formData = new FormData(e.currentTarget);
    const data = {
      website: formData.get('website'),
      email: formData.get('email'),
      company: formData.get('company'),
    };

    console.log('Form submitted:', data);
    
    // For now, mirroring the HTML behavior (alert) but could be integrated with Stripe
    alert('Redirecting to Stripe Checkout...\n\nWebsite: ' + data.website + '\nEmail: ' + data.email);
    setIsLoading(false);
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
            <h2 className="text-2xl font-bold mb-8 text-[#0f172a]">Run Instant Scan — SGD 69</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1e293b] mb-2" htmlFor="website">
                  Website URL *
                </label>
                <input 
                  type="url" 
                  id="website" 
                  name="website" 
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all" 
                  placeholder="https://example.com"
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
                {isLoading ? 'Processing...' : 'Run Scan — Pay SGD 69 (Stripe Checkout)'}
              </button>

              <p className="text-center text-[#94a3b8] text-xs mt-4">
                Secure payment via Stripe. Instant report delivery.
              </p>
            </form>
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
