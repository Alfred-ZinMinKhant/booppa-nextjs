"use client";

import Link from "next/link";

// Shared presentational primitives for the CSP operational app. Kept dependency-light
// (Tailwind only) and consistent with the booppa-green/slate palette used elsewhere.

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a]">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748b] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, tone = "default",
}: { label: string; value: React.ReactNode; tone?: "default" | "warn" | "danger" | "ok" }) {
  const toneCls = {
    default: "text-[#0f172a]",
    ok: "text-[#10b981]",
    warn: "text-amber-500",
    danger: "text-red-600",
  }[tone];
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5">
      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-black mt-1 ${toneCls}`}>{value}</p>
    </div>
  );
}

const RISK_TONE: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  very_high: "bg-red-100 text-red-700",
};

function normalize(v: string | null | undefined): string {
  return String(v || "").toLowerCase().replace("riskrating.", "").replace("cddstatus.", "").replace("strdecision.", "");
}

export function RiskBadge({ rating }: { rating: string | null | undefined }) {
  const r = normalize(rating);
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${RISK_TONE[r] || "bg-slate-100 text-slate-600"}`}>
      {r.replace("_", " ") || "unrated"}
    </span>
  );
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = normalize(status);
  const tone =
    ["completed", "filed", "fit_proper", "compliant", "active"].includes(s) ? "bg-emerald-100 text-emerald-700"
    : ["pending", "in_progress", "not_started", "draft", "under_review"].includes(s) ? "bg-amber-100 text-amber-700"
    : ["failed", "expired", "not_fit", "escalated", "overdue"].includes(s) ? "bg-red-100 text-red-700"
    : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${tone}`}>
      {s.replace(/_/g, " ") || "—"}
    </span>
  );
}

// Blockchain notarization state. tx null → still anchoring; tx present → link to Polygonscan.
export function NotarizationBadge({
  txHash, polygonscanUrl,
}: { txHash?: string | null; polygonscanUrl?: string | null }) {
  if (!txHash) {
    return <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold">● Notarizing…</span>;
  }
  const url = polygonscanUrl || `https://polygonscan.com/tx/${txHash}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#10b981] font-semibold hover:underline">
      ✓ On-chain ↗
    </a>
  );
}

export function EmptyState({ title, hint, cta }: { title: string; hint?: string; cta?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#cbd5e1] p-10 text-center">
      <p className="text-[#0f172a] font-bold">{title}</p>
      {hint && <p className="text-sm text-[#64748b] mt-1">{hint}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition text-sm">
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-sm ${className}`}>{children}</div>;
}

export function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(v);
  }
}
