'use client'

import { useEffect, useState, FormEvent } from 'react'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X } from 'lucide-react'

interface Tender {
  id: string
  tender_no: string
  sector: string
  agency: string
  description: string | null
  base_rate: number
  created_at: string | null
}

const empty = { tender_no: '', sector: '', agency: '', description: '', base_rate: 0.2 }

export default function TendersPage() {
  const [items, setItems] = useState<Tender[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Tender | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<typeof empty>(empty)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/api/admin/tenders?limit=200', { cache: 'no-store' })
    if (!res.ok) {
      setError(`Failed to load (${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(empty)
    setCreating(true)
    setEditing(null)
  }
  function openEdit(t: Tender) {
    setForm({
      tender_no: t.tender_no, sector: t.sector, agency: t.agency,
      description: t.description || '', base_rate: t.base_rate,
    })
    setEditing(t)
    setCreating(false)
  }
  function close() { setEditing(null); setCreating(false) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = creating ? '/api/admin/api/admin/tenders' : `/api/admin/api/admin/tenders/${editing!.id}`
    const res = await fetch(url, {
      method: creating ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.detail || `Save failed (${res.status})`)
      return
    }
    close()
    load()
  }

  async function handleDelete(id: string, tender_no: string) {
    if (!confirm(`Delete tender ${tender_no}?`)) return
    const res = await fetch(`/api/admin/api/admin/tenders/${id}`, { method: 'DELETE' })
    if (res.status === 204) load()
    else alert(`Delete failed (${res.status})`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tenders</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} entries.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> New tender
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Tender No.</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-left">Agency</th>
                <th className="px-4 py-3 text-left">Base rate</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-mono text-white">{t.tender_no}</td>
                  <td className="px-4 py-3 text-neutral-300">{t.sector}</td>
                  <td className="px-4 py-3 text-neutral-300">{t.agency}</td>
                  <td className="px-4 py-3 text-neutral-300">{(t.base_rate * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-3">
                      <button type="button" onClick={() => openEdit(t)} className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(t.id, t.tender_no)} className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No tenders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{creating ? 'New tender' : 'Edit tender'}</h2>
              <button type="button" onClick={close} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Tender No." required value={form.tender_no} onChange={v => setForm(f => ({ ...f, tender_no: v }))} />
              <Input label="Sector" required value={form.sector} onChange={v => setForm(f => ({ ...f, sector: v }))} />
              <Input label="Agency" required value={form.agency} onChange={v => setForm(f => ({ ...f, agency: v }))} />
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
              <Input
                label="Base rate (0.0 – 1.0)"
                type="number"
                value={String(form.base_rate)}
                onChange={v => setForm(f => ({ ...f, base_rate: parseFloat(v) || 0 }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={close} className="px-4 py-2 text-sm text-neutral-300 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving…' : creating ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Input({
  label, value, onChange, type = 'text', required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
      />
    </div>
  )
}
