'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, AlertCircle, Loader2, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react'

interface SsoState {
  configured?: boolean
  protocol?: 'saml' | 'oidc'
  idp_metadata_url?: string | null
  has_idp_metadata_xml?: boolean
  sp_entity_id?: string | null
  oidc_issuer?: string | null
  oidc_client_id?: string | null
  has_oidc_client_secret?: boolean
  allowed_email_domain?: string | null
  enabled?: boolean
  updated_at?: string | null
}

export default function SsoPage() {
  const [state, setState] = useState<SsoState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // form
  const [protocol, setProtocol] = useState<'saml' | 'oidc'>('saml')
  const [idpMetadataUrl, setIdpMetadataUrl] = useState('')
  const [idpMetadataXml, setIdpMetadataXml] = useState('')
  const [spEntityId, setSpEntityId] = useState('')
  const [oidcIssuer, setOidcIssuer] = useState('')
  const [oidcClientId, setOidcClientId] = useState('')
  const [oidcClientSecret, setOidcClientSecret] = useState('')
  const [allowedDomain, setAllowedDomain] = useState('')
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    fetch('/api/vendor/sso', { cache: 'no-store' })
      .then(async r => {
        const d = await r.json()
        if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
        setState(d)
        if (d.configured) {
          setProtocol(d.protocol)
          setIdpMetadataUrl(d.idp_metadata_url || '')
          setSpEntityId(d.sp_entity_id || '')
          setOidcIssuer(d.oidc_issuer || '')
          setOidcClientId(d.oidc_client_id || '')
          setAllowedDomain(d.allowed_email_domain || '')
          setEnabled(!!d.enabled)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setError(''); setInfo('')
    try {
      const r = await fetch('/api/vendor/sso', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          idp_metadata_url: protocol === 'saml' ? (idpMetadataUrl.trim() || null) : null,
          idp_metadata_xml: protocol === 'saml' ? (idpMetadataXml.trim() || null) : null,
          sp_entity_id: protocol === 'saml' ? (spEntityId.trim() || null) : null,
          oidc_issuer: protocol === 'oidc' ? (oidcIssuer.trim() || null) : null,
          oidc_client_id: protocol === 'oidc' ? (oidcClientId.trim() || null) : null,
          oidc_client_secret: protocol === 'oidc' ? (oidcClientSecret.trim() || null) : null,
          allowed_email_domain: allowedDomain.trim() || null,
          enabled,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setInfo('SSO configuration saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="h-6 w-6 text-emerald-400 animate-spin" /></main>
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

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-200/90">
            <p className="font-semibold mb-0.5">Beta — config storage only</p>
            <p className="text-xs text-amber-200/70">
              SSO config can be saved here, but assertion verification (SAML ACS, OIDC callback)
              is stubbed pending <code>python3-saml</code> / <code>authlib</code> integration.
              Don&apos;t enable in production until that&apos;s wired.
            </p>
          </div>
        </div>

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
              <FieldArea label="IdP metadata XML (alternative — paste directly)" value={idpMetadataXml} onChange={setIdpMetadataXml} placeholder="<EntityDescriptor …>" />
              <Field label="Service-provider entity ID (yours)" value={spEntityId} onChange={setSpEntityId} placeholder="https://booppa.io/sso/yourtenant" />
              <div className="text-xs text-neutral-500 bg-neutral-950 border border-neutral-800 rounded p-3 font-mono">
                ACS URL to configure on your IdP: <span className="text-emerald-400 break-all">https://api.booppa.io/api/v1/vendor/sso/acs</span>
              </div>
            </>
          ) : (
            <>
              <Field label="Issuer URL" value={oidcIssuer} onChange={setOidcIssuer} placeholder="https://login.example.com" />
              <Field label="Client ID" value={oidcClientId} onChange={setOidcClientId} />
              <Field label="Client secret" value={oidcClientSecret} onChange={setOidcClientSecret} type="password" placeholder={state?.has_oidc_client_secret ? '••••••••' : ''} />
              <div className="text-xs text-neutral-500 bg-neutral-950 border border-neutral-800 rounded p-3 font-mono">
                Callback URL to register with your IdP: <span className="text-emerald-400 break-all">https://api.booppa.io/api/v1/vendor/sso/oidc/callback</span>
              </div>
            </>
          )}

          <Field
            label="Allowed email domain"
            value={allowedDomain}
            onChange={setAllowedDomain}
            placeholder="example.com"
            hint="New users from this domain are auto-attached to your tenant on first SSO login."
          />

          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            <div>
              <p className="text-sm text-white font-semibold">Enable SSO for this tenant</p>
              <p className="text-xs text-neutral-500">When enabled, password login is disabled for users in your allowed domain.</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? 'bg-emerald-500' : 'bg-neutral-700'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
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

function FieldArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      />
    </div>
  )
}
