'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StatusResult {
  companyName: string;
  verified: boolean;
  verificationDate?: string;
  evidenceCount?: number;
  profileUrl?: string;
}

export default function CheckStatusPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch(
        `/api/trust-status?q=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          setResult({ companyName: trimmed, verified: false });
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }
      const data = await res.json();
      setResult({
        companyName: data.company_name ?? trimmed,
        verified: data.verified ?? false,
        verificationDate: data.verification_date,
        evidenceCount: data.evidence_count,
        profileUrl: data.profile_url,
      });
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] py-24 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-4">Check Trust Status</h1>
          <p className="text-lg text-[#64748b]">
            Enter a company name to instantly see whether they are Verified or Not Verified on BOOPPA.
          </p>
        </div>

        <form onSubmit={handleCheck} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Acme Pte Ltd"
            className="flex-1 px-5 py-4 rounded-xl border-2 border-[#e2e8f0] text-[#0f172a] text-sm font-medium focus:outline-none focus:border-[#10b981] transition-colors bg-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-4 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Check'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className={`rounded-2xl border-2 p-8 text-center ${result.verified ? 'bg-white border-[#10b981]' : 'bg-white border-[#e2e8f0]'}`}>
            <div className={`text-6xl mb-4`}>{result.verified ? '✅' : '❌'}</div>
            <h2 className="text-2xl font-black text-[#0f172a] mb-2">{result.companyName}</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${result.verified ? 'bg-[rgba(16,185,129,0.1)] text-[#059669]' : 'bg-[#f8fafc] text-[#94a3b8]'}`}>
              <span className={`w-2 h-2 rounded-full ${result.verified ? 'bg-[#10b981]' : 'bg-[#cbd5e1]'}`} />
              {result.verified ? 'Verified' : 'Not Verified'}
            </div>

            {result.verified && result.verificationDate && (
              <p className="text-sm text-[#64748b] mb-2">Verified since {new Date(result.verificationDate).toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
            {result.verified && result.evidenceCount != null && (
              <p className="text-sm text-[#64748b] mb-6">{result.evidenceCount} evidence document{result.evidenceCount !== 1 ? 's' : ''} on record</p>
            )}

            {result.verified && result.profileUrl && (
              <Link href={result.profileUrl} className="inline-block px-6 py-3 bg-[#10b981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-colors mb-4">
                View Full Profile
              </Link>
            )}

            {!result.verified && (
              <div className="mt-4">
                <p className="text-sm text-[#64748b] mb-4">This company has not yet claimed or verified their BOOPPA profile.</p>
                <Link href="/auth/register" className="inline-block px-6 py-3 bg-[#10b981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition-colors">
                  Claim this Profile (Free)
                </Link>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-[#94a3b8] text-center mt-8 leading-relaxed">
          Verification status reflects documents submitted to and validated by BOOPPA. This is not an official government registry. For regulatory inquiries, contact PDPC or the relevant authority.
        </p>
      </div>
    </main>
  );
}
