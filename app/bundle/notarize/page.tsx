'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { config } from '@/lib/config'
import { POLYGON_EXPLORER_HOST, polygonscanTxUrl } from '@/lib/blockchain'
import { CheckCircle, Loader2, FileText, ExternalLink, Upload as UploadIcon } from 'lucide-react'

interface AnchoredReport {
  report_id: string
  file_name: string | null
  file_hash: string | null
  tx_hash: string | null
  status: string
  anchored_at: string | null
  document_descriptor: string | null
  created_at: string | null
}

type BundleKey = 'vendor_trust_pack' | 'rfp_accelerator' | 'enterprise_bid_kit' | 'compliance_evidence_pack'

const BUNDLE_META: Record<BundleKey, { label: string; rfpResultPath?: string; expectedCount?: number }> = {
  vendor_trust_pack: { label: 'Vendor Trust Pack', expectedCount: 2 },
  rfp_accelerator: { label: 'RFP Accelerator', rfpResultPath: '/rfp-acceleration/result', expectedCount: 2 },
  enterprise_bid_kit: { label: 'Enterprise Bid Kit', rfpResultPath: '/rfp-acceleration/result', expectedCount: 7 },
  compliance_evidence_pack: { label: 'Compliance Evidence Pack', expectedCount: 1 },
}

