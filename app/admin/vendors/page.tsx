'use client'

import { useEffect, useState, FormEvent, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X, Search } from 'lucide-react'

interface Vendor {
  id: string
  company_name: string
  slug: string
  domain: string | null
  website: string | null
  uen: string | null
  industry: string | null
  country: string | null
  city: string | null
  contact_email: string | null
  scan_status: string
  created_at: string | null
}

const empty = {
  company_name: '', slug: '', domain: '', website: '', uen: '',
  industry: '', country: 'Singapore', city: '', short_description: '', contact_email: '',
}

export default function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search.trim()) params.set('q', search.trim())
    const res = await fetch(`/api/admin/api/admin/vendors?${params}`, { cache: 'no-store' })
    if (!res.ok) {
      setError(`Failed to load (${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  function openCreate() { setForm(empty); setCreating(true); setEditing(null) }
  function openEdit(v: Vendor) {
    setForm({
      company_name: v.company_name, slug: v.slug,
      domain: v.domain || '', website: v.website || '',
      uen: v.uen || '', industry: v.industry || '',
      country: v.country || 'Singapore', city: v.city || '',
      short_description: '', contact_email: v.contact_email || '',
    })
    setEditing(v); setCreating(false)
  }
  function close() { setEditing(null); setCreating(false); setError('') }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const url = creating ? '/api/admin/api/admin/vendors' : `/api/admin/api/admin/vendors/${editing!.id}`
    const payload = Object.fromEntries(Object.entries(form).filter(([_, v]) => v !== ''))
    const res = await fetch(url, {
      method: creating ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.detail || `Save failed (${res.status})`)
      return
    }
    close(); load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete vendor "${name}"?`)) return
    const res = await fetch(`/api/admin/api/admin/vendors/${id}`, { method: 'DELETE' })
    if (res.status === 204) load()
    else alert(`Delete failed (${res.status})`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Vendors</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} marketplace vendors.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/import" className="inline-flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 text-neutral-200 px-3 py-2 rounded-lg text-sm">
            Bulk import CSV
          </Link>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> New vendor
          </button>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="search"
          placeholder="Search by company name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
      </div>

      {error && !creating && !editing && (
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
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Industry</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">UEN</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(v => (
                <tr key={v.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{v.company_name}</div>
                    <div className="text-xs text-neutral-500 font-mono">/{v.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{v.industry || '—'}</td>
                  <td className="px-4 py-3 text-neutral-300">{v.country || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{v.uen || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{v.contact_email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-3">
                      <button type="button" onClick={() => openEdit(v)} className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(v.id, v.company_name)} className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No vendors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{creating ? 'New vendor' : 'Edit vendor'}</h2>
              <button type="button" onClick={close} className="text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Company name" required value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
              <Input label="Slug" hint="Auto-generated if blank." value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Industry" value={form.industry} onChange={v => setForm(f => ({ ...f, industry: v }))} />
                <Input label="Country" value={form.country} onChange={v => setForm(f => ({ ...f, country: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="UEN" value={form.uen} onChange={v => setForm(f => ({ ...f, uen: v }))} />
                <Input label="City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} />
              </div>
              <Input label="Domain" value={form.domain} onChange={v => setForm(f => ({ ...f, domain: v }))} />
              <Input label="Website" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} />
              <Input label="Contact email" value={form.contact_email} onChange={v => setForm(f => ({ ...f, contact_email: v }))} />
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Short description</label>
                <textarea
                  value={form.short_description}
                  onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
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
  label, value, onChange, required, hint,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
      />
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  )
}
