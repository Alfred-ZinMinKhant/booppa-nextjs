'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Copy, Check } from 'lucide-react'

interface Organisation {
  id: string
  name: string
  slug: string
  tier: string
}

interface SsoState {
  configured: boolean
  organisation_id: string
  protocol?: 'saml' | 'oidc'
  is_active?: boolean
  idp_metadata_url?: string | null
  idp_entity_id?: string | null
  oidc_client_id?: string | null
  oidc_discovery_url?: string | null
  has_oidc_client_secret?: boolean
  acs_url?: string | null
  metadata_url?: string | null
  login_url?: string | null
  updated_at?: string | null
}

export default function SsoPage() {
  const [orgs, setOrgs] = useState<Organisation[]>([])
  const [orgId, setOrgId] = useState<string>('')
  const [state, setState] = useState<SsoState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // form
  const [protocol, setProtocol] = useState<'saml' | 'oidc'>('saml')
  const [idpMetadataUrl, setIdpMetadataUrl] = useState('')
  const [idpEntityId, setIdpEntityId] = useState('')
  const [oidcClientId, setOidcClientId] = useState('')
  const [oidcClientSecret, setOidcClientSecret] = useState('')
  const [oidcDiscoveryUrl, setOidcDiscoveryUrl] = useState('')
  const [isActive, setIsActive] = useState(false)

  // Load orgs the user belongs to.
  useEffect(() => {
    fetch('/api/enterprise/organisations', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          throw new Error(d?.error || `Failed to load organisations (${r.status})`)
        }
        return r.json()
      })
      .then((data: Organisation[]) => {
        setOrgs(data)
        if (data.length > 0) setOrgId(data[0].id)
        else setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  // Load current SSO config for the selected org.
  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    setInfo(''); setError('')
    fetch(`/api/enterprise/sso?org_id=${encodeURIComponent(orgId)}`, { cache: 'no-store' })
      .then(async r => {
        const d = await r.json()
        if (!r.ok) { setError(d?.detail || d?.error || `Failed (${r.status})`); return }
        setState(d)
        if (d.configured) {
          setProtocol(d.protocol)
          setIdpMetadataUrl(d.idp_metadata_url || '')
          setIdpEntityId(d.idp_entity_id || '')
          setOidcClientId(d.oidc_client_id || '')
          setOidcDiscoveryUrl(d.oidc_discovery_url || '')
          setIsActive(!!d.is_active)
        } else {
          setProtocol('saml')
          setIdpMetadataUrl('')
          setIdpEntityId('')
          setOidcClientId('')
          setOidcDiscoveryUrl('')
          setOidcClientSecret('')
          setIsActive(false)
        }
      })
      .finally(() => setLoading(false))
  }, [orgId])

  const save = async () => {
    setSaving(true)
    setError(''); setInfo('')
    try {
      const payload: Record<string, unknown> = {
        protocol,
        is_active: isActive,
      }
      if (protocol === 'saml') {
        payload.idp_metadata_url = idpMetadataUrl.trim() || null
        payload.idp_entity_id = idpEntityId.trim() || null
      } else {
        payload.discovery_url = oidcDiscoveryUrl.trim() || null
        payload.client_id = oidcClientId.trim() || null
        if (oidcClientSecret.trim()) payload.client_secret = oidcClientSecret.trim()
      }

      const r = await fetch(`/api/enterprise/sso?org_id=${encodeURIComponent(orgId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || d?.error || `Failed (${r.status})`); return }
      // Merge the response (which carries acs_url + metadata_url) into state.
      setState(prev => ({ ...(prev || { configured: true, organisation_id: orgId }), ...d, configured: true }))
      setInfo('SSO configuration saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && orgs.length === 0 && !error) {
    return <main className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="h-6 w-6 text-emerald-400 animate-spin" /></main>
  }

  if (orgs.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
          </Link>
          <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h1 className="text-xl font-bold text-white mb-2">No enterprise organisation</h1>
            <p className="text-sm text-neutral-400">
              SSO is available on Pro Suite. Activate an organisation first.
            </p>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-400" /> Single Sign-On
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Connect your identity provider to enforce SSO for everyone in your tenant.
          </p>
        </div>

        {orgs.length > 1 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Organisation</label>
            <select
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
            >
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {info && (
          <div className="flex items-center gap-2 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
            <ShieldCheck className="h-4 w-4" /> {info}
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Protocol</p>
            <div className="flex gap-2">
              {(['saml', 'oidc'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProtocol(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    protocol === p
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {protocol === 'saml' ? (
            <>
              <Field label="IdP metadata URL" value={idpMetadataUrl} onChange={setIdpMetadataUrl} placeholder="https://idp.example.com/saml/metadata" />
              <Field label="IdP entity ID (optional)" value={idpEntityId} onChange={setIdpEntityId} placeholder="https://idp.example.com" />
              {state?.configured && state.protocol === 'saml' && (
                <div className="space-y-2">
                  <UrlRow label="ACS URL (configure on your IdP)" value={state.acs_url} />
                  <UrlRow label="SP metadata URL (paste into your IdP)" value={state.metadata_url} />
                  <UrlRow label="SP-initiated login URL" value={state.login_url} />
                </div>
              )}
            </>
          ) : (
            <>
              <Field label="OIDC discovery URL" value={oidcDiscoveryUrl} onChange={setOidcDiscoveryUrl} placeholder="https://login.example.com/.well-known/openid-configuration" />
              <Field label="Client ID" value={oidcClientId} onChange={setOidcClientId} />
              <Field label="Client secret" value={oidcClientSecret} onChange={setOidcClientSecret} type="password" placeholder={state?.has_oidc_client_secret ? '••••••••' : ''} />
            </>
          )}

          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            <div>
              <p className="text-sm text-white font-semibold">Enable SSO for this tenant</p>
              <p className="text-xs text-neutral-500">When enabled, the SP-initiated login URL above will accept logins.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isActive ? 'bg-emerald-500' : 'bg-neutral-700'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save SSO configuration
          </button>
        </div>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, type, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      />
      {hint && <p className="text-[11px] text-neutral-500 mt-1">{hint}</p>}
    </div>
  )
}

function UrlRow({ label, value }: { label: string; value?: string | null }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {/* clipboard blocked */}
  }
  return (
    <div className="text-xs bg-neutral-950 border border-neutral-800 rounded p-3">
      <p className="text-neutral-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="text-emerald-400 break-all flex-1 font-mono">{value}</code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 text-neutral-400 hover:text-white p-1 rounded"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
