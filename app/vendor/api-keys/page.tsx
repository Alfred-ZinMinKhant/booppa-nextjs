'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  KeyRound, Plus, Trash2, Copy, AlertCircle, Loader2, CheckCircle2, ArrowLeft,
} from 'lucide-react'

interface ApiKeyItem {
  id: string
  name: string
  prefix: string
  created_at: string | null
  last_used_at: string | null
  revoked_at: string | null
}

interface NewKey { id: string; name: string; prefix: string; key: string }

export default function ApiKeysPage() {
  const [items, setItems] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<NewKey | null>(null)
  const [copied, setCopied] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/api-keys', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || d?.error || `Failed (${r.status})`); return }
      setItems(d.items || [])
    } catch (e: any) {
      setError(e?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setCreatedKey({ id: d.id, name: d.name, prefix: d.prefix, key: d.key })
      setNewName('')
      load()
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (id: string) => {
    if (!confirm('Revoke this API key? Any clients using it will stop working immediately.')) return
    const r = await fetch(`/api/vendor/api-keys/${id}`, { method: 'DELETE' })
    if (r.ok) load()
    else setError(`Could not revoke (${r.status})`)
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-emerald-400" /> API Keys
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Use these tokens to authenticate API requests. Prefix with <code className="text-emerald-400">Authorization: Bearer</code>.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* New-key reveal */}
        {createdKey && (
          <div className="bg-emerald-900/20 border border-emerald-600/40 rounded-xl p-5">
            <p className="text-sm font-bold text-emerald-300 mb-2">
              New key created: {createdKey.name}
            </p>
            <p className="text-xs text-emerald-400/80 mb-3">
              This is the only time you will see the full secret. Save it now.
            </p>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5">
              <code className="text-xs text-emerald-300 font-mono break-all flex-1">{createdKey.key}</code>
              <button
                type="button"
                onClick={() => copy(createdKey.key)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCreatedKey(null)}
              className="text-xs text-neutral-400 hover:text-white mt-3"
            >
              I've saved it — dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-2">
          <input
            type="text"
            placeholder="Key name — e.g. 'Production server'"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={create}
            disabled={creating || !newName.trim()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate key
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
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Prefix</th>
                  <th className="px-4 py-3 text-left">Last used</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(k => (
                  <tr key={k.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                    <td className="px-4 py-3 text-white font-medium">{k.name}</td>
                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{k.prefix}…</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {k.revoked_at
                        ? <span className="text-red-400">Revoked</span>
                        : <span className="text-emerald-400">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!k.revoked_at && (
                        <button
                          type="button"
                          onClick={() => revoke(k.id)}
                          className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No API keys yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="font-semibold text-neutral-300 mb-1">Usage</p>
          <pre className="text-emerald-400/90 overflow-x-auto">{`curl -H "Authorization: Bearer bp_..." \\
  https://api.booppa.io/api/v1/vendor/status`}</pre>
        </div>
      </div>
    </main>
  )
}
