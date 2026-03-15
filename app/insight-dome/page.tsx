'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { config, endpoints } from '@/lib/config'
import { checkFeature, FLAGS } from '@/lib/featureFlags'

export default function InsightDomePage() {
  const [enabled, setEnabled] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [industries, setIndustries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFeature(FLAGS.INSIGHT).then(setEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    Promise.all([
      fetch(`${config.apiUrl}/api/v1${endpoints.features.metrics}`).then(r => r.ok ? r.json() : null),
      fetch(`${config.apiUrl}/api/v1${endpoints.funnel.revenue}`).then(r => r.ok ? r.json() : null),
      fetch(`${config.apiUrl}/api/v1${endpoints.marketplace.industries}`).then(r => r.ok ? r.json() : null),
    ]).then(([m, r, ind]) => {
      setMetrics(m)
      setRevenue(r)
      setIndustries(ind?.industries || ind || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [enabled])

  if (!enabled) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Insight Dome</h1>
          <p className="text-[#64748b] mb-6">
            AI-powered market intelligence will be available once we reach 500 verified vendors.
          </p>
          <Link href="/vendors" className="text-[#10b981] font-bold hover:underline">
            Browse Vendor Directory →
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-[#64748b]">Loading insights...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f172a]">
      {/* Hero */}
      <section className="py-16 px-6 text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">🔮 Insight Dome</h1>
          <p className="text-xl text-[#94a3b8]">
            AI-powered market intelligence and vendor ecosystem analytics.
          </p>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
              <div className="text-sm text-[#94a3b8] mb-1">Total Vendors</div>
              <div className="text-3xl font-bold text-white">{metrics?.vendors || 0}</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
              <div className="text-sm text-[#94a3b8] mb-1">Active Users</div>
              <div className="text-3xl font-bold text-white">{metrics?.users || 0}</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
              <div className="text-sm text-[#94a3b8] mb-1">Reports Generated</div>
              <div className="text-3xl font-bold text-white">{metrics?.reports || 0}</div>
            </div>
            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
              <div className="text-sm text-[#94a3b8] mb-1">Industries Covered</div>
              <div className="text-3xl font-bold text-white">{industries.length}</div>
            </div>
          </div>

          {/* Revenue Insights */}
          {revenue && (
            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Revenue Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* By Product */}
                <div>
                  <h3 className="text-sm text-[#94a3b8] mb-4">By Product</h3>
                  <div className="space-y-3">
                    {Object.entries(revenue.by_product || {}).map(([product, amount]: [string, any]) => (
                      <div key={product} className="flex items-center justify-between">
                        <span className="text-white text-sm">{product}</span>
                        <span className="text-[#10b981] font-bold">S${(amount / 100).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* By Type */}
                <div>
                  <h3 className="text-sm text-[#94a3b8] mb-4">By Revenue Type</h3>
                  <div className="space-y-3">
                    {Object.entries(revenue.by_type || {}).map(([type, amount]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-white text-sm capitalize">{type}</span>
                        <span className="text-[#10b981] font-bold">S${(amount / 100).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8]">Total Revenue</span>
                  <span className="text-2xl font-bold text-[#10b981]">
                    S${((revenue.total_revenue_cents || 0) / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Industry Distribution */}
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Sector Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {industries.slice(0, 12).map((ind: any) => {
                const maxCount = Math.max(...industries.map((i: any) => i.count), 1)
                const width = (ind.count / maxCount) * 100
                return (
                  <div key={ind.industry} className="flex items-center gap-3">
                    <div className="w-40 text-sm text-[#94a3b8] text-right truncate">{ind.industry}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-[#10b981] rounded-full"
                        style={{ width: `${Math.max(width, 3)}%` }}
                      />
                    </div>
                    <div className="w-12 text-xs text-[#94a3b8] text-right">{ind.count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
