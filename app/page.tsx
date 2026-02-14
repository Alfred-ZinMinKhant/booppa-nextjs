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
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">Why Vendors Lose RFPs</h2>
            <p className="text-xl text-[#64748b]">
              Disqualification rarely happens because of price.<br />
              It happens because of missing paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">Missing Compliance Evidence</h3>
              <p className="text-[#64748b] italic">"Procurement rejected our RFP. Section 4 requires PDPA documentation we didn't have."</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">Consultants Take Weeks</h3>
              <p className="text-[#64748b] italic">"Compliance consultant quoted SGD 5,000 and 4 weeks. Our RFP deadline was in 3 days."</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-3 text-[#0f172a]">Wrong Format</h3>
              <p className="text-[#64748b] italic">"We had a compliance report but GeBIZ required a specific structured format. Disqualified."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-[#0f172a]">What You Actually Get</h2>
            <p className="text-xl text-[#64748b]">Ready-to-submit documents. Procurement-ready files. Vendor submission packages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">01</div>
              <h3 className="text-xl font-bold mb-3">PDPA Instant Scan</h3>
              <p className="text-sm text-[#64748b] mb-6">Automated compliance check across 8 PDPA obligations (Sections 11–26). Risk report with blockchain timestamp.</p>
              <Link href="/pdpa" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Run Scan — SGD 69 →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">02</div>
              <h3 className="text-xl font-bold mb-3">Notarization Express</h3>
              <p className="text-sm text-[#64748b] mb-6">Anchor any compliance document to Polygon mainnet. Immutable timestamp + QR verification for court-admissibility.</p>
              <Link href="/notarization" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Notarize — SGD 69 →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">03</div>
              <h3 className="text-xl font-bold mb-3">RFP Express</h3>
              <p className="text-sm text-[#64748b] mb-6">5 copy-ready RFP answers, Vendor Proof certificate and blockchain verification. Delivered within 24 hours.</p>
              <Link href="/rfp-acceleration#express" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Generate — SGD 129 →</Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] group hover:border-[#10b981] hover:translate-y-[-5px] hover:shadow-lg transition-all">
              <div className="text-5xl font-mono font-bold text-[#e2e8f0] mb-4 group-hover:text-[#10b981] transition-colors leading-none">04</div>
              <h3 className="text-xl font-bold mb-3">RFP Kit</h3>
              <p className="text-sm text-[#64748b] mb-6">Full procurement pack: 15 RFP answers, editable DOCX, AI narrative, attestation letter. Enterprise-grade.</p>
              <Link href="/rfp-acceleration#complete" className="text-[#10b981] font-bold flex items-center gap-2 hover:gap-3 transition-all">Get Kit — SGD 499 →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Scan → Generate → Submit → Win</h2>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-8 lg:gap-4">
            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold mb-2">PDPA Scan</h3>
              <p className="text-white/80 text-sm">Automated compliance check across 8 obligations. Risk score, legislation references, evidence report generated in minutes.</p>
            </div>
            
            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold mb-2">Generate Evidence</h3>
              <p className="text-white/80 text-sm">Copy-ready RFP answers, Vendor Proof certificate, AI compliance narrative. PDF and editable DOCX formats.</p>
            </div>

            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold mb-2">Submit to Procurement</h3>
              <p className="text-white/80 text-sm">Paste answers directly into GeBIZ, SAP Ariba, or any RFP portal. Attach certificate and attestation letter.</p>
            </div>

            <div className="hidden lg:flex items-center pt-8 text-[#10b981] text-3xl">→</div>

            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-2xl font-bold mb-6">4</div>
              <h3 className="text-xl font-bold mb-2">Win Vendor Approval</h3>
              <p className="text-white/80 text-sm">Enterprise teams verify via QR code or blockchain hash. Procurement-accepted format from day one.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:translate-y-[-5px] hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4">PDPA Scan</h3>
              <div className="text-3xl font-bold text-[#0f172a] mb-2">SGD 69</div>
              <p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">One-time technical scan</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> 8-section PDPA analysis</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Risk severity report</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Blockchain timestamp</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> QR verification</li>
              </ul>
              <Link href="/pdpa" className="btn btn-outline w-full py-3">Run Scan</Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:translate-y-[-5px] hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4">Notarization</h3>
              <div className="text-3xl font-bold text-[#0f172a] mb-2">SGD 69</div>
              <p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">Per document</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Any compliance document</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Polygon mainnet anchor</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> QR + Polygonscan URL</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Court-admissible</li>
              </ul>
              <Link href="/notarization" className="btn btn-outline w-full py-3">Notarize</Link>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:translate-y-[-5px] hover:shadow-xl">
              <h3 className="text-xl font-bold mb-4">RFP Express</h3>
              <div className="text-3xl font-bold text-[#0f172a] mb-2">SGD 129</div>
              <p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">Fast procurement evidence</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> 5 RFP Q&A answers</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Vendor Proof Certificate</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Blockchain verification</li>
                <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Ready within 24 hours</li>
              </ul>
              <Link href="/rfp-acceleration#express" className="btn btn-outline w-full py-3">Get Express</Link>
            </div>

            <div className="bg-[#0f172a] p-8 rounded-3xl border-2 border-[#10b981] shadow-lg relative transition-all hover:translate-y-[-5px] hover:shadow-2xl">
              <div className="absolute top-[-15px] right-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Full Package</div>
              <h3 className="text-xl font-bold mb-4 text-white">RFP Kit</h3>
              <div className="text-3xl font-bold text-[#10b981] mb-2">SGD 499</div>
              <p className="text-white/70 text-sm mb-6 pb-6 border-b border-white/10">Enterprise-grade submission</p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center gap-3 text-sm text-white/80"><span className="text-[#10b981] font-bold">✓</span> 15 RFP Q&A answers</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><span className="text-[#10b981] font-bold">✓</span> Editable DOCX template</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><span className="text-[#10b981] font-bold">✓</span> Attestation letter</li>
                <li className="flex items-center gap-3 text-sm text-white/80"><span className="text-[#10b981] font-bold">✓</span> Priority 12-hour delivery</li>
              </ul>
              <Link href="/rfp-acceleration#complete" className="btn btn-primary w-full py-3 shadow-lg">Get RFP Kit</Link>
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
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Compliance evidence generation tools</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Procurement-ready documentation</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> Blockchain timestamping and verification</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#10b981] font-bold">✓</span> RFP response templates and packages</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-[#0f172a] mb-4 text-lg">❌ What We Don't Provide</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Legal advice or representation</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> PDPC certification or approval</li>
                  <li className="flex items-center gap-3 text-sm text-[#64748b]"><span className="text-[#dc2626] font-bold">✕</span> Guarantee of RFP acceptance</li>
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
            <h2 className="text-3xl lg:text-6xl font-black text-white mb-6 leading-tight">Stop Losing RFPs Because of<br />Compliance Paperwork.</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">Procurement-ready evidence generated in hours. No audit cycles. No consultancy fees.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/rfp-acceleration#express" className="btn btn-primary px-10 py-5 text-xl font-black">Get RFP Evidence — SGD 129</Link>
              <Link href="/rfp-acceleration#complete" className="btn btn-secondary bg-white text-[#0f172a] px-10 py-5 text-xl font-black hover:bg-white/90 border-0 transition-colors">See Full RFP Kit</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
