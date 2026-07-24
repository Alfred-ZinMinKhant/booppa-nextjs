'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, AlertCircle, Search, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { adminApiFetch } from '@/lib/adminApiClient'

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string | null
  company: string | null
  uen: string | null
  plan: string | null
  subscription_tier: string | null
  is_active: boolean
  verified: boolean
  has_stripe_subscription: boolean
  notarization_credits: number
  compliance_evidence_credits: number
  signed_cover_sheet_uploaded: boolean
  created_at: string | null
}

const ROLES = ['', 'VENDOR', 'PROCUREMENT', 'GOV_BUYER', 'ADMIN']
const PAGE_SIZE = 50

function roleBadge(role: string | null) {
  const r = (role || 'VENDOR').toUpperCase()
  const colors: Record<string, string> = {
    VENDOR: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    PROCUREMENT: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    GOV_BUYER: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ADMIN: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }
  const cls = colors[r] || 'bg-neutral-700/40 text-neutral-300 border-neutral-600'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {r}
    </span>
  )
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [offset, setOffset] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (search.trim()) params.set('q', search.trim())
    if (role) params.set('role', role)
    try {
      const res = await adminApiFetch(`/api/admin/api/admin/users?${params}`, { cache: 'no-store' })
      if (!res.ok) {
        setError(`Failed to load (${res.status})`)
        setLoading(false)
        return
      }
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [search, role, offset])

  useEffect(() => { load() }, [load])

  // Reset to first page when filters change
  useEffect(() => { setOffset(0) }, [search, role])

  const page = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} accounts · search, filter, inspect.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="search"
            placeholder="Search email, name, or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        >
          {ROLES.map(r => (
            <option key={r || 'all'} value={r}>{r || 'All roles'}</option>
          ))}
        </select>
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
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Credits</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{u.full_name || '—'}</div>
                      <div className="text-xs text-neutral-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">
                      <div className="text-neutral-200">{u.company || '—'}</div>
                      {u.uen && <div className="text-[10px] text-neutral-500 font-mono">UEN {u.uen}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-neutral-200">{u.plan || 'free'}</div>
                      {u.has_stripe_subscription && (
                        <div className="text-[10px] text-violet-400 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Stripe sub
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-neutral-300">Notar.: <span className="font-mono text-white">{u.notarization_credits}</span></div>
                      <div className="text-neutral-400">CE: <span className="font-mono">{u.compliance_evidence_credits}</span></div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className={`inline-flex items-center gap-1 ${u.is_active ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Disabled'}
                      </div>
                      <div className={`text-[10px] ${u.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {u.verified ? 'Verified' : 'Unverified'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 text-sm text-neutral-400">
              <div>Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
