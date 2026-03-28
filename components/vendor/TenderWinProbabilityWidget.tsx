"use client";

import React, { useState, useEffect } from "react";
import { Search, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LastCheck {
  tenderNo: string;
  sector: string;
  agency: string;
  currentProbability: number;
  rfpExpressDelta: number;
}

export default function TenderWinProbabilityWidget() {
  const [lastCheck, setLastCheck] = useState<LastCheck | null>(null);
  const [tenderInput, setTenderInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore last checked tender from sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem("lastTenderCheck");
    if (cached) {
      try { setLastCheck(JSON.parse(cached)); } catch {}
    }
  }, []);

  async function handleQuickCheck(e: React.FormEvent) {
    e.preventDefault();
    const no = tenderInput.trim().toUpperCase();
    if (!no) return;

    setChecking(true);
    setError(null);

    try {
      const res = await fetch(`/api/tender-check?tenderNo=${encodeURIComponent(no)}`);
      if (res.status === 404) { setError("Tender not found in shortlist."); return; }
      if (!res.ok) { setError("Could not reach tender service."); return; }

      const data = await res.json();
      const result: LastCheck = {
        tenderNo:           data.tenderNo,
        sector:             data.sector,
        agency:             data.agency,
        currentProbability: data.currentProbability,
        rfpExpressDelta:    data.projections?.rfpExpress?.delta ?? 0,
      };
      setLastCheck(result);
      sessionStorage.setItem("lastTenderCheck", JSON.stringify(result));
      setTenderInput("");
    } catch {
      setError("Network error — try again.");
    } finally {
      setChecking(false);
    }
  }

  const probColor =
    !lastCheck ? "text-neutral-400"
    : lastCheck.currentProbability >= 30 ? "text-emerald-400"
    : lastCheck.currentProbability >= 15 ? "text-amber-400"
    : "text-red-400";

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Tender Intelligence</p>
          <h3 className="mt-1 text-base font-semibold text-white">Win Probability</h3>
        </div>
        <div className="p-2 bg-violet-500/10 rounded-lg">
          <TrendingUp className="h-5 w-5 text-violet-400" />
        </div>
      </div>

      {/* Quick check input */}
      <div className="px-6 pt-4">
        <form onSubmit={handleQuickCheck} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              value={tenderInput}
              onChange={e => setTenderInput(e.target.value)}
              placeholder="e.g. ITQ202500001"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={checking || !tenderInput.trim()}
            className="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 transition"
          >
            {checking ? "…" : "Check"}
          </button>
        </form>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>

      {/* Last result */}
      {lastCheck ? (
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 truncate">{lastCheck.agency}</p>
              <p className="text-sm font-medium text-neutral-200 truncate">{lastCheck.tenderNo}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{lastCheck.sector}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className={`text-2xl font-bold ${probColor}`}>
                {lastCheck.currentProbability}%
              </p>
              <p className="text-[10px] text-neutral-500">est. win rate</p>
            </div>
          </div>

          {/* Probability bar */}
          <div className="h-1.5 w-full rounded-full bg-neutral-800">
            <div
              className="h-1.5 rounded-full bg-violet-500 transition-all duration-700"
              style={{ width: `${Math.min(lastCheck.currentProbability, 100)}%` }}
            />
          </div>

          {/* Express nudge */}
          {lastCheck.rfpExpressDelta > 0 && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 flex items-start gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-300">
                RFP Express could lift your probability by{" "}
                <span className="text-violet-300 font-semibold">+{lastCheck.rfpExpressDelta}%</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-neutral-500">Enter a GeBIZ tender number above to estimate your win probability.</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/40">
        <Link
          href={lastCheck ? `/tender-check?tenderNo=${lastCheck.tenderNo}` : "/tender-check"}
          className="flex items-center justify-between text-sm text-neutral-400 hover:text-white transition group"
        >
          <span>Full analysis &amp; upgrade options</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
