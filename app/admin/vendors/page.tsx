'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'

interface Vendor {
  id: string
  company_name: string
  slug: string
  domain: string | null
  website: string | null
  uen: string | null
  industry: string | null
  country: string | null
  city: string | null
  contact_email: string | null
  scan_status: string
  created_at: string | null
}

export default function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search.trim()) params.set('q', search.trim())
    const res = await fetch(`/api/admin/api/admin/vendors?${params}`, { cache: 'no-store' })
    if (!res.ok) {
      setError(`Failed to load (${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Vendors</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} marketplace vendors · read-only.</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="search"
          placeholder="Search by company name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Industry</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">UEN</th>
                <th className="px-4 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {items.map(v => (
                <tr key={v.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{v.company_name}</div>
                    <div className="text-xs text-neutral-500 font-mono">/{v.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{v.industry || '—'}</td>
                  <td className="px-4 py-3 text-neutral-300">{v.country || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{v.uen || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{v.contact_email || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No vendors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
