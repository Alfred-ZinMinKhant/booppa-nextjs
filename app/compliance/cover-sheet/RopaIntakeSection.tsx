'use client'

import { useState, useEffect } from 'react'

type RopaField = {
  key: string
  label: string
  help: string
  max_length: number
  type: string
}

type RopaActivity = Record<string, string>

const FIELD_KEYS = [
  'processing_purpose',
  'data_categories',
  'data_subjects',
  'retention_period',
  'cross_border_transfer',
  'legal_basis',
]

const emptyActivity = (): RopaActivity =>
  FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as RopaActivity)

export default function RopaIntakeSection() {
  const [fields, setFields] = useState<RopaField[]>([])
  const [legalBasisOptions, setLegalBasisOptions] = useState<string[]>([])
  const [maxActivities, setMaxActivities] = useState(15)
  const [activities, setActivities] = useState<RopaActivity[]>([emptyActivity()])
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/ropa/schema')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.fields)) setFields(d.fields)
        if (Array.isArray(d.legal_basis_options)) setLegalBasisOptions(d.legal_basis_options)
        if (typeof d.max_activities === 'number') setMaxActivities(d.max_activities)
      })
      .catch(() => {})

    fetch('/api/ropa/intake')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        if (Array.isArray(d.activities) && d.activities.length) {
          setActivities(
            d.activities.map((a: RopaActivity) => {
              const row = emptyActivity()
              FIELD_KEYS.forEach((k) => {
                if (a[k] != null) row[k] = a[k]
              })
              return row
            })
          )
        }
        if (d.submitted) setSubmitted(true)
      })
      .catch(() => {})
  }, [])

  const updateRow = (i: number, key: string, value: string) => {
    setSaved(false)
    setActivities((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  }

  const addRow = () => {
    if (activities.length >= maxActivities) return
    setActivities((prev) => [...prev, emptyActivity()])
  }

  const removeRow = (i: number) => {
    setActivities((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))
  }

  const saveDraft = async (): Promise<boolean> => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/ropa/intake', {
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
            'Could not save your ROPA draft.'
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
      const res = await fetch('/api/ropa/intake/submit', { method: 'POST' })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(typeof d?.detail === 'string' ? d.detail : 'Could not submit your ROPA.')
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const labelFor = (key: string) =>
    fields.find((f) => f.key === key)?.label ?? key
  const helpFor = (key: string) => fields.find((f) => f.key === key)?.help ?? ''

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-700">
          ✓ ROPA submitted — included in your Cover Sheet as the 4th anchored document.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-bold text-[#0f172a] text-sm">
          Record of Processing Activities (ROPA)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Required for PDPC Level 2. Declare each way your organisation processes personal
          data — payroll, marketing, CCTV, and so on. You can save a draft and finish later.
        </p>
      </div>

      {activities.map((row, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Activity {i + 1}</span>
            {activities.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          {FIELD_KEYS.map((key) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                {labelFor(key)}
              </label>
              {key === 'legal_basis' ? (
                <select
                  value={row[key]}
                  onChange={(e) => updateRow(i, key, e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                >
                  <option value="">Select legal basis…</option>
                  {legalBasisOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={row[key]}
                  onChange={(e) => updateRow(i, key, e.target.value)}
                  placeholder={helpFor(key)}
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
        <button
          type="button"
          onClick={saveDraft}
          disabled={saving}
          className="text-sm border border-slate-300 rounded px-3 py-1.5 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="bg-emerald-600 text-white rounded px-4 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Submit ROPA
        </button>
      </div>
    </div>
  )
}
