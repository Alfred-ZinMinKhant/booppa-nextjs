'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface Member { user_id: string; email: string | null; role: string; created_at: string | null }
interface Invite { id: string; email: string; role: string; expires_at: string }
interface Seats { used: number; pending_invites: number; limit: number | null; remaining: number | null }

const card: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 20 }
const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 8, background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }
const btnGhost: React.CSSProperties = { ...btn, background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1' }
const inp: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, flex: 1 }

export default function TeamPanel({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [seats, setSeats] = useState<Seats | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    const [m, i, s] = await Promise.all([
      fetch(`/api/enterprise/organisations/${orgId}/members`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/enterprise/organisations/${orgId}/invites`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/enterprise/seats?org_id=${encodeURIComponent(orgId)}`).then((r) => r.ok ? r.json() : null),
    ])
    setMembers(m)
    setInvites(i)
    setSeats(s as Seats | null)
  }, [orgId])

  useEffect(() => { load() }, [load])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null); setMsg(null)
    const res = await fetch(`/api/enterprise/organisations/${orgId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    setBusy(false)
    if (!res.ok) { setErr((await res.json().catch(() => ({}))).detail || 'Failed to invite'); return }
    setEmail(''); setMsg(`Invite sent to ${email}`); load()
  }

  async function revokeInvite(id: string) {
    if (!confirm('Revoke this invite?')) return
    const res = await fetch(`/api/enterprise/organisations/${orgId}/invites/${id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) load()
  }

  async function removeMember(uid: string) {
    if (!confirm('Remove this member from the organisation?')) return
    const res = await fetch(`/api/enterprise/organisations/${orgId}/members/${uid}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) load()
  }

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/orgs" style={{ fontSize: 13, color: '#64748b' }}>← All organisations</Link>
      <h1 style={{ fontSize: 28, margin: '12px 0 24px' }}>Team</h1>

      {seats && (
        <section style={{ ...card, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Seats used
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {seats.used + seats.pending_invites}
              <span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>
                {' '}/ {seats.limit === null ? '∞' : seats.limit}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {seats.used} active member{seats.used === 1 ? '' : 's'}
              {seats.pending_invites > 0 ? ` · ${seats.pending_invites} pending invite${seats.pending_invites === 1 ? '' : 's'}` : ''}
            </div>
          </div>
          {seats.limit !== null && seats.remaining === 0 && (
            <Link href="/pricing" style={{ ...btn, textDecoration: 'none', background: '#10b981' }}>
              Upgrade plan
            </Link>
          )}
        </section>
      )}

      <section style={card}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Invite a teammate</h2>
        <form onSubmit={invite} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="email" required placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} disabled={seats?.remaining === 0} />
          <select value={role} onChange={(e) => setRole(e.target.value as 'member' | 'admin')} style={{ ...inp, flex: 'none', width: 120 }} disabled={seats?.remaining === 0}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={busy || seats?.remaining === 0}
            title={seats?.remaining === 0 ? 'Seat limit reached — upgrade to invite more team members' : undefined}
            style={{ ...btn, opacity: busy || seats?.remaining === 0 ? 0.5 : 1, cursor: seats?.remaining === 0 ? 'not-allowed' : 'pointer' }}
          >
            {busy ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {seats?.remaining === 0 && (
          <div style={{ color: '#b45309', marginTop: 12, fontSize: 13 }}>
            Seat limit reached. Remove a member or upgrade your plan to invite more.
          </div>
        )}
        {err && <div style={{ color: '#b91c1c', marginTop: 12, fontSize: 13 }}>{err}</div>}
        {msg && <div style={{ color: '#047857', marginTop: 12, fontSize: 13 }}>{msg}</div>}
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Pending invites ({invites.length})</h2>
        {invites.length === 0 ? <div style={{ color: '#64748b', fontSize: 14 }}>No pending invites.</div> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {invites.map((i) => (
              <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{i.email}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{i.role} · expires {new Date(i.expires_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => revokeInvite(i.id)} style={btnGhost}>Revoke</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Members ({members.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {members.map((m) => (
            <li key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{m.email || m.user_id}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{m.role}</div>
              </div>
              {m.role !== 'owner' && (
                <button onClick={() => removeMember(m.user_id)} style={btnGhost}>Remove</button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
