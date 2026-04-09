'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { config, endpoints } from '@/lib/config'
import type { MarketplaceVendor, IndustryCount } from '@/types'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([])
  const [industries, setIndustries] = useState<IndustryCount[]>([])
  const [query, setQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (selectedIndustry) params.set('industry', selectedIndustry)
      params.set('page', String(page))
      params.set('per_page', '24')

      const res = await fetch(`/api/marketplace/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setVendors(data.vendors || [])
        setTotal(data.total || 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [query, selectedIndustry, page])

  const fetchIndustries = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketplace/industries`)
      if (res.ok) {
        const data = await res.json()
        setIndustries(data.industries || data || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  const totalPages = Math.ceil(total / 24)

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">Vendor Directory</h1>
          <p className="text-xl text-[#94a3b8] max-w-[600px] mx-auto">
            Discover verified vendors across Singapore. Search by industry, name, or trust score.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 px-6 bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="flex-1 px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#10b981] transition-colors"
          />
          <select
            value={selectedIndustry}
            onChange={(e) => { setSelectedIndustry(e.target.value); setPage(1) }}
            className="px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] bg-white focus:outline-none focus:border-[#10b981] transition-colors min-w-[200px]"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind.industry} value={ind.industry}>
                {ind.industry} ({ind.count})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <p className="text-[#64748b]">
              {loading ? 'Loading...' : `${total} vendors found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-[#e2e8f0] animate-pulse">
                  <div className="h-6 bg-[#e2e8f0] rounded w-3/4 mb-4" />
                  <div className="h-4 bg-[#e2e8f0] rounded w-1/2 mb-2" />
                  <div className="h-4 bg-[#e2e8f0] rounded w-full" />
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">No vendors found</h3>
              <p className="text-[#64748b]">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={vendor.seo_slug ? `/vendors/${vendor.seo_slug}` : `/vendors/${vendor.id}`}
                  className="bg-white p-6 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:translate-y-[-3px] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#10b981] transition-colors line-clamp-1">
                      {vendor.company_name}
                    </h3>
                    {vendor.trust_score !== null && vendor.trust_score !== undefined && (
                      <span className={`
                        text-sm font-bold px-2 py-1 rounded-lg
                        ${vendor.trust_score >= 80 ? 'bg-[#10b981]/10 text-[#10b981]' :
                          vendor.trust_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-600'}
                      `}>
                        {vendor.trust_score}/100
                      </span>
                    )}
                  </div>

                  {vendor.industry && (
                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#f1f5f9] text-[#64748b] mb-3">
                      {vendor.industry}
                    </span>
                  )}

                  {vendor.short_description && (
                    <p className="text-sm text-[#64748b] line-clamp-2 mb-3">
                      {vendor.short_description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                    <span>{vendor.country}</span>
                    {vendor.claimed && (
                      <span className="text-[#10b981] font-medium">✓ Claimed</span>
                    )}
                    {vendor.tier && (
                      <span className="font-medium uppercase">{vendor.tier}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:border-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-[#64748b]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:border-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Industry Sections */}
      {industries.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-8">Browse by Industry</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {industries.map((ind) => (
                <button
                  key={ind.industry}
                  onClick={() => { setSelectedIndustry(ind.industry); setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="p-4 rounded-xl border border-[#e2e8f0] text-left hover:border-[#10b981] hover:bg-[#10b981]/5 transition-all"
                >
                  <span className="font-bold text-[#0f172a] block">{ind.industry}</span>
                  <span className="text-sm text-[#64748b]">{ind.count} vendors</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
