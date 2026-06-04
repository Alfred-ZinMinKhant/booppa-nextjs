"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMyRemediations, type Remediation } from "@/lib/remediations";

type Bucket = "confirmed" | "pending" | "regressed";

const BUCKETS: { key: Bucket; label: string; badge: string; note: string }[] = [
  {
    key: "confirmed",
    label: "Confirmed fixes",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    note: "Findings you marked fixed that the next scan verified are gone.",
  },
  {
    key: "pending",
    label: "Pending confirmation",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    note: "Marked fixed — will be confirmed automatically on your next scan.",
  },
  {
    key: "regressed",
    label: "Regressed",
    badge: "bg-red-50 text-red-700 border-red-200",
    note: "Previously marked fixed, but the most recent scan still detected the finding.",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function RemediationCard({ r }: { r: Remediation }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0f172a] truncate">{r.label}</p>
          <p className="text-xs text-[#94a3b8] mt-0.5 font-mono">{r.finding_key}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-[#64748b] flex-shrink-0">
          {r.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div>
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Marked</p>
          <p className="text-[#334155] mt-0.5">{formatDate(r.marked_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Confirmed</p>
          <p className="text-[#334155] mt-0.5">{formatDate(r.confirmed_at)}</p>
        </div>
      </div>
      {r.notes && (
        <p className="text-xs text-[#475569] mt-3 border-t border-[#f1f5f9] pt-3 leading-relaxed">
          {r.notes}
        </p>
      )}
    </div>
  );
}

export default function RemediationsPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorised" | "error">("loading");
  const [items, setItems] = useState<Remediation[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/remediations/me", { cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) setStatus("unauthorised");
          return;
        }
        if (!res.ok) {
          if (!cancelled) setStatus("error");
          return;
        }
        const body = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(body) ? body : []);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <p className="text-[#64748b]">Loading remediation history…</p>
      </div>
    );
  }

  if (status === "unauthorised") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white rounded-2xl border border-[#e2e8f0] p-10 shadow-sm">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Sign in required</h2>
          <p className="text-sm text-[#64748b] mb-6">
            Your remediation history is private to your account. Sign in to view confirmed fixes.
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <p className="text-red-600 text-sm">Could not load remediation history.</p>
      </div>
    );
  }

  const byBucket: Record<Bucket, Remediation[]> = {
    confirmed: items.filter(r => r.confirmation_status === "confirmed"),
    pending:   items.filter(r => r.confirmation_status === "pending"),
    regressed: items.filter(r => r.confirmation_status === "regressed"),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/vendor/dashboard" className="text-xs text-[#64748b] hover:text-[#0f172a]">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#0f172a] mt-3">Remediation history</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Findings you&apos;ve marked fixed and their auto-confirmation status from later scans.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-2">No remediations yet</h2>
            <p className="text-sm text-[#64748b]">
              Open one of your PDPA reports and use the &quot;I fixed this&quot; button on any finding.
              The next scan will auto-confirm it.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {BUCKETS.map(b => {
              const list = byBucket[b.key];
              if (list.length === 0) return null;
              return (
                <section key={b.key}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <h2 className="text-sm font-bold text-[#0f172a]">{b.label}</h2>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.badge}`}>
                      {list.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-4">{b.note}</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {list.map(r => <RemediationCard key={r.id} r={r} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
