'use client';

import { useState } from 'react';
import { AlertCircle, Download, FileText, Loader2 } from 'lucide-react';

/**
 * Exportable offline-evidence artefacts. Each fetches a Next proxy that streams
 * the JWT-gated backend PDF (/api/vendor-artifacts/{name}). The simple reports
 * are one-click; the Competitor Activity report needs a GeBIZ tender number and
 * is Vendor-Pro-gated server-side (the proxy 403s for ineligible plans).
 *
 * These were plain `<a href>` links until 2026-08-08. A browser follows such a
 * link whatever comes back, so an expired session or a plan gate navigated the
 * user AWAY from the dashboard and onto a raw JSON error body — losing their
 * page and showing them `{"detail":"..."}` as if it were the document. Fetching
 * the blob keeps failures on the page where they can be explained.
 */
export default function ExportableArtifacts() {
  const [tenderNo, setTenderNo] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const items: { name: string; title: string; desc: string }[] = [
    { name: 'badge-certificate', title: 'Badge Certificate', desc: 'Your verification depth & readiness, attestable offline.' },
    { name: 'priority-placement', title: 'Priority Placement Report', desc: 'Evidence of your search-priority entitlement + profile views.' },
    { name: 'bid-timing', title: 'Bid-Timing Report', desc: 'When GeBIZ awards land — plan your bids around the busiest months.' },
  ];

  /** Human-readable reason, preferring the backend's `detail` when it sent one. */
  async function describeFailure(res: Response): Promise<string> {
    if (res.status === 401) return 'Your session has expired. Please sign in again.';
    if (res.status === 403) return 'This report is available on Vendor Pro.';
    try {
      const body = await res.json();
      if (typeof body?.detail === 'string' && body.detail) return body.detail;
    } catch {
      /* not JSON — fall through */
    }
    return "We couldn't generate that PDF. Please try again.";
  }

  async function download(key: string, url: string, fallbackName: string) {
    setError('');
    setBusy(key);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        setError(await describeFailure(res));
        return;
      }

      // Prefer the server's filename; it carries the report date.
      const disposition = res.headers.get('content-disposition') || '';
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const filename = match ? decodeURIComponent(match[1]) : fallbackName;

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  const trimmedTender = tenderNo.trim();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">Exportable evidence</h2>
      </div>
      <p className="text-xs text-neutral-400 mb-4">
        Download offline PDF versions of your dashboard signals — file them, forward them, or attach them to a tender.
      </p>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <button
            key={it.name}
            type="button"
            onClick={() => download(it.name, `/api/vendor-artifacts/${it.name}`, `${it.name}.pdf`)}
            disabled={busy === it.name}
            className="flex flex-col text-left rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-emerald-500/40 hover:bg-emerald-500/[0.05] transition disabled:opacity-60"
          >
            <span className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{it.title}</span>
              {busy === it.name ? (
                <Loader2 className="h-4 w-4 text-emerald-400 shrink-0 animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{it.desc}</span>
          </button>
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
          <button
            type="button"
            disabled={!trimmedTender || busy === 'competitor-signals'}
            onClick={() =>
              download(
                'competitor-signals',
                `/api/vendor-artifacts/competitor-signals?tenderNo=${encodeURIComponent(trimmedTender)}`,
                `competitor-signals-${trimmedTender}.pdf`,
              )
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              trimmedTender
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-60'
                : 'bg-white/5 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {busy === 'competitor-signals' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}{' '}
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
