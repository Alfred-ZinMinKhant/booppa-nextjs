"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  TrendingUp,
  Eye,
  FileText,
  Layers,
  Sparkles,
  Award,
  Link2,
  History,
} from "lucide-react";

// ── Types — match backend responses ─────────────────────────────────────────
interface QuickScan {
  vendorId: string;
  verificationDepth: "UNVERIFIED" | "BASIC" | "STANDARD" | "DEEP" | "CERTIFIED";
  verificationDetail: {
    lifecycleStatus: string;
    complianceScore: number;
    documentsSubmitted: number;
    expiresAt: string | null;
    daysUntilExpiry: number | null;
    isExpiringSoon: boolean;
  };
  monitoringActivity: string;
  monitoringDetail: {
    lastSnapshotAt: string | null;
    snapshotAgeDays: number | null;
    lastTrustEventAt: string | null;
    trustEventCount7d: number;
    totalTrustEvents: number;
    proofViewCount30d: number;
  };
  riskSignal: string;
  riskDetail: {
    openAnomalyCount: number;
    highestSeverity: string | null;
    openAnomalies: unknown[];
  };
  procurementReadiness: string;
  readinessSummary: string;
  sectorPercentile: number;
  computedAt: string;
}

interface DeepScan {
  vendor: { company: string | null; email: string };
  currentScore: number;
  compliance: {
    lifecycleStatus: string;
    complianceScore: number;
    expiresAt: string | null;
  };
  elevation: {
    structuralLevel: string | null;
    validationId: string | null;
    publicHash: string | null;
    confidenceScore: number | null;
  };
  activityWindow: { days: number; proofViewsInWindow: number };
  snapshotHash: string;
  generatedAt: string;
}

interface EvidenceScan {
  vendor: { company: string | null; email: string };
  currentScore: number;
  verify: {
    lifecycleStatus: string;
    verificationLevel: string;
    complianceScore: number;
    expiresAt: string | null;
    lastRefreshedAt: string | null;
  } | null;
  notarization: {
    structuralLevel: string;
    verificationDepth: string;
    validationId: string;
    publicHash: string;
    evidenceCount: number;
    confidenceScore: number;
    notarizedAt: string | null;
  } | null;
  elevation: {
    structuralLevel: string | null;
    validationId: string | null;
    publicHash: string | null;
    confidenceScore: number | null;
  };
  blockchainAnchors: Array<{
    reportId: string;
    framework: string;
    txHash: string;
    auditHash: string | null;
    anchoredAt: string | null;
    explorerUrl: string | null;
  }>;
  certificateLog: Array<{
    certificateType: string;
    fileHash: string | null;
    generatedAt: string | null;
    downloadCount: number;
    lastDownloadedAt: string | null;
  }>;
  driftHistory: Array<{
    framework: string;
    severity: string;
    previousScore: number | null;
    currentScore: number | null;
    deltaPct: number | null;
    occurredAt: string | null;
  }>;
  generatedAt: string;
}

type ScanError = {
  status: number;
  detail: string;
};

