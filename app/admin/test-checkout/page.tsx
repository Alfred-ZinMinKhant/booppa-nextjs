'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, ExternalLink, Building2, CheckCircle2, X } from 'lucide-react'
import { ALL_PRODUCTS, formatPrice } from '@/lib/pricing'

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

interface Product {
  product_type: string
  label: string
  section: 'one-time-vendors' | 'one-time-buyers' | 'subs-vendors' | 'subs-buyers' | 'subs-enterprise' | 'csp'
  needsUrl?: boolean
  needsCompany?: boolean
  needsRfp?: boolean
}

interface DialogFields {
  email: string
  vendor_url: string
  company_name: string
  rfp_description: string
}

// Two persisted test identities so the operator can run Standard Suite (A) and
// Pro Suite (B) side-by-side without retyping email/url/company between clicks.
// localStorage round-trips them across page reloads.
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

// Product catalog: section grouping + per-SKU field requirements only.
// Display names and prices come from lib/pricing.ts (ALL_PRODUCTS) — the same
// source the /pricing page renders — and any SKU here that is missing from
// ALL_PRODUCTS is filtered out of the page, so the admin list always shows
// exactly the pricing-page products.
const PRODUCT_CATALOG: Product[] = [
  // One-time — Vendors
  { product_type: 'vendor_proof', label: 'Vendor Proof', section: 'one-time-vendors', needsCompany: true, needsUrl: true },
  { product_type: 'pdpa_quick_scan', label: 'PDPA Snapshot', section: 'one-time-vendors', needsCompany: true, needsUrl: true },
  { product_type: 'rfp_complete', label: 'RFP Complete', section: 'one-time-vendors', needsCompany: true, needsUrl: true, needsRfp: true },
  { product_type: 'vendor_trust_pack', label: 'Vendor Trust Pack', section: 'one-time-vendors', needsCompany: true, needsUrl: true },
  // rfp_accelerator / enterprise_bid_kit are retired products — the backend
  // simulate-purchase denylists them and they are no longer sold anywhere.
  { product_type: 'compliance_evidence_pack', label: 'Compliance Bundle', section: 'one-time-vendors', needsCompany: true, needsUrl: true },
  { product_type: 'compliance_notarization_1', label: 'Notarization (1 doc)', section: 'one-time-vendors' },
  // One-time — Buyers
  { product_type: 'notarization_addon_1', label: 'Extra Notarization', section: 'one-time-buyers' },
  // Subscriptions — Vendors
  { product_type: 'vendor_active_monthly', label: 'Vendor Active — monthly', section: 'subs-vendors' },
  { product_type: 'vendor_active_annual', label: 'Vendor Active — annual', section: 'subs-vendors' },
  { product_type: 'vendor_pro_monthly', label: 'Vendor Pro — monthly', section: 'subs-vendors' },
  { product_type: 'vendor_pro_annual', label: 'Vendor Pro — annual', section: 'subs-vendors' },
  { product_type: 'pdpa_monitor_monthly', label: 'PDPA Monitor — monthly', section: 'subs-vendors', needsUrl: true },
  { product_type: 'pdpa_monitor_annual', label: 'PDPA Monitor — annual', section: 'subs-vendors', needsUrl: true },
  { product_type: 'compliance_evidence_monthly', label: 'Compliance Evidence — monthly', section: 'subs-vendors' },
  { product_type: 'tender_intelligence_monthly', label: 'Tender Intelligence — monthly', section: 'subs-vendors' },
  { product_type: 'tender_intelligence_annual', label: 'Tender Intelligence — annual', section: 'subs-vendors' },
  { product_type: 'compliance_notarization_10', label: 'Small Batch — 10 notarizations/mo', section: 'subs-vendors' },
  { product_type: 'compliance_notarization_50', label: 'Enterprise Batch — 50 notarizations/mo', section: 'subs-vendors' },
  // Subscriptions — Buyers
  { product_type: 'buyer_starter_monthly', label: 'Buyer Essentials — monthly', section: 'subs-buyers' },
  { product_type: 'buyer_starter_annual', label: 'Buyer Essentials — annual', section: 'subs-buyers' },
  { product_type: 'buyer_pro_monthly', label: 'Buyer Professional — monthly', section: 'subs-buyers' },
  { product_type: 'buyer_pro_annual', label: 'Buyer Professional — annual', section: 'subs-buyers' },
  { product_type: 'buyer_enterprise_monthly', label: 'Buyer Enterprise — monthly', section: 'subs-buyers' },
  { product_type: 'buyer_enterprise_annual', label: 'Buyer Enterprise — annual', section: 'subs-buyers' },
  // Subscriptions — Enterprise
  { product_type: 'standard_suite_monthly', label: 'Standard Suite — monthly', section: 'subs-enterprise' },
  { product_type: 'pro_suite_monthly', label: 'Pro Suite — monthly', section: 'subs-enterprise' },
  // CSP Compliance Pack
  { product_type: 'csp_pack_onetime', label: 'CSP Compliance Pack — Full', section: 'csp', needsCompany: true },
  { product_type: 'csp_pack_monthly', label: 'CSP Compliance Pack — Full (Monthly)', section: 'csp', needsCompany: true },
  { product_type: 'csp_monitoring_monthly', label: 'CSP Monitoring Add-On', section: 'csp', needsCompany: true },
].filter(p => p.product_type in ALL_PRODUCTS) as Product[]

