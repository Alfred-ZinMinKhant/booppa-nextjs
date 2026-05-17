'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Trash2, AlertCircle, Loader2, ArrowLeft, Mail } from 'lucide-react'

interface Subsidiary {
  id: string
  email: string
  full_name: string | null
  company: string | null
  uen: string | null
  plan: string | null
  is_active: boolean
  created_at: string | null
}

export default function SubsidiariesPage() {
  const [items, setItems] = useState<Subsidiary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [uen, setUen] = useState('')
  const [creating, setCreating] = useState(false)
  const [info, setInfo] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/subsidiaries', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setItems(d.items || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    setCreating(true)
    setError('')
    setInfo('')
    try {
      const r = await fetch('/api/vendor/subsidiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          full_name: fullName.trim() || undefined,
          company: company.trim() || undefined,
          uen: uen.trim() || undefined,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      if (d.needs_invite) {
        setInfo(`Account provisioned for ${d.email}. Send them a password-reset link from /forgot-password to complete onboarding.`)
      } else {
        setInfo(`Attached existing user ${d.email} to your tenant.`)
      }
      setEmail(''); setFullName(''); setCompany(''); setUen('')
      load()
    } finally {
      setCreating(false)
    }
  }

  const detach = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from your tenant? They keep their account but lose access to your aggregated views.`)) return
    const r = await fetch(`/api/vendor/subsidiaries/${id}`, { method: 'DELETE' })
    if (r.ok) load()
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-400" /> Subsidiaries
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage child entities under your Pro Suite tenant. Each subsidiary gets its own login but rolls up to your dashboard.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {info && (
          <div className="flex items-center gap-2 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
            <Mail className="h-4 w-4" /> {info}
          </div>
        )}

        {/* Add form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Add subsidiary</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="admin@subsidiary.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="text"
              placeholder="Contact full name (optional)"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="text"
              placeholder="UEN (optional)"
              value={uen}
              onChange={e => setUen(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={creating || !email.trim()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add subsidiary
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-neutral-400 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left">Subsidiary</th>
                  <th className="px-4 py-3 text-left">UEN</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{s.company || s.full_name || s.email}</p>
                      <p className="text-xs text-neutral-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 font-mono">{s.uen || '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-300">{s.plan || 'free'}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.is_active
                        ? <span className="text-emerald-400">Active</span>
                        : <span className="text-neutral-500">Disabled</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => detach(s.id, s.email)}
                        className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Detach
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No subsidiaries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
