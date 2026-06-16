'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

/**
 * Exportable offline-evidence artefacts. Each links to a Next proxy that streams
 * the JWT-gated backend PDF (/api/vendor-artifacts/{name}). The simple reports
 * are one-click; the Competitor Activity report needs a GeBIZ tender number and
 * is Vendor-Pro-gated server-side (the proxy 403s for ineligible plans).
 */
export default function ExportableArtifacts() {
  const [tenderNo, setTenderNo] = useState('');

  const items: { name: string; title: string; desc: string }[] = [
    { name: 'badge-certificate', title: 'Badge Certificate', desc: 'Your verification depth & readiness, attestable offline.' },
    { name: 'priority-placement', title: 'Priority Placement Report', desc: 'Evidence of your search-priority entitlement + profile views.' },
    { name: 'bid-timing', title: 'Bid-Timing Report', desc: 'When GeBIZ awards land — plan your bids around the busiest months.' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">Exportable evidence</h2>
      </div>
      <p className="text-xs text-neutral-400 mb-4">
        Download offline PDF versions of your dashboard signals — file them, forward them, or attach them to a tender.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <a
            key={it.name}
            href={`/api/vendor-artifacts/${it.name}`}
            className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-emerald-500/40 hover:bg-emerald-500/[0.05] transition"
          >
            <span className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{it.title}</span>
              <Download className="h-4 w-4 text-emerald-400 shrink-0" />
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{it.desc}</span>
          </a>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <p className="text-sm font-medium text-white">Competitor Activity Report</p>
        <p className="text-[11px] text-neutral-400 mt-1 mb-2">
          Anonymised interest on a specific tender + similar tenders. Vendor Pro only.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={tenderNo}
            onChange={(e) => setTenderNo(e.target.value)}
            placeholder="GeBIZ tender number"
            className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40"
          />
          <a
            href={tenderNo.trim() ? `/api/vendor-artifacts/competitor-signals?tenderNo=${encodeURIComponent(tenderNo.trim())}` : undefined}
            aria-disabled={!tenderNo.trim()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              tenderNo.trim()
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : 'bg-white/5 text-neutral-500 pointer-events-none'
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        </div>
      </div>
    </div>
  );
}
