'use client';

import Link from 'next/link';

export default function RFPAccelerationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#f8fafc] to-white -z-10" />
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#059669] mb-8 bg-[#f0fdf4]">
            <span className="w-2 h-2 bg-[#10b981] rounded-full" />
            New: RFP Acceleration Suite
          </div>
          <h1 className="text-4xl lg:text-7xl font-black text-[#0f172a] mb-6 tracking-tight">
            Win RFPs Faster.<br />
            <span className="text-[#10b981]">Evidence-First.</span>
          </h1>
          <p className="text-xl text-[#64748b] mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop manually answering the same security and compliance questions. 
            BOOPPA generates blockchain-verified evidence that procurement teams trust.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#express" className="btn btn-primary px-10 py-4 text-lg">
              RFP Kit Express — SGD 129
            </Link>
            <Link href="#complete" className="btn btn-secondary px-10 py-4 text-lg">
              RFP Kit Complete — SGD 499
            </Link>
          </div>
        </div>
      </section>

      {/* Product Comparison */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Express Tier */}
            <div id="express" className="bg-white p-12 rounded-[2.5rem] border-2 border-[#e2e8f0] relative overflow-hidden transition-all hover:border-[#10b981]">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#0f172a] mb-2">RFP KIT EXPRESS</h3>
                <div className="text-4xl font-black text-[#10b981] mb-6">SGD 129</div>
                <p className="text-[#64748b]">Perfect for simple RFPs and basic vendor verification.</p>
              </div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> 5 Copy-Ready RFP Answers</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> RFP Kit Evidence Certificate</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> Blockchain Verification</li>
                <li className="flex items-center gap-3 text-[#0f172a]"><span className="text-[#10b981]">✓</span> QR Validation</li>
                <li className="flex items-center gap-3 text-[#64748b] opacity-50"><span className="text-[#cbd5e1]">✕</span> No Editable DOCX</li>
                <li className="flex items-center gap-3 text-[#64748b] opacity-50"><span className="text-[#cbd5e1]">✕</span> No AI Narrative</li>
              </ul>
              <Link href="/checkout/express" className="btn btn-primary w-full text-center py-4">Generate Express Evidence</Link>
            </div>

            {/* Complete Tier */}
            <div id="complete" className="bg-[#0f172a] p-12 rounded-[2.5rem] border-2 border-[#10b981] relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Enterprise Ready</div>
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2">RFP KIT COMPLETE</h3>
                <div className="text-4xl font-black text-[#10b981] mb-6">SGD 499</div>
                <p className="text-white/70">Full vendor procurement pack for high-value tenders.</p>
              </div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> 15 Advanced RFP Answers</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Editable DOCX Template</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> AI Compliance Narrative</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Comprehensive Control Mapping</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Attestation Letter</li>
                <li className="flex items-center gap-3 text-white"><span className="text-[#10b981]">✓</span> Priority 12h Delivery</li>
              </ul>
              <Link href="/checkout/complete" className="btn btn-primary w-full text-center py-4">Get Full RFP Kit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Advantage */}
      <section className="py-24 bg-[#f8fafc] px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-black text-[#0f172a] mb-8">Reduce Submission Friction</h2>
          <p className="text-lg text-[#64748b] mb-12">
            Procurement teams are tired of vague answers. By providing 
            <span className="font-bold text-[#0f172a]"> verifiable evidence</span> up front, 
            you move to the top of the pile and close deals faster.
          </p>
        </div>
      </section>
    </main>
  );
}
