'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { adminApiFetch } from '@/lib/adminApiClient'

interface Tender {
  id: string
  tender_no: string
  sector: string
  agency: string
  description: string | null
  base_rate: number
  created_at: string | null
}

export default function TendersPage() {
  const [items, setItems] = useState<Tender[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await adminApiFetch('/api/admin/api/admin/tenders?limit=200', { cache: 'no-store' })
      if (!alive) return
      if (!res.ok) {
        setError(`Failed to load (${res.status})`)
        setLoading(false)
        return
      }
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tenders</h1>
          <p className="text-sm text-neutral-400 mt-1">{total} entries · read-only.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">Tender No.</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-left">Agency</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Base rate</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-mono text-white">{t.tender_no}</td>
                  <td className="px-4 py-3 text-neutral-300">{t.sector}</td>
                  <td className="px-4 py-3 text-neutral-300">{t.agency}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs max-w-md truncate">{t.description || '—'}</td>
                  <td className="px-4 py-3 text-right text-neutral-300">{(t.base_rate * 100).toFixed(0)}%</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No tenders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
