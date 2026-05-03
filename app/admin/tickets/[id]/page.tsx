'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, Send } from 'lucide-react'

interface Reply {
  id: string
  author: string
  author_type: string
  message: string
  is_internal: boolean
  created_at: string | null
}
interface TicketDetail {
  id: string
  ticket_id: string
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string | null
  replies: Reply[]
}

const STATUSES = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [data, setData] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [internal, setInternal] = useState(false)
  const [posting, setPosting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/cms/tickets/${id}`, { cache: 'no-store' })
    if (!res.ok) { setError(`Failed to load (${res.status})`); setLoading(false); return }
    setData(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function patch(payload: Partial<TicketDetail>) {
    const res = await fetch(`/api/admin/cms/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated = await res.json()
      setData(d => d ? { ...d, ...updated } : d)
    }
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setPosting(true)
    const res = await fetch(`/api/admin/cms/tickets/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply, is_internal: internal }),
    })
    setPosting(false)
    if (!res.ok) {
      alert(`Failed to post reply (${res.status})`)
      return
    }
    setReply('')
    setInternal(false)
    load()
  }

  if (loading) return <div className="flex items-center gap-2 text-neutral-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
  if (error || !data) return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
      <AlertCircle className="h-4 w-4" /> {error || 'Ticket not found'}
    </div>
  )

  return (
    <div className="max-w-3xl">
      <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> All tickets
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="font-mono text-xs text-amber-400">{data.ticket_id}</div>
            <h1 className="text-xl font-semibold text-white mt-1">{data.subject}</h1>
            <div className="text-xs text-neutral-500 mt-1">
              From {data.name} · {data.email} · category: {data.category}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <select value={data.status} onChange={e => patch({ status: e.target.value })} className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              {!STATUSES.includes(data.status) && <option value={data.status}>{data.status}</option>}
            </select>
            <select value={data.priority} onChange={e => patch({ priority: e.target.value })} className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              {!PRIORITIES.includes(data.priority) && <option value={data.priority}>{data.priority}</option>}
            </select>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-3 text-sm text-neutral-200 whitespace-pre-wrap">
          {data.message}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-neutral-300 mb-3">Replies</h2>
      <div className="space-y-3 mb-6">
        {data.replies.length === 0 && <div className="text-sm text-neutral-500">No replies yet.</div>}
        {data.replies.map(r => (
          <div key={r.id} className={`rounded-xl p-4 border ${r.is_internal ? 'bg-amber-500/5 border-amber-500/20' : 'bg-neutral-900 border-neutral-800'}`}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span><span className="text-neutral-300 font-medium">{r.author}</span> · {r.author_type}{r.is_internal && ' · internal'}</span>
              <span>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
            </div>
            <div className="text-sm text-neutral-200 whitespace-pre-wrap">{r.message}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submitReply} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          placeholder="Reply to customer…"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
        <div className="flex items-center justify-between mt-3">
          <label className="inline-flex items-center gap-2 text-xs text-neutral-400">
            <input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)} />
            Internal note (not sent to customer)
          </label>
          <button type="submit" disabled={posting || !reply.trim()} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {posting ? 'Posting…' : 'Send reply'}
          </button>
        </div>
      </form>
    </div>
  )
}
