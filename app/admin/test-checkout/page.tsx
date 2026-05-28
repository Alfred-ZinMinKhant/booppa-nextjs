'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react'

type Dispatch = 'subscription' | 'bundle' | 'rfp' | 'rfp-deferred' | 'standalone'

interface SimResponse {
  ok: boolean
  product_type: string
  dispatch: Dispatch
  details: Record<string, unknown>
}

interface SimRow extends SimResponse {
  at: string
}

interface Sku {
  product_type: string
  label: string
  needsRfp?: boolean
}

const ONE_TIME: Sku[] = [
  { product_type: 'pdpa_quick_scan', label: 'PDPA Quick Scan' },
  { product_type: 'vendor_proof', label: 'Vendor Proof' },
  { product_type: 'rfp_express', label: 'RFP Express', needsRfp: true },
  { product_type: 'rfp_complete', label: 'RFP Complete', needsRfp: true },
  { product_type: 'compliance_notarization_1', label: 'Notarization × 1' },
  { product_type: 'compliance_notarization_10', label: 'Notarization × 10' },
  { product_type: 'compliance_notarization_50', label: 'Notarization × 50' },
]

const BUNDLES: Sku[] = [
  { product_type: 'vendor_trust_pack', label: 'Vendor Trust Pack' },
  { product_type: 'rfp_accelerator', label: 'RFP Accelerator' },
  { product_type: 'enterprise_bid_kit', label: 'Enterprise Bid Kit' },
  { product_type: 'compliance_evidence_pack', label: 'Compliance Evidence Pack' },
]

const SUBSCRIPTIONS: Sku[] = [
  { product_type: 'vendor_active_monthly', label: 'Vendor Active — monthly' },
  { product_type: 'vendor_active_annual', label: 'Vendor Active — annual' },
  { product_type: 'vendor_pro_monthly', label: 'Vendor Pro — monthly' },
  { product_type: 'vendor_pro_annual', label: 'Vendor Pro — annual' },
  { product_type: 'pdpa_monitor_monthly', label: 'PDPA Monitor — monthly' },
  { product_type: 'pdpa_monitor_annual', label: 'PDPA Monitor — annual' },
  { product_type: 'compliance_evidence_monthly', label: 'Compliance Evidence — monthly' },
  { product_type: 'tender_intelligence_monthly', label: 'Tender Intelligence — monthly' },
  { product_type: 'tender_intelligence_annual', label: 'Tender Intelligence — annual' },
  { product_type: 'buyer_starter_monthly', label: 'Buyer Essentials — monthly' },
  { product_type: 'buyer_starter_annual', label: 'Buyer Essentials — annual' },
  { product_type: 'buyer_pro_monthly', label: 'Buyer Professional — monthly' },
  { product_type: 'buyer_pro_annual', label: 'Buyer Professional — annual' },
  { product_type: 'buyer_enterprise_monthly', label: 'Buyer Enterprise — monthly' },
  { product_type: 'buyer_enterprise_annual', label: 'Buyer Enterprise — annual' },
  { product_type: 'notana_document_monthly', label: 'Notana Document (Add-On) — monthly' },
  { product_type: 'enterprise_monthly', label: 'Enterprise — monthly' },
  { product_type: 'enterprise_pro_monthly', label: 'Enterprise Pro — monthly' },
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
  const [email, setEmail] = useState('test+admin@booppa.io')
  const [vendorUrl, setVendorUrl] = useState('https://booppa.io')
  const [companyName, setCompanyName] = useState('Booppa QA')
  const [rfpDescriptions, setRfpDescriptions] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<SimRow[]>([])

  async function simulate(sku: Sku) {
    setBusy(sku.product_type)
    setError('')
    try {
      const body: Record<string, string> = {
        product_type: sku.product_type,
        customer_email: email.trim(),
        vendor_url: vendorUrl.trim(),
        company_name: companyName.trim(),
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
      const row: SimRow = { ...data, at: new Date().toLocaleTimeString() }
      setHistory(prev => [row, ...prev].slice(0, 10))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setBusy(null)
    }
  }

  function renderRow(sku: Sku) {
    const isBusy = busy === sku.product_type
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
          disabled={isBusy || !email.trim()}
          onClick={() => simulate(sku)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center gap-1.5"
        >
          {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
          Simulate
        </button>
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

      <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="sim-email" className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Test email</label>
          <input
            id="sim-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-sm"
          />
        </div>
        <div>
          <label htmlFor="sim-vendor-url" className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">vendor_url</label>
          <input
            id="sim-vendor-url"
            type="text"
            value={vendorUrl}
            onChange={e => setVendorUrl(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-sm"
          />
        </div>
        <div>
          <label htmlFor="sim-company" className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">company_name</label>
          <input
            id="sim-company"
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      <Section title="One-time products">
        {ONE_TIME.map(renderRow)}
      </Section>

      <Section title="Bundles">
        {BUNDLES.map(renderRow)}
      </Section>

      <Section title="Subscriptions">
        {SUBSCRIPTIONS.map(renderRow)}
      </Section>

      <Section title="Recent simulations">
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
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">{title}</h2>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 px-4">
        {children}
      </div>
    </div>
  )
}
