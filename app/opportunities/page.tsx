'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Clock, Building2 } from 'lucide-react'
import Link from 'next/link'
import { config as appConfig } from '@/lib/config'

interface Tender {
  tender_no: string
  title: string
  agency: string
  closing_date: string | null
  estimated_value: number | null
  status: string
  url: string | null
  last_fetched_at: string | null
}

function daysLeft(closing: string | null): number | null {
  if (!closing) return null
  const diff = new Date(closing).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function urgencyColor(days: number | null): string {
  if (days === null) return 'text-white/40'
  if (days <= 3) return 'text-red-400'
  if (days <= 7) return 'text-amber-400'
  return 'text-[#10b981]'
}

export default function OpportunitiesPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [isVendorProof, setIsVendorProof] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // Fetch tenders
    fetch(`${appConfig.apiUrl}/api/v1/gebiz/latest-tenders?limit=50`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTenders(data); setLoading(false) })
      .catch(() => setLoading(false))

    // Check auth + vendor proof status
    fetch('/api/auth/me')
      .then(async r => {
        if (!r.ok) return
        setAuthed(true)
        const me = await r.json()
        // vendor_proof = verification_depth is DEEP or CERTIFIED
        const depth: string = me?.verification_depth ?? ''
        setIsVendorProof(['DEEP', 'CERTIFIED'].includes(depth))
      })
      .catch(() => {})
  }, [])

  const lastFetched = tenders[0]?.last_fetched_at
    ? new Date(tenders[0].last_fetched_at).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
    : null

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <section className="border-b border-white/10 bg-[#0f172a]/95 px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-2">Live Feed</p>
              <h1 className="text-3xl font-bold">GeBIZ Open Tenders</h1>
              <p className="mt-2 text-white/50 text-sm">
                Singapore government procurement opportunities, refreshed every 30 minutes.
              </p>
            </div>
            {lastFetched && (
              <p className="text-xs text-white/30 flex-shrink-0">
                Updated {lastFetched} SGT
              </p>
            )}
          </div>

          {/* Smart messages */}
          {authed && isVendorProof && (
            <div className="mt-6 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-5 py-4 text-sm text-[#10b981]">
              <strong>Vendor Proof active</strong> — your blockchain-verified profile is visible to agencies reviewing these tenders.{' '}
              <Link href="/rfp-acceleration" className="underline hover:no-underline">Prepare your RFP documents →</Link>
            </div>
          )}
          {authed && !isVendorProof && (
            <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-4 text-sm text-amber-300">
              Upgrade to <strong>Vendor Proof</strong> to stand out to agencies on these tenders.{' '}
              <Link href="/vendor-proof" className="underline hover:no-underline">Get verified →</Link>
            </div>
          )}
          {!authed && (
            <div className="mt-6 rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-sm text-white/60">
              <Link href="/trial" className="text-[#10b981] underline hover:no-underline">Create a free account</Link> to see your match score and prepare PDPA documents for any tender.
            </div>
          )}
        </div>
      </section>

      {/* Tender list */}
      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {loading && (
            <div className="text-center py-20 text-white/30">Loading tenders…</div>
          )}
          {!loading && tenders.length === 0 && (
            <div className="text-center py-20 text-white/30">
              No open tenders at the moment. Check back soon.
            </div>
          )}
          {tenders.map(tender => {
            const days = daysLeft(tender.closing_date)
            return (
              <div
                key={tender.tender_no}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-white/30 mb-1">{tender.tender_no}</p>
                    <h2 className="text-base font-semibold text-white leading-snug">{tender.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {tender.agency}
                      </span>
                      {tender.closing_date && (
                        <span className={`flex items-center gap-1 ${urgencyColor(days)}`}>
                          <Clock className="h-3 w-3" />
                          Closes {new Date(tender.closing_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {days !== null && ` · ${days}d left`}
                        </span>
                      )}
                      {tender.estimated_value && (
                        <span>Est. SGD {tender.estimated_value.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {tender.url && (
                      <a
                        href={tender.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:border-white/30 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" /> View on GeBIZ
                      </a>
                    )}
                    <Link
                      href={authed ? `/rfp-acceleration?tender=${tender.tender_no}` : '/trial'}
                      className="flex items-center gap-1.5 rounded-lg bg-[#10b981] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#059669] transition-colors"
                    >
                      <FileText className="h-3 w-3" /> Prepare PDPA Docs
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
