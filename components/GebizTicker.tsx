'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { config as appConfig } from '@/lib/config'

interface Tender {
  tender_no: string
  title: string
  agency: string
  closing_date: string | null
  url: string | null
}

export default function GebizTicker() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('gebiz_ticker_dismissed') === '1') {
      setDismissed(true)
      return
    }

    fetch(`${appConfig.apiUrl}/api/v1/gebiz/latest-tenders?limit=10`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setTenders(data) })
      .catch(() => {})
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('gebiz_ticker_dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || tenders.length === 0) return null

  return (
    <div className="bg-[#0f2a1a] border-b border-[#10b981]/20 text-sm text-white/80 flex items-center h-9 overflow-hidden relative">
      {/* Label */}
      <span className="flex-shrink-0 px-3 text-[#10b981] font-semibold text-xs tracking-wider uppercase whitespace-nowrap border-r border-[#10b981]/20 h-full flex items-center">
        GeBIZ Live
      </span>

      {/* Scrolling track */}
      <div className="overflow-hidden flex-1 relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
          {/* Duplicate for seamless loop */}
          {[...tenders, ...tenders].map((t, i) => (
            <span key={`${t.tender_no}-${i}`} className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-white/40 text-[10px] font-mono">{t.tender_no}</span>
              {t.url ? (
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#10b981] transition-colors"
                >
                  {t.title}
                </a>
              ) : (
                <span>{t.title}</span>
              )}
              <span className="text-white/30">{t.agency}</span>
              {t.closing_date && (
                <span className="text-white/30 text-xs">
                  closes {new Date(t.closing_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                </span>
              )}
              <span className="text-white/20">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* View all link */}
      <Link
        href="/opportunities"
        className="flex-shrink-0 px-3 text-[#10b981] text-xs font-medium hover:underline whitespace-nowrap border-l border-[#10b981]/20 h-full flex items-center"
      >
        View all
      </Link>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss ticker"
        className="flex-shrink-0 px-2 text-white/30 hover:text-white/70 h-full flex items-center"
      >
        ×
      </button>
    </div>
  )
}
