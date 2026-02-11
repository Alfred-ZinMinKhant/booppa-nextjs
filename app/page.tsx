import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />

      {/* Problem Statement */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">The Compliance Gap</h2>
            <p className="text-xl text-[#64748b]">Passing audits is one thing. Proving it in court is another.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">No Evidence Trail</h3>
              <p className="text-[#64748b] italic">"We passed the audit but have no timestamped documentation for PDPC inquiries."</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">Scattered Documentation</h3>
              <p className="text-[#64748b] italic">"When regulators requested proof, we had screenshots in 12 different folders."</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">Manual Workflows</h3>
              <p className="text-[#64748b] italic">"Vendor compliance takes 40+ hours per month. It's unsustainable."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">Evidence Infrastructure</h2>
            <p className="text-xl text-[#64748b]">Not compliance certification. Just verifiable, timestamped proof.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">01</div>
              <h3 className="text-xl font-bold mb-3">PDPA Evidence Scan</h3>
              <p className="text-sm text-[#64748b] mb-6">Automated technical assessment covering 8 PDPA obligations (Sections 11-26). Generates risk report with blockchain timestamp.</p>
              <Link href="/pdpa" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Run Scan →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">02</div>
              <h3 className="text-xl font-bold mb-3">Compliance Monitoring</h3>
              <p className="text-sm text-[#64748b] mb-6">Dashboard for consent logs, DSAR workflows, and activity records. Export evidence on-demand for audits.</p>
              <Link href="/compliance" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">View Dashboard →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">03</div>
              <h3 className="text-xl font-bold mb-3">Blockchain Notarization</h3>
              <p className="text-sm text-[#64748b] mb-6">Anchor compliance documents to Polygon mainnet. Immutable timestamp + QR verification for court-admissibility.</p>
              <Link href="/notarization" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Notarize Document →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">04</div>
              <h3 className="text-xl font-bold mb-3">Vendor Proof Records</h3>
              <p className="text-sm text-[#64748b] mb-6">Generate reusable procurement evidence for vendor assessments. Cryptographic hash + verification portal.</p>
              <Link href="/vendor" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Create Proof →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Workflow: Scan → Evidence → Verify</h2>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-4">
            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold mb-2">Technical Scan</h3>
              <p className="text-white/80 text-sm">AI-powered analysis checks PDPA obligations, DPO requirements, NRIC patterns, cookie consent mechanisms.</p>
            </div>
            
            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold mb-2">Evidence Generation</h3>
              <p className="text-white/80 text-sm">Report with severity levels (CRITICAL/HIGH/MEDIUM/LOW), specific legislation sections, and recommended actions.</p>
            </div>

            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold mb-2">Blockchain Anchor</h3>
              <p className="text-white/80 text-sm">SHA-256 hash timestamped on Polygon. Polygonscan URL + QR code for independent verification.</p>
            </div>

            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">4</div>
              <h3 className="text-xl font-bold mb-2">Verify Evidence</h3>
              <p className="text-white/80 text-sm">Anyone can verify authenticity via QR code or hash lookup. Court-admissible proof of documentation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">Transparent Pricing</h2>
            <p className="text-xl text-[#64748b]">No "contact sales" gatekeeping. Clear costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:translate-y-[-5px] hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4">PDPA Snapshot</h3>
              <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 69</div>
              <p className="text-[#64748b] mb-6 pb-6 border-b border-[#e2e8f0]">One-time technical scan</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> 8-section PDPA analysis</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Risk severity report</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Blockchain timestamp</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> QR verification</li>
              </ul>
              <Link href="/pdpa" className="btn btn-outline w-full">Start Scan</Link>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-[#10b981] shadow-lg relative transition-all hover:translate-y-[-5px] hover:shadow-2xl">
              <div className="absolute top-[-15px] right-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold mb-4">PDPA Basic</h3>
              <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 299<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
              <p className="text-[#64748b] mb-6 pb-6 border-b border-[#e2e8f0]">Operational monitoring</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Compliance dashboard</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> 10 DSAR workflows/month</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Consent logging</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Monthly reports</li>
              </ul>
              <Link href="/pricing" className="btn btn-primary w-full shadow-lg">View Plans</Link>
            </div>

            <div className="bg-white p-10 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:translate-y-[-5px] hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4">Enterprise Suite</h3>
              <div className="text-4xl font-bold text-[#0f172a] mb-2">SGD 1,999<span className="text-xl text-[#64748b] font-normal">/mo</span></div>
              <p className="text-[#64748b] mb-6 pb-6 border-b border-[#e2e8f0]">Full evidence infrastructure</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Unlimited notarizations</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Custom API access</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Dedicated manager</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> 24/7 support</li>
              </ul>
              <Link href="/demo" className="btn btn-outline w-full">Book Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Clarity */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white p-12 rounded-3xl border-2 border-[#f59e0b] shadow-sm">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">⚖️ What BOOPPA Is (and Isn't)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              <div>
                <h4 className="font-bold text-[#0f172a] mb-4 text-lg">✅ What We Provide</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Technical scanning infrastructure</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Evidence generation and timestamping</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Workflow automation tools</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Verifiable documentation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-[#0f172a] mb-4 text-lg">❌ What We Don't Provide</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Legal advice or representation</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> PDPC certification or approval</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Regulatory compliance guarantees</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Substitute for legal counsel</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed pt-8 border-t border-[#e2e8f0]">
              Your organization remains responsible for ensuring compliance with applicable laws. 
              BOOPPA provides operational tools to support your compliance efforts, 
              not legal opinions. For regulatory guidance, consult PDPC Helpline (+65 6377 3131) 
              or qualified legal counsel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto bg-[#0f172a] rounded-[2.5rem] p-12 lg:p-24 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-6xl font-black text-white mb-6 leading-tight">Start Building Your<br />Evidence Trail</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">Run your first PDPA scan in 15 minutes. No credit card required for preview.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/pdpa" className="btn btn-primary px-10 py-5 text-xl font-black">Run Free Preview</Link>
              <Link href="/demo" className="btn btn-secondary bg-white text-[#0f172a] px-10 py-5 text-xl font-black hover:bg-white/90 border-0 transition-colors">Book Enterprise Demo</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
