'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Webhook, Plus, Trash2, Send, AlertCircle, Loader2, CheckCircle2, XCircle,
  ArrowLeft, ChevronDown, ChevronRight, Copy,
} from 'lucide-react'

interface WebhookItem {
  id: string
  url: string
  description: string | null
  events: string[]
  active: boolean
  signing_secret_prefix: string
  created_at: string | null
}

interface DeliveryItem {
  id: string
  event_type: string
  response_status: number | null
  response_body: string
  attempt: number
  delivered_at: string | null
}

export default function WebhooksPage() {
  const [items, setItems] = useState<WebhookItem[]>([])
  const [availableEvents, setAvailableEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // create form
  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newEvents, setNewEvents] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [revealedSecret, setRevealedSecret] = useState<{ id: string; secret: string } | null>(null)

  // expanded delivery rows
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryItem[]>>({})
  const [testing, setTesting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/webhooks', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setItems(d.items || [])
      setAvailableEvents(d.available_events || [])
    } catch (e: any) {
      setError(e?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    setCreating(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl.trim(),
          description: newDesc.trim() || undefined,
          events: newEvents,
          active: true,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setRevealedSecret({ id: d.id, secret: d.signing_secret })
      setNewUrl(''); setNewDesc(''); setNewEvents([])
      load()
    } finally {
      setCreating(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this webhook? Events will stop being delivered to this endpoint.')) return
    const r = await fetch(`/api/vendor/webhooks/${id}`, { method: 'DELETE' })
    if (r.ok) load()
  }

  const toggle = async (it: WebhookItem) => {
    await fetch(`/api/vendor/webhooks/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !it.active }),
    })
    load()
  }

  const test = async (id: string) => {
    setTesting(id)
    try {
      const r = await fetch(`/api/vendor/webhooks/${id}/test`, { method: 'POST' })
      const d = await r.json()
      alert(d.delivered ? `OK — ${d.response_status}` : `Failed — ${d.response_status ?? 'network error'}\n${d.response_body || ''}`)
      // refresh deliveries view if expanded
      if (expandedId === id) loadDeliveries(id)
    } finally {
      setTesting(null)
    }
  }

  const loadDeliveries = async (id: string) => {
    const r = await fetch(`/api/vendor/webhooks/${id}/deliveries`, { cache: 'no-store' })
    const d = await r.json()
    setDeliveries(prev => ({ ...prev, [id]: d.items || [] }))
  }

  const expand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    loadDeliveries(id)
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Webhook className="h-6 w-6 text-emerald-400" /> Webhooks
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Register HTTPS endpoints to receive event notifications. Every payload is HMAC-signed with your secret in <code className="text-emerald-400">X-Booppa-Signature: sha256=…</code>.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {revealedSecret && (
          <div className="bg-emerald-900/20 border border-emerald-600/40 rounded-xl p-5">
            <p className="text-sm font-bold text-emerald-300 mb-2">Webhook created — copy the signing secret now</p>
            <p className="text-xs text-emerald-400/80 mb-3">
              You&apos;ll use this secret to verify <code>X-Booppa-Signature</code> on your receiver. It won&apos;t be shown in full again.
            </p>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5">
              <code className="text-xs text-emerald-300 font-mono break-all flex-1">{revealedSecret.secret}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(revealedSecret.secret)}
                className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <button onClick={() => setRevealedSecret(null)} className="text-xs text-neutral-400 hover:text-white mt-3">
              I&apos;ve saved it — dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">New webhook</p>
          <input
            type="url"
            placeholder="https://your-server.example.com/webhooks/booppa"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <input
            type="text"
            placeholder="Description (optional) — e.g. 'Compliance dashboard ingest'"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <div>
            <p className="text-xs text-neutral-400 mb-2">Events to subscribe to:</p>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map(ev => {
                const on = newEvents.includes(ev)
                return (
                  <button
                    key={ev}
                    type="button"
                    onClick={() => setNewEvents(on ? newEvents.filter(e => e !== ev) : [...newEvents, ev])}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      on
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {ev}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={create}
            disabled={creating || !newUrl.trim() || newEvents.length === 0}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create webhook
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-neutral-400 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center text-neutral-500 text-sm py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
            No webhooks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="bg-neutral-900 border border-neutral-800 rounded-xl">
                <div className="p-4 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => expand(it.id)}
                    className="text-neutral-400 hover:text-white mt-1"
                  >
                    {expandedId === it.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm break-all">{it.url}</p>
                    {it.description && <p className="text-xs text-neutral-500 mt-0.5">{it.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {it.events.map(e => (
                        <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      it.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-neutral-700 text-neutral-400'
                    }`}>{it.active ? 'Active' : 'Paused'}</span>
                    <button
                      type="button"
                      onClick={() => test(it.id)}
                      disabled={testing === it.id}
                      className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      {testing === it.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(it)}
                      className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      {it.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedId === it.id && (
                  <div className="border-t border-neutral-800 p-4 bg-neutral-950/40">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Recent deliveries</p>
                    {(deliveries[it.id] || []).length === 0 ? (
                      <p className="text-xs text-neutral-500">No deliveries yet. Hit &quot;Test&quot; to send a ping.</p>
                    ) : (
                      <div className="space-y-2">
                        {(deliveries[it.id] || []).map(d => {
                          const ok = d.response_status != null && d.response_status >= 200 && d.response_status < 300
                          return (
                            <div key={d.id} className="text-xs bg-neutral-900 border border-neutral-800 rounded px-3 py-2 flex items-start gap-2">
                              {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between gap-2">
                                  <span className="text-white font-mono">{d.event_type}</span>
                                  <span className="text-neutral-500">{d.delivered_at ? new Date(d.delivered_at).toLocaleString() : ''}</span>
                                </div>
                                <p className={`mt-0.5 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                  Status {d.response_status ?? 'no response'}
                                </p>
                                {d.response_body && (
                                  <p className="text-neutral-500 mt-0.5 break-all line-clamp-2">{d.response_body}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
