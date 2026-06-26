'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Loader2, FileText, ExternalLink, ArrowRight, Circle } from 'lucide-react'

interface PackDocument {
  doc_type: string
  title: string
  download_url: string | null
  anchored?: boolean
}

interface EvidencePack {
  id: string
  pack_id: string
  status: string
  organisation: string | null
  session_id: string | null
  created_at: string | null
  updated_at?: string | null
  anchored_count?: number
  master_anchored?: boolean
  next_refresh?: string | null
  documents: PackDocument[]
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : null

const GENERATING_STATES = ['queued', 'generating', 'anchoring', 'building_pdfs']

// Fallback document list (titles only) when the account has no pack yet, so the
// buyer still sees what the 7-document pack contains.
const FALLBACK_TITLES = [
  'Data Protection Management Programme',
  'Record of Processing Activities (ROPA)',
  'Data Inventory & Retention Schedule',
  'Third-Party Processor Register & DPA Checklist',
  'Data Breach Response Runbook',
  'Staff Training Register & Completion Evidence',
  'Periodic Security Review Log',
]

export default function EvidencePackSection() {
  const [pack, setPack] = useState<EvidencePack | null>(null)
  const [fallbackDocs, setFallbackDocs] = useState<string[]>(FALLBACK_TITLES)
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    try {
      const r = await fetch('/api/evidence-pack/latest', { cache: 'no-store' })
      if (r.ok) {
        const data = await r.json()
        setPack(data.pack || null)
        if (!data.pack && Array.isArray(data.documents)) setFallbackDocs(data.documents)
      }
    } catch {
      /* keep prior state */
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    load()
    // Poll while the pack is mid-generation so the doc links fill in live.
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [])

  if (!loaded) return null

  const status = pack?.status
  const isReady = status === 'ready'
  const isGenerating = !!status && GENERATING_STATES.includes(status)
  const isIntakePending = status === 'intake_pending'
  const isError = status === 'error'
  const docs = pack?.documents ?? fallbackDocs.map((title, i) => ({
    doc_type: String(i),
    title,
    download_url: null,
  }))

  return (
    <div className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="font-bold text-[#0f172a] flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> PDPA Evidence Pack — 7 documents
        </h2>
        {isReady && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Ready
          </span>
        )}
        {isGenerating && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
            Generating
          </span>
        )}
      </div>
      <p className="text-sm text-[#64748b] mb-4">
        Your Compliance Evidence Pack&apos;s seven PDPA governance documents (DPMP, ROPA, Data
        Inventory, Vendor/DPA Register, Breach Runbook, Training Register, Security Review Log).
        Each is an AI-generated DRAFT — your authorised representative must review and sign it.
      </p>

      {/* Intake outstanding — the buyer must complete the structured intake
          before the 7 documents can be generated. */}
      {isIntakePending && pack && (
        <div className="border-2 border-emerald-200 bg-emerald-50/40 rounded-xl p-4 mb-4">
          <p className="font-bold text-[#0f172a] text-sm mb-1">Complete your intake to generate the pack</p>
          <p className="text-xs text-[#64748b] mb-3">
            A short structured intake (about 5 minutes) — org details, DPO, systems, data types — tailors every document to your actual operations.
          </p>
          <Link
            href={`/evidence-pack-intake/${pack.id}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
          >
            Complete your intake <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {isError && (
        <div className="border border-rose-200 bg-rose-50 rounded-xl p-4 mb-4 text-sm text-rose-700">
          Generation failed — our team has been alerted. Please contact{' '}
          <a href="mailto:support@booppa.io" className="underline">support@booppa.io</a>.
        </div>
      )}

      {isGenerating && (
        <p className="text-xs text-[#94a3b8] mb-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          Drafting and anchoring your seven documents — this page refreshes every 8 seconds. We&apos;ll also email you the pack.
        </p>
      )}

      {/* Recurring-value signals for the monthly tier: when the pack last
          regenerated, how many docs are blockchain-anchored, and the next refresh. */}
      {isReady && pack && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-[#64748b]">
          {fmtDate(pack.updated_at || pack.created_at) && (
            <span>Last regenerated <strong className="text-[#0f172a]">{fmtDate(pack.updated_at || pack.created_at)}</strong></span>
          )}
          {typeof pack.anchored_count === 'number' && (
            <span>{pack.anchored_count}/{docs.length} documents anchored on-chain</span>
          )}
          {pack.next_refresh && (
            <span>Next monthly refresh <strong className="text-[#0f172a]">{fmtDate(pack.next_refresh)}</strong></span>
          )}
        </div>
      )}

      {/* Document list — download links when ready, otherwise greyed checklist. */}
      <ul className="space-y-2">
        {docs.map((doc, i) => {
          const ready = !!doc.download_url
          return (
            <li key={doc.doc_type || i}>
              {ready ? (
                <a
                  href={doc.download_url as string}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#e2e8f0] hover:border-emerald-400 hover:bg-emerald-50/40 transition"
                >
                  <span className="flex items-center gap-2 text-[#0f172a] text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {doc.title}
                    {doc.anchored && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">Anchored</span>
                    )}
                  </span>
                  <span className="text-emerald-600 text-sm font-semibold inline-flex items-center gap-1">
                    Download <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#e2e8f0]">
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#cbd5e1] flex-shrink-0" />
                  )}
                  <span className="text-[#64748b] text-sm">{doc.title}</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
