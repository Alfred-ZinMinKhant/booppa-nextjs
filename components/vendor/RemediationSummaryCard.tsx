"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { listMyRemediations, type Remediation } from "@/lib/remediations";

/**
 * Compact card surfacing the user's PDPA remediation activity from
 * GET /api/remediations/me. Renders nothing when there are zero remediations,
 * so users who've never used the feature see no dashboard clutter.
 *
 * Counts shown:
 *   - Confirmed: fixes verified by a later scan
 *   - Pending:   marked fixed, awaiting next scan
 *   - Regressed: previously fixed, finding reappeared
 */
export default function RemediationSummaryCard() {
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<Remediation[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listMyRemediations();
      if (cancelled) return;
      setItems(list);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loaded || items.length === 0) return null;

  const counts = {
    confirmed: items.filter(r => r.confirmation_status === "confirmed").length,
    pending:   items.filter(r => r.confirmation_status === "pending").length,
    regressed: items.filter(r => r.confirmation_status === "regressed").length,
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white uppercase tracking-tight">
            PDPA Remediation Activity
          </span>
        </div>
        <Link
          href="/vendor/remediations"
          className="text-xs text-emerald-300 hover:text-emerald-200 font-medium"
        >
          View history →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg leading-none">{counts.confirmed}</div>
            <div className="text-neutral-400 text-[11px] mt-1">Confirmed fixes</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
          <Clock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg leading-none">{counts.pending}</div>
            <div className="text-neutral-400 text-[11px] mt-1">Pending next scan</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg leading-none">{counts.regressed}</div>
            <div className="text-neutral-400 text-[11px] mt-1">Regressed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
