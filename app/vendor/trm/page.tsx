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
