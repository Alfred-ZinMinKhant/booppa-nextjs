import Link from 'next/link';

export const metadata = {
  title: 'For Procurement Teams — Reduce Vendor Risk | BOOPPA',
  description: 'Evaluate vendors faster. Verify compliance evidence in seconds. Reduce vendor risk with blockchain-anchored documentation trusted by Singapore procurement teams.',
};

export default function SolutionsProcurementPage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[rgba(16,185,129,0.1)]">
            For Procurement
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Reduce vendor risk.<br />
            <span className="text-[#10b981]">Evaluate faster.</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop chasing vendors for compliance documents. BOOPPA gives your team instant access to blockchain-verified vendor evidence — so you can shortlist confidently and award faster.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/book-demo" className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors text-lg">
              Request Demo
            </Link>
            <Link href="/enterprise" className="px-8 py-4 border border-white/20 hover:border-white/50 text-white font-bold rounded-xl transition-colors text-lg">
              Enterprise Access
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">The procurement compliance bottleneck</h2>
            <p className="text-xl text-[#64748b]">Manual document collection slows every evaluation cycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📂', title: 'Chasing Documents', desc: 'Teams spend days emailing vendors for PDPA policies, financial statements, and certifications — with no audit trail.' },
              { icon: '🔍', title: 'Unverifiable Claims', desc: 'Vendors self-certify compliance. Without independent verification, procurement teams bear the risk of awarding to non-compliant suppliers.' },
              { icon: '⏳', title: 'Slow Evaluation Cycles', desc: 'Manual compliance checks stretch evaluation from days to weeks, delaying procurement and increasing project risk.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#0f172a]">{item.title}</h3>
                <p className="text-[#64748b] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How BOOPPA Helps */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#0f172a]">How BOOPPA accelerates your evaluation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Instant Vendor Verification', desc: 'Check any vendor\'s trust status in seconds. See their verified documents, compliance scores, and evidence history — all blockchain-anchored.' },
              { title: 'Evidence You Can Trust', desc: 'Every document is SHA-256 hashed and anchored on Polygon mainnet. Immutable timestamps mean vendors can\'t alter documents after submission.' },
              { title: 'Compare Vendors Side-by-Side', desc: 'Use the BOOPPA Compare tool to evaluate multiple vendors across compliance scores, evidence depth, and sector suitability.' },
              { title: 'Enterprise Access for Teams', desc: 'Give your entire procurement team access to the BOOPPA vendor network. Filter by sector, compliance status, and evidence count.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                <span className="text-[#10b981] font-black text-xl mt-1">✓</span>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#0f172a]">{item.title}</h3>
                  <p className="text-[#64748b] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#0f172a]">Tools built for procurement teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Vendor Network', desc: 'Browse the full directory of Singapore SMEs. Filter by compliance status, sector, and verification depth.', href: '/vendors', cta: 'Browse Network →' },
              { title: 'Vendor Comparison', desc: 'Compare up to 3 vendors side-by-side across compliance scores, evidence, and procurement readiness.', href: '/compare', cta: 'Compare Vendors →' },
              { title: 'Document Verify', desc: 'Verify any BOOPPA-issued document instantly. Paste a blockchain hash or scan a QR code to confirm authenticity.', href: '/verify', cta: 'Verify a Document →' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold mb-2 text-[#0f172a]">{t.title}</h3>
                <p className="text-sm text-[#64748b] mb-6">{t.desc}</p>
                <Link href={t.href} className="text-[#10b981] font-bold text-sm hover:underline">{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">Cut your vendor evaluation time in half.</h2>
          <p className="text-white/70 text-xl mb-10">See how BOOPPA fits your procurement workflow in a 30-minute demo.</p>
          <Link href="/book-demo" className="inline-block px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xl rounded-2xl transition-colors shadow-lg">
            Request Demo
          </Link>
        </div>
      </section>

    </main>
  );
}
