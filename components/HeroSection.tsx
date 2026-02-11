'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 py-24 max-w-[1400px] mx-auto items-center">
      <div className="hero-container animate-fade-in-up">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#059669] mb-6 bg-[rgba(16,185,129,0.1)]">
          <span className="badge-dot w-2 h-2 bg-[#10b981] rounded-full animate-pulse-custom"></span>
          Singapore-Based Evidence Infrastructure
        </div>
        
        <h1 className="hero-title text-4xl lg:text-6xl font-black mb-6 leading-tight text-[#0f172a]">
          Compliance Evidence.<br />
          <span className="gradient-text">Blockchain-Anchored.</span><br />
          Audit-Ready.
        </h1>
        
        <p className="hero-description text-xl text-[#64748b] mb-12 max-w-xl leading-relaxed">
          Automated documentation, cryptographic timestamping, and verifiable 
          audit records for PDPA, MAS, and MTCS compliance operations.
        </p>

        <div className="hero-cta flex flex-wrap gap-4 mb-12">
          <Link href="/pdpa" className="btn btn-primary text-lg">
            Start PDPA Scan — SGD 69
          </Link>
          <Link href="/demo" className="btn btn-secondary text-lg">
            Book Enterprise Demo
          </Link>
        </div>

        <div className="trust-badges flex flex-wrap gap-6">
          <div className="badge flex items-center gap-2 text-[#94a3b8] text-sm">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-[#10b981]">
              <path d="M10 0L12.5 7.5H20L14 12L16.5 20L10 15L3.5 20L6 12L0 7.5H7.5L10 0Z"/>
            </svg>
            <span>AWS Singapore</span>
          </div>
          <div className="badge flex items-center gap-2 text-[#94a3b8] text-sm">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-[#10b981]">
              <path d="M10 0L12.5 7.5H20L14 12L16.5 20L10 15L3.5 20L6 12L0 7.5H7.5L10 0Z"/>
            </svg>
            <span>Polygon Verified</span>
          </div>
          <div className="badge flex items-center gap-2 text-[#94a3b8] text-sm">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-[#10b981]">
              <path d="M10 0L12.5 7.5H20L14 12L16.5 20L10 15L3.5 20L6 12L0 7.5H7.5L10 0Z"/>
            </svg>
            <span>PDPC-Aligned</span>
          </div>
        </div>
      </div>

      <div className="hero-visual lg:block hidden animate-fade-in-right">
        <div className="evidence-card bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-evidence">
          <div className="evidence-header flex justify-between items-center mb-6 pb-4 border-b border-[#e2e8f0]">
            <span className="evidence-type font-semibold text-sm text-[#0f172a]">PDPA Evidence Scan</span>
            <span className="evidence-status inline-flex items-center gap-1 px-3 py-1 bg-[rgba(16,185,129,0.1)] text-[#059669] rounded-full text-xs font-bold ring-1 ring-[#10b981]">Verified</span>
          </div>
          <div className="evidence-body flex flex-col gap-6">
            <div className="evidence-metric flex justify-between items-center">
              <span className="metric-label text-sm text-[#64748b]">Compliance Score</span>
              <span className="metric-value text-3xl font-bold text-[#10b981]">87/100</span>
            </div>
            <div className="evidence-hash bg-[#f8fafc] p-4 rounded-lg border border-dashed border-[#cbd5e1] overflow-hidden">
              <code className="text-xs text-[#94a3b8] break-all">0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7</code>
            </div>
            <div className="evidence-qr flex items-center gap-4 p-4 bg-[#f8fafc] rounded-lg">
              <div className="qr-placeholder w-16 h-16 bg-[radial-gradient(circle_at_center,_#e2e8f0_1px,_transparent_1px)] bg-[length:10px_10px] rounded" />
              <span className="text-sm font-medium text-[#64748b]">Blockchain Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
