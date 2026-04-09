import Link from 'next/link';

export const metadata = {
  title: 'For Vendors — Claim, Verify & Win More Contracts | BOOPPA',
  description: 'Claim your free company profile, get verified, and prove procurement-readiness to win more Singapore government and enterprise contracts.',
};

export default function SolutionsVendorsPage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[rgba(16,185,129,0.1)]">
            For Vendors
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Verify your company.<br />
            <span className="text-[#10b981]">Prove your compliance.</span><br />
            Win more contracts.
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop losing RFPs because of missing paperwork. Claim your free BOOPPA profile, get verified, and submit procurement-ready evidence in hours — not weeks.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors text-lg">
              Claim your Company Profile (Free)
            </Link>
            <Link href="/check-status" className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-bold rounded-xl transition-colors text-lg">
              Check your Trust Status
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">Most vendors lose opportunities before they even apply</h2>
            <p className="text-xl text-[#64748b]">Disqualification rarely happens because of price. It happens before you even get to the table.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '❌', title: 'Missing Compliance Evidence', quote: '"Procurement rejected our RFP. Section 4 requires PDPA documentation we didn\'t have."' },
              { icon: '⏱️', title: 'Consultants Take Weeks', quote: '"Compliance consultant quoted SGD 5,000 and 4 weeks. Our RFP deadline was in 3 days."' },
              { icon: '📄', title: 'Wrong Format', quote: '"We had a compliance report but GeBIZ required a specific structured format. Disqualified."' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#0f172a]">{item.title}</h3>
                <p className="text-[#64748b] italic text-sm">{item.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution — 3 Steps */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">Claim → Verify → Become Procurement-Ready</h2>
            <p className="text-xl text-[#64748b]">Three steps. No audit cycles. No consultancy fees.</p>
          </div>
          <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-4">
            {[
              { step: '1', title: 'Claim your Profile', desc: 'Register for free and claim your company profile on BOOPPA. Takes under 5 minutes.' },
              { step: '2', title: 'Get Verified', desc: 'Submit compliance documents — PDPA, financial records, certifications. We timestamp and anchor them on blockchain.' },
              { step: '3', title: 'Become Procurement-Ready', desc: 'Your verified profile is visible to procurement teams. Attach your evidence packages directly to RFP submissions.' },
            ].map((item, i) => (
              <div key={i} className="flex-1 min-w-[220px] max-w-[300px] text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 mx-auto">{item.step}</div>
                <h3 className="text-xl font-bold mb-3 text-[#0f172a]">{item.title}</h3>
                <p className="text-[#64748b] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#0f172a]">Everything you need to win</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Free', title: 'Company Profile', desc: 'Claim your profile, add business details, appear in the Vendor Network.', href: '/auth/register', cta: 'Claim Free →' },
              { label: 'SGD 79', title: 'PDPA Scan', desc: 'Automated compliance check across 8 PDPA obligations. Blockchain-timestamped risk report.', href: '/pdpa', cta: 'Run Scan →' },
              { label: 'SGD 249', title: 'RFP Kit Express', desc: '5 copy-ready RFP answers + Vendor Proof certificate. Ready within 24 hours.', href: '/rfp-acceleration#express', cta: 'Get Express →' },
              { label: 'SGD 599', title: 'RFP Kit Complete', desc: '15 RFP answers, editable DOCX, attestation letter. Enterprise-grade submission pack.', href: '/rfp-acceleration#complete', cta: 'Get Kit →' },
            ].map((p, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:shadow-lg transition-all">
                <div className="text-sm font-bold text-[#10b981] mb-2">{p.label}</div>
                <h3 className="text-lg font-bold mb-2 text-[#0f172a]">{p.title}</h3>
                <p className="text-sm text-[#64748b] mb-6">{p.desc}</p>
                <Link href={p.href} className="text-[#10b981] font-bold text-sm hover:underline">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">Ready to become procurement-ready?</h2>
          <p className="text-white/70 text-xl mb-10">Claim your free company profile today. No credit card required.</p>
          <Link href="/auth/register" className="inline-block px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xl rounded-2xl transition-colors shadow-lg">
            Claim your Company Profile (Free)
          </Link>
        </div>
      </section>

    </main>
  );
}
