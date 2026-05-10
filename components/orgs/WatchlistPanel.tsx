'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface WatchItem { id: string; vendor_ref: string; vendor_name: string | null; notes: string | null; added_by_user_id: string; created_at: string | null }
interface Comment { id: string; author_user_id: string; body: string; created_at: string | null }

const card: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 20 }
const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 8, background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }
const btnGhost: React.CSSProperties = { ...btn, background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1' }
const inp: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, width: '100%', boxSizing: 'border-box' }

export default function WatchlistPanel({ orgId }: { orgId: string }) {
  const [items, setItems] = useState<WatchItem[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState('')
  const [vendorRef, setVendorRef] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    const r = await fetch(`/api/enterprise/organisations/${orgId}/watchlist`)
    setItems(r.ok ? await r.json() : [])
  }, [orgId])
  useEffect(() => { load() }, [load])

  async function openItem(id: string) {
    if (openId === id) { setOpenId(null); return }
    setOpenId(id); setNewComment('')
    const r = await fetch(`/api/enterprise/organisations/${orgId}/watchlist/${id}/comments`)
    if (r.ok) {
      const data = await r.json()
      setComments((c) => ({ ...c, [id]: data }))
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const r = await fetch(`/api/enterprise/organisations/${orgId}/watchlist`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_ref: vendorRef, vendor_name: vendorName || null, notes: notes || null }),
    })
    setBusy(false)
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).detail || 'Failed to add'); return }
    setVendorRef(''); setVendorName(''); setNotes(''); load()
  }

  async function removeItem(id: string) {
    if (!confirm('Remove this vendor from the watchlist?')) return
    const r = await fetch(`/api/enterprise/organisations/${orgId}/watchlist/${id}`, { method: 'DELETE' })
    if (r.ok || r.status === 204) { setOpenId(null); load() }
  }

  async function postComment(itemId: string) {
    const text = newComment.trim()
    if (!text) return
    const r = await fetch(`/api/enterprise/organisations/${orgId}/watchlist/${itemId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: text }),
    })
    if (!r.ok) return
    setNewComment('')
    const refresh = await fetch(`/api/enterprise/organisations/${orgId}/watchlist/${itemId}/comments`)
    if (refresh.ok) {
      const data = await refresh.json()
      setComments((c) => ({ ...c, [itemId]: data }))
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/orgs" style={{ fontSize: 13, color: '#64748b' }}>← All organisations</Link>
      <h1 style={{ fontSize: 28, margin: '12px 0 24px' }}>Shared vendor watchlist</h1>

      <section style={card}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Add a vendor</h2>
        <form onSubmit={addItem} style={{ display: 'grid', gap: 8 }}>
          <input required placeholder="Vendor slug or UEN (vendor_ref)" value={vendorRef} onChange={(e) => setVendorRef(e.target.value)} style={inp} />
          <input placeholder="Display name (optional)" value={vendorName} onChange={(e) => setVendorName(e.target.value)} style={inp} />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inp, minHeight: 60, fontFamily: 'inherit' }} />
          <div><button type="submit" disabled={busy} style={btn}>{busy ? 'Adding…' : 'Add to watchlist'}</button></div>
          {err && <div style={{ color: '#b91c1c', fontSize: 13 }}>{err}</div>}
        </form>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Watchlist ({items.length})</h2>
        {items.length === 0 ? <div style={{ color: '#64748b', fontSize: 14 }}>No vendors yet.</div> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((it) => (
              <li key={it.id} style={{ borderTop: '1px solid #f1f5f9', padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{it.vendor_name || it.vendor_ref}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{it.vendor_ref}</div>
                    {it.notes && <div style={{ fontSize: 13, color: '#334155', marginTop: 6, whiteSpace: 'pre-wrap' }}>{it.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openItem(it.id)} style={btnGhost}>{openId === it.id ? 'Hide' : 'Comments'}</button>
                    <button onClick={() => removeItem(it.id)} style={btnGhost}>Remove</button>
                  </div>
                </div>

                {openId === it.id && (
                  <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    {(comments[it.id] || []).map((c) => (
                      <div key={c.id} style={{ marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 13 }}>{c.body}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.created_at && new Date(c.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment…" style={inp} />
                      <button onClick={() => postComment(it.id)} style={btn}>Post</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
