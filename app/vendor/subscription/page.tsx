'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink,
  Zap, Shield, FileText, Globe, KeyRound, Webhook, Building2, ShieldCheck,
} from 'lucide-react'

interface FeatureMap {
  ai_mode?: string
  ai_full?: boolean
  pdf?: boolean
  blockchain?: boolean
  monitoring?: boolean
  dashboard?: boolean
  multi_vendor?: boolean
  api_access?: boolean
  webhooks?: boolean
  sso?: boolean
  white_label?: boolean
  monthly_notarization_quota?: number
}

interface ActiveSubscription {
  id: string
  product_type: string
  label: string
  description: string | null
  price_sgd: number | null
  interval: 'month' | 'annual'
  status: string
  current_period_end: string | null
  started_at: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  features: FeatureMap
}

interface SubscriptionPayload {
  plan: string
  plan_label: string
  price_sgd: number | null
  tier: string | null
  subscription_started_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  features: FeatureMap
  all_subscriptions?: ActiveSubscription[]
  notarization: { monthly_quota: number; used_this_month: number; remaining: number }
  bundle_credits: { notarization: number; compliance_evidence: number }
}

function FeatureRow({ label, on, hint }: { label: string; on: boolean; hint?: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-neutral-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="text-xs text-neutral-500 mt-0.5">{hint}</p>}
      </div>
      {on ? (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold flex-shrink-0">
          <CheckCircle className="h-4 w-4" /> Included
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-neutral-500 text-xs flex-shrink-0">
          <XCircle className="h-4 w-4" /> Not in plan
        </span>
      )}
    </div>
  )
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  // Tab state — only matters when the user has >1 active subscription.
  const [activeSubId, setActiveSubId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendor/subscription', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          setError(body?.detail || body?.error || `Failed to load (${r.status})`)
          return null
        }
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const r = await fetch('/api/vendor/subscription/portal', { method: 'POST' })
      const d = await r.json()
      if (r.ok && d.url) {
        window.location.href = d.url
      } else {
        setError(d?.detail || 'Could not open billing portal.')
      }
    } catch {
      setError('Network error opening billing portal.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
          <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white mb-2">No subscription on file</h1>
          <p className="text-neutral-400 text-sm mb-6">
            {error || "You don't have an active subscription yet."}
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            Browse plans →
          </Link>
        </div>
      </main>
    )
  }

  const isFree = !data.stripe_subscription_id || data.plan === 'free'
  const allSubs = data.all_subscriptions ?? []
  const hasMultiple = allSubs.length > 1

  // Default the active tab to the highest-priced sub so the page opens on
  // the buyer's headline subscription. Each tab scopes the header card +
  // features panel below to that subscription only.
  const sortedSubs = [...allSubs].sort((a, b) => (b.price_sgd ?? 0) - (a.price_sgd ?? 0))
  const selectedSub = hasMultiple
    ? sortedSubs.find(s => s.id === activeSubId) ?? sortedSubs[0]
    : null

  // Header + feature panel data driven by:
  //   - multi-sub: the currently selected tab
  //   - single-sub: legacy User-row plan fields
  const displayLabel = selectedSub?.label ?? data.plan_label
  const displayPriceSgd = selectedSub?.price_sgd ?? data.price_sgd
  const displayInterval = selectedSub?.interval ?? 'month'
  const displayStartedAt = selectedSub?.started_at ?? data.subscription_started_at
  const displayCurrentPeriodEnd = selectedSub?.current_period_end ?? null
  const displayStripeSubId = selectedSub?.stripe_subscription_id ?? data.stripe_subscription_id
  const displayStatus = selectedSub?.status ?? (isFree ? 'inactive' : 'active')
  const f = selectedSub?.features ?? data.features
  const notar = data.notarization
  const usePct = notar.monthly_quota > 0
    ? Math.min(100, Math.round((notar.used_this_month / notar.monthly_quota) * 100))
    : 0

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Subscription tabs — only when the buyer holds more than one. */}
        {hasMultiple && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2">
            <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
              {sortedSubs.map(s => {
                const active = (selectedSub?.id ?? sortedSubs[0].id) === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSubId(s.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>{s.label}</span>
                    {s.price_sgd != null && (
                      <span className={`text-[10px] font-normal ${active ? 'text-emerald-100' : 'text-neutral-500'}`}>
                        SGD {s.price_sgd.toLocaleString()}/{s.interval === 'annual' ? 'yr' : 'mo'}
                      </span>
                    )}
                    {s.status === 'past_due' && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-rose-300">past due</span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5 px-2">
              You have {sortedSubs.length} active subscriptions. Each tab shows what that subscription unlocked, when it renews, and lets you manage it independently.
            </p>
          </div>
        )}

        {/* Header card */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-neutral-900 border border-emerald-800/40 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {hasMultiple ? 'Selected subscription' : 'Current plan'}
            </p>
            {displayStatus !== 'active' && displayStatus !== 'trialing' && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                {displayStatus}
              </span>
            )}
          </div>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black text-white">{displayLabel}</h1>
              {displayPriceSgd != null && (
                <p className="text-neutral-300 mt-1">
                  SGD {displayPriceSgd.toLocaleString()}<span className="text-neutral-500 text-sm">/{displayInterval === 'annual' ? 'year' : 'month'}</span>
                </p>
              )}
              {selectedSub?.description && (
                <p className="text-xs text-neutral-400 mt-2 max-w-xl">{selectedSub.description}</p>
              )}
              <div className="text-xs text-neutral-500 mt-2 space-y-0.5">
                {displayStartedAt && (
                  <p>
                    Active since {new Date(displayStartedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
                {displayCurrentPeriodEnd && (
                  <p>
                    Next renewal {new Date(displayCurrentPeriodEnd).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isFree && (
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-neutral-200 disabled:opacity-50"
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage billing
                </button>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 border border-neutral-700 text-neutral-200 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-neutral-800"
              >
                {isFree ? 'See plans' : 'Change plan'}
              </Link>
            </div>
          </div>
        </div>

        {/* Notarization quota */}
        {notar.monthly_quota > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Notarizations this month</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {notar.used_this_month} <span className="text-neutral-500 text-base font-normal">/ {notar.monthly_quota}</span>
                </p>
              </div>
              <Link
                href="/notarization"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
              >
                <Shield className="h-4 w-4" /> Notarize a document
              </Link>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usePct >= 90 ? 'bg-red-500' : usePct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usePct}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {notar.remaining} remaining this month · quota resets on the 1st
            </p>
          </div>
        )}

        {/* Bundle credits */}
        {(data.bundle_credits.notarization > 0 || data.bundle_credits.compliance_evidence > 0) && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Bundle credits</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold text-white">{data.bundle_credits.notarization}</p>
                <p className="text-xs text-neutral-400">Notarization credits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data.bundle_credits.compliance_evidence}</p>
                <p className="text-xs text-neutral-400">Compliance Evidence credits</p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">What&apos;s unlocked</p>
          <div className="divide-y divide-neutral-800">
            <FeatureRow
              label="Full AI analysis (DeepSeek gap analysis)"
              on={!!f.ai_full}
              hint={f.ai_mode === 'full' ? 'Running full model' : 'Light mode only'}
            />
            <FeatureRow label="Regulator-ready PDF reports" on={!!f.pdf} />
            <FeatureRow label="Blockchain notarization (Polygon anchoring)" on={!!f.blockchain} />
            <FeatureRow label="Continuous compliance monitoring" on={!!f.monitoring} />
            <FeatureRow label="Multi-vendor dashboard" on={!!f.multi_vendor} />
            <FeatureRow label="REST API access" on={!!f.api_access} hint="Bearer-token auth, JSON" />
            <FeatureRow label="Outbound webhooks" on={!!f.webhooks} hint="HMAC-signed event delivery" />
            <FeatureRow label="SSO — SAML 2.0 + OIDC" on={!!f.sso} hint="Pro Suite only" />
            <FeatureRow label="White-label PDF reports" on={!!f.white_label} hint="Pro Suite only" />
          </div>
        </div>

        {/* Quick links to the unlocked surfaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {f.dashboard && (
            <Link href="/vendor/trm" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">MAS TRM — 13 domains</p>
              <p className="text-xs text-neutral-400 mt-0.5">Per-domain status + AI gap analysis</p>
            </Link>
          )}
          {f.api_access && (
            <Link href="/vendor/api-keys" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
              <KeyRound className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">API keys</p>
              <p className="text-xs text-neutral-400 mt-0.5">Generate a Bearer token for programmatic access</p>
            </Link>
          )}
          {f.webhooks && (
            <Link href="/vendor/webhooks" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
              <Webhook className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">Webhooks</p>
              <p className="text-xs text-neutral-400 mt-0.5">Register endpoints for event delivery</p>
            </Link>
          )}
          {f.multi_vendor && (
            <Link href="/vendor/subsidiaries" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
              <Building2 className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">Multi-vendor view</p>
              <p className="text-xs text-neutral-400 mt-0.5">Manage subsidiaries and child entities</p>
            </Link>
          )}
          {f.sso && (
            <Link href="/vendor/sso" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
              <Globe className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="font-semibold text-white text-sm">Single Sign-On</p>
              <p className="text-xs text-neutral-400 mt-0.5">Configure SAML 2.0 / OIDC</p>
            </Link>
          )}
          <Link href="/notarization" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
            <FileText className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="font-semibold text-white text-sm">Notarize a document</p>
            <p className="text-xs text-neutral-400 mt-0.5">SHA-256 anchored on Polygon</p>
          </Link>
          <Link href="/compliance/cover-sheet" className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-700 rounded-xl p-4 transition">
            <Zap className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="font-semibold text-white text-sm">Compliance Cover Sheet</p>
            <p className="text-xs text-neutral-400 mt-0.5">Regulator-ready 9-section PDF</p>
          </Link>
        </div>

        {/* Plan IDs for debugging / support — shows the SELECTED sub's id
            when tabs are active, so support can correlate the right one. */}
        {(data.stripe_customer_id || displayStripeSubId) && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-500 font-mono">
            {data.stripe_customer_id && <div>Customer: {data.stripe_customer_id}</div>}
            {displayStripeSubId && <div>Subscription: {displayStripeSubId}</div>}
          </div>
        )}
      </div>
    </main>
  )
}
