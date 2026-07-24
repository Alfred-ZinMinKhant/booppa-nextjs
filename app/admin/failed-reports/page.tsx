'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, Link2Off } from 'lucide-react'
import { adminApiFetch } from '@/lib/adminApiClient'

interface FailedReport {
  report_id: string
  framework: string
  company_name: string | null
  contact_email: string | null
  product_type: string | null
  missing_anchor: boolean
  created_at: string | null
  updated_at: string | null
}

export default function FailedReportsPage() {
  const [reports, setReports] = useState<FailedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requeuing, setRequeuing] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, string>>({}) // report_id -> note/error

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApiFetch('/api/admin/api/admin/failed-reports?limit=100')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.detail || 'Failed to load reports')
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

  async function requeue(id: string) {
    setRequeuing(s => ({ ...s, [id]: true }))
    setDone(s => { const n = { ...s }; delete n[id]; return n })
    try {
      const res = await adminApiFetch('/api/admin/api/admin/requeue-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDone(s => ({ ...s, [id]: `⚠ ${data.detail || 'Requeue failed'}` }))
        return
      }
      setDone(s => ({ ...s, [id]: '✓ Requeued' }))
      // Drop it from the list optimistically — it's no longer "failed".
      setReports(rs => rs.filter(r => r.report_id !== id))
    } catch {
      setDone(s => ({ ...s, [id]: '⚠ Network error' }))
    } finally {
      setRequeuing(s => ({ ...s, [id]: false }))
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Failed Reports</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Reports stuck in <code className="text-amber-400">status=failed</code> — commonly after a gas-wallet
            outage exhausted the anchor retries. Top up gas, then requeue.
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
          <p className="text-sm">No failed reports. Everything is caught up.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-900 text-neutral-400 text-left">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Product / Framework</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Failed at</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {reports.map(r => (
                <tr key={r.report_id} className="text-neutral-200">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.company_name || '—'}</div>
                    <div className="text-xs text-neutral-500 font-mono">{r.report_id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.product_type || r.framework}</div>
                    {r.missing_anchor && (
                      <div className="inline-flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                        <Link2Off className="h-3 w-3" /> no on-chain anchor
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{r.contact_email || '—'}</td>
                  <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                    {r.updated_at ? new Date(r.updated_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {done[r.report_id] ? (
                      <span className={done[r.report_id].startsWith('✓') ? 'text-emerald-400 text-xs' : 'text-red-400 text-xs'}>
                        {done[r.report_id]}
                      </span>
                    ) : (
                      <button
                        onClick={() => requeue(r.report_id)}
                        disabled={requeuing[r.report_id]}
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        {requeuing[r.report_id]
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <RefreshCw className="h-3.5 w-3.5" />}
                        Requeue
                      </button>
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
