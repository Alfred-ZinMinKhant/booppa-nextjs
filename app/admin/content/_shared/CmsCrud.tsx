'use client'

import { useEffect, useState, FormEvent, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export type CmsKind = 'blogs' | 'rfp-tips' | 'compliance' | 'vendor-guides'

export interface CmsPost {
  id: string
  title: string
  slug: string
  content: string
  author: string | null
  cta1_text: string | null
  cta1_url: string | null
  cta2_text: string | null
  cta2_url: string | null
  published: boolean
  published_at: string | null
  created_at: string | null
  updated_at: string | null
  images?: { id: number; url: string; caption: string | null }[]
}

const KIND_LABELS: Record<CmsKind, { singular: string; plural: string }> = {
  blogs: { singular: 'Blog post', plural: 'Blog posts' },
  'rfp-tips': { singular: 'RFP tip', plural: 'RFP tips' },
  compliance: { singular: 'Compliance article', plural: 'Compliance articles' },
  'vendor-guides': { singular: 'Vendor guide', plural: 'Vendor guides' },
}

export function CmsListView({ kind }: { kind: CmsKind }) {
  const [items, setItems] = useState<CmsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const labels = KIND_LABELS[kind]

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/cms/${kind}`, { cache: 'no-store' })
    if (!res.ok) {
      setError(`Failed to load (${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.results || [])
    setLoading(false)
  }, [kind])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/cms/${kind}/${id}`, { method: 'DELETE' })
    if (res.status === 204) {
      setItems(items => items.filter(i => i.id !== id))
    } else {
      alert(`Delete failed (${res.status})`)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{labels.plural}</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage {labels.plural.toLowerCase()} in the CMS.</p>
        </div>
        <Link
          href={`/admin/content/${kind}/new`}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New {labels.singular.toLowerCase()}
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400">
          No {labels.plural.toLowerCase()} yet.
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(post => (
                <tr key={post.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{post.title}</div>
                    <div className="text-xs text-neutral-500 font-mono">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        href={`/admin/content/${kind}/${post.id}`}
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id, post.title)}
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function CmsEditView({ kind, id }: { kind: CmsKind; id: string | 'new' }) {
  const labels = KIND_LABELS[kind]
  const isNew = id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Partial<CmsPost>>({
    title: '', slug: '', content: '', author: '',
    cta1_text: '', cta1_url: '', cta2_text: '', cta2_url: '',
    published: false,
  })
  const [postId, setPostId] = useState<string | null>(isNew ? null : id)
  const [images, setImages] = useState<{ id: number; url: string; caption: string | null }[]>([])

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/admin/cms/${kind}/${id}`, { cache: 'no-store' })
      if (!res.ok) {
        if (!cancelled) setError(`Failed to load (${res.status})`)
        if (!cancelled) setLoading(false)
        return
      }
      const data: CmsPost = await res.json()
      if (cancelled) return
      setForm(data)
      setImages(data.images || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [kind, id, isNew])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const url = isNew ? `/api/admin/cms/${kind}` : `/api/admin/cms/${kind}/${id}`
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.detail || `Save failed (${res.status})`)
      return
    }
    if (isNew) {
      setPostId(data.id)
      window.location.href = `/admin/content/${kind}/${data.id}`
    }
  }

  async function handleImageUpload(file: File) {
    if (!postId) return
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`/api/admin/cms/blogs/${postId}/images`, { method: 'POST', body: fd })
    if (!res.ok) {
      alert(`Image upload failed (${res.status})`)
      return
    }
    const img = await res.json()
    setImages(imgs => [...imgs, img])
  }

  async function handleImageDelete(imageId: number) {
    if (!postId) return
    if (!confirm('Delete this image?')) return
    const res = await fetch(`/api/admin/cms/blogs/${postId}/images/${imageId}`, { method: 'DELETE' })
    if (res.status === 204) setImages(imgs => imgs.filter(i => i.id !== imageId))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/content/${kind}`} className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to {labels.plural.toLowerCase()}
      </Link>
      <h1 className="text-2xl font-semibold text-white mb-6">
        {isNew ? `New ${labels.singular.toLowerCase()}` : `Edit ${labels.singular.toLowerCase()}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" required>
          <input
            value={form.title || ''}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Slug" hint="Leave blank to auto-generate from title.">
          <input
            value={form.slug || ''}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Author">
          <input
            value={form.author || ''}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <Field label="Content" required hint="HTML allowed.">
          <textarea
            value={form.content || ''}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            required
            rows={12}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="CTA 1 text">
            <input value={form.cta1_text || ''} onChange={e => setForm(f => ({ ...f, cta1_text: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="CTA 1 URL">
            <input value={form.cta1_url || ''} onChange={e => setForm(f => ({ ...f, cta1_url: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="CTA 2 text">
            <input value={form.cta2_text || ''} onChange={e => setForm(f => ({ ...f, cta2_text: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="CTA 2 URL">
            <input value={form.cta2_url || ''} onChange={e => setForm(f => ({ ...f, cta2_url: e.target.value }))} className={inputClass} />
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={!!form.published}
            onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
            className="h-4 w-4"
          />
          Published
        </label>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
          </button>
        </div>
      </form>

      {kind === 'blogs' && postId && (
        <div className="mt-10 pt-6 border-t border-neutral-800">
          <h2 className="text-lg font-semibold text-white mb-3">Images</h2>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleImageUpload(f)
              e.target.value = ''
            }}
            className="block text-sm text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700"
          />
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {images.map(img => (
                <div key={img.id} className="relative group bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption || ''} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const inputClass =
  'w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500'

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  )
}
