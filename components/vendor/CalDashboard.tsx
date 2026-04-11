"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

const NEXT_STEP_MAP: Record<string, { href: string; label: string }> = {
  VERIFIED:   { href: "/vendor-proof",      label: "Get Verified" },
  NOTARIZED:  { href: "/notarization",      label: "Notarize a Document" },
  PROMINENT:  { href: "/notarization",      label: "Add More Evidence" },
  ELITE:      { href: "/rfp-acceleration",  label: "Get RFP Complete" },
};

interface LadderLevel {
  level: string;
  label: string;
  description: string;
  met: boolean;
}

interface CalPayload {
  ladder: {
    levels: LadderLevel[];
    highestMet: string | null;
    nextLevel: string | null;
    gapScore: number;
    progressPct: number;
  };
  suggestion: {
    nextLevel: string | null;
    probabilityScore: number;
    insight: string;
    progressPct: number;
  };
  message: string;
  sectorPressure: {
    sector: string;
    totalElevated: number;
    totalInSector: number;
    elevationRate: number;
  };
}

export default function CalDashboard() {
  const [data, setData] = useState<CalPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/dashboard-cal")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 animate-pulse space-y-3">
        <div className="h-4 w-40 rounded bg-neutral-800" />
        {[0,1,2,3,4].map(i => <div key={i} className="h-10 rounded-lg bg-neutral-800" />)}
      </div>
    );
  }

  if (!data || !data.ladder) return null;

  const { ladder, suggestion, message, sectorPressure } = data;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Activation Ladder</p>
          <h3 className="mt-1 text-base font-semibold text-white">Profile Completeness</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full relative">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#262626" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#6366f1" strokeWidth="3"
                strokeDasharray={`${ladder.progressPct} ${100 - ladder.progressPct}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
              {ladder.progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Ladder steps */}
      <div className="px-4 py-4 space-y-1">
        {ladder.levels.map((lvl, i) => (
          <div
            key={lvl.level}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              lvl.met
                ? "bg-emerald-500/5 border border-emerald-500/10"
                : lvl.level === ladder.nextLevel
                ? "bg-indigo-500/5 border border-indigo-500/20"
                : "border border-transparent"
            }`}
          >
            {lvl.met ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
            ) : lvl.level === ladder.nextLevel ? (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-indigo-400" />
            ) : (
              <Circle className="h-4 w-4 flex-shrink-0 text-neutral-700" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${
                lvl.met ? "text-emerald-300"
                : lvl.level === ladder.nextLevel ? "text-indigo-300"
                : "text-neutral-500"
              }`}>
                {lvl.label}
              </p>
              {lvl.level === ladder.nextLevel && (
                <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{lvl.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion card */}
      {suggestion.nextLevel && (
        <div className="mx-4 mb-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-indigo-300">
                Upgrade insight · {suggestion.probabilityScore}% signal strength
              </p>
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">{suggestion.insight}</p>
            </div>
          </div>
          {/* Probability bar */}
          <div className="mt-3 h-1 w-full rounded-full bg-neutral-800">
            <div
              className="h-1 rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${suggestion.probabilityScore}%` }}
            />
          </div>
          {/* Action CTA */}
          {NEXT_STEP_MAP[suggestion.nextLevel] && (
            <Link
              href={NEXT_STEP_MAP[suggestion.nextLevel].href}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              {NEXT_STEP_MAP[suggestion.nextLevel].label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Dynamic message */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/40">
        <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-500">
          <span>{sectorPressure.sector}</span>
          <span>·</span>
          <span>{sectorPressure.totalElevated} elevated in sector</span>
          <span>·</span>
          <span>{sectorPressure.elevationRate.toFixed(0)}% elevation rate</span>
        </div>
      </div>
    </div>
  );
}
