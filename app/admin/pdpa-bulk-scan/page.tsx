'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Upload, Download, AlertTriangle, FileSpreadsheet } from 'lucide-react'

interface BatchItem {
  id: string
  company_name: string
  website_url: string
  status: 'pending' | 'running' | 'done' | 'failed'
  score: number | null
  risk_level: string | null
  total_findings: number | null
  error: string | null
  finished_at: string | null
}

interface BatchStatus {
  batch_id: string
  filename: string | null
  total: number
  created_at: string | null
  counts: { pending: number; running: number; done: number; failed: number }
  items: BatchItem[]
}

const SAMPLE_CSV = 'company_name,website_url\nAcme Pte Ltd,https://acme.example.com\nBeta Solutions,beta.example.sg\n'

function statusColor(s: BatchItem['status']) {
  switch (s) {
    case 'done':    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'failed':  return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    case 'running': return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    default:        return 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30'
  }
}

export default function AdminPdpaBulkScanPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState<BatchStatus | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchBatch = useCallback(async (batchId: string) => {
    const res = await fetch(`/api/admin/api/admin/pdpa/bulk-scan/${batchId}?limit=1000`, { cache: 'no-store' })
    if (!res.ok) return
    const data: BatchStatus = await res.json()
    setBatch(data)
    return data
  }, [])

  // Poll every 5s while the batch still has pending/running items.
  useEffect(() => {
    if (!batch) return
    const active = batch.counts.pending + batch.counts.running > 0
    if (!active) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    if (pollRef.current) return
    pollRef.current = setInterval(() => fetchBatch(batch.batch_id), 5000)
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [batch, fetchBatch])

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/api/admin/pdpa/bulk-scan', {
        method: 'POST',
        body: form,
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Upload failed')
        return
      }
      await fetchBatch(data.batch_id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setUploading(false)
    }
  }

  async function handleExport() {
    if (!batch) return
    const res = await fetch(`/api/admin/api/admin/pdpa/bulk-scan/${batch.batch_id}/export`, { cache: 'no-store' })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pdpa_bulk_scan_${batch.batch_id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pdpa_bulk_scan_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const doneCount = batch ? batch.counts.done + batch.counts.failed : 0
  const progress = batch && batch.total > 0 ? Math.round((doneCount / batch.total) * 100) : 0

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-neutral-100 mb-2">PDPA Bulk Scan</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Upload a CSV or Excel file of companies (columns: <code className="text-xs">company_name</code>,{' '}
        <code className="text-xs">website_url</code>) to run the PDPA free scan against each website.
        Scans are throttled to 20/minute on the worker — 600 companies take roughly 30 minutes.
      </p>

      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          These are HTTP-only pattern scans (no AI, PDF, or blockchain), so there is no per-scan cost —
          but each target website receives real requests. Max 1,000 rows per file; duplicate URLs are skipped.
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900/50 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 text-sm rounded border border-neutral-700 text-neutral-200 hover:border-sky-500 cursor-pointer">
            <FileSpreadsheet className="w-4 h-4" />
            {file ? file.name : 'Choose .csv / .xlsx'}
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            disabled={!file || uploading}
            onClick={handleUpload}
            className="px-4 py-2 text-sm font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white disabled:bg-neutral-700 disabled:text-neutral-400 inline-flex items-center gap-1.5"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload &amp; start scans
          </button>
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-xs text-sky-400 hover:text-sky-300"
          >
            Download CSV template
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      {batch && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-neutral-100">
                {batch.filename || 'Batch'} — {batch.total} companies
              </p>
              <p className="text-xs text-neutral-500">
                {batch.counts.done} done · {batch.counts.failed} failed · {batch.counts.running} running ·{' '}
                {batch.counts.pending} pending
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-neutral-700 text-neutral-200 hover:border-sky-500 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="h-2 rounded bg-neutral-800 overflow-hidden mb-5">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Website</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2">Findings</th>
                </tr>
              </thead>
              <tbody>
                {batch.items.map(item => (
                  <tr key={item.id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="py-2 pr-3 text-neutral-200">{item.company_name}</td>
                    <td className="py-2 pr-3 text-neutral-400 font-mono text-xs truncate max-w-[220px]">{item.website_url}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                      {item.error && <span className="ml-2 text-[10px] text-rose-400">{item.error.slice(0, 60)}</span>}
                    </td>
                    <td className="py-2 pr-3 text-neutral-200">{item.score ?? '—'}</td>
                    <td className="py-2 pr-3 text-neutral-300">{item.risk_level ?? '—'}</td>
                    <td className="py-2 text-neutral-300">{item.total_findings ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