// ── Small UI helpers ────────────────────────────────────────────────────────
function tone(level: string): string {
  switch (level) {
    case "CERTIFIED":
    case "READY":
    case "CLEAN":
      return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
    case "DEEP":
    case "STANDARD":
    case "ACTIVE":
    case "CONDITIONAL":
    case "WATCH":
      return "text-blue-300 bg-blue-500/10 border-blue-500/30";
    case "BASIC":
    case "QUIET":
    case "NEEDS_ATTENTION":
      return "text-amber-300 bg-amber-500/10 border-amber-500/30";
    default:
      return "text-red-300 bg-red-500/10 border-red-500/30";
  }
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${tone(value)}`}>
      {label}: {value.replace(/_/g, " ")}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function VendorDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug || "";

  const [quick, setQuick] = useState<QuickScan | null>(null);
  const [deep, setDeep] = useState<DeepScan | null>(null);
  const [evidence, setEvidence] = useState<EvidenceScan | null>(null);
  const [quickError, setQuickError] = useState<ScanError | null>(null);
  const [deepError, setDeepError] = useState<ScanError | null>(null);
  const [evidenceError, setEvidenceError] = useState<ScanError | null>(null);
  const [quickLoading, setQuickLoading] = useState(true);
  const [deepLoading, setDeepLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);

  // ── Quick Scan (L1) — auto-runs on mount. Re-views in the same month are free.
  useEffect(() => {
    if (!slug) return;
    setQuickLoading(true);
    setQuickError(null);
    fetch(`/api/procurement/vendor/${encodeURIComponent(slug)}/status`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw {
            status: r.status,
            detail: body?.detail || body?.error || `Failed (${r.status})`,
          } as ScanError;
        }
        setQuick(body as QuickScan);
        setQuotaRefreshKey((k) => k + 1);
      })
      .catch((e: ScanError) => setQuickError(e))
      .finally(() => setQuickLoading(false));
  }, [slug]);

  // ── Deep Scan (L2) — explicit button click.
  const runDeepScan = useCallback(() => {
    setDeepLoading(true);
    setDeepError(null);
    fetch(`/api/procurement/snapshot/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw {
            status: r.status,
            detail: body?.detail || body?.error || `Failed (${r.status})`,
          } as ScanError;
        }
        setDeep(body as DeepScan);
        setQuotaRefreshKey((k) => k + 1);
      })
      .catch((e: ScanError) => setDeepError(e))
      .finally(() => setDeepLoading(false));
  }, [slug]);

  // ── Evidence Scan (L3) — explicit button click. Enterprise-tier only.
  const runEvidenceScan = useCallback(() => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    fetch(`/api/procurement/vendor/${encodeURIComponent(slug)}/evidence`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw {
            status: r.status,
            detail: body?.detail || body?.error || `Failed (${r.status})`,
          } as ScanError;
        }
        setEvidence(body as EvidenceScan);
        setQuotaRefreshKey((k) => k + 1);
      })
      .catch((e: ScanError) => setEvidenceError(e))
      .finally(() => setEvidenceLoading(false));
  }, [slug]);

  if (!slug) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </button>
          <div className="text-right">
            <h1 className="text-lg font-bold">{slug}</h1>
            <p className="text-[11px] text-white/40">Vendor evaluation</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
        {/* Quota widget at top — refreshes via key after each scan */}
        <QuotaInline key={quotaRefreshKey} />

        {/* ── Quick Scan section ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <h2 className="text-base font-semibold">Quick Scan (L1)</h2>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                ACRA + MAS watchlist + PDPA flag
              </span>
            </div>
            {quick && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                1 credit used
              </span>
            )}
          </div>

          {quickLoading && (
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 flex items-center gap-3 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              Running Quick Scan…
            </div>
          )}

          {quickError && (
            <ScanErrorCard error={quickError} tier="QUICK" />
          )}

          {quick && !quickError && (
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge label="Verification" value={quick.verificationDepth} />
                <Badge label="Activity" value={quick.monitoringActivity} />
                <Badge label="Risk" value={quick.riskSignal} />
                <Badge label="Readiness" value={quick.procurementReadiness} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <Stat
                  label="Compliance score"
                  value={`${quick.verificationDetail.complianceScore}/100`}
                  icon={<Shield className="h-3.5 w-3.5 text-emerald-400" />}
                />
                <Stat
                  label="Sector percentile"
                  value={`${Math.round(quick.sectorPercentile)}th`}
                  icon={<TrendingUp className="h-3.5 w-3.5 text-blue-400" />}
                />
                <Stat
                  label="Docs submitted"
                  value={quick.verificationDetail.documentsSubmitted.toString()}
                  icon={<FileText className="h-3.5 w-3.5 text-violet-400" />}
                />
                <Stat
                  label="Trust events (7d)"
                  value={quick.monitoringDetail.trustEventCount7d.toString()}
                  icon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}
                />
              </div>

              <p className="text-sm text-white/70 pt-3 border-t border-white/10">
                {quick.readinessSummary}
              </p>
            </div>
          )}
        </section>

        {/* ── Deep Scan section ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" />
              <h2 className="text-base font-semibold">Deep Scan (L2)</h2>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                Audit-ready snapshot
              </span>
            </div>
            {!deep && !deepLoading && (
              <button
                type="button"
                onClick={runDeepScan}
                disabled={quickError !== null || quickLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run Deep Scan
              </button>
            )}
            {deep && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                1 credit used
              </span>
            )}
          </div>

          {deepLoading && (
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 flex items-center gap-3 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Running Deep Scan…
            </div>
          )}

          {deepError && (
            <ScanErrorCard error={deepError} tier="DEEP" />
          )}

          {deep && !deepError && (
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Current score" value={deep.currentScore.toString()} />
                <Stat
                  label="Lifecycle"
                  value={deep.compliance.lifecycleStatus.replace(/_/g, " ")}
                />
                <Stat
                  label="Structural level"
                  value={(deep.elevation.structuralLevel || "—").replace(/_/g, " ")}
                />
                <Stat
                  label={`Proof views (${deep.activityWindow.days}d)`}
                  value={deep.activityWindow.proofViewsInWindow.toString()}
                />
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[11px] text-white/40 mb-1">Snapshot hash (immutable audit fingerprint)</p>
                <code className="text-[11px] text-emerald-300 font-mono break-all">
                  {deep.snapshotHash}
                </code>
              </div>
            </div>
          )}

          {!deep && !deepLoading && !deepError && (
            <p className="text-xs text-white/40">
              Click <strong>Run Deep Scan</strong> to consume one DEEP credit and reveal the audit-ready snapshot. Re-running on the same vendor this month is free.
            </p>
          )}
        </section>

        {/* ── Evidence Scan section (L3 — Buyer Enterprise + Suites only) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <h2 className="text-base font-semibold">Evidence Scan (L3)</h2>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                Blockchain proof + complete dossier
              </span>
            </div>
            {!evidence && !evidenceLoading && (
              <button
                type="button"
                onClick={runEvidenceScan}
                disabled={quickError !== null || quickLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run Evidence Scan
              </button>
            )}
            {evidence && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                1 credit used
              </span>
            )}
          </div>

          {evidenceLoading && (
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 flex items-center gap-3 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              Running Evidence Scan…
            </div>
          )}

          {evidenceError && (
            <ScanErrorCard error={evidenceError} tier="EVIDENCE" />
          )}

          {evidence && !evidenceError && (
            <div className="space-y-4">
              {/* Headline */}
              <div className="rounded-xl border border-amber-500/20 bg-[#0f172a] p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Current score" value={evidence.currentScore.toString()} />
                <Stat
                  label="Lifecycle"
                  value={(evidence.verify?.lifecycleStatus || "—").replace(/_/g, " ")}
                />
                <Stat
                  label="Verification depth"
                  value={(evidence.notarization?.verificationDepth || evidence.verify?.verificationLevel || "—").replace(/_/g, " ")}
                />
                <Stat
                  label="Confidence"
                  value={`${Math.round(evidence.notarization?.confidenceScore || 0)}/100`}
                />
              </div>

              {/* Blockchain anchors */}
              <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-3.5 w-3.5 text-amber-400" />
                  <h3 className="text-sm font-semibold">
                    Blockchain anchors ({evidence.blockchainAnchors.length})
                  </h3>
                </div>
                {evidence.blockchainAnchors.length === 0 ? (
                  <p className="text-xs text-white/40">No on-chain anchors recorded for this vendor.</p>
                ) : (
                  <ul className="space-y-2">
                    {evidence.blockchainAnchors.slice(0, 10).map((a) => (
                      <li
                        key={a.reportId}
                        className="flex items-start justify-between gap-3 text-[11px] border border-white/5 rounded-lg px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-amber-300 font-semibold uppercase tracking-widest text-[10px]">
                            {a.framework.replace(/_/g, " ")}
                          </p>
                          <code className="text-emerald-300 font-mono break-all">{a.txHash}</code>
                          <p className="text-white/40 mt-0.5">
                            {a.anchoredAt ? new Date(a.anchoredAt).toLocaleString("en-SG") : "—"}
                          </p>
                        </div>
                        {a.explorerUrl && (
                          <a
                            href={a.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-blue-300 hover:text-blue-200 text-[10px] font-semibold uppercase tracking-widest"
                          >
                            Verify ↗
                          </a>
                        )}
                      </li>
                    ))}
                    {evidence.blockchainAnchors.length > 10 && (
                      <li className="text-[11px] text-white/40 text-center pt-1">
                        + {evidence.blockchainAnchors.length - 10} more anchors not shown
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Certificate log */}
              <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <h3 className="text-sm font-semibold">
                    Certificate audit trail ({evidence.certificateLog.length})
                  </h3>
                </div>
                {evidence.certificateLog.length === 0 ? (
                  <p className="text-xs text-white/40">No certificates have been generated.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {evidence.certificateLog.slice(0, 10).map((c, i) => (
                      <li key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-300 font-semibold uppercase tracking-widest text-[10px]">
                          {c.certificateType}
                        </span>
                        <span className="text-white/40">
                          {c.generatedAt ? new Date(c.generatedAt).toLocaleDateString("en-SG", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          {" · "}
                          {c.downloadCount} downloads
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Drift history */}
              <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-3.5 w-3.5 text-amber-400" />
                  <h3 className="text-sm font-semibold">
                    Compliance drift events ({evidence.driftHistory.length})
                  </h3>
                </div>
                {evidence.driftHistory.length === 0 ? (
                  <p className="text-xs text-white/40">No drift events recorded — posture is stable.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {evidence.driftHistory.map((d, i) => (
                      <li key={i} className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold uppercase tracking-widest text-[10px] ${
                            d.severity === "CRITICAL"
                              ? "text-red-300"
                              : d.severity === "WARNING"
                                ? "text-amber-300"
                                : "text-white/60"
                          }`}
                        >
                          {d.severity}
                        </span>
                        <span className="text-white/60">
                          {d.framework.replace(/_/g, " ")} · {d.previousScore ?? "?"} → {d.currentScore ?? "?"} ({d.deltaPct !== null ? `${d.deltaPct.toFixed(1)}%` : "—"})
                        </span>
                        <span className="text-white/40">
                          {d.occurredAt ? new Date(d.occurredAt).toLocaleDateString("en-SG", { month: "short", day: "numeric" }) : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!evidence && !evidenceLoading && !evidenceError && (
            <p className="text-xs text-white/40">
              Click <strong>Run Evidence Scan</strong> to consume one EVIDENCE credit and retrieve all on-chain anchors, the full certificate audit trail, and compliance drift history. Buyer Enterprise (15/mo) or Pro Suite (unlimited).
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] text-white/40 font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-lg font-bold text-white mt-0.5 truncate">{value}</p>
    </div>
  );
}

function ScanErrorCard({ error, tier }: { error: ScanError; tier: "QUICK" | "DEEP" | "EVIDENCE" }) {
  const upsell = error.status === 402 || error.status === 429;
  const tierLabel = tier === "QUICK" ? "Quick" : tier === "DEEP" ? "Deep" : "Evidence";
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3">
      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-300 text-sm font-semibold">
          {error.status === 402
            ? `${tierLabel} Scans not in your plan`
            : error.status === 429
              ? `Monthly ${tierLabel} Scan limit reached`
              : `Scan failed (${error.status})`}
        </p>
        <p className="text-white/60 text-xs mt-1">{error.detail}</p>
        {upsell && (
          <Link
            href="/pricing"
            className="inline-block mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
          >
            Upgrade Buyer plan →
          </Link>
        )}
      </div>
    </div>
  );
}

// Inline mini-quota at the top of the detail page. Refreshes via key prop.
function QuotaInline() {
  const [data, setData] = useState<{
    plan: string;
    month: string;
    scans: Record<string, { used: number; limit: number | null; remaining: number | null }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/procurement/scan-quota", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  const fmt = (b: { used: number; limit: number | null }) =>
    b.limit === null ? `${b.used} / ∞` : b.limit === 0 ? "—" : `${b.used} / ${b.limit}`;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f172a] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <span className="text-white/40 uppercase tracking-widest text-[10px]">
        {data.plan.replace(/_/g, " ")} · {data.month}
      </span>
      <div className="flex items-center gap-4">
        <span className="text-blue-300">Quick {fmt(data.scans.QUICK)}</span>
        <span className="text-violet-300">Deep {fmt(data.scans.DEEP)}</span>
        <span className="text-amber-300">Evidence {fmt(data.scans.EVIDENCE)}</span>
      </div>
    </div>
  );
}