// Canonical display name + price come from lib/pricing.ts (the storefront
// source of truth) so the admin page always matches what customers see on
// /pricing. The hardcoded catalog label is only a fallback for SKUs missing
// from ALL_PRODUCTS.
function productName(p: Product): string {
  return ALL_PRODUCTS[p.product_type]?.name ?? p.label
}

function productPrice(p: Product): string | null {
  const cp = ALL_PRODUCTS[p.product_type]
  if (!cp) return null
  const suffix = p.product_type.endsWith('_annual') ? '/yr' : cp.type === 'subscription' ? '/mo' : ''
  return `${formatPrice(cp.price)}${suffix}`
}

function dispatchColor(d: Dispatch) {
  switch (d) {
    case 'subscription': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'bundle':       return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'rfp':          return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'rfp-deferred': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    case 'standalone':   return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  }
}

function getSectionTitle(section: Product['section']) {
  switch (section) {
    case 'one-time-vendors': return 'For Vendors'
    case 'one-time-buyers': return 'For Buyers'
    case 'subs-vendors': return 'For Vendors'
    case 'subs-buyers': return 'For Buyers'
    case 'subs-enterprise': return 'For Enterprise'
    case 'csp': return 'CSP Compliance Pack'
  }
}

function detailLinks(details: Record<string, unknown>) {
  const out: { href: string; label: string }[] = []
  const reportId = details.report_id as string | undefined
  if (reportId) out.push({ href: `/pdpa/report?session_id=${details.session_id ?? ''}`, label: `report ${reportId.slice(0, 8)}` })
  const intakeId = (details.pending_rfp_intake_id ?? details.intake_id) as string | undefined
  if (intakeId) out.push({ href: `/rfp-intake/${intakeId}`, label: `intake ${intakeId.slice(0, 8)}` })
  const evidencePackId = details.evidence_pack_id as string | undefined
  if (evidencePackId) out.push({ href: `/evidence-pack-intake/${evidencePackId}`, label: `evidence pack ${evidencePackId.slice(0, 8)}` })
  const stubs = details.stub_report_ids as string[] | undefined
  if (stubs?.length) for (const id of stubs) out.push({ href: `/vendor/dashboard`, label: `stub ${id.slice(0, 8)}` })
  return out
}

