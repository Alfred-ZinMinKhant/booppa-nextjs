"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, TrendingUp, AlertCircle, CheckCircle2, ArrowRight,
  Building, Target, ShieldCheck, Zap,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  verificationDepth: string;
  evidenceCount: number;
  riskSignal: string;
  sectorPercentile: number;
}

interface Projection {
  probability: number;
  delta: number;
  label: string;
  simulates: string;
}

interface TenderResult {
  tenderNo: string;
  tenderDescription: string;
  sector: string;
  agency: string;
  currentProbability: number;
  vendorProfile: VendorProfile | null;
  projections: {
    rfpExpress: Projection;
    rfpComplete: Projection;
  } | null;
  gapReasons: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function probColor(p: number) {
  if (p >= 35) return "text-emerald-400";
  if (p >= 20) return "text-amber-400";
  return "text-red-400";
}

function probBg(p: number) {
  if (p >= 35) return "bg-emerald-500";
  if (p >= 20) return "bg-amber-500";
  return "bg-red-500";
}

function depthLabel(d: string) {
  const map: Record<string, string> = {
    UNVERIFIED: "Unverified", BASIC: "Basic", STANDARD: "Standard",
    DEEP: "Deep", CERTIFIED: "Certified",
  };
  return map[d] ?? d;
}

function depthColor(d: string) {
  const map: Record<string, string> = {
    UNVERIFIED: "text-neutral-400", BASIC: "text-yellow-400",
    STANDARD: "text-blue-400", DEEP: "text-violet-400", CERTIFIED: "text-emerald-400",
  };
  return map[d] ?? "text-neutral-400";
}

// ── Radial probability gauge ──────────────────────────────────────────────────

function ProbabilityGauge({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  // Only fill the top 75% of the circle (arc gauge)
  const arcLength = circ * 0.75;
  const fill = (value / 100) * arcLength;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#262626" strokeWidth="10"
          strokeDasharray={`${arcLength} ${circ}`}
          strokeLinecap="round"
          transform="rotate(135 70 70)"
        />
        <circle cx="70" cy="70" r={r} fill="none"
          stroke={value >= 35 ? "#10b981" : value >= 20 ? "#f59e0b" : "#ef4444"}
          strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(135 70 70)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${probColor(value)}`}>{value}%</span>
        <span className="text-[10px] text-neutral-500 mt-0.5">est. win rate</span>
      </div>
    </div>
  );
}

// ── Sector winner profile (sector median benchmarks) ─────────────────────────

const SECTOR_WINNER: VendorProfile = {
  verificationDepth: "DEEP",
  evidenceCount: 5,
  riskSignal: "CLEAN",
  sectorPercentile: 85,
};

function ProfileComparisonRow({
  label, yours, winner,
}: { label: string; yours: string; winner: string }) {
  return (
    <div className="grid grid-cols-3 items-center py-2.5 border-b border-neutral-800/60 last:border-0 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-white text-center">{yours}</span>
      <span className="font-medium text-emerald-400 text-center">{winner}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function TenderCheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState(searchParams.get("tenderNo") ?? "");
  const [result, setResult] = useState<TenderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search if tenderNo is in URL
  useEffect(() => {
    const no = searchParams.get("tenderNo");
    if (no) runCheck(no);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck(tenderNo: string) {
    const no = tenderNo.trim().toUpperCase();
    if (!no) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/tender-check?tenderNo=${encodeURIComponent(no)}`);
      if (res.status === 404) { setError(`Tender "${no}" was not found in our shortlist.`); return; }
      if (!res.ok) { setError("Could not reach the tender service — please try again."); return; }
      const data: TenderResult = await res.json();
      setResult(data);
      router.replace(`/tender-check?tenderNo=${encodeURIComponent(no)}`, { scroll: false });
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runCheck(input);
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-1">Tender Intelligence</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Win Probability Check</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Enter a GeBIZ tender number to estimate your chances and see what upgrading your profile would unlock.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="GeBIZ Tender Number — e.g. ITQ202500001"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 transition shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            {loading ? "Checking…" : "Check Tender"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-pulse">
            <div className="lg:col-span-1 rounded-xl bg-neutral-900 border border-neutral-800 h-64" />
            <div className="lg:col-span-2 rounded-xl bg-neutral-900 border border-neutral-800 h-64" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Tender info + probability */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Gauge card */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col items-center justify-center gap-3">
                <ProbabilityGauge value={result.currentProbability} />
                <div className="text-center">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Success Rate</p>
                </div>
              </div>

              {/* Tender meta */}
              <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Tender</p>
                  <h2 className="text-lg font-semibold text-white">{result.tenderNo}</h2>
                  {result.tenderDescription && (
                    <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{result.tenderDescription}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Building className="h-3.5 w-3.5 text-neutral-500" />
                    {result.agency}
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Target className="h-3.5 w-3.5 text-neutral-500" />
                    {result.sector}
                  </div>
                </div>

                {/* Gap reasons */}
                {result.gapReasons.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Profile Gaps</p>
                    {result.gapReasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile comparison — only if vendor is logged in */}
            {result.vendorProfile && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-800">
                  <h3 className="text-sm font-semibold text-white">Your Profile vs Sector Winners</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">How you compare against vendors who typically win in this sector</p>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider pb-2 border-b border-neutral-800">
                    <span>Dimension</span>
                    <span className="text-center">Your Profile</span>
                    <span className="text-center text-emerald-500">Sector Winners</span>
                  </div>
                  <ProfileComparisonRow
                    label="Verification"
                    yours={depthLabel(result.vendorProfile.verificationDepth)}
                    winner={depthLabel(SECTOR_WINNER.verificationDepth)}
                  />
                  <ProfileComparisonRow
                    label="Evidence Items"
                    yours={String(result.vendorProfile.evidenceCount)}
                    winner={String(SECTOR_WINNER.evidenceCount) + "+"}
                  />
                  <ProfileComparisonRow
                    label="Risk Signal"
                    yours={result.vendorProfile.riskSignal}
                    winner={SECTOR_WINNER.riskSignal}
                  />
                  <ProfileComparisonRow
                    label="Sector Percentile"
                    yours={`${result.vendorProfile.sectorPercentile.toFixed(0)}th`}
                    winner={`${SECTOR_WINNER.sectorPercentile}th+`}
                  />
                </div>
              </div>
            )}

            {/* Upgrade projections */}
            {result.projections && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Upgrade Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* RFP Express */}
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-violet-400" />
                          <span className="text-sm font-semibold text-white">RFP Express</span>
                        </div>
                        <p className="text-xs text-neutral-400">{result.projections.rfpExpress.simulates}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-300">
                          {result.projections.rfpExpress.probability}%
                        </p>
                        <p className="text-xs text-emerald-400">
                          +{result.projections.rfpExpress.delta}% uplift
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-1.5 rounded-full bg-violet-500 transition-all duration-700"
                        style={{ width: `${result.projections.rfpExpress.probability}%` }}
                      />
                    </div>
                    <Link
                      href="/pricing?product=rfp_express"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                    >
                      Upgrade to RFP Express <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* RFP Complete */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-white">RFP Complete</span>
                        </div>
                        <p className="text-xs text-neutral-400">{result.projections.rfpComplete.simulates}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-300">
                          {result.projections.rfpComplete.probability}%
                        </p>
                        <p className="text-xs text-emerald-400">
                          +{result.projections.rfpComplete.delta}% uplift
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${result.projections.rfpComplete.probability}%` }}
                      />
                    </div>
                    <Link
                      href="/pricing?product=rfp_complete"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                    >
                      Upgrade to RFP Complete <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Guest CTA — no vendor profile */}
            {!result.vendorProfile && (
              <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">See your personalised probability</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Sign in or create a vendor profile to get gap analysis, upgrade projections, and your exact score.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Link href="/auth/login" className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-white hover:bg-neutral-800 transition">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition">
                    Create Profile
                  </Link>
                </div>
              </div>
            )}

          </div>
        )}

      {/* Legal Disclaimer */}
      <div className="mt-8 mx-auto max-w-2xl px-4 pb-12">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-5">
          <p className="text-xs text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-300">Important: </span>
            Tender Win Probability scores are non-predictive estimates generated for informational purposes only. They do not guarantee, predict, or influence the outcome of any tender award. BOOPPA is not affiliated with, endorsed by, or connected to GeBIZ, the Ministry of Trade and Industry (MTI), the Personal Data Protection Commission (PDPC), or any Singapore government agency. Results are based on publicly available data and internal scoring models. For official tender requirements, refer to the relevant government portal.
          </p>
        </div>
      </div>

      </div>
    </div>
  );
}

export default function TenderCheckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 p-6 flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading…</div>
      </div>
    }>
      <TenderCheckContent />
    </Suspense>
  );
}
