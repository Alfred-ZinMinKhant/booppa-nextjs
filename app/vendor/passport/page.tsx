"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Send, CheckCircle, ArrowRight, BarChart3, Sparkles, RefreshCw, AlertCircle, FileSearch } from "lucide-react";

type GapItem = {
  dimension: string;
  label: string;
  vendor_score: number;
  sector_average: number;
  gap: number;
  recommended_action: string;
};

type RealityCheckData = {
  assessed: boolean;
  message?: string;
  vendor_total_score?: number;
  sector?: string;
  sector_average?: number;
  percentile_rank?: number;
  top_gaps?: GapItem[];
};

export default function VendorPassportDashboardPage() {
  // Vendor Challenger Form State
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [challengerStatus, setChallengerStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [challengerMsg, setChallengerMsg] = useState("");

  // Reality Check State (No hardcoded fake scores!)
  const [rcLoading, setRcLoading] = useState(true);
  const [realityCheck, setRealityCheck] = useState<RealityCheckData | null>(null);

  useEffect(() => {
    async function loadRealityCheck() {
      try {
        const res = await fetch("/api/v1/passport/reality-check");
        if (res.ok) {
          const data = await res.json();
          setRealityCheck(data);
        } else {
          setRealityCheck({ assessed: false });
        }
      } catch {
        setRealityCheck({ assessed: false });
      } finally {
        setRcLoading(false);
      }
    }
    loadRealityCheck();
  }, []);

  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail) return;

    setChallengerStatus("sending");
    setChallengerMsg("");

    try {
      const res = await fetch("/api/v1/vendor-challenger/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_email: buyerEmail,
          buyer_name: buyerName || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to send challenge email");
      }

      setChallengerStatus("success");
      setChallengerMsg(`Invitation successfully sent to ${buyerEmail}!`);
      setBuyerEmail("");
      setBuyerName("");
    } catch (err: any) {
      setChallengerStatus("error");
      setChallengerMsg(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 font-sans text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Vendor Dashboard
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Trust Passport & Reality Check
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Passport Active
            </span>
            <Link
              href="/pricing"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Upgrade Passport Tier
            </Link>
          </div>
        </div>

        {/* Grid Section 1: Vendor Challenger */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Vendor Challenger Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              <Send className="h-4 w-4" /> Vendor Challenger
            </div>
            <h2 className="mt-2 text-xl font-bold text-white">Invite a Buyer to Verify You</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Skip lengthy questionnaires! Send your verified public Trust Passport directly to procurement decision-makers in 30 seconds.
            </p>

            <form onSubmit={handleSendChallenge} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Buyer Contact Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Tan"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">Buyer Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="procurement@buyer.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={challengerStatus === "sending"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {challengerStatus === "sending" ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Sending Invitation...
                  </>
                ) : (
                  <>
                    Send Trust Passport Challenge <Send className="h-4 w-4" />
                  </>
                )}
              </button>

              {challengerStatus === "success" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  {challengerMsg}
                </div>
              )}
              {challengerStatus === "error" && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {challengerMsg}
                </div>
              )}
            </form>
          </div>

          {/* Sector Rank / Stats Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <BarChart3 className="h-4 w-4" /> Sector Rank & Standing
              </div>

              {rcLoading ? (
                <div className="mt-8 flex items-center justify-center py-8 text-xs text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Calculating reality check benchmarks...
                </div>
              ) : realityCheck?.assessed ? (
                <>
                  <h2 className="mt-2 text-xl font-bold text-white">Percentile Rank: {realityCheck.percentile_rank}th</h2>
                  <p className="mt-1 text-xs text-slate-400">Sector Benchmark: {realityCheck.sector}</p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <span className="text-xs text-slate-500">Your Total Score</span>
                      <p className="mt-1 text-2xl font-bold text-emerald-400">{realityCheck.vendor_total_score}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <span className="text-xs text-slate-500">Sector Average</span>
                      <p className="mt-1 text-2xl font-bold text-slate-300">{realityCheck.sector_average}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                    <AlertCircle className="h-4 w-4" /> Sector Benchmark Pending
                  </div>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {realityCheck?.message || "Complete your initial PDPA Quick Scan to generate your official sector benchmark score and percentile rank."}
                  </p>
                  <Link
                    href="/pdpa"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                  >
                    <FileSearch className="h-3.5 w-3.5" /> Run Free PDPA Scan
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Tip:</span> Top 10% vendors in your sector receive 4x more buyer verification requests.
            </div>
          </div>
        </div>

        {/* Section 2: My Reality Check - 90-day Action Plan */}
        {realityCheck?.assessed && realityCheck.top_gaps && realityCheck.top_gaps.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-4 w-4" /> My Reality Check — 90-Day Action Plan
            </div>
            <h2 className="mt-2 text-xl font-bold text-white">Top Gaps & Recommended Remediation</h2>

            <div className="mt-6 space-y-4">
              {realityCheck.top_gaps.map((gap, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <span className="font-semibold text-slate-200 text-sm">{gap.label}</span>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                      Gap: {gap.gap} pts
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    <strong className="text-slate-200">90-Day Action:</strong> {gap.recommended_action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