export default function AdminTestCheckoutPage() {
  const [identities, setIdentities] = useState<Record<IdentityKey, Identity>>(IDENTITY_DEFAULTS)
  const [activeIdentity, setActiveIdentity] = useState<IdentityKey>('A')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<SimRow[]>([])
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null)
  const [dialogFields, setDialogFields] = useState<DialogFields>({
    email: '',
    vendor_url: '',
    company_name: '',
    rfp_description: '',
  })

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

  function openDialog(product: Product) {
    const id = identities[activeIdentity]
    setDialogFields({
      email: id.email,
      vendor_url: id.url,
      company_name: id.company,
      rfp_description: '',
    })
    setDialogProduct(product)
    setError('')
  }

  function closeDialog() {
    setDialogProduct(null)
  }

  async function confirmDialog() {
    if (!dialogProduct) return
    const email = dialogFields.email.trim()
    if (!email) {
      setError('Email is required')
      return
    }
    setBusy(dialogProduct.product_type)
    setError('')
    closeDialog()
    try {
      // Always send the active identity's company + website for EVERY product,
      // regardless of the per-product needs flags. The test checkout is fully
      // identity-driven — fulfillment must reflect the active Test Identity
      // (e.g. Crayon Singapore / crayon.com), never the logged-in user's profile
      // or the backend's Booppa fallback defaults.
      const body: Record<string, string> = {
        product_type: dialogProduct.product_type,
        customer_email: email,
      }
      const url = dialogFields.vendor_url.trim()
      const company = dialogFields.company_name.trim()
      if (url) body.vendor_url = url
      if (company) body.company_name = company
      if (dialogProduct.needsRfp) {
        const desc = dialogFields.rfp_description.trim()
        if (desc) body.rfp_description = desc
      }

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
        identity_email: email,
        identity_label: `Identity ${activeIdentity}`,
      }
      setHistory(prev => [row, ...prev].slice(0, 10))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(null)
    }
  }

  function renderRow(product: Product) {
    const isBusy = busy === product.product_type
    return (
      <div
        key={product.product_type}
        className="flex items-center gap-3 py-3 border-b border-neutral-800 last:border-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-100 truncate">
            {productName(product)}
            {productPrice(product) && (
              <span className="ml-2 text-emerald-300 font-semibold">{productPrice(product)}</span>
            )}
          </p>
          <p className="text-xs text-neutral-500 font-mono truncate">{product.product_type}</p>
        </div>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => openDialog(product)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center gap-1.5"
        >
          {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
          Test
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
            const product = PRODUCT_CATALOG.find(p => p.product_type === card.productType)!
            const isBusy = busy === card.productType
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
                  onClick={() => {
                    setActiveIdentity(card.identityKey)
                    openDialog(product)
                  }}
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
          {PRODUCT_CATALOG.filter(p => p.section === 'one-time-vendors').map(renderRow)}
        </Section>
        <Section title="For Buyers">
          {PRODUCT_CATALOG.filter(p => p.section === 'one-time-buyers').map(renderRow)}
        </Section>
      </SectionGroup>

      <SectionGroup title="Subscriptions">
        <Section title="For Vendors">
          {PRODUCT_CATALOG.filter(p => p.section === 'subs-vendors').map(renderRow)}
        </Section>
        <Section title="For Buyers">
          {PRODUCT_CATALOG.filter(p => p.section === 'subs-buyers').map(renderRow)}
        </Section>
        <Section title="For Enterprise">
          {PRODUCT_CATALOG.filter(p => p.section === 'subs-enterprise').map(renderRow)}
        </Section>
      </SectionGroup>

      <SectionGroup title="CSP Compliance Pack">
        <Section title="For CSPs">
          {PRODUCT_CATALOG.filter(p => p.section === 'csp').map(renderRow)}
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

      {/* Dialog overlay */}
      {dialogProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <h3 className="text-base font-semibold text-neutral-100">
                {productName(dialogProduct)}
                {productPrice(dialogProduct) && (
                  <span className="ml-2 text-sm text-emerald-300 font-semibold">{productPrice(dialogProduct)}</span>
                )}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Send to email *
                </label>
                <input
                  type="email"
                  value={dialogFields.email}
                  onChange={e => setDialogFields({ ...dialogFields, email: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-sm"
                  autoFocus
                />
              </div>
              {dialogProduct.needsUrl && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={dialogFields.vendor_url}
                    onChange={e => setDialogFields({ ...dialogFields, vendor_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-sm"
                  />
                </div>
              )}
              {dialogProduct.needsCompany && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={dialogFields.company_name}
                    onChange={e => setDialogFields({ ...dialogFields, company_name: e.target.value })}
                    placeholder="Your company name"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-sm"
                  />
                </div>
              )}
              {dialogProduct.needsRfp && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    RFP Description (optional)
                  </label>
                  <textarea
                    value={dialogFields.rfp_description}
                    onChange={e => setDialogFields({ ...dialogFields, rfp_description: e.target.value })}
                    placeholder="Leave blank to defer brief collection"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 text-sm h-20 resize-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    If blank, admin will collect the brief via intake form
                  </p>
                </div>
              )}
              {error && (
                <div className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-neutral-700">
              <button
                type="button"
                onClick={closeDialog}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog}
                disabled={busy !== null}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center justify-center gap-1.5"
              >
                {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                Simulate
              </button>
            </div>
          </div>
        </div>
      )}
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
