import Link from 'next/link';
import { FileText, Zap, CheckCircle, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'RFP Tools — Prepare Better Submissions | BOOPPA',
  description: 'Generate procurement-ready RFP evidence packages in minutes. Blockchain-anchored certificates accepted by Singapore government agencies and enterprise buyers.',
};

export default function RfpPage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#10b981] mb-8 bg-[rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
            GeBIZ &amp; Enterprise Ready
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Prepare better RFP responses,<br />
            <span className="text-[#10b981]">faster.</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate stronger, more complete submissions with structured compliance data. Blockchain-anchored certificates that procurement officers can verify instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rfp-acceleration" className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors text-lg">
              Start your RFP Package
            </Link>
            <Link href="/tender-check" className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-colors text-lg">
              Check Tender Win Probability (Free)
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-4">
            Most vendors lose opportunities before they even apply
          </h2>
          <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
            Incomplete or weak compliance documentation leads to rejection in RFPs and procurement processes. Without structured credibility evidence, your proposal is evaluated on price alone.
          </p>
        </div>
      </section>

      {/* Solution steps */}
      <section className="py-20 px-6 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] text-center mb-14">
            Turn compliance into a competitive advantage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: '1',
                title: 'Faster document generation',
                desc: 'Enter your tender number and sector. BOOPPA AI generates a structured evidence package in minutes — not days.',
              },
              {
                icon: CheckCircle,
                step: '2',
                title: 'Structured responses',
                desc: 'Every package covers the compliance dimensions procurement officers evaluate: PDPA, verification depth, sector percentile, evidence count.',
              },
              {
                icon: Shield,
                step: '3',
                title: 'Reduced errors',
                desc: 'Blockchain-anchored certificates with QR verification. Buyers confirm authenticity instantly — no follow-up, no doubt.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-[#e2e8f0] p-8 hover:border-[#10b981] hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#10b981] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </span>
                  <Icon className="h-5 w-5 text-[#10b981]" />
                </div>
                <h3 className="text-base font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] text-center mb-14">
            Available for verified vendors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* RFP Express */}
            <div className="rounded-2xl border-2 border-violet-400 bg-white p-8 relative">
              <div className="absolute top-[-14px] right-6 bg-violet-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-violet-500" />
                <h3 className="text-xl font-bold text-[#0f172a]">RFP Express</h3>
              </div>
              <div className="text-3xl font-bold text-[#0f172a] mt-3 mb-1">SGD 249</div>
              <p className="text-sm text-[#64748b] mb-6">Per tender · 2-page evidence certificate</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Tender Readiness Score (0–100)',
                  '5 PDPA compliance answers',
                  'AI-generated, sector-tailored',
                  'Blockchain-anchored PDF',
                  'Delivered in minutes',
                  'Strategy 6: notifies shortlisted vendors',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                    <span className="text-violet-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/rfp-acceleration"
                className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Get RFP Express
              </Link>
            </div>

            {/* RFP Complete */}
            <div className="rounded-2xl border-2 border-[#10b981] bg-white p-8 relative">
              <div className="absolute top-[-14px] right-6 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Best Value
              </div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-[#10b981]" />
                <h3 className="text-xl font-bold text-[#0f172a]">RFP Complete</h3>
              </div>
              <div className="text-3xl font-bold text-[#0f172a] mt-3 mb-1">SGD 599</div>
              <p className="text-sm text-[#64748b] mb-6">Per tender · Full 15-question dossier</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Full procurement dossier',
                  '15 PDPA compliance answers',
                  'Editable DOCX + PDF',
                  'Enterprise visibility unlocked',
                  'Multi-sector matching',
                  'Priority email delivery',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b]">
                    <span className="text-[#10b981] font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/rfp-acceleration"
                className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Get RFP Complete
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-[#94a3b8] mt-8">
            Both products require an active{' '}
            <Link href="/vendor-proof" className="text-[#10b981] underline hover:no-underline">Vendor Proof</Link>{' '}
            verification. Don't have it yet?{' '}
            <Link href="/vendor-proof" className="text-[#10b981] underline hover:no-underline">Get verified first →</Link>
          </p>
        </div>
      </section>

      {/* Free tool CTA */}
      <section className="py-20 px-6 bg-[#0f172a] text-center">
        <div className="max-w-xl mx-auto">
          <Clock className="h-10 w-10 text-[#10b981] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Not sure which to choose?</h2>
          <p className="text-white/50 text-sm mb-8">
            Use the free Tender Win Probability Calculator to see exactly how much your score would improve — anchored to a real GeBIZ tender number.
          </p>
          <Link
            href="/tender-check"
            className="inline-block px-8 py-4 border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white font-bold rounded-xl transition-colors"
          >
            Check Tender Win Probability (Free)
          </Link>
        </div>
      </section>

    </main>
  );
}
