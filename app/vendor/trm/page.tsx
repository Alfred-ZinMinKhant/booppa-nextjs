'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, AlertCircle, AlertTriangle, Loader2, ArrowLeft,
  ChevronDown, ChevronRight, Sparkles, CheckCircle2, XCircle, Clock,
  Upload, Trash2, FileText,
} from 'lucide-react'

interface TrmControl {
  id: string
  domain: string
  control_ref: string | null
  description: string | null
  status: 'not_started' | 'in_progress' | 'compliant' | 'gap' | null
  risk_rating: 'low' | 'medium' | 'high' | 'critical' | null
  gap_analysis: string | null
  evidence_count?: number
  updated_at: string | null
}

interface TrmPayload {
  total: number
  summary: {
    compliant_pct: number
    by_status: Record<string, number>
    by_risk: Record<string, number>
  }
  items: TrmControl[]
}

const STATUS_META: Record<string, { label: string; color: string; Icon: any }> = {
  compliant:   { label: 'Compliant',   color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',  Icon: CheckCircle2 },
  in_progress: { label: 'In progress', color: 'bg-sky-500/15 text-sky-300 border-sky-500/40',              Icon: Clock },
  gap:         { label: 'Gap',         color: 'bg-red-500/15 text-red-300 border-red-500/40',              Icon: XCircle },
  not_started: { label: 'Not started', color: 'bg-neutral-800 text-neutral-400 border-neutral-700',        Icon: AlertCircle },
}

const RISK_META: Record<string, string> = {
  low:      'bg-emerald-500/15 text-emerald-300',
  medium:   'bg-amber-500/15 text-amber-300',
  high:     'bg-orange-500/15 text-orange-300',
  critical: 'bg-red-500/15 text-red-300',
}

export default function TrmPage() {
  const [data, setData] = useState<TrmPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [context, setContext] = useState<Record<string, string>>({})
  const [running, setRunning] = useState<string | null>(null)
  const [savingStatus, setSavingStatus] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/trm', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setData(d)
    } catch (e: any) {
      setError(e?.message || 'Network error')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const runGap = async (id: string) => {
    const ctx = (context[id] || '').trim()
    if (ctx.length < 10) {
      alert('Provide at least 10 characters of context describing your current state for this domain.')
      return
    }
    setRunning(id)
    setError('')
    try {
      const r = await fetch(`/api/vendor/trm/${id}/gap-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      // Patch the row in place + refresh summary
      load()
    } finally {
      setRunning(null)
    }
  }

  const setStatus = async (id: string, status: TrmControl['status']) => {
    setSavingStatus(id)
    try {
      const r = await fetch(`/api/vendor/trm/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (r.ok) load()
    } finally { setSavingStatus(null) }
  }

  if (loading) {
    return <main className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="h-6 w-6 text-emerald-400 animate-spin" /></main>
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-950 p-6">
        <div className="max-w-2xl mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
          <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white mb-2">MAS TRM dashboard unavailable</h1>
          <p className="text-neutral-400 text-sm mb-6">{error || 'No data.'}</p>
          <Link href="/vendor/subscription" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">
            Back to subscription →
          </Link>
        </div>
      </main>
    )
  }

  const s = data.summary
  const gapsAndHighRisk = (s.by_status.gap || 0) + (s.by_risk.high || 0) + (s.by_risk.critical || 0)

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/vendor/subscription" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to subscription
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" /> MAS TRM — 13-domain dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track compliance status, run AI gap analysis per domain, and capture evidence for your MAS Technology Risk Management programme.
          </p>
        </div>

        {/* Summary header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Domains" value={String(data.total)} hint="MAS TRM 2021" />
          <SummaryCard label="Compliant" value={`${s.compliant_pct}%`} hint={`${s.by_status.compliant || 0} of ${data.total}`} tone="good" />
          <SummaryCard label="Open gaps" value={String(s.by_status.gap || 0)} hint="needs action" tone={s.by_status.gap ? 'bad' : 'good'} />
          <SummaryCard label="High/critical risk" value={String((s.by_risk.high || 0) + (s.by_risk.critical || 0))} hint="from AI analysis" tone={gapsAndHighRisk ? 'warn' : 'good'} />
        </div>

        {/* MAS TRM Baseline — the starting-inventory PDF generated on Suite activation */}
        <BaselineReportCard />

        {/* Board-ready monthly report — download latest or generate on demand */}
        <BoardReportCard />

        {/* Compliance trend over time — surfaces month-over-month progress that
            previously lived only in the emailed board report PDF */}
        <TrmProgressCard />

        {/* Pro Suite: group-wide subsidiary comparison (hidden for Standard / sub-tenants) */}
        <SubsidiaryComparison />

        {/* Pro Suite capabilities — discoverable in one place */}
        <ProFeaturesCard />

        {(s.by_status.not_started || 0) === data.total && (
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-sky-200">
            <Sparkles className="h-4 w-4 text-sky-300 flex-shrink-0 mt-0.5" />
            <p>
              Your 13 TRM controls are initialised. Expand each domain, paste a paragraph of context describing your current
              state (existing policies, tools, evidence), then click <strong>Run AI gap analysis</strong> to identify gaps
              and rate risk.
            </p>
          </div>
        )}

        {/* Domain list */}
        <div className="space-y-2">
          {data.items.map(c => {
            const meta = STATUS_META[c.status || 'not_started']
            const Icon = meta.Icon
            const open = expanded === c.id
            return (
              <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : c.id)}
                  className="w-full text-left p-4 flex items-start gap-3 hover:bg-neutral-800/40 transition rounded-xl"
                >
                  {open
                    ? <ChevronDown className="h-4 w-4 text-neutral-400 mt-1 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-neutral-400 mt-1 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-neutral-500">{c.control_ref}</span>
                      <p className="text-white font-semibold text-sm">{c.domain}</p>
                    </div>
                    {c.gap_analysis && !open && (
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{c.gap_analysis}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!!c.evidence_count && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        📎 {c.evidence_count}
                      </span>
                    )}
                    {c.risk_rating && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${RISK_META[c.risk_rating]}`}>
                        {c.risk_rating}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.color}`}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-neutral-800 p-4 space-y-4">
                    {/* Existing AI narrative */}
                    {c.gap_analysis && (
                      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">AI gap analysis</p>
                        <p className="text-sm text-neutral-200 whitespace-pre-wrap">{c.gap_analysis}</p>
                        {c.updated_at && (
                          <p className="text-[10px] text-neutral-500 mt-2">
                            Last analysed {new Date(c.updated_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Context input + run button */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        {c.gap_analysis ? 'Re-analyse with updated context' : 'Paste your current-state context'}
                      </label>
                      <textarea
                        value={context[c.id] || ''}
                        onChange={e => setContext({ ...context, [c.id]: e.target.value })}
                        placeholder="Describe what you have in place for this domain — policies, tooling, audit cadence, owners, etc."
                        rows={4}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => runGap(c.id)}
                          disabled={running === c.id || (context[c.id] || '').trim().length < 10}
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
                        >
                          {running === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          {c.gap_analysis ? 'Re-run AI analysis' : 'Run AI gap analysis'}
                        </button>

                        {/* Manual status overrides */}
                        <div className="flex gap-1 ml-auto">
                          {(['in_progress','compliant','gap'] as const).map(opt => (
                            <button
                              key={opt}
                              type="button"
                              disabled={savingStatus === c.id || c.status === opt}
                              onClick={() => setStatus(c.id, opt)}
                              className={`text-[10px] px-2 py-1 rounded ${
                                c.status === opt
                                  ? 'bg-neutral-700 text-white cursor-default'
                                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                              }`}
                            >
                              Mark {STATUS_META[opt].label.toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!c.gap_analysis && (context[c.id] || '').length === 0 && (
                      <p className="text-xs text-neutral-500 italic">
                        Tip: a few sentences is enough. Include policy names, tools (e.g. CrowdStrike, OneTrust), audit cadence,
                        and named owners — the model uses this to identify what&apos;s missing.
                      </p>
                    )}

                    {/* Evidence */}
                    <EvidenceManager controlId={c.id} onChange={load} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

function SummaryCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good'|'bad'|'warn' }) {
  const valueColor = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : tone === 'warn' ? 'text-amber-400' : 'text-white'
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      {hint && <p className="text-[11px] text-neutral-500 mt-0.5">{hint}</p>}
    </div>
  )
}

// ── Compliance trend over time ────────────────────────────────────────────────
type TrmProgressPoint = { label: string; compliant_pct: number; generated_at: string }

function TrmProgressCard() {
  const [points, setPoints] = useState<TrmProgressPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/vendor/trm/progress-history', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { points: [] }))
      .then((d) => { if (active) setPoints(Array.isArray(d.points) ? d.points : []) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading || points.length < 2) return null  // needs ≥2 snapshots to trend

  const w = 560, h = 120, pad = 26
  const xs = points.map((_, i) => pad + (i * (w - 2 * pad)) / (points.length - 1))
  const ys = points.map((p) => h - pad - (p.compliant_pct / 100) * (h - 2 * pad))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const first = points[0].compliant_pct
  const last = points[points.length - 1].compliant_pct
  const delta = last - first

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">MAS TRM compliance trend</h2>
        {delta !== 0 && (
          <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta > 0 ? '+' : ''}{delta}% since {points[0].label}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 mt-2">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#262626" strokeWidth="1" />
        <path d={path} fill="none" stroke="#34d399" strokeWidth="2" />
        {xs.map((x, i) => (
          <g key={points[i].generated_at}>
            <circle cx={x} cy={ys[i]} r="3" fill="#34d399" />
            <text x={x} y={ys[i] - 8} textAnchor="middle" className="fill-neutral-300" fontSize="9">{points[i].compliant_pct}%</text>
            <text x={x} y={h - pad + 14} textAnchor="middle" className="fill-neutral-500" fontSize="9">{points[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Pro Suite capabilities — discoverable in one place ────────────────────────
function ProFeaturesCard() {
  const features = [
    { title: 'Multi-entity comparison', desc: 'Group-wide MAS TRM rollup across subsidiaries.', href: '/vendor/subsidiaries' },
    { title: 'Single sign-on (SSO)', desc: 'SAML 2.0 / OIDC for your team.', href: '/vendor/sso' },
    { title: 'White-label board report', desc: 'Your logo and colours on the monthly board PDF.', href: '/vendor/white-label' },
  ]
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-white font-semibold text-sm">Pro Suite capabilities</h2>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/40">PRO</span>
      </div>
      <p className="text-xs text-neutral-500 mb-3">Available on Pro Suite. Standard subscribers can upgrade to unlock these.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3 hover:border-violet-500/40 transition-colors">
            <p className="text-sm font-semibold text-white">{f.title}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">{f.desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-300">Open <ChevronRight className="h-3 w-3" /></span>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface BoardReport {
  available: boolean
  download_url?: string | null
  generated_at?: string | null
  compliant_pct?: number | null
  plan_label?: string | null
}

function BoardReportCard() {
  const [report, setReport] = useState<BoardReport | null>(null)
  const [hidden, setHidden] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const r = await fetch('/api/vendor/trm/board-report/latest', { cache: 'no-store' })
      if (!r.ok) { setHidden(true); return }
      setReport(await r.json())
    } catch {
      setHidden(true)
    }
  }
  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])

  const generate = async () => {
    setGenerating(true)
    setNotice('')
    try {
      const r = await fetch('/api/vendor/trm/board-report/generate', { method: 'POST' })
      const d = await r.json().catch(() => ({}))
      setNotice(r.ok ? (d?.message || 'Your board report is being generated and will be emailed shortly.')
                     : (d?.detail || 'Could not start generation.'))
    } catch {
      setNotice('Network error — please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (hidden) return null

  const generatedOn = report?.generated_at ? new Date(report.generated_at).toLocaleDateString() : null

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" /> Board-ready monthly report
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            One-page RAG status, month-over-month progress, top risks and next focus — board-presentable.
            {report?.available && typeof report.compliant_pct === 'number'
              ? ` Latest: ${report.compliant_pct}% compliant${generatedOn ? ` · ${generatedOn}` : ''}.`
              : ' No report generated yet.'}
          </p>
          {notice && <p className="text-xs text-emerald-300 mt-2">{notice}</p>}
        </div>
        <div className="flex items-center gap-2">
          {report?.available && report.download_url && (
            <a
              href={report.download_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg"
            >
              <FileText className="h-3.5 w-3.5" /> Download latest
            </a>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {report?.available ? 'Regenerate' : 'Generate now'}
          </button>
        </div>
      </div>
    </section>
  )
}

interface BaselineReport {
  available: boolean
  download_url?: string | null
  generated_at?: string | null
  plan_label?: string | null
}

function BaselineReportCard() {
  const [report, setReport] = useState<BaselineReport | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/vendor/trm/baseline/latest', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) { if (active) setHidden(true); return null }
        return r.json()
      })
      .then(d => { if (active && d) setReport(d) })
      .catch(() => { if (active) setHidden(true) })
    return () => { active = false }
  }, [])

  if (hidden) return null

  const generatedOn = report?.generated_at ? new Date(report.generated_at).toLocaleDateString() : null

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" /> MAS TRM Baseline Assessment
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Your starting inventory across all 13 MAS TRM domains, generated when your Suite subscription
            activated and emailed to you at the time.
            {report?.available
              ? ` Generated ${generatedOn || 'recently'}.`
              : ' Not generated yet — this is created automatically once your Suite subscription is active.'}
          </p>
        </div>
        {report?.available && report.download_url && (
          <a
            href={report.download_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg"
          >
            <FileText className="h-3.5 w-3.5" /> Download baseline (PDF)
          </a>
        )}
      </div>
    </section>
  )
}

interface ComparisonEntity {
  user_id: string
  name: string
  is_parent: boolean
  sector: string | null
  domains_complete: number
  domains_total: number
  compliant_pct: number
  critical_open: number
  domain_status: Record<string, string>
  last_updated: string | null
}

interface ComparisonPayload {
  entity_count: number
  domains: string[]
  entities: ComparisonEntity[]
  alerts: string[]
}

const RAG_DOT: Record<string, string> = {
  compliant: 'bg-emerald-500',
  in_progress: 'bg-amber-500',
  not_started: 'bg-neutral-600',
  gap: 'bg-red-500',
}

function SubsidiaryComparison() {
  const [data, setData] = useState<ComparisonPayload | null>(null)
  const [hidden, setHidden] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/vendor/trm/subsidiary-comparison', { cache: 'no-store' })
      .then(async r => {
        // 403 (Standard, no multi_vendor) or 400 (sub-tenant) → silently hide.
        if (!r.ok) { if (active) setHidden(true); return null }
        return r.json()
      })
      .then(d => { if (active && d) setData(d) })
      .catch(() => { if (active) setHidden(true) })
    return () => { active = false }
  }, [])

  // Only meaningful once there's a parent + at least one subsidiary.
  if (hidden || !data || data.entity_count < 2) return null

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Group MAS TRM comparison
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">Pro</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Consolidated TRM posture across your {data.entity_count} group entities.
        </p>
      </div>

      {data.alerts.length > 0 && (
        <div className="space-y-1.5">
          {data.alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
              <th className="text-left font-bold py-2 pr-3">Entity</th>
              <th className="text-right font-bold py-2 px-3">Complete</th>
              <th className="text-right font-bold py-2 px-3">Critical open</th>
              <th className="text-left font-bold py-2 pl-3">By domain</th>
            </tr>
          </thead>
          <tbody>
            {data.entities.map(e => (
              <tr
                key={e.user_id}
                onClick={() => !e.is_parent && setSelectedId(selectedId === e.user_id ? null : e.user_id)}
                className={`border-b border-neutral-800/60 ${!e.is_parent ? 'cursor-pointer hover:bg-neutral-800/40' : ''}`}
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{e.name}</span>
                    {e.is_parent && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">Parent</span>
                    )}
                    {!e.is_parent && (
                      <ChevronRight className={`h-3 w-3 text-neutral-500 transition-transform ${selectedId === e.user_id ? 'rotate-90' : ''}`} />
                    )}
                  </div>
                  {e.sector && <span className="text-[10px] text-neutral-500 capitalize">{e.sector}</span>}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`font-bold ${e.compliant_pct >= 70 ? 'text-emerald-400' : e.compliant_pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                    {e.compliant_pct}%
                  </span>
                  <span className="text-[10px] text-neutral-500 ml-1">({e.domains_complete}/{e.domains_total})</span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={e.critical_open ? 'text-red-400 font-semibold' : 'text-neutral-500'}>{e.critical_open}</span>
                </td>
                <td className="py-2.5 pl-3">
                  <div className="flex gap-1">
                    {data.domains.map(d => (
                      <span
                        key={d}
                        title={`${d}: ${(e.domain_status[d] || 'not_started').replace('_', ' ')}`}
                        className={`h-2.5 w-2.5 rounded-full ${RAG_DOT[e.domain_status[d] || 'not_started'] || 'bg-neutral-600'}`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <SubsidiaryDetail
          subsidiaryId={selectedId}
          name={data.entities.find(e => e.user_id === selectedId)?.name || 'Subsidiary'}
        />
      )}
    </section>
  )
}

// Read-only drill-down into one subsidiary's own 13-domain TRM workspace
// (gap analysis text + evidence count) — the group table above only shows
// a per-domain status matrix, not the underlying detail. Parent-tenant only;
// the backend (_resolve_trm_target_user) 403s any other caller.
function SubsidiaryDetail({ subsidiaryId, name }: { subsidiaryId: string; name: string }) {
  const [data, setData] = useState<TrmPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetch(`/api/vendor/trm?subsidiary_id=${encodeURIComponent(subsidiaryId)}`, { cache: 'no-store' })
      .then(async r => {
        const d = await r.json()
        if (!r.ok) { if (active) setError(d?.detail || `Failed (${r.status})`); return }
        if (active) setData(d)
      })
      .catch(() => { if (active) setError('Network error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [subsidiaryId])

  return (
    <div className="border-t border-neutral-800 pt-4">
      <p className="text-xs font-bold text-neutral-300 mb-2">{name} — full TRM workspace</p>
      {loading ? (
        <div className="text-neutral-500 text-xs inline-flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>
      ) : error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : data ? (
        <div className="space-y-1.5">
          {data.items.map(item => {
            const meta = STATUS_META[item.status || 'not_started']
            return (
              <div key={item.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-neutral-800/60 last:border-0">
                <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${meta.color} flex-shrink-0`}>{meta.label}</span>
                <span className="text-neutral-200 flex-1 min-w-0 truncate">{item.domain}</span>
                {item.risk_rating && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${RISK_META[item.risk_rating]}`}>{item.risk_rating}</span>
                )}
                <span className="text-neutral-500 text-[10px] flex-shrink-0">{item.evidence_count || 0} evidence</span>
              </div>
            )
          })}
          {data.items.some(i => i.gap_analysis) && (
            <div className="mt-3 space-y-2">
              {data.items.filter(i => i.gap_analysis).map(i => (
                <div key={i.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{i.domain} — gap analysis</p>
                  <p className="text-xs text-neutral-300 whitespace-pre-wrap">{i.gap_analysis}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

interface EvidenceItem {
  id: string
  file_name: string | null
  hash_value: string | null
  tx_hash: string | null
  uploaded_at: string | null
  download_url: string | null
}

function EvidenceManager({ controlId, onChange }: { controlId: string; onChange: () => void }) {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/vendor/trm/${controlId}/evidence`, { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        setItems(Array.isArray(d.items) ? d.items : [])
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [controlId])

  const upload = async (file: File) => {
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`/api/vendor/trm/${controlId}/evidence`, { method: 'POST', body: fd })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setError(typeof d?.detail === 'string' ? d.detail : 'Upload failed.')
      } else {
        await load()
        onChange()
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      const r = await fetch(`/api/vendor/trm/${controlId}/evidence/${id}`, { method: 'DELETE' })
      if (r.ok) {
        await load()
        onChange()
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Evidence</p>

      {loading ? (
        <p className="text-xs text-neutral-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-neutral-500 mb-2">No evidence attached yet.</p>
      ) : (
        <ul className="space-y-1 mb-2">
          {items.map(it => (
            <li key={it.id} className="flex items-center gap-2 text-xs text-neutral-200">
              <FileText className="h-3 w-3 text-neutral-500 flex-shrink-0" />
              {it.download_url ? (
                <a href={it.download_url} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline truncate">
                  {it.file_name}
                </a>
              ) : (
                <span className="truncate">{it.file_name}</span>
              )}
              {it.tx_hash && <span className="text-[10px] text-emerald-400">anchored</span>}
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="ml-auto text-neutral-500 hover:text-red-400"
                aria-label="Delete evidence"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <label className="inline-flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 px-3 py-1.5 rounded-lg cursor-pointer">
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading ? 'Uploading…' : 'Upload evidence'}
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) upload(f)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}
