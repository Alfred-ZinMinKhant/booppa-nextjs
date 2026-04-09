'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 py-24 max-w-[1400px] mx-auto items-center">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#059669] mb-6 bg-[rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          Singapore B2B Procurement Trust Platform
        </div>

        <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight text-[#0f172a]">
          Verify your company.<br />
          <span className="text-[#10b981]">Prove your compliance.</span><br />
          Win more contracts.
        </h1>

        <p className="text-xl text-[#64748b] mb-12 max-w-xl leading-relaxed">
          Booppa helps vendors become trusted and procurement-ready through verified compliance data.
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <Link href="/auth/register" className="btn btn-primary text-lg">
            Claim your Company Profile (Free)
          </Link>
          <Link href="/check-status" className="btn btn-secondary text-lg">
            Check your Trust Status
          </Link>
        </div>

        {/* 3-step funnel */}
        <div className="flex flex-wrap gap-6">
          {[
            { step: '1', label: 'Claim your profile', sub: 'Free, no credit card' },
            { step: '2', label: 'Get verified',        sub: 'Vendor Proof — S$149' },
            { step: '3', label: 'Win more contracts',  sub: 'Procurement-ready evidence' },
          ].map(({ step, label, sub }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#10b981] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">{label}</p>
                <p className="text-xs text-[#94a3b8]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — trust card */}
      <div className="lg:block hidden animate-fade-in-right">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e8f0]">
            <span className="font-semibold text-sm text-[#0f172a]">Vendor Trust Profile</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(16,185,129,0.1)] text-[#059669] rounded-full text-xs font-bold ring-1 ring-[#10b981]">
              Verified
            </span>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#64748b]">Compliance Score</span>
              <span className="text-3xl font-bold text-[#10b981]">87/100</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'PDPA Snapshot',    done: true },
                { label: 'Document Notarization', done: true },
                { label: 'RFP Evidence Pack', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">{label}</span>
                  <span className={done ? 'text-[#10b981] font-bold' : 'text-[#cbd5e1]'}>
                    {done ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-[#f8fafc] p-4 rounded-lg border border-dashed border-[#cbd5e1]">
              <code className="text-xs text-[#94a3b8] break-all">0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7</code>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-lg">
              <div className="w-16 h-16 bg-[radial-gradient(circle_at_center,_#e2e8f0_1px,_transparent_1px)] bg-[length:10px_10px] rounded flex-shrink-0" />
              <span className="text-sm font-medium text-[#64748b]">Blockchain Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
