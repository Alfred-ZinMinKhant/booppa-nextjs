'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, BarChart2, Users } from 'lucide-react';
import { config as appConfig } from '@/lib/config';

interface LeaderboardEntry {
  rank: number;
  company: string;
  sector: string;
  score: number;
  verification_depth: string;
  evidence_count: number;
}

interface IndustryItem {
  slug: string;
  name: string;
  count: number;
}

const DEPTH_COLOR: Record<string, string> = {
  CERTIFIED: 'text-emerald-400',
  DEEP:      'text-blue-400',
  STANDARD:  'text-yellow-400',
  BASIC:     'text-orange-400',
  UNVERIFIED:'text-neutral-500',
};

const SECTORS = [
  'Technology', 'Construction', 'Healthcare', 'Finance',
  'Logistics', 'Professional Services', 'Manufacturing', 'Education',
];

export default function InsightsPage() {
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [sector, setSector]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '20' });
    if (sector) params.set('sector', sector);

    Promise.all([
      fetch(`${appConfig.apiUrl}/api/v1/rankings/leaderboard/all?${params}`).then(r => r.ok ? r.json() : { entries: [] }),
      fetch(`${appConfig.apiUrl}/api/v1/marketplace/industries`).then(r => r.ok ? r.json() : []),
    ]).then(([lb, ind]) => {
      setEntries(lb.entries || lb || []);
      setIndustries(ind || []);
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
            { icon: Users,     label: 'Vendors on network',     value: '2,800+' },
            { icon: Shield,    label: 'Verified vendors',        value: '840+' },
            { icon: BarChart2, label: 'Documents notarized',     value: '12,000+' },
            { icon: TrendingUp,label: 'Avg compliance score',    value: '61/100' },
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
              onChange={e => { setSector(e.target.value); setLoading(true); }}
            >
              <option value="">All sectors</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
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
              <p className="text-white/30 text-sm">No data available for this sector yet.</p>
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
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium hidden sm:table-cell">Sector</th>
                    <th className="text-left px-5 py-3 text-xs text-white/40 font-medium hidden md:table-cell">Verification</th>
                    <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.map((e, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-white/30 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-white">{e.company}</td>
                      <td className="px-5 py-3 text-white/50 hidden sm:table-cell">{e.sector}</td>
                      <td className={`px-5 py-3 text-xs font-semibold hidden md:table-cell ${DEPTH_COLOR[e.verification_depth] ?? 'text-white/40'}`}>
                        {e.verification_depth ?? 'UNVERIFIED'}
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

      {/* Industry benchmarks */}
      <section className="px-6 py-10 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-semibold mb-6">Compliance Trends by Industry</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => { setSector(s); setLoading(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="rounded-xl border border-white/10 bg-white/5 hover:border-[#10b981] hover:bg-[#10b981]/5 transition-all px-5 py-4 text-left"
              >
                <p className="text-sm font-semibold text-white">{s}</p>
                <p className="text-xs text-white/40 mt-1">View benchmarks →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

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
