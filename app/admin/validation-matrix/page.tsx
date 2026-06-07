'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────

type Dispatch = 'subscription' | 'bundle' | 'rfp' | 'rfp-deferred' | 'standalone'

interface SimResponse {
  ok: boolean
  product_type: string
  dispatch: Dispatch
  details: Record<string, unknown>
}

type SegmentKey = 'vendor' | 'buyer' | 'enterprise'

interface Prospect {
  company: string
  website: string
  sector: string
  conversion?: string
  priority: string
  why?: string
}

interface SkuCol {
  product_type: string
  label: string
  short: string  // narrow column header
  group: 'one_time' | 'subscription'
}

interface CellState {
  status: 'idle' | 'busy' | 'ok' | 'error'
  at?: string
  detail?: string
}

// ─── Prospect data (from VALIDATION PRODUCTS.xlsx) ────────────────────────

const VENDOR_PROSPECTS: Prospect[] = [
  { company: 'Crayon Singapore',         website: 'crayon.com',           sector: 'Microsoft CSP Premier',     conversion: '9/10',   priority: 'Compliance Bundle → Vendor Pro' },
  { company: 'SoftwareOne Singapore',    website: 'softwareone.com',      sector: 'Software asset + cloud',    conversion: '9/11',   priority: 'Vendor Pro SGD 99/mo' },
  { company: 'Cloud Kinetics',           website: 'cloud-kinetics.com',   sector: 'AWS Partner',               conversion: '8.5/10', priority: 'Compliance Bundle + Tender Intelligence' },
  { company: 'eCloudvalley Singapore',   website: 'ecloudvalley.com',     sector: 'AWS Premier Partner',       conversion: '8.5/10', priority: 'Vendor Active → Compliance Bundle' },
  { company: 'Ensign InfoSecurity',      website: 'ensigninfosecurity.com', sector: 'Cybersecurity pure-play', conversion: '8/10',   priority: 'PDPA Snapshot → Standard Suite' },
  { company: 'Horangi Cyber Security',   website: 'horangi.com',          sector: 'Cybersecurity boutique',    conversion: '8/10',   priority: 'Vendor Proof + PDPA Snapshot' },
  { company: 'Netpoleon Singapore',      website: 'netpoleon.com',        sector: 'Cybersecurity distributor', conversion: '7.5/10', priority: 'Buyer Pro + Vendor Active (reseller)' },
  { company: 'PointStar Singapore',      website: 'pointstar.com',        sector: 'Google Cloud Premier',      conversion: '7.5/10', priority: 'Tender Intelligence + Vendor Pro' },
  { company: 'Cloud4C Singapore',        website: 'cloud4c.com',          sector: 'Managed Cloud',             conversion: '7.5/10', priority: 'PDPA Monitor → Pro Suite' },
  { company: 'Adnovum Singapore',        website: 'adnovum.com',          sector: 'Software house (banking/gov)', conversion: '7.5/10', priority: 'Compliance Bundle → Standard Suite' },
]

const BUYER_PROSPECTS: Prospect[] = [
  { company: 'Certis Group',             website: 'certisgroup.com',      sector: 'Security + facility mgmt',  priority: 'Buyer Professional', why: 'Hundreds of subcontractors — CDD on operational vendors' },
  { company: 'NTUC Enterprise',          website: 'ntuc.org.sg',          sector: 'Cooperative multi-BU',      priority: 'Buyer Essentials → Professional', why: 'Diverse vendor panel, non-bureaucratic decisions' },
  { company: 'Surbana Jurong',           website: 'surbanajurong.com',    sector: 'Engineering / urbanism',    priority: 'Buyer Professional', why: 'Huge supply chain of technical subcontractors' },
  { company: 'Pavilion Energy (Shell)',  website: 'pavilionenergy.com',   sector: 'LNG trading',               priority: 'Buyer Essentials', why: 'International vendors, strong compliance, lean team' },
  { company: 'Sembcorp Industries',      website: 'sembcorp.com',         sector: 'Utilities + urban dev',     priority: 'Buyer Professional', why: 'Extensive vendor panel, sustainability reporting' },
  { company: 'Raffles Medical Group',    website: 'rafflesmedicalgroup.com', sector: 'Healthcare (private)',   priority: 'Buyer Pro (healthcare framework)', why: 'Max PDPA on vendors handling patient data' },
  { company: 'Metro Holdings',           website: 'metroholdings.com.sg', sector: 'Real estate + retail',      priority: 'Buyer Essentials', why: 'Contractor and facility vendor, rapid decisions' },
  { company: 'IHH Healthcare Singapore', website: 'ihhhealthcare.com',    sector: 'Healthcare (intl private)', priority: 'Buyer Enterprise', why: 'Large vendor panel, max PDPA' },
  { company: 'Frasers Property',         website: 'frasersproperty.com',  sector: 'Real estate group',         priority: 'Buyer Essentials → Professional', why: 'Supply chain contractor + facility' },
  { company: 'AETOS Holdings',           website: 'aetos.com.sg',         sector: 'Security + government',     priority: 'Buyer Pro + GeBIZ integration', why: 'Government contracts, strong vendor qualification' },
]

