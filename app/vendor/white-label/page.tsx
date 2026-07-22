'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Palette, AlertCircle, Loader2, ArrowLeft, CheckCircle2, Upload, ImageIcon } from 'lucide-react'

const DEFAULT_PRIMARY = '#10b981'
const DEFAULT_SECONDARY = '#0f172a'

export default function WhiteLabelPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY)
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY)
  const [footerText, setFooterText] = useState('')
  const [reportHeaderText, setReportHeaderText] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/vendor/white-label', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      if (d.configured) {
        setPrimaryColor(d.primary_color || DEFAULT_PRIMARY)
        setSecondaryColor(d.secondary_color || DEFAULT_SECONDARY)
        setFooterText(d.footer_text || '')
        setReportHeaderText(d.report_header_text || '')
        setLogoUrl(d.logo_url || null)
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    setError(''); setInfo('')
    try {
      const r = await fetch('/api/vendor/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          footer_text: footerText.trim() || null,
          report_header_text: reportHeaderText.trim() || null,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d?.detail || `Failed (${r.status})`); return }
      setInfo('Branding saved. Your next generated report (e.g. regenerate the MAS TRM Baseline from the TRM workspace) will carry it.')
      load()
    } finally {
      setSaving(false)
    }
  }

  const uploadLogo = async (file: File) => {
    setUploading(true)
    setError(''); setInfo('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/vendor/white-label/logo', { method: 'POST', body: fd })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setError(typeof d?.detail === 'string' ? d.detail : `Upload failed (${r.status})`); return }
      setLogoUrl(d.logo_url || null)
      setInfo('Logo uploaded.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/vendor/trm" className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to MAS TRM
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="h-6 w-6 text-emerald-400" /> White-label reports
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Pro Suite exclusive. Your logo and brand colors replace Booppa's on the MAS TRM Baseline
            Assessment PDF and board report — set them here, then regenerate a report to see it applied.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {info && (
          <div className="flex items-center gap-2 text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4" /> {info}
          </div>
        )}

        {loading ? (
          <div className="text-neutral-400 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Logo</p>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoUrl
                    ? <img src={logoUrl} alt="Brand logo" className="max-h-full max-w-full object-contain" />
                    : <ImageIcon className="h-6 w-6 text-neutral-700" />}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 border border-neutral-700 hover:border-emerald-500 text-neutral-200 font-semibold px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {logoUrl ? 'Replace logo' : 'Upload logo'}
                  </button>
                  <p className="text-[11px] text-neutral-500 mt-1">PNG, JPG, or SVG. Max 5 MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Primary color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded border border-neutral-800 bg-neutral-950 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Secondary color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="h-9 w-9 rounded border border-neutral-800 bg-neutral-950 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Report header text</label>
              <input
                type="text"
                placeholder="Defaults to your company name"
                value={reportHeaderText}
                onChange={e => setReportHeaderText(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Footer text</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp — Confidential"
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save branding
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
