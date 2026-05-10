'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const card: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, textAlign: 'center' }
const btn: React.CSSProperties = { padding: '12px 24px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600 }

export default function AcceptInvitePanel({ token }: { token: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<{ organisation_id: string; role: string } | null>(null)

  async function accept() {
    setBusy(true); setErr(null)
    const r = await fetch(`/api/enterprise/invites/${token}/accept`, { method: 'POST' })
    setBusy(false)
    if (r.status === 401) { router.push(`/login?next=/orgs/invites/${token}`); return }
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).detail || 'Could not accept invite'); return }
    setDone(await r.json())
  }

  return (
    <main style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={card}>
        {done ? (
          <>
            <h1 style={{ fontSize: 22, marginTop: 0 }}>You&apos;re in</h1>
            <p style={{ color: '#64748b' }}>You joined the organisation as <strong>{done.role}</strong>.</p>
            <button onClick={() => router.push(`/orgs/${done.organisation_id}/team`)} style={btn}>Go to team</button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, marginTop: 0 }}>Accept invitation</h1>
            <p style={{ color: '#64748b' }}>You&apos;ve been invited to join an organisation on BOOPPA. You must be signed in with the email address the invite was sent to.</p>
            {err && <div style={{ color: '#b91c1c', marginBottom: 16, fontSize: 14 }}>{err}</div>}
            <button onClick={accept} disabled={busy} style={btn}>{busy ? 'Accepting…' : 'Accept invite'}</button>
          </>
        )}
      </div>
    </main>
  )
}