const ENTERPRISE_PROSPECTS: Prospect[] = [
  { company: 'Funding Societies',  website: 'fundingsocieties.com',  sector: 'SME digital financing + debt invest.', priority: 'Standard Suite',          why: 'MAS TRM + vendor due diligence per partner tech (CMS Licence)' },
  { company: 'Aspire',             website: 'aspireapp.com',         sector: 'Financial OS for businesses',          priority: 'Standard Suite → Pro',    why: 'MAS TRM all 13 domains + PDPA (Digital Bank restricted)' },
  { company: 'Nium',               website: 'nium.com',              sector: 'Payments infrastructure',              priority: 'Pro Suite',               why: 'Cross-border + MAS + multi-jurisdiction (MPI Licence)' },
  { company: 'Thunes',             website: 'thunes.com',            sector: 'Real-time payments',                   priority: 'Standard Suite',          why: 'Vendor onboarding international + MAS audit trail (MPI Licence)' },
  { company: 'FOMO Pay',           website: 'fomopay.com',           sector: 'Financial institution',                priority: 'Standard Suite',          why: 'Digital payment + crypto — high MAS scrutiny (MPI + DPT)' },
  { company: 'Chocolate Finance',  website: 'chocolatefinance.com',  sector: 'Financial institution',                priority: 'Standard Suite',          why: 'Retail investing + PDPA + MAS investor protection (CMS investment)' },
  { company: 'MatchMove',          website: 'matchmove.com',         sector: 'Financial institution',                priority: 'Pro Suite',               why: 'Embedded finance + partner API compliance (MPI Licence)' },
  { company: 'GXS Capital',        website: 'business.gxs.com.sg',   sector: 'Financial institution',                priority: 'Standard Suite',          why: 'SME lending + CDD/KYB on borrower and vendor (CMS lending)' },
  { company: 'StashAway',          website: 'stashaway.sg',          sector: 'Investment service',                   priority: 'Standard Suite',          why: 'PDPA + MAS asset management code (CMS asset mgmt)' },
  { company: 'Lendela',            website: 'lendela.com',           sector: 'Finance broker',                       priority: 'Buyer Enterprise → Standard Suite', why: 'Loan marketplace + vendor onboarding per lender (CMS Licence)' },
]

// ─── SKU columns per segment ──────────────────────────────────────────────

const VENDOR_SKUS: SkuCol[] = [
  { product_type: 'vendor_proof',                  label: 'Vendor Proof',       short: 'VP',   group: 'one_time' },
  { product_type: 'pdpa_quick_scan',               label: 'PDPA Snapshot',      short: 'PDPA', group: 'one_time' },
  { product_type: 'rfp_complete',                  label: 'RFP Complete',       short: 'RFP',  group: 'one_time' },
  { product_type: 'compliance_evidence_pack',      label: 'Compliance Bundle',  short: 'CB',   group: 'one_time' },
  { product_type: 'vendor_active_monthly',         label: 'Vendor Active',      short: 'VA',   group: 'subscription' },
  { product_type: 'vendor_pro_monthly',            label: 'Vendor Pro',         short: 'VPro', group: 'subscription' },
  { product_type: 'pdpa_monitor_monthly',          label: 'PDPA Monitor',       short: 'PM',   group: 'subscription' },
  { product_type: 'compliance_evidence_monthly',   label: 'Compliance Evidence', short: 'CE',  group: 'subscription' },
  { product_type: 'tender_intelligence_monthly',   label: 'Tender Intelligence', short: 'TI',  group: 'subscription' },
]

