"use client";

import { useEffect, useState } from "react";
import { Gauge, AlertCircle } from "lucide-react";

interface ScanBucket {
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
}

interface ScanQuotaResponse {
  month: string;
  plan: string;
  scans: {
    QUICK: ScanBucket;
    DEEP: ScanBucket;
    EVIDENCE: ScanBucket;
  };
}

const TIER_LABEL: Record<string, string> = {
  QUICK: "Quick Scans",
  DEEP: "Deep Scans",
  EVIDENCE: "Evidence Scans",
};

const TIER_TONE: Record<string, string> = {
  QUICK: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  DEEP: "bg-violet-500/10 border-violet-500/30 text-violet-300",
  EVIDENCE: "bg-amber-500/10 border-amber-500/30 text-amber-300",
};

export default function ScanQuotaWidget() {
  const [data, setData] = useState<ScanQuotaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/procurement/scan-quota", { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.error || `Failed (${r.status})`);
        return body as ScanQuotaResponse;
      })
      .then((d) => setData(d))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
        <p className="text-white/40 text-xs">Loading scan quota…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 text-xs font-semibold">Scan quota unavailable</p>
          <p className="text-white/40 text-[11px] mt-0.5">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  const formatBucket = (b: ScanBucket): string => {
    if (b.limit === null) return `${b.used} / unlimited`;
    if (b.limit === 0) return "Not in plan";
    return `${b.used} / ${b.limit}`;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 col-span-2 lg:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Scan quota this month ({data.month})
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          {data.plan.replace(/_/g, " ")}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["QUICK", "DEEP", "EVIDENCE"] as const).map((tier) => {
          const b = data.scans[tier];
          const pct =
            b.limit && b.limit > 0
              ? Math.min(100, Math.round((b.used / b.limit) * 100))
              : 0;
          return (
            <div
              key={tier}
              className={`rounded-lg border px-3 py-2.5 ${TIER_TONE[tier]}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest">
                {TIER_LABEL[tier]}
              </p>
              <p className="text-lg font-bold mt-0.5">{formatBucket(b)}</p>
              {b.limit !== null && b.limit > 0 && (
                <div className="mt-2 h-1 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current opacity-70 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-white/30 mt-3">
        Re-viewing a vendor you&apos;ve already scanned this month is free. Resets on the 1st.
      </p>
    </div>
  );
}
