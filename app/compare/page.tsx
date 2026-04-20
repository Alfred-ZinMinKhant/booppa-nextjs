"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { MarketplaceVendor } from "@/types";

// ── types ─────────────────────────────────────────────────────────────────────
interface VendorAnalysis {
  scores: {
    total_score: number;
    compliance_score: number;
    visibility_score: number;
    engagement_score: number;
    recency_score: number;
    procurement_interest_score: number;
  } | null;
  status: {
    verification_depth: string;
    monitoring_activity: string;
    risk_signal: string;
    procurement_readiness: string;
    confidence_score: number;
    evidence_count: number;
    notarization_depth: number;
  };
  verification: { lifecycle_status: string | null; verified_at: string | null } | null;
  sectors: string[];
}

// ── profile rows (from MarketplaceVendor) ─────────────────────────────────────
const PROFILE_ROWS: { key: keyof MarketplaceVendor; label: string }[] = [
  { key: "verified",          label: "Verified" },
  { key: "claimed",           label: "Profile Claimed" },
  { key: "industry",          label: "Industry" },
  { key: "country",           label: "Country" },
  { key: "city",              label: "City" },
  { key: "uen",               label: "UEN / Reg. No." },
  { key: "domain",            label: "Domain" },
  { key: "website",           label: "Website" },
  { key: "scan_status",       label: "Domain Scan" },
  { key: "short_description", label: "Description" },
];

// ── helpers ───────────────────────────────────────────────────────────────────
function scoreBar(value: number, max = 100) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 70 ? "bg-[#10b981]" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-bold text-base ${pct >= 70 ? "text-[#10b981]" : pct >= 40 ? "text-yellow-600" : "text-red-500"}`}>{value}</span>
      <div className="w-20 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function riskBadge(signal: string) {
  if (signal === "CLEAN") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">✓ Clean</span>;
  if (signal === "WATCH") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">⚠ Watch</span>;
  if (signal === "FLAGGED") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">⚠ Flagged</span>;
  if (signal === "CRITICAL") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">✕ Critical</span>;
  return <span className="text-[#94a3b8] text-xs">{signal}</span>;
}

function readinessBadge(r: string) {
  if (r === "READY") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">✓ Ready</span>;
  if (r === "CONDITIONAL") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">Conditional</span>;
  if (r === "NEEDS_ATTENTION") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">Needs attention</span>;
  return <span className="text-[#94a3b8] text-xs">Not ready</span>;
}

function depthBadge(d: string) {
  const map: Record<string, string> = { CERTIFIED: "text-[#10b981]", DEEP: "text-[#10b981]", STANDARD: "text-blue-600", BASIC: "text-yellow-600", UNVERIFIED: "" };
  return <span className={`text-xs font-semibold uppercase ${map[d] ?? "text-[#94a3b8]"}`}>{d}</span>;
}

function renderProfileCell(key: keyof MarketplaceVendor, value: unknown) {
  if (value === null || value === undefined || value === "") return <span className="text-[#94a3b8]">—</span>;
  if (key === "verified") return value ? <span className="text-[#10b981] font-semibold text-sm">✓ Verified</span> : <span className="text-[#94a3b8] text-sm">Not verified</span>;
  if (key === "claimed") return value ? <span className="text-[#10b981] font-semibold text-sm">✓ Claimed</span> : <span className="text-[#94a3b8] text-sm">Unclaimed</span>;
  if (key === "scan_status") {
    const s = String(value);
    if (s === "COMPLETE") return <span className="text-[#10b981] font-semibold text-sm">✓ Scanned</span>;
    if (s === "SCANNING" || s === "QUEUED") return <span className="text-yellow-600 text-sm">In progress</span>;
    if (s === "FAILED") return <span className="text-red-500 text-sm">Failed</span>;
    return <span className="text-[#94a3b8] text-sm">Not scanned</span>;
  }
  if (key === "domain" || key === "website") {
    const url = String(value);
    const href = url.startsWith("http") ? url : `https://${url}`;
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#10b981] text-sm hover:underline truncate max-w-[140px] block">{url}</a>;
  }
  if (key === "short_description") return <span className="text-xs text-[#64748b] line-clamp-3">{String(value)}</span>;
  return <span className="text-sm text-[#0f172a]">{String(value)}</span>;
}

