'use client'

import { useState } from 'react'
import { config, endpoints } from '@/lib/config'
import Link from 'next/link'
import type { MarketplaceVendor } from '@/types'

export default function ComparePage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<MarketplaceVendor[]>([])
  const [selected, setSelected] = useState<MarketplaceVendor[]>([])
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const searchVendors = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const res = await fetch(
        `/api/marketplace/search?q=${encodeURIComponent(q)}&per_page=10`
      )
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
    setSearch('')
    setResults([])
  }

  const removeVendor = (id: string) => {
    setSelected(selected.filter(v => v.id !== id))
    setComparison(null)
  }

  const runComparison = async () => {
    if (selected.length < 2) return
    setLoading(true)
    try {
      const ids = selected.map(v => v.id)
      const res = await fetch(`${config.apiUrl}/api/v1${endpoints.compare.vendors}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_ids: ids }),
      })
      if (res.ok) {
        setComparison(await res.json())
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Compare Vendors</h1>
          <p className="text-xl text-[#94a3b8]">
            Side-by-side comparison of up to 4 vendors. See trust scores, compliance status, and more.
          </p>
        </div>
      </section>

      {/* Selection */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search and add vendors to compare (max 4)..."
              value={search}
              onChange={(e) => searchVendors(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#10b981] transition-colors"
              disabled={selected.length >= 4}
            />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#e2e8f0] rounded-xl mt-1 shadow-lg max-h-[300px] overflow-y-auto z-20">
                {results.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => addVendor(v)}
                    disabled={!!selected.find(s => s.id === v.id)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] border-b border-[#e2e8f0] last:border-b-0 disabled:opacity-50 transition-colors"
                  >
                    <span className="font-medium text-[#0f172a]">{v.company_name}</span>
                    {v.industry && (
                      <span className="text-sm text-[#64748b] ml-2">· {v.industry}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected vendors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {selected.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-xl border border-[#10b981] relative">
                <button
                  onClick={() => removeVendor(v.id)}
                  className="absolute top-2 right-2 text-[#64748b] hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
                <h4 className="font-bold text-[#0f172a] text-sm pr-6 line-clamp-1">{v.company_name}</h4>
                <p className="text-xs text-[#64748b]">{v.industry || 'N/A'}</p>
                {v.trust_score !== null && v.trust_score !== undefined && (
                  <span className="text-[#10b981] font-bold text-sm">{v.trust_score}/100</span>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - selected.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-4 flex items-center justify-center text-[#94a3b8] text-sm">
                Add vendor
              </div>
            ))}
          </div>

          {/* Compare button */}
          <div className="text-center">
            <button
              onClick={runComparison}
              disabled={selected.length < 2 || loading}
              className="px-8 py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Comparing...' : `Compare ${selected.length} Vendors`}
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      {comparison && (
        <section className="py-12 px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Comparison Results</h2>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left p-4 text-sm text-[#64748b] font-medium">Attribute</th>
                    {comparison.vendors?.map((v: any) => (
                      <th key={v.id} className="text-center p-4 text-sm font-bold text-[#0f172a]">
                        {v.company_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="p-4 text-sm text-[#64748b]">Trust Score</td>
                    {comparison.vendors?.map((v: any) => (
                      <td key={v.id} className="p-4 text-center font-bold">
                        <span className={v.trust_score >= 80 ? 'text-[#10b981]' : v.trust_score >= 50 ? 'text-yellow-600' : 'text-red-500'}>
                          {v.trust_score ?? 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="p-4 text-sm text-[#64748b]">Industry</td>
                    {comparison.vendors?.map((v: any) => (
                      <td key={v.id} className="p-4 text-center text-sm text-[#0f172a]">{v.industry || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="p-4 text-sm text-[#64748b]">Tier</td>
                    {comparison.vendors?.map((v: any) => (
                      <td key={v.id} className="p-4 text-center text-sm text-[#0f172a] uppercase">{v.tier || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="p-4 text-sm text-[#64748b]">Country</td>
                    {comparison.vendors?.map((v: any) => (
                      <td key={v.id} className="p-4 text-center text-sm text-[#0f172a]">{v.country}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm text-[#64748b]">Verified</td>
                    {comparison.vendors?.map((v: any) => (
                      <td key={v.id} className="p-4 text-center">
                        {v.claimed ? <span className="text-[#10b981]">✓</span> : <span className="text-[#94a3b8]">—</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
