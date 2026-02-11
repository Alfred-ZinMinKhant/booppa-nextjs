'use client';

import Link from 'next/link';

export default function VendorProofPage() {
  const checkout = () => {
    alert('Redirecting to Stripe Checkout for SGD 69 payment...\n\nIn production, this would be:\nwindow.location.href = "https://buy.stripe.com/YOUR_PAYMENT_LINK";');
  };

  return (
    <main className="bg-white">
      <section className="py-24 px-6">
        <div className="container max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-black mb-6 text-[#0f172a]">Vendor Proof Infrastructure</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              Reusable procurement evidence with blockchain verification.
              Generate once, share with multiple procurement teams.
            </p>
          </div>

          <div className="bg-[#f8fafc] p-10 rounded-3xl border-2 border-[#10b981] mb-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 text-[#0f172a]">🏢 The Procurement Problem</h3>
            <p className="text-[#64748b] mb-6">
              Every enterprise procurement team asks the same questions:
            </p>
            <ul className="space-y-4 mb-6">
              {[
                '"Does this vendor have PDPA compliance documentation?"',
                '"Can you prove your security practices?"',
                '"Where\'s your ISO 27001 / SOC 2 / MTCS certification?"',
                '"How do we verify this document is authentic?"'
              ].map((q, i) => (
                <li key={i} className="flex items-start gap-3 text-[#475569] font-medium italic">
                  <span className="text-[#10b981] font-bold">"</span>
                  {q.slice(1, -1)}
                  <span className="text-[#10b981] font-bold">"</span>
                </li>
              ))}
            </ul>
            <p className="pt-6 border-t border-[#e2e8f0] text-[#64748b]">
              Answering these questions manually takes <strong>40+ hours per month</strong> for most vendors.
            </p>
          </div>

          <div className="bg-white p-8 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#e2e8f0] mb-20">
            <h2 className="text-3xl font-black mb-12 text-[#0f172a]">How Vendor Proof Works</h2>
            
            <div className="space-y-12">
              {[
                { n: 1, t: 'Run PDPA Evidence Scan', d: 'We scan your website and generate a comprehensive PDPA compliance report covering all 8 obligations. Same technical assessment as our SGD 69 snapshot.' },
                { n: 2, t: 'Blockchain Anchoring', d: 'Report hash is timestamped on Polygon mainnet. Creates immutable proof that this evidence existed at this specific date and time.' },
                { n: 3, t: 'QR Verification Portal', d: 'Get a unique QR code that links to public verification page. Anyone can scan and verify authenticity via Polygonscan.' },
                { n: 4, t: 'Share with Procurement Teams', d: 'Include the QR code in RFP responses, vendor questionnaires, or security assessments. Reusable for 12 months or until next scan.' }
              ].map((item) => (
                <div key={item.n} className="flex gap-8">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">{item.n}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 text-[#0f172a]">{item.t}</h3>
                    <p className="text-[#64748b] leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 lg:p-16 rounded-[2.5rem] shadow-2xl border border-[#e2e8f0] mb-20 text-center">
            <h2 className="text-3xl font-black mb-8 text-[#0f172a]">Purchase Vendor Proof</h2>
            
            <div className="max-w-[500px] mx-auto bg-[#f8fafc] p-10 rounded-3xl border border-[#e2e8f0]">
              <div className="text-5xl font-black text-[#0f172a] mb-2">SGD 69</div>
              <p className="text-[#64748b] mb-10">One-time vendor proof generation</p>
              
              <ul className="space-y-4 mb-10 text-left">
                {[
                  'Complete PDPA evidence scan',
                  'Blockchain timestamp (Polygon)',
                  'QR verification link',
                  'Polygonscan proof URL',
                  'Reusable for RFPs',
                  'Valid for 12 months'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#64748b] font-medium border-b border-[#e2e8f0] pb-4 last:border-0 last:pb-0">
                    <span className="text-[#10b981] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={checkout} className="btn btn-primary w-full py-5 text-xl font-bold shadow-lg">
                Purchase Vendor Proof — SGD 69
              </button>

              <p className="mt-6 text-sm text-[#94a3b8]">
                Secure payment via Stripe. Instant delivery.
              </p>
            </div>

            <div className="mt-12 bg-[#0f172a] p-10 rounded-2xl text-white text-left flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Enterprise Volume?</h4>
                <p className="text-white/70">Need vendor proof for multiple domains or subsidiaries?</p>
              </div>
              <Link href="/demo" className="btn btn-secondary border-white text-white hover:bg-white hover:text-[#0f172a] px-8">
                Contact Sales for Volume Pricing
              </Link>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border-2 border-[#e2e8f0] mb-20">
            <h3 className="text-2xl font-black mb-8 text-[#0f172a]">💡 Use Cases</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { t: 'RFP Responses', d: '"Attach our blockchain-verified PDPA compliance proof to security questionnaire section 3.2"' },
                { t: 'Vendor Onboarding', d: '"Enterprise procurement teams can verify our compliance independently via QR scan"' },
                { t: 'Due Diligence', d: '"Investors requested proof of PDPA compliance — sent them our Polygonscan verification"' },
                { t: 'Sales Enablement', d: '"Sales team includes vendor proof in first demo deck — builds trust immediately"' }
              ].map((item, i) => (
                <div key={i} className="group">
                  <h4 className="text-lg font-bold text-[#10b981] mb-2 group-hover:translate-x-1 transition-transform">{item.t}</h4>
                  <p className="text-[#64748b] italic leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fffbeb] p-12 rounded-[2rem] border-2 border-[#fef3c7]">
            <h3 className="text-2xl font-black mb-6 text-[#92400e]">⚖️ What This Evidence Represents</h3>
            <p className="text-[#92400e] mb-6 font-medium">
              This vendor proof is a <strong>technical assessment</strong> of PDPA compliance indicators found on your website at a specific point in time. It is NOT:
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                'Legal certification or PDPC approval',
                'Guarantee of full regulatory compliance',
                'Substitute for legal counsel review',
                'Warranty of security practices'
              ].map((li, i) => (
                <li key={i} className="flex items-center gap-3 text-[#92400e] font-medium">
                  <span className="text-[#d97706] font-bold">✕</span> {li}
                </li>
              ))}
            </ul>

            <p className="bg-white/50 p-6 rounded-xl text-sm text-[#92400e] leading-relaxed border border-[#fde68a]">
              Procurement teams use this as <strong>one data point</strong> in their vendor assessment process, not as sole proof of compliance.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
