'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { Upload, FileCheck, Loader2, AlertCircle, ExternalLink, Clock } from 'lucide-react'

interface EvidenceItem {
  id: string
  filename: string
  hash: string
  blockchain_tx?: string
  verify_url?: string
  created_at: string
}

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/vendor/evidence')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setSuccess('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/vendor/evidence', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Upload failed')
      } else {
        setSuccess('Document notarized and anchored on blockchain.')
        setItems(prev => [data, ...prev])
      }
    } catch {
      setError('Network error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-2xl font-bold text-white">Evidence Upload</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Notarize documents on-chain to generate immutable compliance evidence
          </p>
        </div>

        {/* Upload zone */}
        <div
          className="border-2 border-dashed border-neutral-700 rounded-2xl p-10 text-center hover:border-emerald-500/50 transition cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleUpload}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
              <p className="text-sm">Uploading and anchoring to blockchain…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Upload className="h-10 w-10 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-300">Click to upload a document</p>
              <p className="text-xs text-neutral-500">PDF, DOC, DOCX, PNG, JPG — max 20 MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            <FileCheck className="h-4 w-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Evidence list */}
        <div>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Your Evidence ({items.length})
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500 py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.filename}</p>
                      <p className="text-xs text-neutral-500 font-mono truncate">{item.hash}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(item.created_at).toLocaleDateString('en-SG')}
                    </div>
                    {item.verify_url && (
                      <a
                        href={item.verify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        Verify <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
