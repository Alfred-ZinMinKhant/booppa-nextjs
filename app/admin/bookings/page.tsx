'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, Mail, Phone, Calendar } from 'lucide-react'

interface Booking {
  id: string
  slot_id: string
  slot_date: string | null
  start_time: string
  end_time: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  notes: string | null
  status: string
  source: string | null
  created_at: string | null
}

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

export default function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/cms/bookings', { cache: 'no-store' })
    if (!res.ok) {
      setError(`Failed to load (${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.results || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    setSavingId(id)
    const res = await fetch(`/api/admin/cms/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSavingId(null)
    if (res.ok) {
      const updated = await res.json()
      setItems(items => items.map(b => b.id === id ? { ...b, status: updated.status } : b))
    } else {
      alert(`Update failed (${res.status})`)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Demo bookings</h1>
        <p className="text-sm text-neutral-400 mt-1">Customer-facing demo slot bookings.</p>
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
      ) : items.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400">
          No bookings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(b => (
            <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{b.customer_name}</span>
                    <span className="text-xs text-neutral-500 font-mono">#{b.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {b.slot_date} · {b.start_time}–{b.end_time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {b.customer_email}
                    </span>
                    {b.customer_phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {b.customer_phone}
                      </span>
                    )}
                  </div>
                  {b.notes && (
                    <p className="mt-2 text-sm text-neutral-300 whitespace-pre-wrap">{b.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={b.status}
                    disabled={savingId === b.id}
                    onChange={e => updateStatus(b.id, e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    {!STATUSES.includes(b.status as any) && <option value={b.status}>{b.status}</option>}
                  </select>
                  {savingId === b.id && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
