'use client'

import { useState, useEffect } from 'react'
import { config, endpoints } from '@/lib/config'
import type { IndustryCount } from '@/types'

/**
 * SectorDemandSignal — shows sector-level demand/supply signals
 * based on vendor counts and verification activity.
 */
export default function SectorDemandSignal() {
  const [industries, setIndustries] = useState<IndustryCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${config.apiUrl}/api/v1${endpoints.marketplace.industries}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = data?.industries || data || []
        setIndustries(list.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || industries.length === 0) return null

  const maxCount = Math.max(...industries.map(i => i.count), 1)

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
      <h3 className="text-lg font-bold text-[#0f172a] mb-1">Sector Demand Signals</h3>
      <p className="text-sm text-[#64748b] mb-6">Vendor density by industry — higher concentration indicates stronger market activity.</p>
      <div className="space-y-3">
        {industries.map((ind) => {
          const pct = (ind.count / maxCount) * 100
          const isHigh = pct > 66
          const isMedium = pct > 33
          return (
            <div key={ind.industry} className="flex items-center gap-3">
              <div className="w-36 text-sm text-[#64748b] text-right truncate">{ind.industry}</div>
              <div className="flex-1 bg-[#f1f5f9] rounded-full h-5">
                <div
                  className={`h-full rounded-full transition-all ${
                    isHigh ? 'bg-[#10b981]' : isMedium ? 'bg-yellow-400' : 'bg-[#94a3b8]'
                  }`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
              <div className="w-12 text-xs text-right font-medium text-[#0f172a]">{ind.count}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
