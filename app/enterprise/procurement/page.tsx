"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Search, Filter, ChevronDown, X, ExternalLink,
  CheckCircle2, AlertTriangle, Clock, XCircle, Loader2,
  TrendingUp, TrendingDown, Minus, Activity,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface VendorBreakdown {
  compliance: number;
  visibility: number;
  engagement: number;
  recency: number;
  procurement: number;
}

interface Vendor {
  slug: string;
  company: string | null;
  currentScore: number;
  breakdown: VendorBreakdown;
  verified: boolean;
  complianceScore: number;
  verifyExpiry: string | null;
  stabilityIndex: number;
  volatility: number;
  trajectory: "RISING" | "FALLING" | "STABLE" | "INSUFFICIENT_DATA";
  downgradeRisk: { level: string; score: number; reason: string };
  sectorPercentile: number;
  verificationDepth: "UNVERIFIED" | "BASIC" | "STANDARD" | "DEEP" | "CERTIFIED";
  monitoringActivity: string;
  riskSignal: "CLEAN" | "WATCH" | "FLAGGED" | "CRITICAL";
  procurementReadiness: "READY" | "CONDITIONAL" | "NEEDS_ATTENTION" | "NOT_READY";
  elevation: {
    structuralLevel: string;
    verificationDepth: string | null;
    notarizedAt: string | null;
    validationId: string | null;
  };
}

interface RfpSignal {
  domain: string;
  orgType: string;
  isGov: boolean;
  intentScore: number;
  isActiveRFP: boolean;
  viewCount7d: number;
  lastSeenAt: string | null;
}

// ── Config Maps ──────────────────────────────────────────────────────────────

const DEPTH_CONFIG: Record<string, { label: string; tw: string; bg: string }> = {
  UNVERIFIED: { label: "Unverified", tw: "text-neutral-400", bg: "bg-neutral-800" },
  BASIC:      { label: "Basic",      tw: "text-yellow-400",  bg: "bg-yellow-500/10" },
  STANDARD:   { label: "Standard",   tw: "text-blue-400",    bg: "bg-blue-500/10" },
  DEEP:       { label: "Deep",       tw: "text-violet-400",  bg: "bg-violet-500/10" },
  CERTIFIED:  { label: "Certified",  tw: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const RISK_CONFIG: Record<string, { label: string; tw: string; icon: typeof CheckCircle2 }> = {
  CLEAN:    { label: "Clean",    tw: "text-emerald-400", icon: CheckCircle2 },
  WATCH:    { label: "Watch",    tw: "text-yellow-400",  icon: AlertTriangle },
  FLAGGED:  { label: "Flagged",  tw: "text-orange-400",  icon: AlertTriangle },
  CRITICAL: { label: "Critical", tw: "text-red-400",     icon: XCircle },
};

const READINESS_CONFIG: Record<string, { label: string; tw: string; bar: string; pct: number }> = {
  READY:           { label: "Ready",           tw: "text-emerald-400", bar: "bg-emerald-500", pct: 100 },
  CONDITIONAL:     { label: "Conditional",     tw: "text-blue-400",    bar: "bg-blue-500",    pct: 70 },
  NEEDS_ATTENTION: { label: "Needs attention", tw: "text-yellow-400",  bar: "bg-yellow-500",  pct: 40 },
  NOT_READY:       { label: "Not ready",       tw: "text-red-400",     bar: "bg-red-500",     pct: 15 },
};

const TRAJECTORY_CONFIG: Record<string, { icon: typeof TrendingUp; tw: string; label: string }> = {
  RISING:            { icon: TrendingUp,   tw: "text-emerald-400", label: "Rising" },
  FALLING:           { icon: TrendingDown, tw: "text-red-400",     label: "Falling" },
  STABLE:            { icon: Minus,        tw: "text-blue-400",    label: "Stable" },
  INSUFFICIENT_DATA: { icon: Activity,     tw: "text-neutral-500", label: "New" },
};

// ── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold text-slate-100">{score}</span>
      </div>
    </div>
  );
}

// ── Vendor Card ──────────────────────────────────────────────────────────────

