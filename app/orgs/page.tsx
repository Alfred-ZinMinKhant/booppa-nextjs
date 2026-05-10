import Link from 'next/link'
import { redirect } from 'next/navigation'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Org { id: string; name: string; slug: string; tier: string }

export default async function OrgsIndexPage() {
  const res = await fetchWithAuth('/api/v1/enterprise/organisations')
  if (res.status === 401) redirect('/login?next=/orgs')
  const orgs: Org[] = res.ok ? await res.json() : []

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Your organisations</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Manage members, invites, and the shared vendor watchlist.</p>

      {orgs.length === 0 ? (
        <div style={{ padding: 24, border: '1px dashed #cbd5e1', borderRadius: 12, color: '#64748b' }}>
          You don&apos;t belong to any organisation yet. Create one from the <Link href="/settings">settings</Link> page or accept an invite.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {orgs.map((o) => (
            <li key={o.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{o.slug} · {o.tier}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/orgs/${o.id}/team`} style={btn}>Team</Link>
                <Link href={`/orgs/${o.id}/watchlist`} style={btn}>Watchlist</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

const btn: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  background: '#0f172a',
  color: '#fff',
  textDecoration: 'none',
  fontSize: 13,
}
