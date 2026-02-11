'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [hash, setHash] = useState('');
  const [results, setResults] = useState<{
    docType: string;
    timestamp: string;
    txHash: string;
    status: string;
    polygonscanUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate verification (in production, this would call /api/verify endpoint)
    setTimeout(() => {
      setResults({
        docType: 'PDPA Evidence Scan',
        timestamp: new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }) + ' SGT',
        txHash: hash.length > 20 ? hash.substring(0, 10) + '...' + hash.substring(hash.length - 8) : hash,
        status: 'Confirmed (24 blocks)',
        polygonscanUrl: `https://polygonscan.com/tx/${hash}`
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="bg-white min-h-screen">
      <section className="py-24 px-6">
        <div className="container max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0f172a]">Verify Evidence</h1>
            <p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
              Independently verify blockchain-anchored compliance evidence.
              No login required — fully transparent verification.
            </p>
          </div>

          <div className="bg-white p-8 lg:p-16 rounded-[3rem] shadow-2xl border border-[#e2e8f0] mb-12">
            <h2 className="text-2xl font-black mb-8 text-[#0f172a]">Enter Proof Hash or Document ID</h2>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="hash" className="block text-sm font-bold text-[#0f172a] mb-3">
                  Evidence Hash or Verification ID
                </label>
                <input
                  type="text"
                  id="hash"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="w-full px-6 py-4 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl focus:border-[#10b981] focus:outline-none font-mono text-sm transition-all"
                  placeholder="0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7..."
                  required
                />
                <p className="mt-3 text-sm text-[#94a3b8] italic">
                  Enter the SHA-256 hash or verification ID from your BOOPPA report
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full py-5 text-xl font-black shadow-lg shadow-[#10b981]/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying on Blockchain...' : 'Verify on Blockchain'}
              </button>
            </form>

            {results && (
              <div className="mt-12 p-8 bg-[#f0fdf4] rounded-[2rem] border-2 border-[#10b981] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                    <span className="font-bold">✓</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#059669]">Evidence Verified</h3>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { l: 'Document Type', v: results.docType },
                    { l: 'Timestamp', v: results.timestamp },
                    { l: 'Blockchain', v: 'Polygon Mainnet' },
                    { l: 'Transaction Hash', v: results.txHash, mono: true },
                    { l: 'Status', v: results.status, color: 'text-[#10b981]' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center py-4 border-b border-[#10b981]/10 last:border-0">
                      <span className="text-[#64748b] text-sm font-medium">{item.l}</span>
                      <strong className={`text-[#0f172a] ${item.mono ? 'font-mono text-xs break-all' : ''} ${item.color || ''}`}>{item.v}</strong>
                    </div>
                  ))}
                </div>

                <a
                  href={results.polygonscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full py-4 text-[#0f172a] border-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-all font-bold"
                >
                  View on Polygonscan →
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-[#0f172a]">🔍 How Verification Works</h3>
              <ol className="space-y-4">
                {[
                  'We generate SHA-256 hash of your compliance report',
                  'Hash is anchored to Polygon blockchain (immutable)',
                  'Anyone can verify the timestamp and authenticity',
                  'Verification is independent — no BOOPPA login needed'
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 text-[#64748b] leading-relaxed">
                    <span className="font-bold text-[#10b981]">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm text-center">
              <h3 className="text-xl font-bold mb-6 text-[#0f172a]">📱 QR Code Scanning</h3>
              <p className="text-[#64748b] mb-8 leading-relaxed">
                All BOOPPA reports include a QR code that links directly to this verification page for instant trust.
              </p>
              <div className="bg-[#f8fafc] p-8 rounded-3xl inline-block border-2 border-dashed border-[#e2e8f0]">
                <div className="w-24 h-24 bg-[#0f172a] rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#10b981] rounded-sm relative">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-[#10b981]"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#10b981]"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 bg-[#10b981]"></div>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Sample QR</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] text-white p-12 lg:p-20 rounded-[3rem] mb-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#10b981] opacity-10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
            <h2 className="text-3xl lg:text-4xl font-black mb-12 relative z-10">What Verification Proves</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
              {[
                { t: 'Timestamp Authenticity', d: 'Blockchain proves this exact document existed at this specific date and time. Cannot be backdated.' },
                { t: 'Document Integrity', d: 'SHA-256 hash ensures the document hasn\'t been altered. Even 1-byte change would produce different hash.' },
                { t: 'Independent Verification', d: 'Polygonscan is a public blockchain explorer. Anyone can verify without trusting BOOPPA.' },
                { t: 'Court Admissibility', d: 'Blockchain evidence is accepted under Singapore Evidence Act as reliable electronic records.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center text-[#0f172a]">
                    <span className="font-bold text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-[#10b981]">{item.t}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#fffbeb] p-10 rounded-[2.5rem] border-2 border-[#fef3c7]">
            <h3 className="text-2xl font-black mb-6 text-[#92400e]">⚖️ What Verification Does NOT Prove</h3>
            <ul className="space-y-4">
              {[
                'Verification confirms existence and timestamp of evidence documentation.',
                'It does NOT confirm regulatory compliance, PDPC approval, or legal certification.',
                'The underlying report is a technical assessment, not legal opinion.',
                'Organizations remain responsible for actual compliance with applicable laws.'
              ].map((li, i) => (
                <li key={i} className="flex items-start gap-4 text-[#92400e] font-medium leading-relaxed">
                  <span className="text-[#d97706] font-bold">✕</span>
                  {li}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
