'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { config, endpoints } from '@/lib/config'
import { checkFeature, FLAGS } from '@/lib/featureFlags'
import type { LeaderboardEntry } from '@/types'

export default function RankingsPage() {
  const [enabled, setEnabled] = useState(true)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [quarter, setQuarter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFeature(FLAGS.RANKING).then(setEnabled)
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (quarter) params.set('quarter', quarter)
      params.set('limit', '50')

      const res = await fetch(
        `${config.apiUrl}/api/v1${endpoints.rankings.leaderboard}?${params}`
      )
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || data || [])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [quarter])

  useEffect(() => {
    if (enabled) fetchLeaderboard()
  }, [enabled, fetchLeaderboard])

  if (!enabled) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Rankings Coming Soon</h1>
          <p className="text-[#64748b] mb-6">
            Vendor rankings will be available once we reach 200 verified vendors.
          </p>
          <Link href="/vendors" className="text-[#10b981] font-bold hover:underline">
            Browse Vendor Directory →
          </Link>
        </div>
      </main>
    )
  }

  const now = new Date()
  const currentQuarter = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">🏆 Vendor Rankings</h1>
          <p className="text-xl text-[#94a3b8]">
            Quarterly leaderboard based on trust scores, compliance verification, and engagement.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="py-6 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <label className="text-sm text-[#64748b]">Quarter:</label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-[#0f172a] bg-white focus:outline-none focus:border-[#10b981] transition-colors"
          >
            <option value="">Current ({currentQuarter})</option>
            <option value="2026-Q1">2026 Q1</option>
            <option value="2025-Q4">2025 Q4</option>
            <option value="2025-Q3">2025 Q3</option>
          </select>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-[#e2e8f0] animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e2e8f0] rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#e2e8f0] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[#e2e8f0] rounded w-1/5" />
                  </div>
                  <div className="h-6 bg-[#e2e8f0] rounded w-16" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">No rankings yet</h3>
              <p className="text-[#64748b]">The leaderboard will be computed at the end of the quarter.</p>
            </div>
          ) : (
            <>
              {/* Top 3 podium */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-12">
                  {[entries[1], entries[0], entries[2]].map((entry, i) => {
                    const sizes = ['text-3xl', 'text-4xl', 'text-2xl']
                    const heights = ['pt-8', 'pt-0', 'pt-12']
                    const medals = ['🥈', '🥇', '🥉']
                    return (
                      <div
                        key={entry.id}
                        className={`bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center ${heights[i]}`}
                      >
                        <div className={`${sizes[i]} mb-2`}>{medals[i]}</div>
                        <h3 className="font-bold text-[#0f172a] text-lg line-clamp-1">
                          {entry.company_name || 'Anonymous'}
                        </h3>
                        <div className="text-2xl font-bold text-[#10b981] mt-2">{entry.score}</div>
                        <div className="text-sm text-[#64748b]">points</div>
                        {entry.tier && (
                          <span className="inline-block mt-2 text-xs px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full font-medium uppercase">
                            {entry.tier}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Full list */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${entry.rank <= 3 ? 'bg-[#10b981]/10 text-[#10b981]' :
                        entry.rank <= 10 ? 'bg-[#f1f5f9] text-[#64748b]' :
                        'bg-[#f8fafc] text-[#94a3b8]'}
                    `}>
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0f172a]">{entry.company_name || 'Anonymous'}</h4>
                      <div className="flex items-center gap-2">
                        {entry.tier && (
                          <span className="text-xs px-2 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded-full uppercase">
                            {entry.tier}
                          </span>
                        )}
                        <span className="text-xs text-[#94a3b8]">{entry.quarter}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#10b981]">{entry.score}</span>
                      <span className="text-sm text-[#94a3b8] ml-1">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
