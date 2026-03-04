"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Users, BarChart3 } from "lucide-react";

interface SectorPressureData {
  snapshot: {
    sector: string;
    vendorElevated: boolean;
    totalElevated: number;
    totalInSector: number;
    elevationRate: number;
    vendorRank: number | null;
    competitorElevated: boolean;
    peerCount: number;
    vendorEvidence: number;
    avgEvidence: number;
  };
  message: string;
}

export default function SectorPressureWidget() {
  const [data, setData] = useState<SectorPressureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/sector-pressure")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 animate-pulse h-48">
        <div className="h-4 w-32 rounded bg-neutral-800 mb-4" />
        <div className="h-20 rounded-lg bg-neutral-800" />
      </div>
    );
  }

  if (!data) return null;

  const { snapshot, message } = data;
  const elevPct = snapshot.totalInSector > 0
    ? Math.round((snapshot.totalElevated / snapshot.totalInSector) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Sector Intelligence</p>
          <h3 className="mt-1 text-base font-semibold text-white">
            {snapshot.sector}
          </h3>
        </div>
        {snapshot.vendorElevated ? (
          <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 text-xs font-medium border border-violet-500/20">
            ELEVATED ✦
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 text-xs font-medium border border-neutral-700">
            STANDARD
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-neutral-800 border-b border-neutral-800">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-400 mb-1">
            <Users className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-widest">In Sector</span>
          </div>
          <p className="text-xl font-bold text-white">{snapshot.totalInSector}</p>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-widest">Elevated</span>
          </div>
          <p className="text-xl font-bold text-white">{snapshot.totalElevated}</p>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <BarChart3 className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-widest">Your Rank</span>
          </div>
          <p className="text-xl font-bold text-white">
            {snapshot.vendorRank ? `#${snapshot.vendorRank}` : "—"}
          </p>
        </div>
      </div>

      {/* Elevation progress bar */}
      <div className="px-6 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Sector elevation rate</span>
          <span className="text-xs font-semibold text-neutral-300">{elevPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-800">
          <div
            className="h-1.5 rounded-full bg-violet-500 transition-all duration-700"
            style={{ width: `${Math.min(elevPct, 100)}%` }}
          />
        </div>
        {snapshot.competitorElevated && !snapshot.vendorElevated && (
          <p className="mt-1.5 text-[10px] text-orange-400">
            A competitor in your sector has reached ELEVATED status.
          </p>
        )}
      </div>

      {/* Contextual message */}
      <div className="px-6 py-4">
        <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
        {!snapshot.vendorElevated && (
          <div className="mt-3 flex items-center gap-3">
            <div className="text-xs text-neutral-500">
              Avg peer evidence: <span className="text-neutral-300 font-medium">{snapshot.avgEvidence}</span>
            </div>
            <div className="text-xs text-neutral-500">
              Your evidence: <span className="text-neutral-300 font-medium">{snapshot.vendorEvidence}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
