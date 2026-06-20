'use client'

import { useState, useEffect } from 'react'

type Field = { key: string; label: string; help: string; max_length: number; type: string }
type Activity = Record<string, string>

export default function PdpaDeclarationSection() {
  const [fields, setFields] = useState<Field[]>([])
  const [legalBasisOptions, setLegalBasisOptions] = useState<string[]>([])
  const [maxActivities, setMaxActivities] = useState(20)
  const [activities, setActivities] = useState<Activity[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState<boolean | null>(null)

  type L2Status = {
    completed: boolean
    submitted: boolean
    download_url?: string | null
    tx_hash?: string | null
    anchored_at?: string | null
    network?: string
    explorer_url?: string
  }
  const [status, setStatus] = useState<L2Status | null>(null)

  const emptyActivity = (fs: Field[]): Activity =>
    fs.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {} as Activity)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [])

  // Poll Level-2 fulfillment status: once submitted, the worker generates +
  // anchors the record within ~10s, after which we show the anchored deliverable.
  useEffect(() => {
    if (!authed) return
    let timer: ReturnType<typeof setInterval> | null = null
    const fetchStatus = () =>
      fetch('/api/pdpa-declaration/status')
        .then((r) => (r.ok ? r.json() : null))
        .then((d: L2Status | null) => {
          if (!d) return
          setStatus(d)
          if (d.submitted) setSubmitted(true)
          if (d.completed && timer) { clearInterval(timer); timer = null }
        })
        .catch(() => {})
    fetchStatus()
    timer = setInterval(fetchStatus, 6000)
    return () => { if (timer) clearInterval(timer) }
  }, [authed])

  useEffect(() => {
    if (!authed) return
    fetch('/api/pdpa-declaration/schema')
      .then((r) => r.json())
      .then((d) => {
        const fs: Field[] = Array.isArray(d.fields) ? d.fields : []
        setFields(fs)
        if (Array.isArray(d.legal_basis_options)) setLegalBasisOptions(d.legal_basis_options)
        if (typeof d.max_activities === 'number') setMaxActivities(d.max_activities)
        setActivities((prev) => (prev.length ? prev : [emptyActivity(fs)]))
      })
      .catch(() => {})

    fetch('/api/pdpa-declaration/intake')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        if (Array.isArray(d.activities) && d.activities.length) setActivities(d.activities)
        if (d.submitted) setSubmitted(true)
      })
      .catch(() => {})
  }, [authed])

  if (authed === false) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-[#0f172a] text-sm">Upgrade to PDPC Level 2 — Self-Declaration</h3>
        <p className="text-xs text-slate-500 mt-1">
          <a href="/login" className="text-emerald-700 font-semibold hover:underline">Sign in</a>{' '}
          to add your processing-activity declaration and generate a blockchain-anchored Level 2 record.
        </p>
      </div>
    )
  }
  if (authed === null) return null

  const updateRow = (i: number, key: string, value: string) => {
    setSaved(false)
    setActivities((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  }
  const addRow = () => {
    if (activities.length >= maxActivities) return
    setActivities((prev) => [...prev, emptyActivity(fields)])
  }
  const removeRow = (i: number) =>
    setActivities((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const saveDraft = async (): Promise<boolean> => {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/pdpa-declaration/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        const detail = d?.detail
        setError(
          (detail?.errors && detail.errors.join(' ')) ||
            (typeof detail === 'string' ? detail : '') ||
            'Could not save your declaration.'
        )
        return false
      }
      setSaved(true)
      return true
    } catch {
      setError('Network error — please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const submit = async () => {
    const ok = await saveDraft()
    if (!ok) return
    setSaving(true)
    try {
      const res = await fetch('/api/pdpa-declaration/intake/submit', { method: 'POST' })
      if (res.ok) setSubmitted(true)
      else {
        const d = await res.json().catch(() => ({}))
        setError(typeof d?.detail === 'string' ? d.detail : 'Could not submit your declaration.')
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    // Anchored & ready — present it as part of the PDPA deliverable.
    if (status?.completed) {
      const txUrl = status.tx_hash && status.explorer_url
        ? `${status.explorer_url}/tx/${status.tx_hash}`
        : null
      return (
        <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-sky-50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              PDPC Level 2 ✓
            </span>
            <h3 className="font-bold text-[#0f172a] text-sm">Record of Processing Activities — anchored</h3>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Your Level-2 self-declaration is part of your PDPA evidence trail: a tamper-evident,
            blockchain-anchored record alongside your Quick Scan (Level 1).
          </p>
          <div className="flex flex-wrap gap-2">
            {status.download_url && (
              <a href={status.download_url} target="_blank" rel="noreferrer"
                className="text-xs font-semibold bg-[#0f172a] text-white rounded px-3 py-1.5">
                ⬇ Download Level-2 record
              </a>
            )}
            {txUrl && (
              <a href={txUrl} target="_blank" rel="noreferrer"
                className="text-xs font-semibold border border-slate-300 rounded px-3 py-1.5 text-slate-700">
                View blockchain anchor ↗
              </a>
            )}
          </div>
          {status.network && (
            <p className="text-[10px] text-slate-400 mt-2">Anchored on {status.network}.</p>
          )}
        </div>
      )
    }
    // Submitted, worker still generating + anchoring.
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-700">
          ✓ PDPA Level-2 self-declaration submitted — generating and anchoring your record…
        </p>
        <p className="text-xs text-emerald-600 mt-1">This usually takes under a minute. It will also arrive by email.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-bold text-[#0f172a] text-sm">Upgrade to PDPC Level 2 — Self-Declaration</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your Quick Scan covers Level 1 (automated). Declare your processing activities and
          accountability measures below to produce a blockchain-anchored PDPC Level 2 record.
        </p>
      </div>

      {activities.map((row, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Activity {i + 1}</span>
            {activities.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-600 hover:underline">
                Remove
              </button>
            )}
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={row[f.key] ?? ''}
                  onChange={(e) => updateRow(i, f.key, e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                >
                  <option value="">Select…</option>
                  {legalBasisOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={row[f.key] ?? ''}
                  onChange={(e) => updateRow(i, f.key, e.target.value)}
                  placeholder={f.help}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">Draft saved.</p>}

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={addRow}
          disabled={activities.length >= maxActivities}
          className="text-sm text-slate-600 hover:underline disabled:opacity-40"
        >
          + Add another activity
        </button>
        <span className="flex-1" />
        <button type="button" onClick={saveDraft} disabled={saving}
          className="text-sm border border-slate-300 rounded px-3 py-1.5 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button type="button" onClick={submit} disabled={saving}
          className="bg-emerald-600 text-white rounded px-4 py-1.5 text-sm font-medium disabled:opacity-50">
          Submit declaration
        </button>
      </div>
    </div>
  )
}
