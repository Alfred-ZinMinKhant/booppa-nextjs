'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { config } from '@/lib/config'
import { POLYGON_EXPLORER_HOST, polygonscanTxUrl } from '@/lib/blockchain'
import { CheckCircle, Loader2, FileText, ExternalLink, Upload as UploadIcon, AlertCircle } from 'lucide-react'

interface CoverSheetStatus {
  credits: number
  pending_cover_sheet: boolean
  signed_uploaded: boolean
  pdpa: { status: string; score: number | null; completed_at: string | null } | null
  rfp: { status: string; completed_at: string | null; download_url: string | null } | null
  cover_sheet: { ready: boolean; download_url?: string | null; tx_hash?: string | null; generated_at?: string | null }
  signed: { uploaded_at: string | null; tx_hash: string | null; file_hash: string | null; file_name: string | null } | null
}

function CoverSheetInner() {
  const apiBase = config.apiUrl
  const fileRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [status, setStatus] = useState<CoverSheetStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.email) setEmail(data.email)
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [])

  const refreshStatus = async (currentEmail: string) => {
    if (!currentEmail) return
    try {
      const r = await fetch(`${apiBase}/api/v1/compliance/cover-sheet/status?email=${encodeURIComponent(currentEmail)}`)
      if (r.ok) setStatus(await r.json())
    } catch {}
  }

  useEffect(() => {
    if (!email) return
    refreshStatus(email)
    const id = setInterval(() => refreshStatus(email), 8000)
    return () => clearInterval(id)
  }, [email, apiBase])

  const handleUpload = async () => {
    const files = fileRef.current?.files
    if (!files || files.length === 0) {
      setError('Choose your signed Cover Sheet PDF.')
      return
    }
    if (!email) {
      setError('Sign in or enter your purchase email first.')
      return
    }
    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Signed Cover Sheet must be a PDF.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum 50 MB.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', email)
      const res = await fetch(`${apiBase}/api/v1/compliance/cover-sheet/upload-signed`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Upload failed')
      }
      if (fileRef.current) fileRef.current.value = ''
      await refreshStatus(email)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!authChecked) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </main>
    )
  }

  const pdpaDone = status?.pdpa?.status === 'completed'
  const rfpDone = status?.rfp?.status === 'completed'
  const coverReady = !!status?.cover_sheet?.ready
  const signed = status?.signed
  const finalReceipt = !!signed?.tx_hash
  const hasAccess = !!status && (status.credits > 0 || status.pending_cover_sheet || status.signed_uploaded || coverReady)

  return (
    <main className="bg-white min-h-screen py-16 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-2">Compliance Evidence Pack</p>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Compliance Cover Sheet</h1>
          <p className="text-[#64748b] text-lg leading-relaxed">
            Track your PDPA Snapshot and RFP Complete Kit, download your regulator-ready Cover Sheet, and finalise the workflow by uploading the signed copy. Each step is anchored on {POLYGON_EXPLORER_HOST}.
          </p>
        </div>

        {!email && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#0f172a] mb-2">
              Enter the email used for your Compliance Evidence Pack purchase
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-lg focus:border-[#10b981] outline-none"
            />
          </div>
        )}

        {email && status && !hasAccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">No Compliance Evidence Pack on this account</p>
              <p className="text-sm text-amber-800 mt-1">
                Buy a <Link href="/pricing" className="underline">Compliance Evidence Pack</Link> to unlock the regulator-ready cover sheet workflow.
              </p>
            </div>
          </div>
        )}

        {/* Component progress grid */}
        {status && hasAccess && (
          <div className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-[#0f172a] mb-4">Bundle progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PDPA */}
              <div className="border border-[#e2e8f0] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {pdpaDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  )}
                  <p className="font-bold text-[#0f172a] text-sm">PDPA Quick Scan</p>
                </div>
                <p className="text-xs text-[#64748b]">
                  {pdpaDone
                    ? `Score: ${status.pdpa?.score ?? '—'}/100`
                    : status.pdpa?.status
                      ? `Status: ${status.pdpa.status}`
                      : 'Queued'}
                </p>
              </div>
              {/* RFP */}
              <div className="border border-[#e2e8f0] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {rfpDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  )}
                  <p className="font-bold text-[#0f172a] text-sm">RFP Complete Kit</p>
                </div>
                <p className="text-xs text-[#64748b]">
                  {rfpDone ? 'Generated & anchored' : status.rfp?.status ? `Status: ${status.rfp.status}` : 'Generating…'}
                </p>
                {status.rfp?.download_url && (
                  <a
                    href={status.rfp.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0ea5e9] hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Download <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {/* Cover Sheet */}
              <div className="border border-[#e2e8f0] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {coverReady ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  )}
                  <p className="font-bold text-[#0f172a] text-sm">Cover Sheet</p>
                </div>
                <p className="text-xs text-[#64748b]">
                  {coverReady ? 'Ready for download' : pdpaDone && rfpDone ? 'Generating…' : 'Waiting for PDPA + RFP'}
                </p>
              </div>
            </div>
            {(!pdpaDone || !rfpDone) && (
              <p className="text-xs text-[#94a3b8] mt-4">
                Cover Sheet generates automatically once PDPA Quick Scan and RFP Complete Kit are ready. Page refreshes every 8 seconds.
              </p>
            )}
          </div>
        )}

        {/* Cover sheet ready — show download */}
        {coverReady && status?.cover_sheet?.download_url && (
          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-300 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="font-black text-[#0f172a] text-xl mb-1">
                  {finalReceipt ? 'Updated Cover Sheet' : 'Compliance Cover Sheet ready'}
                </h2>
                <p className="text-sm text-[#475569] mb-4">
                  {finalReceipt
                    ? 'Section 5 now includes your signed Cover Sheet anchor. Keep this PDF — it\'s the regulator-ready evidence trail.'
                    : '9-section regulator-ready PDF with PDPA score, RFP Complete summary, and SHA-256 anchored evidence. Sign this PDF, then upload the signed copy below using your included Compliance Evidence credit.'}
                  {status.cover_sheet.generated_at && (
                    <span className="block text-xs text-[#94a3b8] mt-1">
                      Generated {new Date(status.cover_sheet.generated_at).toLocaleString()}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={status.cover_sheet.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 inline-flex items-center gap-2"
                  >
                    Download PDF <ExternalLink className="w-4 h-4" />
                  </a>
                  {status.cover_sheet.tx_hash && (
                    <a
                      href={polygonscanTxUrl(status.cover_sheet.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-emerald-300 text-emerald-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 inline-flex items-center gap-2"
                    >
                      View Anchor <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signed upload form */}
        {coverReady && !status?.signed_uploaded && status && status.credits > 0 && (
          <div className="border-2 border-dashed border-[#cbd5e1] rounded-2xl p-8 mb-8 bg-[#f8fafc]">
            <h2 className="font-bold text-[#0f172a] mb-2 flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-[#10b981]" /> Upload your signed Cover Sheet
            </h2>
            <p className="text-sm text-[#64748b] mb-4">
              Sign the downloaded PDF (digital or wet signature), then upload the signed copy here. We&apos;ll anchor it on-chain and email you the final blockchain receipt with all four anchors.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Signed PDF (max 50 MB)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="w-full text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="bg-[#10b981] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#059669] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Anchoring…</> : <>Upload Signed PDF</>}
              </button>
              <p className="text-xs text-[#94a3b8]">
                This consumes your 1 included Compliance Evidence credit. Other bundle notarizations are unaffected.
              </p>
            </div>
          </div>
        )}

        {/* Signed uploaded — show anchored evidence */}
        {signed && (
          <div className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-6">
            <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Signed Cover Sheet anchored
            </h2>
            <div className="space-y-2 text-sm">
              {signed.file_name && (
                <p className="text-[#334155]"><span className="font-semibold">File:</span> {signed.file_name}</p>
              )}
              {signed.uploaded_at && (
                <p className="text-[#64748b]"><span className="font-semibold text-[#334155]">Uploaded:</span> {new Date(signed.uploaded_at).toLocaleString()}</p>
              )}
              {signed.file_hash && (
                <p className="text-xs text-[#64748b] font-mono break-all">
                  <span className="font-semibold text-[#334155] font-sans">SHA-256:</span> {signed.file_hash}
                </p>
              )}
              {signed.tx_hash ? (
                <a
                  href={polygonscanTxUrl(signed.tx_hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#0ea5e9] hover:underline inline-flex items-center gap-1 mt-2"
                >
                  View signed-CS anchor on {POLYGON_EXPLORER_HOST} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-sm text-[#0ea5e9]">Anchoring on-chain… (refreshes automatically)</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function CoverSheetPage() {
  return (
    <Suspense fallback={<main className="bg-white min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></main>}>
      <CoverSheetInner />
    </Suspense>
  )
}
