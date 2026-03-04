"use client";

import React, { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface VendorStatus {
  verificationDepth: string;
  monitoringActivity: string;
  riskSignal: string;
  procurementReadiness: string;
  readinessSummary: string;
  sectorPercentile: number;
  verificationDetail: {
    complianceScore: number;
    documentsSubmitted: number;
    isExpiringSoon: boolean;
    daysUntilExpiry: number | null;
  };
  riskDetail: {
    openAnomalyCount: number;
    highestSeverity: string | null;
  };
}

// ── Badge config maps ───────────────────────────────────────────────────────

const DEPTH_CONFIG: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
  UNVERIFIED: { label: "Unverified",  color: "text-neutral-400", bg: "bg-neutral-800",  dotColor: "bg-neutral-500" },
  BASIC:      { label: "Basic",       color: "text-yellow-400",  bg: "bg-yellow-500/10", dotColor: "bg-yellow-400" },
  STANDARD:   { label: "Standard",   color: "text-blue-400",    bg: "bg-blue-500/10",   dotColor: "bg-blue-400"   },
  DEEP:       { label: "Deep",        color: "text-violet-400",  bg: "bg-violet-500/10", dotColor: "bg-violet-400" },
  CERTIFIED:  { label: "Certified",  color: "text-emerald-400", bg: "bg-emerald-500/10",dotColor: "bg-emerald-400"},
};

const MONITORING_CONFIG: Record<string, { label: string; color: string }> = {
  NONE:     { label: "No monitoring",    color: "text-neutral-400" },
  INACTIVE: { label: "Inactive",         color: "text-red-400"     },
  STALE:    { label: "Stale",            color: "text-yellow-400"  },
  ACTIVE:   { label: "Active",           color: "text-emerald-400" },
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CLEAN:    { label: "Clean",    color: "text-emerald-400", bg: "bg-emerald-500/10" },
  WATCH:    { label: "Watch",    color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
  FLAGGED:  { label: "Flagged",  color: "text-orange-400",  bg: "bg-orange-500/10"  },
  CRITICAL: { label: "Critical", color: "text-red-400",     bg: "bg-red-500/10"     },
};

const READINESS_CONFIG: Record<string, { label: string; color: string; bar: string }> = {
  NOT_READY:       { label: "Not Ready",       color: "text-red-400",     bar: "bg-red-500"     },
  NEEDS_ATTENTION: { label: "Needs Attention", color: "text-yellow-400",  bar: "bg-yellow-500"  },
  CONDITIONAL:     { label: "Conditional",     color: "text-blue-400",    bar: "bg-blue-500"    },
  READY:           { label: "Ready",           color: "text-emerald-400", bar: "bg-emerald-500" },
};

const READINESS_PCT: Record<string, number> = {
  NOT_READY: 15, NEEDS_ATTENTION: 40, CONDITIONAL: 70, READY: 100,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function VendorStatusBadge() {
  const [status, setStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/status")
      .then((r) => r.json())
      .then((d) => { setStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 animate-pulse">
        <div className="h-4 w-40 rounded bg-neutral-800" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!status) return null;

  const depth   = DEPTH_CONFIG[status.verificationDepth]   || DEPTH_CONFIG.UNVERIFIED;
  const monitor = MONITORING_CONFIG[status.monitoringActivity] || MONITORING_CONFIG.NONE;
  const risk    = RISK_CONFIG[status.riskSignal]            || RISK_CONFIG.CLEAN;
  const ready   = READINESS_CONFIG[status.procurementReadiness] || READINESS_CONFIG.NOT_READY;
  const pct     = READINESS_PCT[status.procurementReadiness] ?? 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Trust Status</p>
          <h3 className="mt-1 text-base font-semibold text-white">Verification Profile</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${depth.bg} ${depth.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${depth.dotColor}`} />
          {depth.label}
        </span>
      </div>

      {/* Procurement Readiness Bar */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Procurement Readiness</span>
          <span className={`text-xs font-semibold ${ready.color}`}>{ready.label}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-800">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${ready.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed">{status.readinessSummary}</p>
      </div>

      {/* 4-quadrant status tiles */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        {/* Compliance */}
        <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Compliance</p>
          <p className="mt-1 text-xl font-bold text-white">{status.verificationDetail.complianceScore}<span className="text-neutral-500 text-sm font-normal">/100</span></p>
          <p className="mt-0.5 text-[10px] text-neutral-500">{status.verificationDetail.documentsSubmitted} docs</p>
        </div>

        {/* Monitoring */}
        <div className="rounded-lg bg-neutral-800/50 border border-neutral-700/50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Monitoring</p>
          <p className={`mt-1 text-base font-semibold ${monitor.color}`}>{monitor.label}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">Sector position: {status.sectorPercentile.toFixed(0)}th pct</p>
        </div>

        {/* Risk */}
        <div className={`rounded-lg border border-neutral-700/50 p-3 ${risk.bg}`}>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Risk Signal</p>
          <p className={`mt-1 text-base font-semibold ${risk.color}`}>{risk.label}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">
            {status.riskDetail.openAnomalyCount === 0 ? "No open anomalies" : `${status.riskDetail.openAnomalyCount} open · ${status.riskDetail.highestSeverity}`}
          </p>
        </div>

        {/* Expiry */}
        <div className={`rounded-lg border border-neutral-700/50 p-3 ${status.verificationDetail.isExpiringSoon ? "bg-orange-500/10" : "bg-neutral-800/50"}`}>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Verification</p>
          <p className={`mt-1 text-base font-semibold ${status.verificationDetail.isExpiringSoon ? "text-orange-400" : "text-white"}`}>
            {status.verificationDetail.daysUntilExpiry !== null
              ? `${status.verificationDetail.daysUntilExpiry}d left`
              : "No expiry"}
          </p>
          <p className="mt-0.5 text-[10px] text-neutral-500">{depth.label} level</p>
        </div>
      </div>
    </div>
  );
}
