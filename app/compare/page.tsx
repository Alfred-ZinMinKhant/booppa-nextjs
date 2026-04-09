'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MarketplaceVendor } from '@/types'

const ROWS: { key: keyof MarketplaceVendor; label: string }[] = [
  { key: 'trust_score',       label: 'Trust Score' },
  { key: 'tier',              label: 'Tier' },
  { key: 'industry',          label: 'Industry' },
  { key: 'country',           label: 'Country' },
  { key: 'city',              label: 'City' },
  { key: 'claimed',           label: 'Profile Claimed' },
  { key: 'entity_type',       label: 'Entity Type' },
  { key: 'uen',               label: 'UEN' },
  { key: 'domain',            label: 'Domain' },
  { key: 'short_description', label: 'Description' },
]

function scoreColor(score: number) {
  if (score >= 80) return 'text-[#10b981]'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

function renderCell(key: keyof MarketplaceVendor, value: unknown) {
  if (value === null || value === undefined || value === '') return <span className="text-[#94a3b8]">—</span>
  if (key === 'trust_score') {
    const n = value as number
    return <span className={`font-bold text-lg ${scoreColor(n)}`}>{n}<span className="text-xs font-normal text-[#94a3b8]">/100</span></span>
  }
  if (key === 'claimed') {
    return value
      ? <span className="inline-flex items-center gap-1 text-[#10b981] font-semibold text-sm"><span>✓</span> Claimed</span>
      : <span className="text-[#94a3b8] text-sm">Unclaimed</span>
  }
  if (key === 'tier') return <span className="uppercase font-medium text-sm">{String(value)}</span>
  if (key === 'short_description') return <span className="text-xs text-[#64748b] line-clamp-2">{String(value)}</span>
  return <span className="text-sm text-[#0f172a]">{String(value)}</span>
}

export default function ComparePage() {
  const [search, setSearch]       = useState('')
  const [results, setResults]     = useState<MarketplaceVendor[]>([])
  const [selected, setSelected]   = useState<MarketplaceVendor[]>([])
  const [matrix, setMatrix]       = useState<Record<string, Record<string, unknown>> | null>(null)
  const [loading, setLoading]     = useState(false)

  const searchVendors = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const res = await fetch(`/api/marketplace/search?q=${encodeURIComponent(q)}&per_page=10`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.vendors || [])
      }
    } catch { /* silent */ }
  }

  const addVendor = (vendor: MarketplaceVendor) => {
    if (selected.length >= 4) return
    if (selected.find(v => v.id === vendor.id)) return
    setSelected([...selected, vendor])
    setMatrix(null)
    setSearch('')
    setResults([])
  }

  const removeVendor = (id: string) => {
    setSelected(selected.filter(v => v.id !== id))
    setMatrix(null)
  }

  const runAnalysis = async () => {
    if (selected.length < 2) return
    setLoading(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_ids: selected.map(v => v.id) }),
      })
      if (res.ok) {
        const data = await res.json()
        setMatrix(data.matrix || null)
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  const showTable = selected.length >= 2

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Compare Vendors</h1>
          <p className="text-xl text-[#94a3b8]">
            Side-by-side comparison of up to 4 vendors — trust scores, compliance tier, entity data, and more.
          </p>
        </div>
      </section>

      {/* Search + selected chips */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={selected.length >= 4 ? 'Maximum 4 vendors selected' : 'Search vendors to compare (min 2, max 4)…'}
              value={search}
              onChange={(e) => searchVendors(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#10b981] transition-colors bg-white"
              disabled={selected.length >= 4}
            />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#e2e8f0] rounded-xl mt-1 shadow-lg max-h-[300px] overflow-y-auto z-20">
                {results.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => addVendor(v)}
                    disabled={!!selected.find(s => s.id === v.id)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] border-b border-[#e2e8f0] last:border-b-0 disabled:opacity-40 transition-colors"
                  >
                    <span className="font-medium text-[#0f172a]">{v.company_name}</span>
                    {v.industry && <span className="text-sm text-[#64748b] ml-2">· {v.industry}</span>}
                    {v.trust_score !== undefined && v.trust_score !== null && (
                      <span className={`ml-2 text-xs font-bold ${scoreColor(v.trust_score)}`}>{v.trust_score}/100</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected vendor chips */}
          <div className="flex flex-wrap gap-3 mb-6">
            {selected.map((v) => (
              <div key={v.id} className="flex items-center gap-2 bg-white border border-[#10b981] rounded-xl px-4 py-2">
                <span className="font-semibold text-[#0f172a] text-sm">{v.company_name}</span>
                {v.trust_score !== undefined && v.trust_score !== null && (
                  <span className={`text-xs font-bold ${scoreColor(v.trust_score)}`}>{v.trust_score}/100</span>
                )}
                <button
                  onClick={() => removeVendor(v.id)}
                  className="text-[#94a3b8] hover:text-red-500 transition-colors ml-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {selected.length < 2 && (
              <div className="flex items-center gap-2 border-2 border-dashed border-[#e2e8f0] rounded-xl px-4 py-2 text-[#94a3b8] text-sm">
                Add {2 - selected.length} more vendor{2 - selected.length > 1 ? 's' : ''} to compare
              </div>
            )}
          </div>

          {showTable && (
            <div className="flex justify-end mb-6">
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="px-6 py-2 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading ? 'Running analysis…' : 'Run deep analysis'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comparison table */}
      {showTable && (
        <section className="px-6 pb-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide w-40">Field</th>
                    {selected.map((v) => (
                      <th key={v.id} className="text-center px-6 py-4">
                        <Link
                          href={v.seo_slug ? `/vendors/${v.seo_slug}` : `/vendors/${v.id}`}
                          className="font-bold text-[#0f172a] hover:text-[#10b981] transition-colors"
                        >
                          {v.company_name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(({ key, label }, i) => {
                    // skip rows where all vendors have no data
                    const hasData = selected.some(v => v[key] !== undefined && v[key] !== null && v[key] !== '')
                    if (!hasData) return null
                    return (
                      <tr key={key} className={`border-b border-[#f1f5f9] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}`}>
                        <td className="px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</td>
                        {selected.map((v) => (
                          <td key={v.id} className="px-6 py-4 text-center">
                            {renderCell(key, v[key])}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix data from backend analysis */}
            {matrix && Object.keys(matrix).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-[#0f172a] mb-4">Deep Analysis</h3>
                <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide w-40">Dimension</th>
                        {selected.map((v) => (
                          <th key={v.id} className="text-center px-6 py-4 font-bold text-[#0f172a] text-sm">{v.company_name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(matrix).map(([dimension, vendorValues], i) => (
                        <tr key={dimension} className={`border-b border-[#f1f5f9] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}`}>
                          <td className="px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide capitalize">
                            {dimension.replace(/_/g, ' ')}
                          </td>
                          {selected.map((v) => {
                            const val = vendorValues[v.id]
                            return (
                              <td key={v.id} className="px-6 py-4 text-center text-sm text-[#0f172a]">
                                {val !== undefined && val !== null ? String(val) : <span className="text-[#94a3b8]">—</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-xs text-[#94a3b8] mt-4 text-center">
              Data sourced from BOOPPA Vendor Network. Last updated at time of profile scan.{' '}
              <Link href="/vendors" className="text-[#10b981] hover:underline">Browse all vendors →</Link>
            </p>
          </div>
        </section>
      )}

      {!showTable && (
        <section className="py-20 px-6 text-center">
          <p className="text-[#94a3b8] text-lg">Search and add at least 2 vendors above to start comparing.</p>
          <Link href="/vendors" className="mt-4 inline-block text-[#10b981] font-semibold hover:underline">
            Browse the vendor directory →
          </Link>
        </section>
      )}
    </main>
  )
}