const BUYER_SKUS: SkuCol[] = [
  { product_type: 'buyer_starter_monthly',         label: 'Buyer Essentials',    short: 'Ess', group: 'subscription' },
  { product_type: 'buyer_pro_monthly',             label: 'Buyer Professional',  short: 'Pro', group: 'subscription' },
  { product_type: 'buyer_enterprise_monthly',      label: 'Buyer Enterprise',    short: 'Ent', group: 'subscription' },
]

const ENTERPRISE_SKUS: SkuCol[] = [
  { product_type: 'pdpa_quick_scan',               label: 'PDPA Snapshot',      short: 'PDPA', group: 'one_time' },
  { product_type: 'compliance_evidence_pack',      label: 'Compliance Bundle',  short: 'CB',   group: 'one_time' },
  { product_type: 'standard_suite_monthly',        label: 'Standard Suite',     short: 'Std',  group: 'subscription' },
  { product_type: 'pro_suite_monthly',             label: 'Pro Suite',          short: 'Pro',  group: 'subscription' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

const SEGMENT_PREFIX: Record<SegmentKey, string> = {
  vendor: 'vendor',
  buyer: 'buyer',
  enterprise: 'ent',
}

// Aliased emails route everything to your inbox. Format:
//   test+<segment>-<company-slug>@booppa.io
function aliasEmail(segment: SegmentKey, company: string): string {
  const slug = company
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
  return `test+${SEGMENT_PREFIX[segment]}-${slug}@booppa.io`
}

// Parse the spreadsheet's priority text into a set of product_types we should
// visually flag in the row. Spreadsheet wording is loose ("Vendor Pro SGD 99",
// "Compliance Bundle → Vendor Pro") so we do keyword detection.
const PRIORITY_KEYWORDS: { keyword: RegExp; productType: string }[] = [
  // Order matters: longer/specific phrases first so they win.
  { keyword: /compliance\s*evidence(?!\s*pack)/i,           productType: 'compliance_evidence_monthly' },
  { keyword: /compliance\s*bundle|compliance\s*evidence\s*pack/i, productType: 'compliance_evidence_pack' },
  { keyword: /vendor\s*proof/i,                              productType: 'vendor_proof' },
  { keyword: /pdpa\s*snap(shot)?/i,                          productType: 'pdpa_quick_scan' },
  { keyword: /pdpa\s*monitor/i,                              productType: 'pdpa_monitor_monthly' },
  { keyword: /rfp\s*complete/i,                              productType: 'rfp_complete' },
  { keyword: /vendor\s*active/i,                             productType: 'vendor_active_monthly' },
  { keyword: /vendor\s*pro/i,                                productType: 'vendor_pro_monthly' },
  { keyword: /tender\s*intelligence/i,                       productType: 'tender_intelligence_monthly' },
  { keyword: /standard\s*suite/i,                            productType: 'standard_suite_monthly' },
  { keyword: /pro\s*suite/i,                                 productType: 'pro_suite_monthly' },
  { keyword: /buyer\s*essentials?|buyer\s*starter/i,         productType: 'buyer_starter_monthly' },
  { keyword: /buyer\s*professional|buyer\s*pro\b/i,          productType: 'buyer_pro_monthly' },
  { keyword: /buyer\s*enterprise/i,                          productType: 'buyer_enterprise_monthly' },
]

function priorityHits(priority: string): Set<string> {
  const hits = new Set<string>()
  for (const { keyword, productType } of PRIORITY_KEYWORDS) {
    if (keyword.test(priority)) hits.add(productType)
  }
  return hits
}

const STORAGE_KEY = 'booppa_admin_validation_matrix'

// ─── Page ─────────────────────────────────────────────────────────────────

const SEGMENTS: { key: SegmentKey; label: string; prospects: Prospect[]; skus: SkuCol[] }[] = [
  { key: 'vendor',     label: 'Vendor',     prospects: VENDOR_PROSPECTS,     skus: VENDOR_SKUS },
  { key: 'buyer',      label: 'Buyer',      prospects: BUYER_PROSPECTS,      skus: BUYER_SKUS },
  { key: 'enterprise', label: 'Enterprise', prospects: ENTERPRISE_PROSPECTS, skus: ENTERPRISE_SKUS },
]

export default function AdminValidationMatrixPage() {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('vendor')
  const [activations, setActivations] = useState<Record<string, CellState>>({})
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Hydrate from localStorage so refresh / tab switch keeps the checklist.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      setActivations(JSON.parse(raw) as Record<string, CellState>)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activations))
    } catch {}
  }, [activations])

  function cellKey(segment: SegmentKey, slug: string, productType: string) {
    return `${segment}:${slug}:${productType}`
  }

  async function simulateCell(segment: SegmentKey, prospect: Prospect, sku: SkuCol) {
    const email = aliasEmail(segment, prospect.company)
    const key = cellKey(segment, prospect.company, sku.product_type)
    setBusyKey(key)
    setError('')
    setActivations(prev => ({ ...prev, [key]: { status: 'busy' } }))
    try {
      const body: Record<string, string> = {
        product_type: sku.product_type,
        customer_email: email,
        vendor_url: prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`,
        company_name: prospect.company,
      }
      // RFP Complete must defer (no brief at this point). Leave rfp_description
      // empty so the backend creates a PendingRfpIntake instead of generating
      // a placeholder kit.
      const res = await fetch('/api/admin/api/admin/simulate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
      const data: SimResponse & { detail?: string } = await res.json()
      if (!res.ok) {
        const msg = typeof data.detail === 'string' ? data.detail : 'Simulation failed'
        setError(`${prospect.company} · ${sku.label}: ${msg}`)
        setActivations(prev => ({ ...prev, [key]: { status: 'error', detail: msg } }))
        return
      }
      setActivations(prev => ({
        ...prev,
        [key]: { status: 'ok', at: new Date().toLocaleTimeString() },
      }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error'
      setError(`${prospect.company} · ${sku.label}: ${msg}`)
      setActivations(prev => ({ ...prev, [key]: { status: 'error', detail: msg } }))
    } finally {
      setBusyKey(null)
    }
  }

  function clearAll() {
    if (!confirm('Clear all activation checkmarks from this page? (DB state is not reverted.)')) return
    setActivations({})
  }

  const seg = SEGMENTS.find(s => s.key === activeSegment)!

  return (
    <div className="p-8 max-w-[1400px]">
      <h1 className="text-2xl font-bold text-neutral-100 mb-1">Validation Matrix</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Click any cell to simulate a Stripe purchase for that prospect + SKU. Emails are aliased to{' '}
        <code className="text-xs">test+&lt;segment&gt;-&lt;slug&gt;@booppa.io</code> so all activations route to your inbox.
        Priority targets from the spreadsheet are highlighted in the rightmost column.
      </p>

      <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-rose-200">
          <strong>Real fulfillments.</strong> Each cell click creates a User row, sets the plan,
          fires Celery tasks, and (where applicable) anchors on Amoy-testnet. Aliased to your inbox via
          the <code className="text-xs">+suffix</code> trick — no prospect receives email.
        </div>
      </div>

      {/* Segment tabs */}
      <div className="flex items-center gap-2 mb-5 border-b border-neutral-800">
        {SEGMENTS.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSegment(s.key)}
            className={`px-4 py-2 text-sm font-semibold transition border-b-2 -mb-px ${
              activeSegment === s.key
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {s.label} <span className="text-xs text-neutral-500">({s.prospects.length})</span>
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-neutral-500 hover:text-rose-400"
          title="Clear local checkmarks (does not revert DB)"
        >
          Clear checkmarks
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Matrix */}
      <div className="overflow-x-auto border border-neutral-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/80">
            <tr>
              <th className="text-left text-xs uppercase tracking-wider text-neutral-400 px-3 py-2 font-semibold sticky left-0 bg-neutral-900/95 z-10 min-w-[200px]">Prospect</th>
              <th className="text-left text-xs uppercase tracking-wider text-neutral-500 px-3 py-2 font-semibold min-w-[160px]">Sector</th>
              {seg.skus.map(sku => (
                <th key={sku.product_type} className="text-center text-[10px] uppercase tracking-wider text-neutral-400 px-2 py-2 font-semibold whitespace-nowrap" title={sku.label}>
                  <div>{sku.short}</div>
                  <div className="text-[9px] text-neutral-600 normal-case font-normal">{sku.group === 'one_time' ? 'one-time' : 'sub'}</div>
                </th>
              ))}
              <th className="text-left text-[10px] uppercase tracking-wider text-emerald-400 px-3 py-2 font-semibold min-w-[220px]">Priority</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-neutral-500 px-3 py-2 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {seg.prospects.map(p => {
              const email = aliasEmail(seg.key, p.company)
              const priorityProducts = priorityHits(p.priority)
              return (
                <tr key={p.company} className="hover:bg-neutral-900/40">
                  <td className="px-3 py-2 sticky left-0 bg-neutral-950 z-10">
                    <p className="text-sm font-bold text-neutral-100">{p.company}</p>
                    <a
                      href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-neutral-500 hover:text-sky-400"
                    >
                      {p.website}
                    </a>
                    <p className="text-[10px] font-mono text-neutral-600 mt-0.5" title={email}>{email}</p>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-neutral-400 align-top">
                    {p.sector}
                    {p.conversion && (
                      <span className="block text-[10px] text-neutral-600 mt-0.5">conv. {p.conversion}</span>
                    )}
                  </td>
                  {seg.skus.map(sku => {
                    const key = cellKey(seg.key, p.company, sku.product_type)
                    const state = activations[key]
                    const isBusy = busyKey === key
                    const isPriority = priorityProducts.has(sku.product_type)
                    let cellClass = 'border border-neutral-800 hover:border-sky-500 text-neutral-400 hover:text-sky-300 bg-neutral-900/40'
                    if (isPriority && (!state || state.status === 'idle')) {
                      cellClass = 'border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    }
                    if (state?.status === 'ok') {
                      cellClass = 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
                    } else if (state?.status === 'error') {
                      cellClass = 'border border-rose-500/50 bg-rose-500/15 text-rose-300'
                    } else if (state?.status === 'busy' || isBusy) {
                      cellClass = 'border border-sky-500/60 bg-sky-500/15 text-sky-300'
                    }
                    return (
                      <td key={sku.product_type} className="px-1 py-2 text-center">
                        <button
                          type="button"
                          disabled={isBusy || state?.status === 'busy'}
                          onClick={() => simulateCell(seg.key, p, sku)}
                          className={`w-12 h-9 rounded text-xs font-bold inline-flex items-center justify-center transition ${cellClass}`}
                          title={`${sku.label}\n${state?.at ? `✓ activated ${state.at}` : isPriority ? 'Priority target' : 'Click to simulate'}`}
                        >
                          {state?.status === 'busy' || isBusy ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : state?.status === 'ok' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : state?.status === 'error' ? (
                            '!'
                          ) : isPriority ? (
                            '★'
                          ) : (
                            '·'
                          )}
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-[11px] text-emerald-300 align-top">
                    <p className="font-semibold">{p.priority}</p>
                    {p.why && <p className="text-[10px] text-neutral-500 mt-0.5">{p.why}</p>}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    <Link
                      href={`/vendor/dashboard?as=${encodeURIComponent(email)}`}
                      target="_blank"
                      className="text-[10px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                    >
                      Dashboard <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-neutral-500 mt-4">
        Legend: <span className="text-emerald-300">★</span> priority target (from spreadsheet) ·{' '}
        <span className="text-emerald-300">✓</span> activated ·{' '}
        <span className="text-rose-300">!</span> error ·{' '}
        <span className="text-neutral-400">·</span> not yet exercised. Checkmarks are local (browser
        only) — DB rows persist regardless. Re-clicking an already-activated cell calls the endpoint
        again (idempotent for subscriptions; one-time SKUs create a new row).
      </p>
    </div>
  )
}
