"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, CheckCircle2, AlertTriangle, XCircle,
  FileText, ExternalLink, Loader2, Download, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EvidenceItem {
  report_id: string;
  framework: string;
  status: string;
  created_at: string | null;
  audit_hash: string | null;
  notarized: boolean;
}

interface RegulationRow {
  regulation_key: string;
  display_name: string;
  description: string;
  status: "MET" | "PARTIAL" | "MISSING";
  evidence_count: number;
  latest_evidence_date: string | null;
  notarized: boolean;
  evidence_list: EvidenceItem[];
  requires_notarization: boolean;
  reference_url: string;
}

interface LockerData {
  user_id: string;
  company_name: string;
  overall_status: "MET" | "PARTIAL" | "MISSING";
  met_count: number;
  total_count: number;
  compliance_score: number;
  regulations: RegulationRow[];
  generated_at: string;
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  MET: {
    label: "Met",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  PARTIAL: {
    label: "Partial",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  MISSING: {
    label: "Missing",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
};

const FRAMEWORK_LABELS: Record<string, string> = {
  pdpa_scan: "PDPA Scan",
  pdpa_full: "PDPA Full Report",
  pdpa_free_scan: "PDPA Free Scan",
  compliance_notarization: "Blockchain Notarization",
  acra_verification: "ACRA Verification",
  gebiz_check: "GeBIZ Check",
  mas_trm: "MAS TRM Assessment",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Regulation Card ───────────────────────────────────────────────────────────

function RegulationCard({ reg }: { reg: RegulationRow }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[reg.status];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-6 text-left hover:opacity-90 transition-opacity"
      >
        <Icon className={`${cfg.color} flex-shrink-0 mt-0.5`} size={22} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-[#0f172a] text-lg leading-tight">{reg.display_name}</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.badge}`}>
              {cfg.label}
            </span>
            {reg.notarized && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-violet-100 text-violet-700">
                Blockchain Verified
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748b] mt-1.5 leading-relaxed">{reg.description}</p>
          {reg.evidence_count > 0 && (
            <p className="text-xs text-[#94a3b8] mt-2">
              {reg.evidence_count} evidence {reg.evidence_count === 1 ? "item" : "items"} · Latest: {formatDate(reg.latest_evidence_date)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-[#94a3b8]">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded evidence list */}
      {expanded && (
        <div className="border-t border-current/10 px-6 pb-6 pt-4 space-y-3">
          {reg.evidence_count === 0 ? (
            <div className="text-sm text-[#94a3b8] italic">
              No evidence on file for this regulation yet.
              {reg.regulation_key === "PDPA" && (
                <Link href="/pdpa" className="ml-2 text-[#10b981] font-semibold hover:underline">
                  Run a PDPA Scan →
                </Link>
              )}
              {reg.regulation_key !== "PDPA" && (
                <Link href="/compliance-notarization" className="ml-2 text-[#10b981] font-semibold hover:underline">
                  Upload a notarized document →
                </Link>
              )}
            </div>
          ) : (
            reg.evidence_list.map((ev) => (
              <div
                key={ev.report_id}
                className="flex items-center justify-between gap-4 bg-white/70 rounded-xl px-4 py-3 border border-white/80"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-[#64748b] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">
                      {FRAMEWORK_LABELS[ev.framework] || ev.framework}
                    </p>
                    <p className="text-xs text-[#94a3b8]">{formatDate(ev.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ev.notarized && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                      On-chain
                    </span>
                  )}
                  <Link
                    href={`/check-status?id=${ev.report_id}`}
                    className="text-xs text-[#10b981] font-semibold hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}

          {reg.requires_notarization && !reg.notarized && reg.evidence_count > 0 && (
            <p className="text-xs text-amber-600 font-medium mt-2">
                This regulation requires blockchain notarization to be fully met.{" "}
              <Link href="/compliance-notarization" className="underline">Notarize a document →</Link>
            </p>
          )}

          <a
            href={reg.reference_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#0f172a] mt-1"
          >
            Official regulation reference <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="100" height="100" className="rotate-[-90deg]">
      <circle cx="50" cy="50" r={r} stroke="#e2e8f0" strokeWidth="8" fill="none" />
      <circle
        cx="50" cy="50" r={r}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text
        x="50" y="55"
        textAnchor="middle"
        fill={color}
        fontSize="18"
        fontWeight="800"
        style={{ transform: "rotate(90deg)", transformOrigin: "50px 50px" }}
      >
        {score}
      </text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ComplianceLockerPage() {
  const [locker, setLocker] = useState<LockerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dossier, setDossier] = useState<object | null>(null);

  useEffect(() => {
    fetchLocker();
  }, []);

  async function fetchLocker() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance/locker");
      if (!res.ok) throw new Error("Failed to load compliance locker.");
      const data = await res.json();
      setLocker(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDossier() {
    setGenerating(true);
    try {
      const res = await fetch("/api/compliance/dossier", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate dossier.");
      const data = await res.json();
      setDossier(data);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Dossier generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Loading ──

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#10b981] mx-auto mb-4" size={36} />
          <p className="text-[#64748b] font-medium">Loading your compliance locker…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <XCircle className="text-red-500 mx-auto mb-3" size={32} />
          <p className="font-bold text-red-700 mb-2">Could not load locker</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <p className="text-sm text-[#64748b]">
            Please{" "}
            <Link href="/auth/login" className="text-[#10b981] font-bold hover:underline">
              sign in
            </Link>{" "}
            to view your compliance locker.
          </p>
        </div>
      </main>
    );
  }

  if (!locker) return null;

  const overallCfg = STATUS_CONFIG[locker.overall_status];

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <section className="bg-[#0f172a] text-white py-16 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Score ring */}
            <div className="flex-shrink-0">
              <ScoreRing score={locker.compliance_score} />
            </div>

            {/* Summary */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Shield size={20} className="text-[#10b981]" />
                <span className="text-[#10b981] font-bold text-sm uppercase tracking-widest">
                  Singapore Compliance Locker
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black mb-2 leading-tight">
                {locker.company_name || "Your Company"}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${overallCfg.badge}`}>
                  {locker.met_count} / {locker.total_count} Regulations Met
                </span>
                <span className="text-white/50 text-sm">
                  Updated {formatDate(locker.generated_at)}
                </span>
              </div>
              <p className="text-white/70 max-w-xl leading-relaxed text-sm">
                Your end-to-end compliance evidence across Singapore&apos;s key regulatory frameworks —
                PDPA, ACRA, GeBIZ, and MAS. Expand any regulation to see your evidence on file.
              </p>
            </div>

            {/* Generate Dossier CTA */}
            <div className="flex-shrink-0">
              <button
                onClick={handleGenerateDossier}
                disabled={generating || locker.met_count === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Generating…</>
                ) : (
                  <><Download size={16} /> Generate Dossier</>
                )}
              </button>
              {locker.met_count === 0 && (
                <p className="text-xs text-white/40 mt-2 text-center max-w-[160px]">
                  Add evidence first to generate a dossier.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dossier result banner */}
      {dossier && (
        <section className="bg-emerald-50 border-b-2 border-emerald-200 px-6 py-4">
          <div className="max-w-[1100px] mx-auto flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
            <p className="text-sm text-emerald-700 font-medium">
              Dossier generated — {(dossier as { met_count?: number }).met_count ?? 0} regulation{((dossier as { met_count?: number }).met_count ?? 0) !== 1 ? "s" : ""} covered.
              PDF export with blockchain anchoring is coming in Phase 2.
            </p>
          </div>
        </section>
      )}

      {/* Regulations */}
      <section className="py-12 px-6">
        <div className="max-w-[1100px] mx-auto space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0f172a]">Singapore Regulatory Frameworks</h2>
            <Link
              href="/compliance-notarization"
              className="text-sm text-[#10b981] font-semibold hover:underline flex items-center gap-1"
            >
              + Add Evidence
            </Link>
          </div>

          {locker.regulations.map((reg) => (
            <RegulationCard key={reg.regulation_key} reg={reg} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 border-t border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[#0f172a] mb-2">Run a PDPA Scan</h3>
            <p className="text-sm text-[#64748b] mb-4">Generate a blockchain-anchored PDPA compliance report in minutes.</p>
            <Link href="/pdpa" className="text-sm text-[#10b981] font-bold hover:underline">
              Start PDPA Scan →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[#0f172a] mb-2">Notarize a Document</h3>
            <p className="text-sm text-[#64748b] mb-4">Upload any compliance document — SHA-256 hash + blockchain timestamp.</p>
            <Link href="/compliance-notarization" className="text-sm text-[#10b981] font-bold hover:underline">
              Upload Document →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[#0f172a] mb-2">Monitor Your Vendors</h3>
            <p className="text-sm text-[#64748b] mb-4">Track compliance risk across your supply chain with the vendor portfolio.</p>
            <Link href="/supply-chain" className="text-sm text-[#10b981] font-bold hover:underline">
              Supply Chain Risk →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
