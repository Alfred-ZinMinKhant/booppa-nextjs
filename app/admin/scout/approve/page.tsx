'use client'

import { useState, useEffect } from 'react'
import { endpoints } from '@/lib/config'
import {
  CheckCircle2, XCircle, Eye, Upload, Filter, AlertCircle, RefreshCw, Mail, Building2, ShieldCheck
} from 'lucide-react'

interface Prospect {
  id: string
  pipeline: 'vendor' | 'buyer' | 'csp'
  display_name: string
  score: number | null
  priority_tier: string | null
  website_url: string | null
  has_contact_email: boolean
  outreach_subject: string | null
}

interface ProspectPreview {
  id: string
  display_name: string
  pipeline: string
  contact_email: string | null
  subject: string | null
  body_html: string | null
  raw_data: Record<string, any> | null
}

export default function ScoutApprovePage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'csp_import'>('pending')
  const [pipelineFilter, setPipelineFilter] = useState<string>('all')
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Modal State
  const [previewProspect, setPreviewProspect] = useState<ProspectPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  // The admin_token cookie is httpOnly, so it cannot be read here. Every call
  // goes through app/api/admin/api/[...path]/route.ts, which reads the cookie
  // server-side and forwards it as a Bearer header to FastAPI.
  const adminApi = (path: string) => `/api/admin/api${path}`

  const fetchPending = async () => {
    setLoading(true)
    setError('')
    try {
      const url = new URL(adminApi(endpoints.scout.pending), window.location.origin)
      if (pipelineFilter !== 'all') {
        url.searchParams.set('pipeline', pipelineFilter)
      }

      const res = await fetch(url.toString(), { cache: 'no-store' })

      if (!res.ok) {
        throw new Error(`Failed to load prospects (${res.status})`)
      }
      const data = await res.json()
      setProspects(data)
      setSelectedIds(new Set())
    } catch (e: any) {
      setError(e.message || 'Error loading pending prospects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPending()
    }
  }, [activeTab, pipelineFilter])

  const handleSelectAll = () => {
    if (selectedIds.size === prospects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(prospects.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleBatchAction = async (action: 'approve' | 'reject', ids: string[]) => {
    if (ids.length === 0) return
    setActionLoading(true)
    setError('')
    setMessage('')

    try {
      const path = action === 'approve' ? endpoints.scout.approve : endpoints.scout.reject
      const res = await fetch(adminApi(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_ids: ids,
          reason: action === 'reject' ? 'Admin bulk rejection via dashboard' : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || `Action failed (${res.status})`)
      }

      setMessage(
        action === 'approve'
          ? `Successfully approved ${data.approved} prospect(s). They will be queued for daily dispatch.`
          : `Successfully rejected ${data.rejected} prospect(s).`
      )
      if (previewProspect && ids.includes(previewProspect.id)) {
        setPreviewProspect(null)
      }
      fetchPending()
    } catch (e: any) {
      setError(e.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePreview = async (id: string) => {
    setPreviewLoading(true)
    setPreviewProspect(null)
    try {
      const res = await fetch(adminApi(endpoints.scout.preview(id)), { cache: 'no-store' })
      if (!res.ok) throw new Error('Could not load email preview')
      const data = await res.json()
      setPreviewProspect(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleTemplateDownload = async () => {
    setError('')
    try {
      const res = await fetch(adminApi(endpoints.scout.cspTemplate))
      if (!res.ok) throw new Error(`Could not download template (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scout_csp_seed_template.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message || 'Template download failed')
    }
  }

  const handleCspUpload = async () => {
    if (!csvFile) return
    setUploading(true)
    setError('')
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', csvFile)

      const res = await fetch(adminApi(endpoints.scout.cspUpload), {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setImportResult(data)
      setCsvFile(null)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
            SCOUT Prospect Approvals
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Review and approve cold outreach prospects scored by autonomous SCOUT agents before dispatch.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pending Review ({prospects.length})
          </button>
          <button
            onClick={() => setActiveTab('csp_import')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'csp_import'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            Import CSP Seed
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TAB 1: PENDING PROSPECTS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
            {/* Filter Pipeline */}
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-neutral-400" />
              <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">Pipeline:</span>
              <div className="flex gap-1">
                {['all', 'vendor', 'buyer', 'csp'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPipelineFilter(p)}
                    className={`px-3 py-1 text-xs rounded-lg uppercase font-semibold transition ${
                      pipelineFilter === p
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPending}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                title="Refresh list"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => handleBatchAction('reject', Array.from(selectedIds))}
                disabled={selectedIds.size === 0 || actionLoading}
                className="px-3.5 py-1.5 bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-800/50 rounded-lg text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                Reject Selected ({selectedIds.size})
              </button>

              <button
                onClick={() => handleBatchAction('approve', Array.from(selectedIds))}
                disabled={selectedIds.size === 0 || actionLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Selected ({selectedIds.size})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                <span>Loading pending SCOUT prospects...</span>
              </div>
            ) : prospects.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <span className="font-semibold text-white">No prospects pending approval</span>
                <span className="text-xs text-neutral-500">All prospects have been reviewed or none fit qualification criteria.</span>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-neutral-950 text-neutral-400 text-xs font-semibold uppercase tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === prospects.length && prospects.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-amber-500/20"
                      />
                    </th>
                    <th className="p-4">Company / Target</th>
                    <th className="p-4">Pipeline</th>
                    <th className="p-4">Tier & Score</th>
                    <th className="p-4">Contact Email</th>
                    <th className="p-4">Outreach Subject</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-200">
                  {prospects.map(p => {
                    const isSelected = selectedIds.has(p.id)
                    return (
                      <tr key={p.id} className={`hover:bg-neutral-800/50 transition ${isSelected ? 'bg-neutral-850' : ''}`}>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-amber-500/20"
                          />
                        </td>
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                            <span>{p.display_name}</span>
                          </div>
                          {p.website_url && (
                            <a
                              href={p.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-neutral-500 hover:text-amber-400 truncate block max-w-xs mt-0.5"
                            >
                              {p.website_url}
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${
                            p.pipeline === 'vendor'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                              : p.pipeline === 'buyer'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                          }`}>
                            {p.pipeline}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400 text-xs">{p.priority_tier || 'N/A'}</span>
                            {p.score !== null && (
                              <span className="text-xs px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded">
                                {p.score} pts
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {p.has_contact_email ? (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" /> Found
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-500">None</span>
                          )}
                        </td>
                        <td className="p-4 max-w-xs truncate text-xs text-neutral-300">
                          {p.outreach_subject || '—'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handlePreview(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 rounded transition"
                            title="Preview email body"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBatchAction('approve', [p.id])}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 rounded text-xs font-medium transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBatchAction('reject', [p.id])}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-700/50 rounded text-xs font-medium transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CSP SEED IMPORT */}
      {activeTab === 'csp_import' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-400" />
              Upload CSP License Seed CSV
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Upload a CSV file containing licensed Corporate Service Providers (CSPs) to run the CSP pipeline. Max 500 rows.
              Scoring runs in the background — approved-ready prospects appear under Pending when it finishes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-neutral-400">
                Required header format: <code className="bg-neutral-950 text-amber-300 px-1.5 py-0.5 rounded border border-neutral-800">name, uen, licence_issue_date</code>
              </p>
              <button
                onClick={handleTemplateDownload}
                className="shrink-0 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Download template
              </button>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-700 hover:border-amber-500/60 bg-neutral-950 rounded-xl cursor-pointer transition">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => setCsvFile(e.target.files?.[0] || null)}
              />
              {csvFile ? (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-white">{csvFile.name}</p>
                  <p className="text-xs text-neutral-400">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center space-y-1 text-neutral-400">
                  <Upload className="h-8 w-8 mx-auto text-neutral-500 mb-2" />
                  <p className="text-sm font-medium text-neutral-300">Click to upload CSP seed CSV</p>
                  <p className="text-xs text-neutral-500">Supports standard .csv file format</p>
                </div>
              )}
            </label>

            <button
              onClick={handleCspUpload}
              disabled={!csvFile || uploading}
              className="w-full py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl hover:bg-amber-400 disabled:opacity-40 transition"
            >
              {uploading ? 'Uploading CSP Seed List...' : 'Upload & Queue CSP Seed'}
            </button>
          </div>

          {/* Result Output */}
          {importResult && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <p className="font-bold text-emerald-400">Queued for scoring</p>
              <p className="text-neutral-300">Rows received: {importResult.rows_received ?? 0}</p>
              <p className="text-neutral-300">Rows skipped (no name): {importResult.rows_skipped ?? 0}</p>
              <p className="text-neutral-300">Companies queued: {importResult.queued ?? 0}</p>
              <p className="text-neutral-500">
                Scoring runs on the background worker. Check the Pending tab shortly — this can take several minutes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {(previewLoading || previewProspect) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Outreach Email Preview</h3>
                  <p className="text-xs text-neutral-400">{previewProspect?.display_name}</p>
                </div>
              </div>
              <button
                onClick={() => { setPreviewProspect(null); setPreviewLoading(false); }}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
              {previewLoading ? (
                <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                  <span>Loading outreach preview...</span>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase font-semibold">Recipient Email:</span>
                      <span className="text-emerald-400 font-mono">{previewProspect?.contact_email || 'Not found (Best effort)'}</span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-800 pt-2">
                      <span className="text-neutral-500 uppercase font-semibold">Subject:</span>
                      <span className="text-white font-medium">{previewProspect?.subject}</span>
                    </div>
                  </div>

                  {/* Rendered HTML */}
                  <div className="border border-neutral-800 rounded-xl overflow-hidden bg-white text-neutral-900 p-4 min-h-[300px]">
                    <div
                      dangerouslySetInnerHTML={{ __html: previewProspect?.body_html || '' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            {previewProspect && (
              <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end gap-3">
                <button
                  onClick={() => handleBatchAction('reject', [previewProspect.id])}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-800/50 rounded-lg text-xs font-semibold transition"
                >
                  Reject Prospect
                </button>
                <button
                  onClick={() => handleBatchAction('approve', [previewProspect.id])}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Approve Prospect
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
