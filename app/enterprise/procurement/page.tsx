"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle2, XCircle, Eye, RefreshCw, Filter, ChevronDown
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  slug: string;
  company: string | null;
  currentScore: number;
  breakdown: { compliance: number; visibility: number; engagement: number; recency: number; procurement: number; };
  verificationDepth: string;
  monitoringActivity: string;
  riskSignal: string;
  procurementReadiness: string;
  sectorPercentile: number;
  stabilityIndex: number;
  volatility: number;
  trajectory: string;
  downgradeRisk: { level: string; score: number; reason: string; };
  elevation: { structuralLevel: string; verificationDepth: string | null; validationId: string | null; };
}

interface ProcurementData {
  vendors: Vendor[];
  page: number;
  limit: number;
  totalCount: number;
  orderBy: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DEPTH_COLOR: Record<string, string> = {
  UNVERIFIED: "text-neutral-500", BASIC: "text-yellow-400",
  STANDARD: "text-blue-400", DEEP: "text-violet-400", CERTIFIED: "text-emerald-400",
};
const RISK_COLOR: Record<string, string> = {
  CLEAN: "text-emerald-400", WATCH: "text-yellow-400", FLAGGED: "text-orange-400", CRITICAL: "text-red-400",
};
const DOWNGRADE_COLOR: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-400", MEDIUM: "bg-yellow-500/10 text-yellow-400",
  HIGH: "bg-orange-500/10 text-orange-400", CRITICAL: "bg-red-500/10 text-red-400",
};
function TrajectoryIcon({ t }: { t: string }) {
  if (t === "RISING")   return <TrendingUp  className="h-3.5 w-3.5 text-emerald-400" />;
  if (t === "FALLING")  return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-neutral-500" />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EnterpriseProcurementPage() {
  const [data, setData]         = useState<ProcurementData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [order, setOrder]       = useState("SCORE_FIRST");
  const [selected, setSelected] = useState<Vendor | null>(null);

  function load(p = 1, o = order) {
    setLoading(true);
    fetch(`/api/procurement/vendors?page=${p}&order_by=${o}&limit=20`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(1, order); }, []);

  const orders = [
    { value: "SCORE_FIRST",    label: "Score first"      },
    { value: "VERIFIED_FIRST", label: "Verified first"   },
    { value: "SNAPSHOT_FIRST", label: "Active first"     },
    { value: "COMPOSITE",      label: "Composite (AI)"   },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-neutral-800 pb-6">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Enterprise Pro</p>
            <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Procurement Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Ranked vendor list. Vendors are not informed of this analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Order selector */}
            <div className="relative">
              <select
                value={order}
                onChange={(e) => { setOrder(e.target.value); load(1, e.target.value); }}
                className="appearance-none pl-3 pr-8 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg cursor-pointer focus:outline-none"
              >
                {orders.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-neutral-500" />
            </div>
            <button
              onClick={() => load(page, order)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={`grid ${selected ? "grid-cols-5" : "grid-cols-1"} gap-6`}>
          {/* Table */}
          <div className={selected ? "col-span-3" : "col-span-1"}>
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr_1fr] gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
                <span>Vendor</span><span>Score</span><span>Depth</span>
                <span>Trajectory</span><span>Risk</span><span>Downgrade</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-neutral-500 text-sm">Loading…</div>
              ) : data?.vendors.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">No vendors found.</div>
              ) : (
                data?.vendors.map((v) => (
                  <button
                    key={v.slug}
                    onClick={() => setSelected(selected?.slug === v.slug ? null : v)}
                    className={`w-full grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr_1fr] gap-3 px-4 py-3 border-b border-neutral-800 hover:bg-neutral-900/80 transition text-left ${
                      selected?.slug === v.slug ? "bg-neutral-900" : ""
                    }`}
                  >
                    {/* Company */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{v.company || v.slug}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {v.elevation.structuralLevel === "ELEVATED" && (
                          <span className="text-[9px] text-violet-400 font-medium">✦ ELEVATED</span>
                        )}
                        <span className="text-[10px] text-neutral-500">{v.sectorPercentile.toFixed(0)}th pct</span>
                      </div>
                    </div>
                    {/* Score */}
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white">{v.currentScore}</span>
                    </div>
                    {/* Depth */}
                    <div className="flex items-center">
                      <span className={`text-xs font-medium ${DEPTH_COLOR[v.verificationDepth] || "text-neutral-400"}`}>
                        {v.verificationDepth}
                      </span>
                    </div>
                    {/* Trajectory */}
                    <div className="flex items-center gap-1">
                      <TrajectoryIcon t={v.trajectory} />
                      <span className="text-xs text-neutral-400">{(v.stabilityIndex || 0).toFixed(2)}</span>
                    </div>
                    {/* Risk */}
                    <div className="flex items-center">
                      <span className={`text-xs font-medium ${RISK_COLOR[v.riskSignal] || "text-neutral-400"}`}>
                        {v.riskSignal}
                      </span>
                    </div>
                    {/* Downgrade */}
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DOWNGRADE_COLOR[v.downgradeRisk?.level] || "bg-neutral-800 text-neutral-400"}`}>
                        {v.downgradeRisk?.level || "—"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Pagination */}
            {data && data.totalCount > data.limit && (
              <div className="flex items-center justify-between mt-4 text-sm text-neutral-400">
                <span>{data.totalCount} total vendors</span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => { const p = page - 1; setPage(p); load(p); }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 disabled:opacity-40 transition"
                  >← Prev</button>
                  <span className="px-3 py-1.5 text-neutral-500">Page {page}</span>
                  <button
                    disabled={page * data.limit >= data.totalCount}
                    onClick={() => { const p = page + 1; setPage(p); load(p); }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 disabled:opacity-40 transition"
                  >Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          {selected && (
            <div className="col-span-2 space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{selected.company || selected.slug}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Score: {selected.currentScore} · {selected.sectorPercentile.toFixed(0)}th percentile</p>
                  </div>
                  {selected.elevation.structuralLevel === "ELEVATED" && (
                    <span className="px-2 py-1 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-medium">✦ ELEVATED</span>
                  )}
                </div>

                {/* Score breakdown */}
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium mb-2">Score Breakdown</p>
                  {Object.entries(selected.breakdown).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 w-24 capitalize">{k}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-800">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${v}%` }} />
                      </div>
                      <span className="text-[10px] text-neutral-400 w-6 text-right">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Status grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-neutral-800 p-2.5">
                    <p className="text-neutral-500 mb-0.5">Monitoring</p>
                    <p className="font-medium text-white">{selected.monitoringActivity}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-800 p-2.5">
                    <p className="text-neutral-500 mb-0.5">Readiness</p>
                    <p className="font-medium text-white">{selected.procurementReadiness}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-800 p-2.5">
                    <p className="text-neutral-500 mb-0.5">Stability</p>
                    <p className="font-medium text-white">{selected.stabilityIndex?.toFixed(2) ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-800 p-2.5">
                    <p className="text-neutral-500 mb-0.5">Volatility</p>
                    <p className="font-medium text-white">±{selected.volatility}</p>
                  </div>
                </div>

                {selected.elevation.validationId && (
                  <div className="mt-3 rounded-lg bg-violet-500/5 border border-violet-500/15 p-2.5">
                    <p className="text-[10px] text-violet-400 font-medium">Elevaton Validation ID</p>
                    <p className="text-[10px] font-mono text-neutral-400 mt-1 break-all">{selected.elevation.validationId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
