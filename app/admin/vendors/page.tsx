'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react'
import { adminApiFetch } from '@/lib/adminApiClient'

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
  const [acraState, setAcraState] = useState<'idle' | 'running' | 'queued' | 'error'>('idle')
  const [acraMsg, setAcraMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search.trim()) params.set('q', search.trim())
    const res = await adminApiFetch(`/api/admin/api/admin/vendors?${params}`, { cache: 'no-store' })
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

  // Kicks off the targeted ACRA pass over every UEN in our own data. The button
  // exists because the alternative is waiting for the Wednesday 06:00 beat entry,
  // and until one cycle completes `registry_status` is NULL on every profile.
  //
  // Deliberately does NOT reload the table afterwards: the pass runs for minutes
  // in a Celery worker and chains itself across several bounded passes, so an
  // immediate refetch would show unchanged rows and read as "the button did
  // nothing". The coverage numbers land in the worker log, not in this response.
  const runAcraRefresh = useCallback(async () => {
    setAcraState('running')
    setAcraMsg('')
    try {
      const res = await adminApiFetch('/api/admin/api/admin/acra/refresh-targeted', { method: 'POST' })
      if (!res.ok) {
        setAcraState('error')
        setAcraMsg(`Could not queue the refresh (${res.status}).`)
        return
      }
      const data = await res.json()
      setAcraState('queued')
      // A pass already in flight takes the same Redis lock and no-ops rather than
      // running twice, so this cannot promise the work started — only that it was
      // accepted.
      setAcraMsg(
        `Queued${data.task_id ? ` (task ${String(data.task_id).slice(0, 8)})` : ''}. ` +
        `Runs in the background over several passes; if one is already in progress this is a no-op.`,
      )
    } catch {
      setAcraState('error')
      setAcraMsg('Could not reach the admin API.')
    }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Vendors</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} marketplace vendors · list is read-only.</p>
        </div>
        <button
          type="button"
          onClick={runAcraRefresh}
          disabled={acraState === 'running'}
          title="Fetch current ACRA registration date and registry status for every UEN in our data"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <RefreshCw className={`h-4 w-4 ${acraState === 'running' ? 'animate-spin' : ''}`} />
          {acraState === 'running' ? 'Queueing…' : 'Refresh ACRA registry'}
        </button>
      </div>

      {acraMsg && (
        <div
          className={`text-sm rounded-lg px-3 py-2.5 mb-4 border ${
            acraState === 'error'
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
          }`}
        >
          {acraMsg}
        </div>
      )}

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
