'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { config } from '@/lib/config'
import { POLYGON_EXPLORER_HOST, polygonscanTxUrl } from '@/lib/blockchain'
import { CheckCircle, Loader2, FileText, ExternalLink, Upload as UploadIcon, AlertCircle, ArrowRight, Mail, Circle, Download as DownloadIcon, PenLine } from 'lucide-react'
import RopaIntakeSection from './RopaIntakeSection'

interface CoverSheetStatus {
  credits: number
  pending_cover_sheet: boolean
  signed_uploaded: boolean
  vendor_url_missing: boolean
  pdpa: { status: string; score: number | null; completed_at: string | null } | null
  rfp: { status: string; completed_at: string | null; download_url: string | null } | null
  rfp_brief_intake_id: string | null
  cover_sheet: { ready: boolean; download_url?: string | null; tx_hash?: string | null; generated_at?: string | null; schema_version?: number | null; outdated?: boolean; stale?: boolean }
  signed: {
    uploaded_at: string | null
    tx_hash: string | null
    file_hash: string | null
    file_name: string | null
    signature_method?: 'electronic' | 'uploaded' | string | null
    signer_name?: string | null
    signer_title?: string | null
    signed_at_utc?: string | null
    legal_basis?: string | null
    signed_report_id?: string | null
    anchor_failed?: boolean | null
    anchor_failed_at?: string | null
    anchor_failed_reason?: string | null
  } | null
}

