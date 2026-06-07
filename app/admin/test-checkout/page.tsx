'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, ExternalLink, Building2, CheckCircle2 } from 'lucide-react'

type Dispatch = 'subscription' | 'bundle' | 'rfp' | 'rfp-deferred' | 'standalone'

interface SimResponse {
  ok: boolean
  product_type: string
  dispatch: Dispatch
  details: Record<string, unknown>
}

interface SimRow extends SimResponse {
  at: string
  identity_email: string
  identity_label: string
}

interface Sku {
  product_type: string
  label: string
  needsRfp?: boolean
}

// Two persisted test identities so the operator can run Standard Suite (A) and
// Pro Suite (B) side-by-side without retyping email/url/company between clicks.
// localStorage round-trips them across page reloads. "Manual" lets the operator
// fall back to ad-hoc edits in the legacy single-field block at the bottom of
// the SectionGroups (kept for compatibility with the older SKU workflow).
type IdentityKey = 'A' | 'B'

interface Identity {
  email: string
  company: string
  url: string
}

const IDENTITY_DEFAULTS: Record<IdentityKey, Identity> = {
  A: {
    email: 'test+suite-a@booppa.io',
    company: 'Suite Test Co A',
    url: 'https://suite-a.booppa.io',
  },
  B: {
    email: 'test+suite-b@booppa.io',
    company: 'Suite Test Co B',
    url: 'https://suite-b.booppa.io',
  },
}

const STORAGE_KEY = 'booppa_admin_test_identities'

// One-time — For Vendors
const ONE_TIME_VENDORS: Sku[] = [
  { product_type: 'vendor_proof', label: 'Vendor Proof' },
  { product_type: 'pdpa_quick_scan', label: 'PDPA Snapshot' },
  { product_type: 'rfp_complete', label: 'RFP Complete', needsRfp: true },
  { product_type: 'compliance_evidence_pack', label: 'Compliance Bundle' },
  { product_type: 'compliance_notarization_1', label: 'Notarization (1 doc)' },
]

// One-time — For Buyers
const ONE_TIME_BUYERS: Sku[] = [
  { product_type: 'notarization_addon_1', label: 'Extra Notarization' },
]

// Subscriptions — For Vendors
const SUBS_VENDORS: Sku[] = [
  { product_type: 'vendor_active_monthly', label: 'Vendor Active — monthly' },
  { product_type: 'vendor_active_annual', label: 'Vendor Active — annual' },
  { product_type: 'vendor_pro_monthly', label: 'Vendor Pro — monthly' },
  { product_type: 'vendor_pro_annual', label: 'Vendor Pro — annual' },
  { product_type: 'pdpa_monitor_monthly', label: 'PDPA Monitor — monthly' },
  { product_type: 'compliance_evidence_monthly', label: 'Compliance Evidence — monthly' },
  { product_type: 'tender_intelligence_monthly', label: 'Tender Intelligence — monthly' },
  { product_type: 'tender_intelligence_annual', label: 'Tender Intelligence — annual' },
  { product_type: 'compliance_notarization_10', label: 'Small Batch — 10 notarizations/mo' },
  { product_type: 'compliance_notarization_50', label: 'Enterprise Batch — 50 notarizations/mo' },
]

// Subscriptions — For Buyers
const SUBS_BUYERS: Sku[] = [
  { product_type: 'buyer_starter_monthly', label: 'Buyer Essentials — monthly' },
  { product_type: 'buyer_pro_monthly', label: 'Buyer Professional — monthly' },
  { product_type: 'buyer_enterprise_monthly', label: 'Buyer Enterprise — monthly' },
]

// Subscriptions — For Enterprise
const SUBS_ENTERPRISE: Sku[] = [
  { product_type: 'standard_suite_monthly', label: 'Standard Suite — monthly' },
  { product_type: 'pro_suite_monthly', label: 'Pro Suite — monthly' },
]

