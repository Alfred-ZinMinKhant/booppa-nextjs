'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2, RefreshCw, AlertTriangle, CheckCircle2, Send, Ban,
} from 'lucide-react'
import { adminApiFetch } from '@/lib/adminApiClient'

// Deliberately distinct from /admin/failed-reports. That page lists reports stuck
// in status=failed. This one lists orders the customer PAID FOR and never
// received — which can (and did) happen on a report whose status is "completed":
// the scan finished, the delivery step never ran. Requeuing the scan does not fix
// that, so this page calls /admin/refulfill, which re-runs delivery instead.
interface StrandedReport {
  report_id: string
  framework: string
  status: string
  company_name: string | null
  contact_email: string | null
  product_type: string | null
  stripe_session_id: string | null
  missing: string
  fulfillable: boolean
  created_at: string | null
}

export default function StrandedFulfillmentsPage() {
  const [reports, setReports] = useState<StrandedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApiFetch('/api/admin/api/admin/stranded-fulfillments?limit=100')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.detail || 'Failed to load orders')
        return
      }
      setReports(data.reports || [])
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function refulfill(id: string) {
    setSending(s => ({ ...s, [id]: true }))
    setDone(s => { const n = { ...s }; delete n[id]; return n })
    try {
      const res = await adminApiFetch('/api/admin/api/admin/refulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDone(s => ({ ...s, [id]: `⚠ ${data.detail || 'Re-fulfil failed'}` }))
        return
      }
      setDone(s => ({ ...s, [id]: '✓ Delivery queued' }))
      setReports(rs => rs.filter(r => r.report_id !== id))
    } catch {
      setDone(s => ({ ...s, [id]: '⚠ Network error' }))
    } finally {
      setSending(s => ({ ...s, [id]: false }))
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Undelivered Paid Orders</h1>
          <p className="text-neutral-400 text-sm mt-1 max-w-3xl">
            Orders where payment was confirmed but the deliverable never reached the buyer — no
            certificate, no PDF, no email. A report can sit here with{' '}
            <code className="text-amber-400">status=completed</code>: that only means the scan
            finished, not that anything was sent.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-neutral-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
          <CheckCircle2 className="h-10 w-10 mb-3 text-emerald-500/70" />
          <p className="text-sm">Every paid order has been delivered.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-900 text-neutral-400 text-left">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">What&apos;s missing</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {reports.map(r => (
                <tr key={r.report_id} className="text-neutral-200 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.company_name || '—'}</div>
                    <div className="text-xs text-neutral-500 font-mono">{r.report_id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.product_type || r.framework}</div>
                    <div className="text-xs text-neutral-500">status={r.status}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    <div>{r.contact_email || '—'}</div>
                    {r.stripe_session_id && (
                      <div className="text-xs text-neutral-600 font-mono mt-0.5">
                        {r.stripe_session_id.slice(0, 20)}…
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-amber-400/90 text-xs">{r.missing}</td>
                  <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {done[r.report_id] ? (
                      <span className={done[r.report_id].startsWith('✓') ? 'text-emerald-400 text-xs' : 'text-red-400 text-xs'}>
                        {done[r.report_id]}
                      </span>
                    ) : r.fulfillable ? (
                      <button
                        onClick={() => refulfill(r.report_id)}
                        disabled={sending[r.report_id]}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        {sending[r.report_id]
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Send className="h-3.5 w-3.5" />}
                        Re-deliver
                      </button>
                    ) : (
                      // No score was ever produced, so re-running delivery would
                      // just strand again — the scan has to be rerun first from
                      // Failed Reports.
                      <span
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-500"
                        title="The underlying scan never completed. Re-run the scan from Failed Reports first."
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Needs re-scan
                      </span>
                    )}
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