function CoverSheetInner() {
  const apiBase = config.apiUrl
  const fileRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [status, setStatus] = useState<CoverSheetStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  // Sign-step UI state. Default to electronic — it closes the loop without a
  // platform exit. Wet-sign still works for buyers who need a physical signature.
  const [signMethod, setSignMethod] = useState<'electronic' | 'wet'>('electronic')
  const [signerName, setSignerName] = useState('')
  const [signerTitle, setSignerTitle] = useState('')
  const [attestAuthorised, setAttestAuthorised] = useState(false)
  const [attestAccurate, setAttestAccurate] = useState(false)
  const [esigning, setEsigning] = useState(false)
  const [downloadedOnce, setDownloadedOnce] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, apiBase])

  const handleRegenerate = async () => {
    if (!email) return
    setRegenerating(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      const res = await fetch(`${apiBase}/api/v1/compliance/cover-sheet/regenerate`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Regeneration failed')
      }
      // Poll quickly for the new PDF — the task waits ~5s then runs.
      setTimeout(() => refreshStatus(email), 8000)
    } catch (e: any) {
      setError(e.message || 'Regeneration failed')
    } finally {
      setRegenerating(false)
    }
  }

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

  // In-browser electronic signature path. Sends typed name + title + the two
  // attestations to the backend, which appends a Signature Page to the
  // unsigned Cover Sheet and anchors the combined PDF on-chain — same final
  // pipeline as the wet-sign upload path.
  const handleESign = async () => {
    if (!email) {
      setError('Sign in or enter your purchase email first.')
      return
    }
    if (!signerName.trim() || !signerTitle.trim()) {
      setError('Enter your full legal name and title.')
      return
    }
    if (!attestAuthorised || !attestAccurate) {
      setError('Both attestations must be ticked.')
      return
    }
    setError('')
    setEsigning(true)
    try {
      const res = await fetch(`${apiBase}/api/v1/compliance/cover-sheet/sign-electronically`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          signer_name: signerName.trim(),
          signer_title: signerTitle.trim(),
          attestations: { authorised: attestAuthorised, accurate: attestAccurate },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Electronic signature failed')
      }
      await refreshStatus(email)
    } catch (e: any) {
      setError(e.message || 'Electronic signature failed')
    } finally {
      setEsigning(false)
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
  // RFP is only "really done" when the Report row says completed AND there is
  // no unsubmitted brief outstanding — a pending intake means the buyer hasn't
  // told us what they're procuring yet, so any earlier "completed" tile would
  // be misleading.
  const rfpBriefPending = !!status?.rfp_brief_intake_id
  const rfpDone = status?.rfp?.status === 'completed' && !rfpBriefPending
  // Cover sheet is only surfaced as ready once both upstream inputs are done
  // AND it isn't stale (i.e., a fresh purchase cycle hasn't superseded it).
  const coverReady = !!status?.cover_sheet?.ready && pdpaDone && rfpDone && !status?.cover_sheet?.stale
  const signed = status?.signed
  const finalReceipt = !!signed?.tx_hash
  // "Signed in this cycle" is the only correct gate for pre/post-sign UI.
  // status.signed_uploaded is a lifetime User flag that does NOT reset across
  // bundle re-purchases — a buyer who bought again would otherwise get stuck
  // on the post-sign view. The `signed` payload is already cycle-scoped by
  // the backend (filtered to created_at >= latest PDPA scan).
  const signedThisCycle = !!signed
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

        {/* Missing website — surface the deferred-cycle reason. The cycle
            cannot run without a vendor_url, so prompt them to backfill before
            anything else. */}
        {email && status && hasAccess && status.vendor_url_missing && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-900">Add your website to start your cycle</p>
              <p className="text-sm text-amber-800 mt-1">
                We need your company website on your profile to refresh your PDPA Snapshot and RFP Complete Kit. Once saved, your cover sheet workflow will resume automatically.
              </p>
              <Link
                href="/profile"
                className="inline-block mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700"
              >
                Update profile
              </Link>
            </div>
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

        {/* RFP brief required — bundle includes RFP Complete, but the kit
            can't be generated until the buyer submits the brief. Surface this
            above the progress grid so the spinner state below makes sense. */}
        {email && status && hasAccess && rfpBriefPending && status.rfp_brief_intake_id && (
          <div className="border-2 border-sky-300 bg-gradient-to-b from-sky-50 to-white rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-[#0f172a] mb-1">Tell us about your RFP</h2>
                <p className="text-sm text-[#475569] mb-4 leading-relaxed">
                  Your Compliance Evidence Pack includes an RFP Complete Kit. Share a few details
                  about the procurement (takes about 2 minutes) and we&apos;ll generate the kit
                  immediately — it then feeds into your regulator-ready Cover Sheet.
                </p>
                <Link
                  href={`/rfp-intake/${status.rfp_brief_intake_id}`}
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-lg font-bold text-sm transition"
                >
                  Complete your RFP brief <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-4 flex items-start gap-2 text-xs text-[#64748b]">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p>We&apos;ve also emailed you this link — you can finish the brief later from your inbox.</p>
                </div>
              </div>
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
                  ) : rfpBriefPending ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  )}
                  <p className="font-bold text-[#0f172a] text-sm">RFP Complete Kit</p>
                </div>
                <p className="text-xs text-[#64748b]">
                  {rfpDone
                    ? 'Generated & anchored'
                    : rfpBriefPending
                      ? 'Waiting for your RFP brief'
                      : status.rfp?.status
                        ? `Status: ${status.rfp.status}`
                        : 'Generating…'}
                </p>
                {rfpBriefPending && status.rfp_brief_intake_id && (
                  <Link
                    href={`/rfp-intake/${status.rfp_brief_intake_id}`}
                    className="text-xs font-semibold text-sky-600 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Complete brief <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {!rfpBriefPending && status.rfp?.download_url && (
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
            {!coverReady && (!pdpaDone || !rfpDone) && (
              <p className="text-xs text-[#94a3b8] mt-4">
                {rfpBriefPending
                  ? 'Submit your RFP brief above to start the RFP Complete Kit. The Cover Sheet generates automatically once both PDPA Quick Scan and RFP Complete Kit are ready.'
                  : 'Cover Sheet generates automatically once PDPA Quick Scan and RFP Complete Kit are ready. Page refreshes every 8 seconds.'}
              </p>
            )}
          </div>
        )}

        {/* ROPA Lite intake — 4th anchored document of the Compliance Evidence
            Pack. Shown alongside the status cards; the backend handles every
            submission-order combination, so the signing UI below is NOT gated
            on ROPA being submitted first. */}
        {email && status && hasAccess && (
          <div className="mb-8">
            <RopaIntakeSection />
          </div>
        )}

        {/* Final receipt card — only shown after the signed Cover Sheet has
            been anchored (signed_uploaded=true). Now surfaces the signature
            method + signer identity so the buyer sees how/who/when in one
            place rather than scrolling to the anchored-evidence panel. */}
        {coverReady && signedThisCycle && status?.cover_sheet?.download_url && (
          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-300 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-black text-[#0f172a] text-xl">Bundle complete</h2>
                  {signed?.signature_method === 'electronic' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Signed electronically
                    </span>
                  )}
                  {signed?.signature_method === 'uploaded' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      Signed &amp; uploaded
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#475569] mb-4">
                  Section 5 of the Cover Sheet now carries your signed anchor. Keep this PDF — it&apos;s the regulator-ready evidence trail.
                </p>

                {/* Signature receipt — only the buyer/regulator can verify
                    these inline. Mirrors what we anchor on-chain. */}
                {signed && (signed.signer_name || signed.signed_at_utc) && (
                  <div className="bg-white/60 border border-emerald-200 rounded-lg p-3 mb-4 text-xs space-y-1">
                    <p className="font-bold text-[#0f172a] uppercase tracking-widest text-[10px] mb-1">
                      Signature receipt
                    </p>
                    {signed.signer_name && (
                      <p className="text-[#334155]">
                        <span className="font-semibold">Signed by:</span> {signed.signer_name}
                        {signed.signer_title && <span className="text-[#64748b]"> · {signed.signer_title}</span>}
                      </p>
                    )}
                    {signed.signed_at_utc && (
                      <p className="text-[#64748b]">
                        <span className="font-semibold text-[#334155]">When:</span> {new Date(signed.signed_at_utc).toLocaleString()} UTC
                      </p>
                    )}
                    {signed.legal_basis && (
                      <p className="text-[10px] text-[#64748b]">
                        <span className="font-semibold text-[#334155]">Legal basis:</span> {signed.legal_basis}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <a
                    href={status.cover_sheet.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 inline-flex items-center gap-2"
                  >
                    Download signed PDF <ExternalLink className="w-4 h-4" />
                  </a>
                  {status.cover_sheet.tx_hash && (
                    <a
                      href={polygonscanTxUrl(status.cover_sheet.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-emerald-300 text-emerald-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 inline-flex items-center gap-2"
                    >
                      View Cover Sheet anchor <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {signed?.tx_hash && (
                    <a
                      href={polygonscanTxUrl(signed.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white border border-emerald-300 text-emerald-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 inline-flex items-center gap-2"
                    >
                      View signed anchor <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {status.cover_sheet.generated_at && (
                  <p className="text-xs text-[#94a3b8] mt-3">
                    Cover Sheet generated {new Date(status.cover_sheet.generated_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Finalise checklist — sequenced 3-step card. Shown after the
            unsigned Cover Sheet is generated but before it's been signed.
            Replaces the old separate Download + Upload blocks so the buyer
            has a single, ordered set of instructions instead of two
            disconnected cards. */}
        {coverReady && !signedThisCycle && status && status.credits > 0 && status?.cover_sheet?.download_url && (
          <div className="border-2 border-emerald-200 bg-white rounded-2xl p-6 mb-8">
            <div className="mb-5">
              <h2 className="text-xl font-black text-[#0f172a] mb-1">Finalise your Cover Sheet</h2>
              <p className="text-sm text-[#64748b]">
                Three steps to lock in your regulator-ready evidence trail. The whole loop stays inside Booppa — no DocuSign or external e-sign account needed.
              </p>
              {status.cover_sheet.generated_at && (
                <p className="text-xs text-[#94a3b8] mt-1">
                  Unsigned Cover Sheet generated {new Date(status.cover_sheet.generated_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Step 1 — Download */}
            <div className="border border-[#e2e8f0] rounded-xl p-4 mb-3">
              <div className="flex items-start gap-3">
                {downloadedOnce ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-[#cbd5e1] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-[#0f172a] text-sm">Step 1 — Download the unsigned Cover Sheet</p>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Open the 9-section regulator-ready PDF and review the contents before signing.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={status.cover_sheet.download_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setDownloadedOnce(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-700 inline-flex items-center gap-2"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" /> Download PDF
                    </a>
                    {status.cover_sheet.tx_hash && (
                      <a
                        href={polygonscanTxUrl(status.cover_sheet.tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white border border-emerald-300 text-emerald-700 px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-50 inline-flex items-center gap-2"
                      >
                        View unsigned anchor <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {status?.cover_sheet?.outdated && (
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {regenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Regenerating…</> : 'Regenerate to latest format'}
                      </button>
                    )}
                  </div>
                  {status?.cover_sheet?.outdated && (
                    <p className="text-xs text-amber-700 mt-2">
                      This Cover Sheet was issued by an earlier version. Click <strong>Regenerate</strong> for a refreshed PDF at no cost.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 — Sign */}
            <div className="border border-[#e2e8f0] rounded-xl p-4 mb-3">
              <div className="flex items-start gap-3">
                <Circle className="w-5 h-5 text-[#cbd5e1] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[#0f172a] text-sm">Step 2 — Sign it</p>
                  <p className="text-xs text-[#64748b] mt-0.5 mb-3">
                    Pick how you want to sign. Most buyers stay in-browser.
                  </p>

                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${signMethod === 'electronic' ? 'border-emerald-400 bg-emerald-50/50' : 'border-[#e2e8f0]'}`}>
                      <input
                        type="radio"
                        name="signMethod"
                        value="electronic"
                        checked={signMethod === 'electronic'}
                        onChange={() => setSignMethod('electronic')}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                          <PenLine className="w-3.5 h-3.5" /> Sign electronically (recommended)
                        </p>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          Type your name and tick two attestations. We append a Signature Page bound to the PDF&apos;s SHA-256 and anchor it on-chain. Valid under Singapore Electronic Transactions Act s. 8.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${signMethod === 'wet' ? 'border-emerald-400 bg-emerald-50/50' : 'border-[#e2e8f0]'}`}>
                      <input
                        type="radio"
                        name="signMethod"
                        value="wet"
                        checked={signMethod === 'wet'}
                        onChange={() => setSignMethod('wet')}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0f172a]">Print, wet-sign, scan</p>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          Print the PDF, sign in ink, scan back to PDF. Upload in Step 3 below.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Electronic-sign inline form */}
                  {signMethod === 'electronic' && (
                    <div className="mt-4 space-y-3 border-t border-[#e2e8f0] pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#334155] mb-1">Full legal name *</label>
                          <input
                            type="text"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="e.g. Tan Wei Ling"
                            className="w-full px-3 py-2 text-sm border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334155] mb-1">Title / role *</label>
                          <input
                            type="text"
                            value={signerTitle}
                            onChange={(e) => setSignerTitle(e.target.value)}
                            placeholder="e.g. Chief Compliance Officer"
                            className="w-full px-3 py-2 text-sm border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <label className="flex items-start gap-2 text-xs text-[#334155]">
                        <input
                          type="checkbox"
                          checked={attestAuthorised}
                          onChange={(e) => setAttestAuthorised(e.target.checked)}
                          className="mt-0.5"
                        />
                        <span>I am authorised to sign this Cover Sheet on behalf of my organisation.</span>
                      </label>
                      <label className="flex items-start gap-2 text-xs text-[#334155]">
                        <input
                          type="checkbox"
                          checked={attestAccurate}
                          onChange={(e) => setAttestAccurate(e.target.checked)}
                          className="mt-0.5"
                        />
                        <span>I attest that the contents of this Cover Sheet are true and accurate to the best of my knowledge.</span>
                      </label>
                      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                      <button
                        type="button"
                        onClick={handleESign}
                        disabled={esigning}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {esigning ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing &amp; anchoring…</> : <>Sign &amp; submit <ArrowRight className="w-4 h-4" /></>}
                      </button>
                      <p className="text-xs text-[#94a3b8]">
                        This consumes your 1 included Compliance Evidence credit. Other bundle notarizations are unaffected.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 — Upload (only when wet-sign chosen) */}
            {signMethod === 'wet' && (
              <div className="border border-[#e2e8f0] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-[#cbd5e1] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                      <UploadIcon className="w-3.5 h-3.5" /> Step 3 — Upload your signed copy
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5 mb-3">
                      We&apos;ll anchor the signed PDF on-chain and email the final receipt with all four anchors.
                    </p>
                    <div className="space-y-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="w-full text-sm"
                      />
                      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Anchoring…</> : <>Upload signed PDF</>}
                      </button>
                      <p className="text-xs text-[#94a3b8]">
                        Maximum 50 MB. This consumes your 1 included Compliance Evidence credit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signed Cover Sheet anchored — full hash/tx breakdown for the
            buyer (and any regulator they share this page with). Compact
            top section names the signer + method; bottom shows the raw
            cryptographic receipt (SHA-256, tx hash). */}
        {signed && (
          <div className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-6">
            <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Signed Cover Sheet — anchored evidence
            </h2>

            {/* Signer block — only the data we capture at sign time. */}
            {(signed.signer_name || signed.signature_method === 'electronic') && (
              <div className="border-l-4 border-emerald-400 pl-3 mb-4">
                <p className="text-xs font-bold text-[#0f172a] uppercase tracking-widest mb-1">
                  {signed.signature_method === 'electronic' ? 'Electronic signature' : 'Signature'}
                </p>
                {signed.signer_name && (
                  <p className="text-sm text-[#0f172a]">
                    <span className="font-semibold">{signed.signer_name}</span>
                    {signed.signer_title && <span className="text-[#64748b]"> · {signed.signer_title}</span>}
                  </p>
                )}
                {signed.signed_at_utc && (
                  <p className="text-xs text-[#64748b]">
                    Signed {new Date(signed.signed_at_utc).toLocaleString()} UTC
                  </p>
                )}
                {signed.legal_basis && (
                  <p className="text-[10px] text-[#94a3b8] mt-1">{signed.legal_basis}</p>
                )}
              </div>
            )}

            {/* Cryptographic receipt — the raw evidence trail. */}
            <div className="space-y-2 text-sm">
              {signed.file_name && (
                <p className="text-[#334155]"><span className="font-semibold">File:</span> {signed.file_name}</p>
              )}
              {signed.uploaded_at && (
                <p className="text-[#64748b]"><span className="font-semibold text-[#334155]">Anchored:</span> {new Date(signed.uploaded_at).toLocaleString()}</p>
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
              ) : signed.anchor_failed ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm font-bold text-rose-700 mb-1">
                    On-chain anchoring failed
                  </p>
                  <p className="text-xs text-rose-600 mb-3">
                    The signature is recorded and the SHA-256 is committed in the PDF, but the Polygon
                    Amoy transaction couldn&apos;t complete after multiple attempts. Your signed Cover
                    Sheet is still valid — only the on-chain receipt needs a retry.
                    {signed.anchor_failed_reason && (
                      <span className="block mt-1 font-mono text-[10px] text-rose-500 break-all">
                        {signed.anchor_failed_reason}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Contact <a href="mailto:support@booppa.io" className="text-[#0ea5e9] hover:underline">support@booppa.io</a>{" "}
                    with this report ID and we&apos;ll trigger a manual retry:
                  </p>
                  {signed.signed_report_id && (
                    <p className="text-[10px] font-mono text-[#334155] mt-1 break-all bg-white px-2 py-1 rounded">
                      {signed.signed_report_id}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#0ea5e9] mt-2">
                  Anchoring on-chain… <span className="text-xs text-[#94a3b8]">(refreshes every 8 seconds; first confirmation typically within 30s)</span>
                </p>
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
