"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft, ExternalLink, Search } from "lucide-react";

interface ScanRow {
  id: string;
  month: string;
  scanType: string;
  createdAt: string | null;
  txHash: string | null;
  anchoredAt: string | null;
  status: "anchored" | "pending" | "failed";
  explorerUrl: string | null;
}

interface LogResult {
  vendor: { company: string | null; slug: string };
  network: string;
  scans: ScanRow[];
  total: number;
}

const STATUS_CLS: Record<string, string> = {
  anchored: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  pending: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  failed: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

function ScanLogContent() {
  const params = useSearchParams();
  const [slug, setSlug] = useState(params.get("vendor") || "");
  const [result, setResult] = useState<LogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: string) => {
    if (!s.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/procurement/scan-verification-log?vendor_slug=${encodeURIComponent(s.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || "Failed to load");
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load scan log");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/procurement/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight">On-chain scan log</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6 max-w-xl leading-relaxed">
          Every vendor scan is blockchain-timestamped. Look up a vendor to see the immutable,
          independently verifiable record of when you scanned them.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); load(slug); }}
          className="flex gap-2 mb-6"
        >
          <div className="flex-1 flex items-center gap-2 bg-[#0f172a] border border-white/10 rounded-lg px-3">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="Vendor slug (email prefix)"
              className="flex-1 bg-transparent py-2.5 text-sm focus:outline-none"
            />
          </div>
          <button className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-sm font-semibold">
            Look up
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">{error}</div>
        )}

        {loading && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-sky-400 animate-spin" /></div>}

        {result && !loading && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold">{result.vendor.company || result.vendor.slug}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{result.network}</span>
            </div>
            {result.scans.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No scans of this vendor yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                    <th className="text-left font-medium px-5 py-2.5">Date</th>
                    <th className="text-left font-medium px-3 py-2.5">Type</th>
                    <th className="text-left font-medium px-3 py-2.5">Status</th>
                    <th className="text-left font-medium px-3 py-2.5">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scans.map((s) => (
                    <tr key={s.id} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-5 py-3 text-slate-300">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : s.month}</td>
                      <td className="px-3 py-3 text-slate-300">{s.scanType}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_CLS[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-3 py-3">
                        {s.txHash && s.explorerUrl ? (
                          <a href={s.explorerUrl} target="_blank" rel="noreferrer" className="font-mono text-sky-400 hover:text-sky-300 inline-flex items-center gap-1">
                            {s.txHash.slice(0, 12)}… <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">{s.status === "pending" ? "anchoring…" : "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ScanLogPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-sky-400 animate-spin" /></main>}>
      <ScanLogContent />
    </Suspense>
  );
}
