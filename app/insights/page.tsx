'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, BarChart2, Users } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  company: string;
  sector: string;
  score: number;
  verification_depth: string;
  evidence_count: number;
}

interface IndustryItem {
  industry: string;
  count: number;
}

const DEPTH_COLOR: Record<string, string> = {
  CERTIFIED:  'text-emerald-400',
  DEEP:       'text-blue-400',
  STANDARD:   'text-yellow-400',
  BASIC:      'text-orange-400',
  UNVERIFIED: 'text-neutral-500',
};

export default function InsightsPage() {
  const [entries, setEntries]       = useState<LeaderboardEntry[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [sector, setSector]         = useState('');
  const [loading, setLoading]       = useState(true);

  // Derived stats from real data
  const totalVendors    = industries.reduce((sum, i) => sum + i.count, 0)
  const avgScore        = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length)
    : null
  const verifiedCount   = entries.filter(e =>
    e.verification_depth === 'CERTIFIED' || e.verification_depth === 'DEEP'
  ).length

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (sector) params.set('sector', sector);

    setLoading(true);
    Promise.all([
      fetch(`/api/rankings/leaderboard?${params}`).then(r => r.ok ? r.json() : { entries: [] }),
      fetch(`/api/marketplace/industries`).then(r => r.ok ? r.json() : { industries: [] }),
    ]).then(([lb, ind]) => {
      setEntries(lb.entries || lb || []);
      const raw = ind.industries || ind || [];
      // normalise: backend may return { industry, count } or { name, count }
      setIndustries(
        raw.map((item: any) => ({
          industry: item.industry || item.name || item.slug || '',
          count: item.count ?? 0,
        })).filter((i: IndustryItem) => i.industry)
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sector]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">

      {/* Hero */}
      <section className="border-b border-white/10 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Public Intelligence</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">Procurement &amp; Compliance Insights</h1>
          <p className="text-white/50 text-sm max-w-xl">
            Compliance trends, vendor readiness benchmarks, and industry data — updated continuously from the BOOPPA vendor network.
          </p>
        </div>
      </section>

      {/* Summary stats */}
      <section className="px-6 py-10 lg:px-8 border-b border-white/10">
        <div className="mx-auto max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              label: 'Vendors on network',
              value: totalVendors > 0 ? `${totalVendors.toLocaleString()}+` : '—',
            },
            {
              icon: Shield,
              label: 'Certified or deep-verified',
              value: verifiedCount > 0 ? `${verifiedCount}` : '—',
            },
            {
              icon: BarChart2,
              label: 'Industries tracked',
              value: industries.length > 0 ? `${industries.length}` : '—',
            },
            {
              icon: TrendingUp,
              label: 'Avg compliance score',
              value: avgScore !== null ? `${avgScore}/100` : '—',
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-5 py-5">
              <Icon className="h-5 w-5 text-[#10b981] mb-3" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sector filter + leaderboard */}
      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-lg font-semibold">Vendor Readiness Leaderboard</h2>
            <select
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#10b981]"
              value={sector}
              onChange={e => setSector(e.target.value)}
            >
              <option value="">All industries</option>
              {industries.map(i => (
                <option key={i.industry} value={i.industry}>
                  {i.industry} ({i.count})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
              <p className="text-white/30 text-sm">No data available for this industry yet.</p>
              <Link href="/auth/register" className="mt-4 inline-block text-[#10b981] text-sm underline hover:no-underline">
                Be the first — claim your profile
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium w-12">#</th>
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Company</th>
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium hidden sm:table-cell">Industry</th>
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium hidden md:table-cell">Verification</th>
                    <th className="text-right px-5 py-3 text-xs text-white/40 font-medium hidden md:table-cell">Evidence</th>
                    <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((e, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-white/30 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-white">{e.company}</td>
                      <td className="px-5 py-3 text-white/50 hidden sm:table-cell">{e.sector || '—'}</td>
                      <td className={`px-5 py-3 text-xs font-semibold hidden md:table-cell ${DEPTH_COLOR[e.verification_depth] ?? 'text-white/40'}`}>
                        {e.verification_depth ?? 'UNVERIFIED'}
                      </td>
                      <td className="px-5 py-3 text-right text-white/40 text-xs hidden md:table-cell">
                        {e.evidence_count ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#10b981]">{e.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Industry breakdown */}
      {industries.length > 0 && (
        <section className="px-6 py-10 lg:px-8 border-t border-white/10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-lg font-semibold mb-6">Vendors by Industry</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {industries.map(ind => (
                <button
                  key={ind.industry}
                  onClick={() => { setSector(ind.industry); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`rounded-xl border px-5 py-4 text-left transition-all ${
                    sector === ind.industry
                      ? 'border-[#10b981] bg-[#10b981]/10'
                      : 'border-white/10 bg-white/5 hover:border-[#10b981] hover:bg-[#10b981]/5'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{ind.industry}</p>
                  <p className="text-xs text-white/40 mt-1">{ind.count} vendors</p>
                </button>
              ))}
            </div>
            {sector && (
              <button
                onClick={() => setSector('')}
                className="mt-4 text-xs text-white/40 hover:text-[#10b981] transition-colors"
              >
                ← Show all industries
              </button>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-16 lg:px-8 border-t border-white/10 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Not on the leaderboard yet?</h2>
          <p className="text-white/50 text-sm mb-8">
            Claim your free profile and start building your compliance score today.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors"
          >
            Claim your Company Profile (Free)
          </Link>
        </div>
      </section>

    </main>
  );
}