function VendorCard({
  vendor,
  selected,
  onSelect,
  onVerify,
}: {
  vendor: Vendor;
  selected: boolean;
  onSelect: (v: Vendor) => void;
  onVerify: (v: Vendor) => void;
}) {
  const depth = DEPTH_CONFIG[vendor.verificationDepth] ?? DEPTH_CONFIG.UNVERIFIED;
  const readiness = READINESS_CONFIG[vendor.procurementReadiness] ?? READINESS_CONFIG.NOT_READY;
  const risk = RISK_CONFIG[vendor.riskSignal] ?? RISK_CONFIG.CLEAN;
  const RiskIcon = risk.icon;
  const traj = TRAJECTORY_CONFIG[vendor.trajectory] ?? TRAJECTORY_CONFIG.INSUFFICIENT_DATA;
  const TrajIcon = traj.icon;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all hover:border-neutral-600 ${
        selected
          ? "border-blue-500/50 bg-blue-500/[0.03]"
          : "border-neutral-800 bg-neutral-950"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onSelect(vendor)}
        className={`absolute top-3.5 right-3.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
          selected
            ? "border-blue-500 bg-blue-500"
            : "border-neutral-700 bg-transparent hover:border-neutral-500"
        }`}
      >
        {selected && <span className="text-white text-[10px] font-bold">&check;</span>}
      </button>

      {/* Header */}
      <div className="flex gap-3 items-start pr-7">
        <ScoreRing score={vendor.currentScore} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[13px] font-bold text-slate-200 leading-tight truncate">
              {vendor.company || vendor.slug}
            </h3>
            {vendor.verified && (
              <span className="text-[9px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                VERIFIED
              </span>
            )}
            {vendor.elevation.structuralLevel === "ELEVATED" && (
              <span className="text-[9px] font-bold tracking-wider text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                ELEVATED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-neutral-500">{vendor.slug}</span>
            <span className="text-neutral-700">&middot;</span>
            <span className={`text-[10px] font-medium ${traj.tw} inline-flex items-center gap-0.5`}>
              <TrajIcon className="w-2.5 h-2.5" />
              {traj.label}
            </span>
          </div>
        </div>
      </div>

      {/* Score breakdown mini-bar */}
      <div className="flex gap-0.5 my-2.5 h-1.5 rounded-full overflow-hidden">
        <div className="bg-blue-500" style={{ width: `${vendor.breakdown.compliance}%` }} title={`Compliance: ${vendor.breakdown.compliance}`} />
        <div className="bg-emerald-500" style={{ width: `${vendor.breakdown.visibility}%` }} title={`Visibility: ${vendor.breakdown.visibility}`} />
        <div className="bg-amber-500" style={{ width: `${vendor.breakdown.engagement}%` }} title={`Engagement: ${vendor.breakdown.engagement}`} />
        <div className="bg-violet-500" style={{ width: `${vendor.breakdown.recency}%` }} title={`Recency: ${vendor.breakdown.recency}`} />
        <div className="bg-cyan-500" style={{ width: `${vendor.breakdown.procurement}%` }} title={`Procurement: ${vendor.breakdown.procurement}`} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${depth.bg} ${depth.tw}`}>
          {depth.label}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 ${risk.tw} inline-flex items-center gap-1`}>
          <RiskIcon className="w-2.5 h-2.5" />
          {risk.label}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-500">
          {vendor.sectorPercentile}th pct
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-500">
          Stability {Math.round(vendor.stabilityIndex * 100)}%
        </span>
        {vendor.downgradeRisk.level !== "LOW" && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-800 ${
            vendor.downgradeRisk.level === "CRITICAL" ? "text-red-400" :
            vendor.downgradeRisk.level === "HIGH" ? "text-orange-400" : "text-yellow-400"
          }`}>
            Downgrade: {vendor.downgradeRisk.level}
          </span>
        )}
      </div>

      {/* Readiness bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-neutral-500">Procurement Readiness</span>
          <span className={`text-[10px] font-bold ${readiness.tw}`}>{readiness.label}</span>
        </div>
        <div className="h-[3px] bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${readiness.bar} transition-all duration-500`}
            style={{ width: `${readiness.pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onVerify(vendor)}
          className="flex-1 text-[11px] font-bold py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <Search className="w-3 h-3" />
          Verify
        </button>
        <Link
          href={`/vendors/${vendor.slug}`}
          className="flex-1 text-[11px] font-bold py-2 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1.5"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

// ── Verify Modal ─────────────────────────────────────────────────────────────

function VerifyModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [step, setStep] = useState<"input" | "verifying" | "result" | "error">("input");
  const [docHash, setDocHash] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!docHash.trim()) {
      setError("Enter a document hash to verify.");
      return;
    }
    setStep("verifying");
    setError("");
    try {
      const res = await fetch(`/api/procurement/verify?hash=${encodeURIComponent(docHash.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Verification failed (${res.status})`);
        setStep("error");
        return;
      }
      setResult(await res.json());
      setStep("result");
    } catch {
      setError("Network error — could not reach verification service.");
      setStep("error");
    }
  }, [docHash]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Verify Vendor</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{vendor.company || vendor.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "input" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                Document / audit hash
              </label>
              <input
                type="text"
                value={docHash}
                onChange={(e) => setDocHash(e.target.value)}
                placeholder="Enter the audit hash (e.g. 0x3a9f…)"
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50"
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 space-y-1.5">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Verification includes</p>
              <div className="flex flex-col gap-1">
                {[
                  "UEN registry cross-check",
                  "Blockchain anchor lookup",
                  "Compliance evidence scan",
                  "Risk signal analysis",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                    <span className="text-[11px] text-neutral-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleVerify}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
            >
              Run Verification
            </button>
          </div>
        )}

        {step === "verifying" && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="mx-auto w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-neutral-400">Verifying {vendor.company || vendor.slug}...</p>
            <p className="text-[10px] text-neutral-600">Checking blockchain anchors &amp; registry</p>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-400">Verification Failed</p>
                <p className="text-[11px] text-red-400/70">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep("input"); setError(""); }}
                className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-400 text-sm font-medium hover:bg-neutral-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-400 text-sm font-medium hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  {result.anchored ? "Verification Passed" : "Record Found (unanchored)"}
                </p>
                <p className="text-[11px] text-emerald-400/70">
                  {result.anchored ? "Blockchain anchor confirmed" : "Pending blockchain confirmation"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Company", value: result.company_name },
                { label: "Framework", value: result.framework },
                { label: "Status", value: result.status },
                { label: "Format", value: result.format },
                ...(result.anchored_at ? [{ label: "Anchored at", value: result.anchored_at }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-neutral-800/50 last:border-0">
                  <span className="text-[11px] text-neutral-500">{row.label}</span>
                  <span className="text-[11px] font-medium text-neutral-200">{row.value}</span>
                </div>
              ))}
              {result.tx_hash && (
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[11px] text-neutral-500">Tx Hash</span>
                  <span className="text-[11px] font-mono text-blue-400">{result.tx_hash}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-400 text-sm font-medium hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
              {result.verify_url && (
                <a
                  href={result.verify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  Full Report
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── RFP Signals Panel ───────────────────────────────────────────────────────

function RfpSignalsPanel({ signals }: { signals: RfpSignal[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Active RFP Signals ({signals.length})
        </h3>
      </div>
      <div className="space-y-2">
        {signals.slice(0, 5).map((s) => (
          <div
            key={s.domain}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-950 border border-neutral-800"
          >
            <div className="flex items-center gap-2.5">
              {s.isGov && (
                <span className="text-[9px] font-bold tracking-wider text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                  GOV
                </span>
              )}
              <span className="text-xs font-medium text-neutral-200">{s.domain}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-neutral-500">
                {s.viewCount7d} views
              </span>
              <span className={`text-[10px] font-bold ${s.intentScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                Intent: {s.intentScore}
              </span>
              {s.isActiveRFP && (
                <span className="text-[9px] font-bold tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  ACTIVE RFP
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({ vendors, totalCount }: { vendors: Vendor[]; totalCount: number }) {
  const ready = vendors.filter((v) => v.procurementReadiness === "READY").length;
  const verified = vendors.filter((v) => v.verified).length;
  const avgScore = vendors.length
    ? Math.round(vendors.reduce((s, v) => s + v.currentScore, 0) / vendors.length)
    : 0;
  const atRisk = vendors.filter((v) => v.riskSignal !== "CLEAN").length;

  const stats = [
    { label: "Total Vendors", value: String(totalCount), tw: "text-white" },
    { label: "Procurement Ready", value: String(ready), tw: "text-emerald-400" },
    { label: "Verified", value: String(verified), tw: "text-blue-400" },
    { label: "Avg Trust Score", value: String(avgScore), tw: "text-white" },
    { label: "Risk Signals", value: String(atRisk), tw: atRisk > 0 ? "text-yellow-400" : "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{s.label}</p>
          <p className={`text-xl font-extrabold mt-1 ${s.tw}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function EnterpriseProcurementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 30;

  const [searchQuery, setSearchQuery] = useState("");
  const [depthFilter, setDepthFilter] = useState("All");
  const [readinessFilter, setReadinessFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"SCORE_FIRST" | "VERIFIED_FIRST" | "COMPOSITE">("SCORE_FIRST");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [verifyVendor, setVerifyVendor] = useState<Vendor | null>(null);

  const [rfpSignals, setRfpSignals] = useState<RfpSignal[]>([]);

  // Fetch vendors from real API
  useEffect(() => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("page", String(page));
    params.set("order_by", sortBy);
    if (verifiedOnly) params.set("verified", "true");

    fetch(`/api/procurement/vendors?${params}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to load (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setVendors(data.vendors || []);
        setTotalCount(data.totalCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, sortBy, verifiedOnly]);

  // Fetch RFP signals
  useEffect(() => {
    fetch("/api/procurement/rfp-signals")
      .then((res) => (res.ok ? res.json() : { signals: [] }))
      .then((data) => setRfpSignals(data.signals || []))
      .catch(() => {});
  }, []);

  const toggleSelect = useCallback((v: Vendor) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(v.slug)) next.delete(v.slug);
      else next.add(v.slug);
      return next;
    });
  }, []);

  // Client-side filtering (search, depth, readiness) on top of server results
  const filtered = useMemo(() => {
    let list = vendors;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          (v.company || "").toLowerCase().includes(q) ||
          v.slug.toLowerCase().includes(q)
      );
    }
    if (depthFilter !== "All") list = list.filter((v) => v.verificationDepth === depthFilter);
    if (readinessFilter !== "All") list = list.filter((v) => v.procurementReadiness === readinessFilter);

    return list;
  }, [vendors, searchQuery, depthFilter, readinessFilter]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
              Enterprise Pro
            </p>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Procurement Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Evaluate, compare, and verify vendors. Analysis is confidential — vendors are not notified.
          </p>
        </div>

        {/* Summary */}
        <SummaryStats vendors={vendors} totalCount={totalCount} />

        {/* RFP Signals */}
        <RfpSignalsPanel signals={rfpSignals} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name or slug..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={depthFilter}
                onChange={(e) => setDepthFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg cursor-pointer focus:outline-none focus:border-neutral-600"
              >
                <option value="All">All Depths</option>
                {Object.entries(DEPTH_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            </div>

            <div className="relative">
              <select
                value={readinessFilter}
                onChange={(e) => setReadinessFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg cursor-pointer focus:outline-none focus:border-neutral-600"
              >
                <option value="All">All Readiness</option>
                {Object.entries(READINESS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg cursor-pointer focus:outline-none focus:border-neutral-600"
              >
                <option value="SCORE_FIRST">Sort: Trust Score</option>
                <option value="VERIFIED_FIRST">Sort: Verified First</option>
                <option value="COMPOSITE">Sort: Composite</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            </div>

            <button
              onClick={() => { setVerifiedOnly(!verifiedOnly); setPage(1); }}
              className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                verifiedOnly
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Verified Only
            </button>
          </div>
        </div>

        {/* Selection bar */}
        {selectedSlugs.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm font-medium text-blue-400">
              {selectedSlugs.size} vendor{selectedSlugs.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex-1" />
            <Link
              href="/compare"
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Compare Selected
            </Link>
            <button
              onClick={() => setSelectedSlugs(new Set())}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto w-6 h-6 text-blue-500 animate-spin mb-3" />
            <p className="text-neutral-500 text-sm">Loading vendors...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={() => { setError(""); setPage(1); }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Vendor Grid */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-neutral-500 text-sm">No vendors match your filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setDepthFilter("All"); setReadinessFilter("All"); setVerifiedOnly(false); }}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <VendorCard
                key={v.slug}
                vendor={v}
                selected={selectedSlugs.has(v.slug)}
                onSelect={toggleSelect}
                onVerify={setVerifyVendor}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-[10px] text-neutral-600 pt-4">
          Trust scores and risk signals are computed from public registry data, blockchain anchors, and compliance evidence.
          Vendors are not informed of procurement analysis. &middot; BOOPPA Enterprise
        </p>
      </div>

      {/* Verify Modal */}
      {verifyVendor && (
        <VerifyModal vendor={verifyVendor} onClose={() => setVerifyVendor(null)} />
      )}
    </div>
  );
}