function BundleNotarizeInner() {
  const apiBase = config.apiUrl
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const bundleParam = (searchParams.get('bundle') || '') as BundleKey
  const sessionId = searchParams.get('session_id') || ''
  const meta = BUNDLE_META[bundleParam] || BUNDLE_META.vendor_trust_pack

  const [email, setEmail] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [reports, setReports] = useState<AnchoredReport[]>([])
  const [descriptor, setDescriptor] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.email) setEmail(data.email)
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [])

  const refreshState = async (currentEmail: string) => {
    if (!currentEmail) return
    try {
      const [creditsRes, reportsRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/notarize/credits?email=${encodeURIComponent(currentEmail)}`),
        fetch(`${apiBase}/api/v1/notarize/bundle/notarizations?email=${encodeURIComponent(currentEmail)}`),
      ])
      if (creditsRes.ok) {
        const d = await creditsRes.json()
        if (typeof d.balance === 'number') setCreditBalance(d.balance)
      }
      if (reportsRes.ok) {
        const d = await reportsRes.json()
        if (Array.isArray(d.reports)) setReports(d.reports)
      }
    } catch {}
  }

  useEffect(() => {
    if (!email) return
    refreshState(email)
    const interval = setInterval(() => refreshState(email), 8000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, apiBase])

  const handleUpload = async () => {
    const files = fileRef.current?.files
    if (!files || files.length === 0) {
      setError('Please choose a file to upload.')
      return
    }
    if (!email) {
      setError('Please log in or enter your email so we can apply your bundle credit.')
      return
    }
    if (!descriptor.trim()) {
      setError('Document description is required so the certificate is identifiable.')
      return
    }
    const file = files[0]
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
      formData.append('plan', 'single')
      formData.append('document_descriptor', descriptor.trim().slice(0, 120))

      const res = await fetch(`${apiBase}/api/v1/notarize/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Upload failed')
      }
      const data = await res.json()
      if (!data.skip_checkout) {
        setError('No bundle credit was applied. Please contact support.')
      } else {
        setDescriptor('')
        if (fileRef.current) fileRef.current.value = ''
        await refreshState(email)
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const uploadedCount = reports.length
  const remaining = creditBalance ?? 0

  if (!authChecked) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </main>
    )
  }

  // Compliance Evidence Pack uses its own page + dedicated credit pool — bounce.
  if (bundleParam === 'compliance_evidence_pack') {
    return (
      <main className="bg-white min-h-screen py-16 px-6">
        <div className="container max-w-3xl mx-auto">
          <p className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-2">{meta.label}</p>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Your Compliance Evidence Pack is being generated</h1>
          <p className="text-[#64748b] text-lg mb-6">
            Your PDPA Quick Scan and RFP Complete Kit are running now. Once both finish, your 9-section regulator-ready Cover Sheet PDF will be emailed to you automatically.
          </p>
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6">
            <h2 className="font-black text-[#0f172a] mb-2">Track everything on your Cover Sheet page</h2>
            <p className="text-sm text-[#475569] mb-4">
              Watch PDPA + RFP progress in real time, download the unsigned Cover Sheet, then upload your signed copy to anchor the final blockchain receipt.
            </p>
            <Link
              href="/compliance/cover-sheet"
              className="bg-[#10b981] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#059669] inline-flex items-center gap-2"
            >
              Open Compliance Cover Sheet →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white min-h-screen py-16 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-2">{meta.label}</p>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">Notarize your included documents</h1>
          <p className="text-[#64748b] text-lg leading-relaxed">
            Each document is hashed with SHA-256 and anchored on {POLYGON_EXPLORER_HOST}.
          </p>
        </div>

        {/* RFP-bearing bundles: link to RFP results */}
        {meta.rfpResultPath && sessionId && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-purple-900">Your RFP Kit is being generated</p>
              <p className="text-sm text-purple-700">View progress and download once ready.</p>
            </div>
            <Link
              href={`${meta.rfpResultPath}?session_id=${sessionId}`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700"
            >
              View RFP Kit →
            </Link>
          </div>
        )}

        {/* Credit balance card */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-2xl border-2 border-sky-300 mb-8 flex items-center gap-6 shadow-sm">
          <div className="text-5xl font-black text-sky-700">{remaining}</div>
          <div className="flex-1">
            <p className="font-bold text-sky-900 text-lg">
              {remaining > 0 ? `${remaining} notarization${remaining === 1 ? '' : 's'} remaining` : 'All credits redeemed'}
            </p>
            <p className="text-sm text-sky-800">
              {uploadedCount} of {uploadedCount + remaining} uploaded
            </p>
          </div>
        </div>

        {!email && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#0f172a] mb-2">
              Enter the email used for your bundle purchase
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

        {remaining > 0 && (
          <div className="border-2 border-dashed border-[#cbd5e1] rounded-2xl p-8 mb-8 bg-[#f8fafc]">
            <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-[#10b981]" /> Upload a compliance document
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">Document description *</label>
                <input
                  type="text"
                  value={descriptor}
                  onChange={(e) => setDescriptor(e.target.value)}
                  placeholder="e.g. Q1 2026 PDPA Audit Report"
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg outline-none focus:border-[#10b981]"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">File (PDF, DOCX, image — max 50 MB)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt,.csv,.xlsx"
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
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Anchoring…</> : <>Notarize Document</>}
              </button>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-[#0f172a] mb-4">Anchored documents ({reports.length})</h2>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.report_id} className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {r.tx_hash ? (
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-[#0ea5e9] animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0f172a]">{r.document_descriptor || r.file_name || 'Document'}</p>
                    <p className="text-xs text-[#64748b] mt-1">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {r.file_name}
                    </p>
                    {r.file_hash && (
                      <p className="text-xs text-[#64748b] mt-1 font-mono break-all">
                        SHA-256: {r.file_hash}
                      </p>
                    )}
                    {r.tx_hash ? (
                      <a
                        href={polygonscanTxUrl(r.tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0ea5e9] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        View on {POLYGON_EXPLORER_HOST} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-xs text-[#0ea5e9] mt-1">Anchoring on-chain… (refreshes automatically)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {remaining === 0 && uploadedCount > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 font-medium">
            All bundle notarizations completed. Each document is anchored on-chain — receipts have been emailed.
          </div>
        )}
      </div>
    </main>
  )
}

export default function BundleNotarizePage() {
  return (
    <Suspense fallback={<main className="bg-white min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></main>}>
      <BundleNotarizeInner />
    </Suspense>
  )
}
