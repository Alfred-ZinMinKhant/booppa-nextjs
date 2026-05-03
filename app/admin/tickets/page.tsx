'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'

interface Ticket {
  id: string
  ticket_id: string
  name: string
  email: string
  category: string
  subject: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string | null
}

export default function TicketsPage() {
  const [items, setItems] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/admin/cms/tickets', { cache: 'no-store' })
      if (!res.ok) { setError(`Failed to load (${res.status})`); setLoading(false); return }
      const data = await res.json()
      setItems(data.results || [])
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Support tickets</h1>
        <p className="text-sm text-neutral-400 mt-1">{items.length} tickets.</p>
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
          No tickets yet.
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">
                    <Link href={`/admin/tickets/${t.id}`} className="hover:underline">{t.ticket_id}</Link>
                  </td>
                  <td className="px-4 py-3 text-white">{t.subject}</td>
                  <td className="px-4 py-3 text-neutral-300 text-xs">
                    {t.name}<br/><span className="text-neutral-500">{t.email}</span>
                  </td>
                  <td className="px-4 py-3"><Pill text={t.status} /></td>
                  <td className="px-4 py-3"><Pill text={t.priority} variant={t.priority === 'high' || t.priority === 'urgent' ? 'red' : 'neutral'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Pill({ text, variant = 'neutral' }: { text: string; variant?: 'neutral' | 'red' }) {
  const cls = variant === 'red'
    ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${cls}`}>{text}</span>
  )
}