// ── section header row ────────────────────────────────────────────────────────
function SectionRow({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr className="bg-[#f1f5f9]">
      <td colSpan={colCount + 1} className="px-6 py-2 text-xs font-bold text-[#64748b] uppercase tracking-widest">{label}</td>
    </tr>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [search, setSearch]     = useState("");
  const [results, setResults]   = useState<MarketplaceVendor[]>([]);
  const [selected, setSelected] = useState<MarketplaceVendor[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, VendorAnalysis>>({});
  const [loading, setLoading]   = useState(false);

  const searchVendors = async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/marketplace/search?q=${encodeURIComponent(q)}&per_page=10`);
      if (res.ok) { const data = await res.json(); setResults(data.vendors || []); }
    } catch { /* silent */ }
  };

  const addVendor = (vendor: MarketplaceVendor) => {
    if (selected.length >= 4) return;
    if (selected.find(v => v.id === vendor.id)) return;
    setSelected(prev => [...prev, vendor]);
    setSearch(""); setResults([]);
  };

  const removeVendor = (id: string) => {
    setSelected(prev => prev.filter(v => v.id !== id));
    setAnalysis(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // auto-fetch analysis whenever selected vendors change (≥2)
  useEffect(() => {
    if (selected.length < 2) return;
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor_ids: selected.map(v => v.id) }),
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.vendors) return;
        const map: Record<string, VendorAnalysis> = {};
        for (const v of data.vendors) {
          map[v.id] = { scores: v.scores, status: v.status, verification: v.verification, sectors: v.sectors };
        }
        setAnalysis(map);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selected]);

  const showTable = selected.length >= 2;
  const cols = selected.length;

  const td = "px-6 py-4 text-center";
  const rowClass = (i: number) => `border-b border-[#f1f5f9] ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`;
  const labelTd = "px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide";

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Compare Vendors</h1>
          <p className="text-xl text-[#94a3b8]">Side-by-side comparison of up to 4 vendors — profile, trust scores, compliance, procurement readiness, and more.</p>
        </div>
      </section>

      {/* Search + chips */}
      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={selected.length >= 4 ? "Maximum 4 vendors selected" : "Search vendors to compare (min 2, max 4)…"}
              value={search}
              onChange={e => searchVendors(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#10b981] transition-colors bg-white"
              disabled={selected.length >= 4}
            />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#e2e8f0] rounded-xl mt-1 shadow-lg max-h-[300px] overflow-y-auto z-20">
                {results.map(v => (
                  <button type="button" key={v.id} onClick={() => addVendor(v)} disabled={!!selected.find(s => s.id === v.id)}
                    className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] border-b border-[#e2e8f0] last:border-b-0 disabled:opacity-40 transition-colors">
                    <span className="font-medium text-[#0f172a]">{v.company_name}</span>
                    {v.industry && <span className="text-sm text-[#64748b] ml-2">· {v.industry}</span>}
                    {v.verified && <span className="ml-2 text-xs text-[#10b981] font-semibold">✓ Verified</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {selected.map(v => (
              <div key={v.id} className="flex items-center gap-2 bg-white border border-[#10b981] rounded-xl px-4 py-2">
                <span className="font-semibold text-[#0f172a] text-sm">{v.company_name}</span>
                {v.verified && <span className="text-xs text-[#10b981]">✓</span>}
                <button type="button" onClick={() => removeVendor(v.id)} className="text-[#94a3b8] hover:text-red-500 transition-colors ml-1 text-xs">✕</button>
              </div>
            ))}
            {selected.length < 2 && (
              <div className="flex items-center gap-2 border-2 border-dashed border-[#e2e8f0] rounded-xl px-4 py-2 text-[#94a3b8] text-sm">
                Add {2 - selected.length} more vendor{2 - selected.length > 1 ? "s" : ""} to compare
              </div>
            )}
            {loading && <span className="text-xs text-[#94a3b8] self-center">Loading scores…</span>}
          </div>
        </div>
      </section>

      {/* Unified comparison table */}
      {showTable && (
        <section className="px-6 pb-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wide w-44">Field</th>
                    {selected.map(v => (
                      <th key={v.id} className="text-center px-6 py-4">
                        <Link href={`/vendors/${v.slug || v.seo_slug || v.id}`} className="font-bold text-[#0f172a] hover:text-[#10b981] transition-colors">
                          {v.company_name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ── Profile ── */}
                  <SectionRow label="Profile" colCount={cols} />
                  {PROFILE_ROWS.map(({ key, label }, i) => {
                    const hasData = selected.some(v => v[key] !== undefined && v[key] !== null && v[key] !== "");
                    if (!hasData) return null;
                    return (
                      <tr key={key} className={rowClass(i)}>
                        <td className={labelTd}>{label}</td>
                        {selected.map(v => <td key={v.id} className={td}>{renderProfileCell(key, v[key])}</td>)}
                      </tr>
                    );
                  })}

                  {/* ── Trust Scores ── */}
                  <SectionRow label="Trust Scores" colCount={cols} />
                  {[
                    { key: "total_score",                 label: "Overall Score" },
                    { key: "compliance_score",            label: "Compliance" },
                    { key: "visibility_score",            label: "Visibility" },
                    { key: "engagement_score",            label: "Engagement" },
                    { key: "recency_score",               label: "Recency" },
                    { key: "procurement_interest_score",  label: "Procurement Interest" },
                  ].map(({ key, label }, i) => (
                    <tr key={key} className={rowClass(i)}>
                      <td className={labelTd}>{label}</td>
                      {selected.map(v => {
                        const a = analysis[v.id];
                        const val = a?.scores?.[key as keyof typeof a.scores];
                        return (
                          <td key={v.id} className={td}>
                            {val !== undefined && val !== null
                              ? scoreBar(val as number)
                              : <span className="text-[#94a3b8] text-xs">No data</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* ── Procurement Status ── */}
                  <SectionRow label="Procurement Status" colCount={cols} />
                  <tr className={rowClass(0)}>
                    <td className={labelTd}>Verification Depth</td>
                    {selected.map(v => <td key={v.id} className={td}>{analysis[v.id] ? depthBadge(analysis[v.id].status.verification_depth) : <span className="text-[#94a3b8] text-xs">—</span>}</td>)}
                  </tr>
                  <tr className={rowClass(1)}>
                    <td className={labelTd}>Risk Signal</td>
                    {selected.map(v => <td key={v.id} className={td}>{analysis[v.id] ? riskBadge(analysis[v.id].status.risk_signal) : <span className="text-[#94a3b8] text-xs">—</span>}</td>)}
                  </tr>
                  <tr className={rowClass(2)}>
                    <td className={labelTd}>Procurement Readiness</td>
                    {selected.map(v => <td key={v.id} className={td}>{analysis[v.id] ? readinessBadge(analysis[v.id].status.procurement_readiness) : <span className="text-[#94a3b8] text-xs">—</span>}</td>)}
                  </tr>
                  <tr className={rowClass(3)}>
                    <td className={labelTd}>Monitoring Activity</td>
                    {selected.map(v => <td key={v.id} className={td}><span className="text-xs text-[#0f172a]">{analysis[v.id]?.status.monitoring_activity ?? <span className="text-[#94a3b8]">—</span>}</span></td>)}
                  </tr>
                  <tr className={rowClass(4)}>
                    <td className={labelTd}>Confidence Score</td>
                    {selected.map(v => {
                      const s = analysis[v.id]?.status;
                      return <td key={v.id} className={td}>{s ? scoreBar(Math.round(s.confidence_score)) : <span className="text-[#94a3b8] text-xs">—</span>}</td>;
                    })}
                  </tr>
                  <tr className={rowClass(5)}>
                    <td className={labelTd}>Evidence Count</td>
                    {selected.map(v => {
                      const s = analysis[v.id]?.status;
                      return <td key={v.id} className={td}><span className="text-sm font-semibold text-[#0f172a]">{s ? s.evidence_count : <span className="text-[#94a3b8]">—</span>}</span></td>;
                    })}
                  </tr>
                  <tr className={rowClass(6)}>
                    <td className={labelTd}>Notarization Depth</td>
                    {selected.map(v => {
                      const s = analysis[v.id]?.status;
                      return <td key={v.id} className={td}><span className="text-sm font-semibold text-[#0f172a]">{s ? `${s.notarization_depth}/5` : <span className="text-[#94a3b8]">—</span>}</span></td>;
                    })}
                  </tr>

                  {/* ── Sectors ── */}
                  <SectionRow label="Sectors / Specialisations" colCount={cols} />
                  <tr className={rowClass(0)}>
                    <td className={labelTd}>Sectors</td>
                    {selected.map(v => {
                      const secs = analysis[v.id]?.sectors;
                      return (
                        <td key={v.id} className={td}>
                          {secs && secs.length > 0
                            ? <div className="flex flex-wrap gap-1 justify-center">{secs.map(s => <span key={s} className="inline-block px-2 py-0.5 bg-[#f1f5f9] text-[#0f172a] rounded-full text-xs">{s}</span>)}</div>
                            : <span className="text-[#94a3b8] text-xs">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#94a3b8] mt-4 text-center">
              Data sourced from BOOPPA Vendor Network. Scores reflect claimed &amp; active vendors only.{" "}
              <Link href="/vendors" className="text-[#10b981] hover:underline">Browse all vendors →</Link>
            </p>
          </div>
        </section>
      )}

      {!showTable && (
        <section className="py-20 px-6 text-center">
          <p className="text-[#94a3b8] text-lg">Search and add at least 2 vendors above to start comparing.</p>
          <Link href="/vendors" className="mt-4 inline-block text-[#10b981] font-semibold hover:underline">Browse the vendor directory →</Link>
        </section>
      )}
    </main>
  );
}