function dispatchColor(d: Dispatch) {
  switch (d) {
    case 'subscription': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'bundle':       return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'rfp':          return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'rfp-deferred': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    case 'standalone':   return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  }
}

function detailLinks(details: Record<string, unknown>) {
  const out: { href: string; label: string }[] = []
  const reportId = details.report_id as string | undefined
  if (reportId) out.push({ href: `/pdpa/report?session_id=${details.session_id ?? ''}`, label: `report ${reportId.slice(0, 8)}` })
  const intakeId = (details.pending_rfp_intake_id ?? details.intake_id) as string | undefined
  if (intakeId) out.push({ href: `/rfp-intake/${intakeId}`, label: `intake ${intakeId.slice(0, 8)}` })
  const stubs = details.stub_report_ids as string[] | undefined
  if (stubs?.length) for (const id of stubs) out.push({ href: `/vendor/dashboard`, label: `stub ${id.slice(0, 8)}` })
  return out
}

export default function AdminTestCheckoutPage() {
  const [identities, setIdentities] = useState<Record<IdentityKey, Identity>>(IDENTITY_DEFAULTS)
  const [activeIdentity, setActiveIdentity] = useState<IdentityKey>('A')
  const [rfpDescriptions, setRfpDescriptions] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<SimRow[]>([])

  // Hydrate identities from localStorage on first render so the operator's
  // edits survive reloads (and tab swaps). Failure path falls back to defaults.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { A?: Identity; B?: Identity }
      setIdentities({
        A: { ...IDENTITY_DEFAULTS.A, ...(parsed.A || {}) },
        B: { ...IDENTITY_DEFAULTS.B, ...(parsed.B || {}) },
      })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(identities))
    } catch {}
  }, [identities])

  function updateIdentity(key: IdentityKey, field: keyof Identity, value: string) {
    setIdentities(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function simulate(sku: Sku, identityKey: IdentityKey) {
    const id = identities[identityKey]
    if (!id.email.trim()) {
      setError(`Identity ${identityKey} has no email — fill it in first.`)
      return
    }
    setBusy(`${sku.product_type}:${identityKey}`)
    setError('')
    try {
      const body: Record<string, string> = {
        product_type: sku.product_type,
        customer_email: id.email.trim(),
        vendor_url: id.url.trim(),
        company_name: id.company.trim(),
      }
      const desc = (rfpDescriptions[sku.product_type] || '').trim()
      if (desc) body.rfp_description = desc

      const res = await fetch('/api/admin/api/admin/simulate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Simulation failed')
        return
      }
      const row: SimRow = {
        ...data,
        at: new Date().toLocaleTimeString(),
        identity_email: id.email.trim(),
        identity_label: `Identity ${identityKey}`,
      }
      setHistory(prev => [row, ...prev].slice(0, 10))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(null)
    }
  }

  function renderRow(sku: Sku) {
    const isBusy = busy === `${sku.product_type}:${activeIdentity}`
    const id = identities[activeIdentity]
    return (
      <div
        key={sku.product_type}
        className="flex items-center gap-3 py-3 border-b border-neutral-800 last:border-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-100 truncate">{sku.label}</p>
          <p className="text-xs text-neutral-500 font-mono truncate">{sku.product_type}</p>
        </div>
        {sku.needsRfp && (
          <input
            type="text"
            value={rfpDescriptions[sku.product_type] || ''}
            onChange={e => setRfpDescriptions({ ...rfpDescriptions, [sku.product_type]: e.target.value })}
            placeholder="rfp_description (blank → defer)"
            className="px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-100 w-72"
          />
        )}
        <button
          type="button"
          disabled={isBusy || !id.email.trim()}
          onClick={() => simulate(sku, activeIdentity)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center gap-1.5"
          title={`Simulate as Identity ${activeIdentity} (${id.email})`}
        >
          {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
          Simulate as {activeIdentity}
        </button>
      </div>
    )
  }

  // Per-tier verify-link strip. Each link opens in a new tab with ?as=<email>
  // so the operator can sanity-check unlocked features for the right identity
  // without clobbering their normal admin session.
  const VERIFY_LINKS = {
    standard: [
      { href: '/vendor/trm', label: 'MAS TRM' },
      { href: '/notarize', label: 'Notarize' },
      { href: '/vendor/webhooks', label: 'Webhooks' },
      { href: '/vendor/api-keys', label: 'API keys' },
    ],
    pro: [
      { href: '/vendor/trm', label: 'MAS TRM' },
      { href: '/notarize', label: 'Notarize' },
      { href: '/vendor/webhooks', label: 'Webhooks' },
      { href: '/vendor/api-keys', label: 'API keys' },
      { href: '/vendor/sso', label: 'SSO' },
      { href: '/vendor/subsidiaries', label: 'Subsidiaries' },
    ],
  } as const

  function lastActivation(identityKey: IdentityKey, productType: string) {
    return history.find(
      r => r.identity_email === identities[identityKey].email.trim() && r.product_type === productType,
    )
  }

  function renderVerifyStrip(tier: 'standard' | 'pro', email: string) {
    const safeEmail = encodeURIComponent(email)
    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">Verify in:</span>
        {VERIFY_LINKS[tier].map(l => (
          <Link
            key={l.href}
            href={`${l.href}?as=${safeEmail}`}
            target="_blank"
            className="px-2 py-0.5 text-[10px] rounded border border-neutral-700 hover:border-sky-500 hover:text-sky-300 text-neutral-300 inline-flex items-center gap-1"
          >
            {l.label} <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-neutral-100 mb-2">Test Checkout</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Simulates a Stripe <code className="text-xs">checkout.session.completed</code> event for any SKU
        without going through Stripe. Calls the same fulfillment helpers a real purchase would.
      </p>

      <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-rose-200">
          <strong>Heads up:</strong> these are real fulfillments. DB rows are written, Celery tasks queued,
          emails sent, and Amoy-testnet anchors produced. Records are tagged with{' '}
          <code className="text-xs">test_simulation</code> for later cleanup. Use a test email you control.
        </div>
      </div>

      {/* Dual identity panel — persisted to localStorage. Replaces the old
          single email/url/company header so the operator can run two test
          companies (A, B) in the same session without retyping between
          activations. Identity A is also the default-active identity used by
          the legacy SectionGroup rows below. */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['A', 'B'] as IdentityKey[]).map(k => (
          <div
            key={k}
            className={`rounded-lg border bg-neutral-900/50 p-4 ${activeIdentity === k ? 'border-sky-500/40' : 'border-neutral-800'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-neutral-400" />
                <p className="text-sm font-bold text-neutral-200">Test Identity {k}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveIdentity(k)}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${activeIdentity === k ? 'bg-sky-600 text-white' : 'border border-neutral-700 text-neutral-400 hover:text-neutral-200'}`}
              >
                {activeIdentity === k ? 'Active' : 'Use'}
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Email</label>
                <input
                  type="email"
                  value={identities[k].email}
                  onChange={e => updateIdentity(k, 'email', e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Company name</label>
                <input
                  type="text"
                  value={identities[k].company}
                  onChange={e => updateIdentity(k, 'company', e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Website</label>
                <input
                  type="text"
                  value={identities[k].url}
                  onChange={e => updateIdentity(k, 'url', e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Suite Test Drive — promoted hero for the two enterprise SKUs. Each
          column targets a different identity, so a single trip through this
          panel provisions Standard (A) + Pro (B). Verify-link strips jump
          straight to the unlocked features carrying ?as=<email>. */}
      <div className="mb-10 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5">
        <h2 className="text-base font-black uppercase tracking-widest text-emerald-300 mb-1">Suite Test Drive</h2>
        <p className="text-xs text-neutral-400 mb-5">
          Activate Standard Suite for Identity A and Pro Suite for Identity B side by side, then jump
          to each company&apos;s vendor surface to verify the unlocked features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([
            {
              tier: 'standard' as const,
              identityKey: 'A' as IdentityKey,
              productType: 'standard_suite_monthly',
              label: 'Standard Suite',
              price: 'SGD 1,800 / mo',
              features: [
                'MAS TRM — all 13 domains',
                'AI gap analysis (DeepSeek)',
                '50 notarizations / month',
                'RESTful API + webhooks',
              ],
            },
            {
              tier: 'pro' as const,
              identityKey: 'B' as IdentityKey,
              productType: 'pro_suite_monthly',
              label: 'Pro Suite',
              price: 'SGD 4,500 / mo',
              features: [
                'Everything in Standard Suite',
                'SSO — SAML 2.0 + OIDC',
                'White-label reports',
                'Multi-subsidiary management',
                '100 notarizations / month',
              ],
            },
          ]).map(card => {
            const id = identities[card.identityKey]
            const last = lastActivation(card.identityKey, card.productType)
            const sku: Sku = { product_type: card.productType, label: card.label }
            const isBusy = busy === `${card.productType}:${card.identityKey}`
            return (
              <div key={card.productType} className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4 flex flex-col">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-neutral-100">{card.label}</p>
                  <p className="text-[11px] text-neutral-500">{card.price}</p>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Identity {card.identityKey} · <span className="font-mono">{id.email || '(empty)'}</span>
                </p>
                <ul className="text-[11px] text-neutral-300 space-y-1 mb-4 flex-1">
                  {card.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isBusy || !id.email.trim()}
                  onClick={() => simulate(sku, card.identityKey)}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center justify-center gap-1.5"
                >
                  {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
                  {last ? `Re-activate ${card.label} for ${card.identityKey}` : `Activate ${card.label} for ${card.identityKey}`}
                </button>
                {last && (
                  <div className="mt-3 pt-3 border-t border-neutral-800">
                    <p className="text-[10px] text-emerald-400">
                      ✓ Activated {last.at} · {last.identity_email}
                    </p>
                    {renderVerifyStrip(card.tier, last.identity_email)}
                    {card.tier === 'pro' && (
                      <p className="text-[10px] text-neutral-500 mt-1.5">
                        White-label report toggle lives on <span className="font-mono">/vendor/profile</span>.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <SectionGroup title="One-Time Products">
        <Section title="For Vendors">
          {ONE_TIME_VENDORS.map(renderRow)}
        </Section>
        <Section title="For Buyers">
          {ONE_TIME_BUYERS.map(renderRow)}
        </Section>
      </SectionGroup>

      <SectionGroup title="Subscriptions">
        <Section title="For Vendors">
          {SUBS_VENDORS.map(renderRow)}
        </Section>
        <Section title="For Buyers">
          {SUBS_BUYERS.map(renderRow)}
        </Section>
        <Section title="For Enterprise">
          {SUBS_ENTERPRISE.map(renderRow)}
        </Section>
      </SectionGroup>

      <SectionGroup title="Recent Simulations">
        <Section title="Last 10">
        {history.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">No simulations yet.</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {history.map((row, i) => (
              <div key={i} className="py-3 flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-neutral-500 w-20">{row.at}</span>
                <span className="font-mono text-xs text-neutral-300 w-56 truncate">{row.product_type}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${dispatchColor(row.dispatch)}`}>
                  {row.dispatch}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate w-48" title={row.identity_email}>
                  {row.identity_label} · {row.identity_email}
                </span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {detailLinks(row.details).map((l, j) => (
                    <Link key={j} href={l.href} target="_blank" className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
                      {l.label} <ExternalLink className="w-3 h-3" />
                    </Link>
                  ))}
                  {detailLinks(row.details).length === 0 && (
                    <span className="text-xs text-neutral-500 font-mono">{JSON.stringify(row.details)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </Section>
      </SectionGroup>
    </div>
  )
}

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-black uppercase tracking-widest text-neutral-200 mb-4 pb-2 border-b border-neutral-700">{title}</h2>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{title}</h3>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 px-4">
        {children}
      </div>
    </div>
  )
}
