'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Star, Shield, Zap, TrendingUp, Award, Lock } from 'lucide-react'
import { config, endpoints } from '@/lib/config'

interface Achievement {
  id: string
  type: string
  label: string
  description: string
  quarter: string | null
  sector: string | null
  awarded_at: string | null
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  TOP_10_PCT:          <Trophy className="h-6 w-6 text-amber-400" />,
  TOP_5_PCT:           <Trophy className="h-6 w-6 text-orange-400" />,
  TOP_1_PCT:           <Trophy className="h-6 w-6 text-red-400" />,
  TIER_UP:             <TrendingUp className="h-6 w-6 text-emerald-400" />,
  SCORE_500:           <Star className="h-6 w-6 text-violet-400" />,
  SCORE_750:           <Star className="h-6 w-6 text-violet-300" />,
  FIRST_NOTARIZATION:  <Shield className="h-6 w-6 text-blue-400" />,
  FIRST_RFP:           <Zap className="h-6 w-6 text-yellow-400" />,
  ENTERPRISE_READY:    <Award className="h-6 w-6 text-cyan-400" />,
}

const ACHIEVEMENT_COLORS: Record<string, string> = {
  TOP_10_PCT:          'border-amber-500/30 bg-amber-500/5',
  TOP_5_PCT:           'border-orange-500/30 bg-orange-500/5',
  TOP_1_PCT:           'border-red-500/30 bg-red-500/5',
  TIER_UP:             'border-emerald-500/30 bg-emerald-500/5',
  SCORE_500:           'border-violet-500/30 bg-violet-500/5',
  SCORE_750:           'border-violet-400/30 bg-violet-400/5',
  FIRST_NOTARIZATION:  'border-blue-500/30 bg-blue-500/5',
  FIRST_RFP:           'border-yellow-500/30 bg-yellow-500/5',
  ENTERPRISE_READY:    'border-cyan-500/30 bg-cyan-500/5',
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Get vendor ID from session
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) { setError('Not authenticated'); setLoading(false); return }
        const me = await meRes.json()
        const vendorId = me.id || me.vendor_id
        if (!vendorId) { setError('Vendor ID not found'); setLoading(false); return }

        const res = await fetch(
          `${config.apiUrl}/api/v1${endpoints.rankings.achievements(vendorId)}`,
          { credentials: 'include' }
        )
        if (!res.ok) { setError('Could not load achievements'); setLoading(false); return }
        setAchievements(await res.json())
      } catch {
        setError('Network error — please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-1">
            Vendor Profile
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Achievements</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Milestones awarded based on your compliance score, tier, and procurement activity.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && achievements.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-10 text-center space-y-4">
            <Lock className="h-10 w-10 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 text-sm">
              No achievements yet. Keep improving your compliance score and verification depth.
            </p>
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
            >
              View Dashboard
            </Link>
          </div>
        )}

        {!loading && achievements.length > 0 && (
          <div className="space-y-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`flex items-start gap-4 rounded-xl border p-5 ${ACHIEVEMENT_COLORS[a.type] ?? 'border-neutral-800 bg-neutral-900'}`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                  {ACHIEVEMENT_ICONS[a.type] ?? <Award className="h-6 w-6 text-neutral-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{a.label}</p>
                    {a.awarded_at && (
                      <p className="text-xs text-neutral-500 flex-shrink-0">{formatDate(a.awarded_at)}</p>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{a.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.quarter && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-400">
                        {a.quarter}
                      </span>
                    )}
                    {a.sector && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-400">
                        {a.sector}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/rankings" className="text-sm text-violet-400 hover:underline">
            View public leaderboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
