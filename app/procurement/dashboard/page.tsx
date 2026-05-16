"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Shield,
  TrendingUp,
  Building2,
  AlertTriangle,
  Eye,
  ExternalLink,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  slug: string;
  company: string | null;
  website: string | null;
  contactEmail: string | null;
  domain: string | null;
  currentScore: number;
  breakdown: {
    compliance: number;
    visibility: number;
    engagement: number;
    recency: number;
    procurement: number;
  };
  verified: boolean;
  complianceScore: number;
  verifyExpiry: string | null;
  stabilityIndex: number;
  volatility: number;
  trajectory: string;
  downgradeRisk: { level: string; score: number; reason: string };
  sectorPercentile: number;
  verificationDepth: string;
  monitoringActivity: string;
  riskSignal: string;
  procurementReadiness: string;
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

// ── Config ───────────────────────────────────────────────────────────────────

const DEPTH_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UNVERIFIED: { label: "Unverified", color: "#64748b", bg: "#1e293b" },
  BASIC:      { label: "Basic",      color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  STANDARD:   { label: "Standard",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  DEEP:       { label: "Deep",       color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  CERTIFIED:  { label: "Certified",  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  CLEAN:    { label: "Clean",    color: "#10b981" },
  WATCH:    { label: "Watch",    color: "#f59e0b" },
  FLAGGED:  { label: "Flagged",  color: "#f97316" },
  CRITICAL: { label: "Critical", color: "#ef4444" },
};

const READINESS_CONFIG: Record<string, { label: string; color: string; pct: number }> = {
  READY:           { label: "Ready",           color: "#10b981", pct: 100 },
  CONDITIONAL:     { label: "Conditional",     color: "#3b82f6", pct: 70 },
  NEEDS_ATTENTION: { label: "Needs attention", color: "#f59e0b", pct: 40 },
  NOT_READY:       { label: "Not ready",       color: "#ef4444", pct: 15 },
};

const INDUSTRIES = [
  "All",
  "IT & Technology",
  "Professional Services",
  "Logistics & Supply Chain",
  "HR & People Tech",
  "Cybersecurity",
  "Financial Services",
  "Healthcare",
  "Construction & Engineering",
];

function scoreColor(s: number): string {
  return s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
}

// ── Components ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: size === 44 ? 11 : 14, fontWeight: 800, color: "#f1f5f9" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function VendorCard({
  vendor,
  selected,
  onSelect,
}: {
  vendor: Vendor;
  selected: boolean;
  onSelect: (v: Vendor) => void;
}) {
  const depth = DEPTH_CONFIG[vendor.verificationDepth] || DEPTH_CONFIG.UNVERIFIED;
  const readiness = READINESS_CONFIG[vendor.procurementReadiness] || READINESS_CONFIG.NOT_READY;
  const risk = RISK_CONFIG[vendor.riskSignal] || RISK_CONFIG.CLEAN;

  return (
    <div
      className={`rounded-xl border p-4 transition-all cursor-pointer ${
        selected
          ? "border-blue-500 bg-blue-500/5"
          : "border-white/10 bg-[#0f172a] hover:border-white/20"
      }`}
    >
      {/* Select checkbox */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onSelect(vendor)}
          className={`mt-1 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${
            selected ? "border-blue-500 bg-blue-500" : "border-white/20 bg-transparent"
          }`}
        >
          {selected && <span className="text-white text-[10px] font-bold">&#10003;</span>}
        </button>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-3">
            <ScoreRing score={vendor.currentScore} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">
                  {vendor.company || vendor.slug}
                </h3>
                {vendor.verified && (
                  <span className="text-[9px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    VERIFIED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/40 mt-0.5">
                {vendor.contactEmail || vendor.slug}
                {vendor.domain && ` · ${vendor.domain}`}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mt-3">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ background: depth.bg, color: depth.color }}
            >
              {depth.label}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5"
              style={{ color: risk.color }}
            >
              {risk.label}
            </span>
            {vendor.trajectory !== "INSUFFICIENT_DATA" && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 ${
                  vendor.trajectory === "RISING"
                    ? "text-emerald-400"
                    : vendor.trajectory === "FALLING"
                      ? "text-red-400"
                      : "text-white/40"
                }`}
              >
                {vendor.trajectory === "RISING" ? "Trending Up" : vendor.trajectory === "FALLING" ? "Trending Down" : "Stable"}
              </span>
            )}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/50">
              P{Math.round(vendor.sectorPercentile)}
            </span>
          </div>

          {/* Readiness bar */}
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-white/40">Procurement Readiness</span>
              <span className="text-[10px] font-bold" style={{ color: readiness.color }}>
                {readiness.label}
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${readiness.pct}%`, background: readiness.color }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="flex-1 text-center text-[11px] font-bold py-1.5 rounded-md bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
            >
              View Profile
            </Link>
            <Link
              href={`/verify?vendor=${vendor.slug}`}
              className="flex-1 text-center text-[11px] font-bold py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition"
            >
              Verify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function ProcurementDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string; plan: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [signals, setSignals] = useState<RfpSignal[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [orderBy, setOrderBy] = useState("SCORE_FIRST");

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.role !== "PROCUREMENT" && data.role !== "ADMIN") {
          router.push("/vendor/dashboard");
          return;
        }
        setUser(data);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (industry !== "All") params.set("sector", industry);
    if (verifiedOnly) params.set("verified", "true");
    if (minScore > 0) params.set("min_score", String(minScore));
    params.set("order_by", orderBy);
    params.set("limit", "30");

    try {
      const res = await fetch(`/api/procurement/vendors?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, industry, verifiedOnly, minScore, orderBy]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Fetch RFP signals
  useEffect(() => {
    if (!user) return;
    fetch("/api/procurement/rfp-signals")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.signals) setSignals(data.signals);
      })
      .catch(() => {});
  }, [user]);

  const handleSelect = (vendor: Vendor) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(vendor.slug)) {
        next.delete(vendor.slug);
      } else {
        next.add(vendor.slug);
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  // Filter vendors by search query (client-side text filter on top of server filters)
  const filteredVendors = vendors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.company || "").toLowerCase().includes(q) ||
      (v.contactEmail || "").toLowerCase().includes(q) ||
      (v.domain || "").toLowerCase().includes(q) ||
      v.slug.toLowerCase().includes(q)
    );
  });

  // KPIs
  const readyCount = vendors.filter((v) => v.procurementReadiness === "READY").length;
  const verifiedCount = vendors.filter((v) => v.verified).length;
  const watchCount = vendors.filter(
    (v) => v.riskSignal === "WATCH" || v.riskSignal === "FLAGGED" || v.riskSignal === "CRITICAL"
  ).length;
  const avgScore = vendors.length
    ? Math.round(vendors.reduce((s, v) => s + v.currentScore, 0) / vendors.length)
    : 0;

  const ENTERPRISE_PLANS = ["enterprise", "enterprise_pro"];
  const hasEnterprise = user ? ENTERPRISE_PLANS.includes(user.plan) : false;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  // Free procurement user — show preview with upgrade gate
  if (!hasEnterprise && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white relative">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Procurement Dashboard</h1>
              <p className="text-white/40 text-xs mt-0.5">Vendor evaluation and compliance intelligence</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
          {/* Preview KPI Cards (blurred) */}
          <div className="relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 filter blur-[6px] pointer-events-none select-none">
              {[
                { label: "Total Vendors", value: "1,247", sub: "342 verified (27%)", icon: Building2, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
                { label: "Avg Trust Score", value: "68/100", sub: "Across all vendors", icon: Shield, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
                { label: "Procurement Ready", value: "186", sub: "Vendors ready for shortlisting", icon: TrendingUp, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
                { label: "Risk Alerts", value: "23", sub: "Watch / Flagged / Critical", icon: AlertTriangle, iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
              ].map((card, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/40 text-xs font-medium">{card.label}</p>
                      <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${card.iconBg}`}>
                      <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-white/30 text-[10px] mt-2">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Preview vendor cards (blurred) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 filter blur-[6px] pointer-events-none select-none">
              <div className="lg:col-span-2 space-y-3">
                {[
                  { name: "TechBridge Solutions Pte. Ltd.", score: 82, depth: "DEEP", risk: "Clean", readiness: 100 },
                  { name: "Axiom Consulting Group", score: 74, depth: "STANDARD", risk: "Clean", readiness: 70 },
                  { name: "NCS Digital Pte. Ltd.", score: 91, depth: "CERTIFIED", risk: "Clean", readiness: 100 },
                  { name: "Greenline Logistics Pte. Ltd.", score: 61, depth: "BASIC", risk: "Watch", readiness: 40 },
                ].map((v, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-[#0f172a] p-4">
                    <div className="flex items-center gap-3">
                      <ScoreRing score={v.score} />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">{v.name}</h3>
                        <div className="flex gap-1.5 mt-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/50">{v.depth}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-emerald-400">{v.risk}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${v.readiness}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">RFP Signals</h3>
                {["tech.gov.sg", "mof.gov.sg", "dbs.com.sg"].map((d, i) => (
                  <div key={i} className="py-2 border-b border-white/5 last:border-0">
                    <p className="text-xs text-white/60">{d}</p>
                    <p className="text-[10px] text-white/30">Intent: {85 - i * 10}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-[#0f172a]/95 border border-white/10 rounded-2xl p-10 max-w-lg text-center shadow-2xl backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Unlock Procurement Intelligence</h2>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  Get full access to vendor scoring, risk signals, compliance posture analysis,
                  and procurement readiness data across the entire BOOPPA network.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/solutions/procurement#pricing"
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm"
                  >
                    Get Enterprise — SGD 499/mo
                  </Link>
                  <Link
                    href="/demo"
                    className="block w-full py-3 border border-white/20 text-white/60 hover:text-white hover:border-white/40 font-semibold rounded-xl transition text-sm"
                  >
                    Book a Demo
                  </Link>
                </div>
                <p className="text-white/30 text-xs mt-6">Free tools available: <Link href="/vendors" className="text-blue-400 hover:underline">Browse Network</Link> · <Link href="/compare" className="text-blue-400 hover:underline">Compare Vendors</Link> · <Link href="/verify" className="text-blue-400 hover:underline">Verify Documents</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Procurement Dashboard</h1>
            <p className="text-white/40 text-xs mt-0.5">
              Vendor evaluation and compliance intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/compare"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                selected.size >= 2
                  ? "border-blue-500 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (selected.size < 2) e.preventDefault();
              }}
            >
              Compare ({selected.size})
            </Link>
            <Link
              href="/solutions/procurement"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white transition"
            >
              Upgrade Plan
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-xs font-medium">Total Vendors</p>
                <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-2">
              {verifiedCount} verified ({totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%)
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-xs font-medium">Avg Trust Score</p>
                <h3 className="text-2xl font-bold mt-1">
                  {avgScore}
                  <span className="text-sm text-white/30 font-normal">/100</span>
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-2">Across filtered vendors</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-xs font-medium">Procurement Ready</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-400">{readyCount}</h3>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-2">Vendors ready for shortlisting</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-xs font-medium">Risk Alerts</p>
                <h3 className={`text-2xl font-bold mt-1 ${watchCount > 0 ? "text-amber-400" : "text-white"}`}>
                  {watchCount}
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${watchCount > 0 ? "bg-amber-500/10" : "bg-white/5"}`}>
                <AlertTriangle className={`h-4 w-4 ${watchCount > 0 ? "text-amber-400" : "text-white/30"}`} />
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-2">Watch / Flagged / Critical</p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Vendor list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vendors..."
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-white/20"
                  />
                </div>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i} className="bg-[#0f172a]">
                      {i}
                    </option>
                  ))}
                </select>
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                >
                  <option value="SCORE_FIRST" className="bg-[#0f172a]">Score First</option>
                  <option value="VERIFIED_FIRST" className="bg-[#0f172a]">Verified First</option>
                  <option value="COMPOSITE" className="bg-[#0f172a]">Composite</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-white/50 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Verified only
                </label>
              </div>
            </div>

            {/* Vendor grid */}
            {loading ? (
              <div className="text-center py-20 text-white/30 text-sm">Loading vendors...</div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-20 text-white/30 text-sm">
                No vendors match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredVendors.map((v) => (
                  <VendorCard
                    key={v.slug}
                    vendor={v}
                    selected={selected.has(v.slug)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar: RFP signals + quick actions */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/vendors"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition w-full"
                >
                  <Search className="h-3.5 w-3.5" />
                  Browse Full Network
                </Link>
                <Link
                  href="/compare"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition w-full"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Compare Vendors
                </Link>
                <Link
                  href="/verify"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition w-full"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Verify a Document
                </Link>
              </div>
            </div>

            {/* RFP Signals */}
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">RFP Signals</h3>
                <div className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              {signals.length === 0 ? (
                <p className="text-white/30 text-xs">No active signals detected.</p>
              ) : (
                <div className="space-y-0">
                  {signals.slice(0, 8).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-white/80 truncate">{s.domain}</p>
                          {s.isGov && (
                            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              GOV
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Intent: {s.intentScore} · {s.viewCount7d} views (7d)
                        </p>
                      </div>
                      {s.isActiveRFP && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                          ACTIVE RFP
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected vendors summary */}
            {selected.size > 0 && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-400">
                    Selected ({selected.size})
                  </h3>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-[10px] text-white/30 hover:text-white transition"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1.5 mb-3">
                  {Array.from(selected).map((slug) => {
                    const v = vendors.find((x) => x.slug === slug);
                    return (
                      <div
                        key={slug}
                        className="flex items-center justify-between text-xs text-white/60"
                      >
                        <span className="truncate">{v?.company || slug}</span>
                        <button
                          onClick={() =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              next.delete(slug);
                              return next;
                            })
                          }
                          className="text-white/20 hover:text-white ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href={`/compare?vendors=${Array.from(selected).join(",")}`}
                  className="block w-full text-center text-xs font-bold py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition"
                >
                  Compare Selected
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
