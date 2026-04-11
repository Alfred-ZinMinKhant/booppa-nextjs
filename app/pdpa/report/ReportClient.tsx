"use client"

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import Link from "next/link";

type StructuredReport = {
  executive_summary?: string;
  risk_assessment?: {
    score?: number;
    level?: string;
    description?: string;
  };
  detailed_findings?: Array<{
    type?: string;
    severity?: string;
    description?: string;
    evidence?: string;
    penalty?: { amount?: string };
    deadline?: string;
  }>;
  recommendations?: Array<{
    violation_type?: string;
    severity?: string;
    actions?: string[];
    timeline?: string;
  }>;
  legal_references?: Array<{ title?: string; url?: string }>;
  report_metadata?: { ai_model?: string; report_id?: string };
};

// Parse [KEY]: value blocks out of AI-formatted description strings
function parseDescriptionFields(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = raw.split("\n");
  const tagRe = /^\[([A-Z][A-Z _]+)\]:\s*(.*)$/;
  let currentKey = "";
  for (const line of lines) {
    const m = line.match(tagRe);
    if (m) {
      currentKey = m[1];
      result[currentKey] = m[2].trim();
    } else if (currentKey && line.trim()) {
      result[currentKey] = (result[currentKey] + " " + line.trim()).trim();
    }
  }
  // If no tags parsed, treat the whole thing as VIOLATION text
  if (Object.keys(result).length === 0 && raw.trim()) {
    result["VIOLATION"] = raw.trim();
  }
  return result;
}

const SEVERITY_CONFIG: Record<string, { label: string; bar: string; badge: string; border: string; text: string }> = {
  CRITICAL: { label: "Critical",  bar: "bg-red-600",    badge: "bg-red-100 text-red-700 border-red-300",    border: "border-l-red-600",    text: "text-red-700" },
  HIGH:     { label: "High",      bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-300", border: "border-l-orange-500", text: "text-orange-600" },
  MEDIUM:   { label: "Medium",    bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-300",  border: "border-l-amber-400",  text: "text-amber-600" },
  LOW:      { label: "Low",       bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-700 border-blue-300",    border: "border-l-blue-400",   text: "text-blue-600" },
};

const RISK_SCORE_CONFIG = (score: number) => {
  if (score >= 70) return { label: "High Risk",    color: "text-red-600",    bar: "bg-red-500",    bg: "bg-red-50 border-red-200" };
  if (score >= 40) return { label: "Medium Risk",  color: "text-amber-600",  bar: "bg-amber-400",  bg: "bg-amber-50 border-amber-200" };
  return               { label: "Low Risk",     color: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
};

function FindingCard({ f, rec }: {
  f: NonNullable<StructuredReport["detailed_findings"]>[number];
  rec?: NonNullable<StructuredReport["recommendations"]>[number];
}) {
  const [open, setOpen] = useState(false);
  const sev = f.severity?.toUpperCase() ?? "LOW";
  const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.LOW;
  const fields = parseDescriptionFields(f.description ?? "");

  const violation   = fields["VIOLATION"] || fields["VIOLATION "] || "";
  const legislation = fields["LEGISLATION"] || "";
  const action      = fields["IMMEDIATE ACTION"] || "";
  const penalty     = fields["PENALTY"] || f.penalty?.amount || "";
  const deadline    = fields["COMPLIANCE DEADLINE"] || f.deadline || "";

  return (
    <div className={`bg-white rounded-xl border border-[#e2e8f0] border-l-4 ${cfg.border} shadow-sm overflow-hidden`}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#f8fafc] transition"
      >
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
        <span className="text-sm font-semibold text-[#0f172a] flex-1 capitalize">
          {(f.type ?? "").replace(/_/g, " ")}
        </span>
        {penalty && (
          <span className="text-xs text-[#94a3b8] hidden sm:block">Penalty: {penalty}</span>
        )}
        <svg
          className={`h-4 w-4 text-[#94a3b8] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#f1f5f9]">
          {/* Violation */}
          {violation && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Violation</p>
              <p className="text-sm text-[#334155] leading-relaxed">{violation}</p>
            </div>
          )}

          {/* Evidence */}
          {f.evidence && (
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Evidence</p>
              <p className="text-sm text-[#64748b]">{f.evidence}</p>
            </div>
          )}

          {/* Legislation */}
          {legislation && (
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Legislation</p>
              <p className="text-sm text-[#64748b]">{legislation}</p>
            </div>
          )}

          {/* Penalty + Deadline row */}
          {(penalty || deadline) && (
            <div className="grid grid-cols-2 gap-3">
              {penalty && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Max Penalty</p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">{penalty}</p>
                </div>
              )}
              {deadline && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Deadline</p>
                  <p className="text-sm font-medium text-amber-700 mt-0.5">{deadline}</p>
                </div>
              )}
            </div>
          )}

          {/* Immediate action */}
          {action && (
            <div className="bg-[#f0fdf4] border border-[#10b981]/20 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wide mb-1">Immediate Action</p>
              <p className="text-sm text-[#334155] leading-relaxed">{action}</p>
            </div>
          )}

          {/* Remediation steps from recommendations */}
          {rec?.actions && rec.actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Remediation Steps</p>
              <ol className="space-y-1.5">
                {rec.actions.map((a, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[#64748b]">
                    <span className="text-[#10b981] font-bold flex-shrink-0 mt-0.5">{j + 1}.</span>
                    {a}
                  </li>
                ))}
              </ol>
              {rec.timeline && (
                <p className="mt-2 text-xs text-[#94a3b8]">Timeline: {rec.timeline}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportClient() {
  const [status, setStatus]               = useState("loading");
  const [message, setMessage]             = useState("Checking report availability...");
  const [reportUrl, setReportUrl]         = useState<string | null>(null);
  const [report, setReport]               = useState<StructuredReport | null>(null);
  const [siteScreenshot, setSiteScreenshot] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [sessionId, setSessionId]         = useState<string | null>(null);
  const [attempts, setAttempts]           = useState(0);
  const [retryTrigger, setRetryTrigger]   = useState(0);
  const [progress, setProgress]           = useState(12);
  const [loadingStep, setLoadingStep]     = useState(0);
  const [verification, setVerification]   = useState<{ tx_hash?: string; polygonscan_url?: string; verify_url?: string; qr_image?: string } | null>(null);

  const maxAttempts = 12;
  const baseDelayMs = 5000;
  const maxDelayMs  = 60000;

  const loadingSteps = [
    { label: "Preparing scan…",        max: 35 },
    { label: "Scanning your website…", max: 65 },
    { label: "Analysing PDPA gaps…",   max: 85 },
    { label: "Almost done!",           max: 95 },
  ];

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session_id"));
    } catch {
      setSessionId(null);
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      if (!sessionId) { setStatus("error"); setMessage("No session ID provided."); return; }

      let isReady = false;
      try {
        const res = await fetch(`${config.apiUrl}/api/reports/by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report)           setReport(data.report);
          if (data.site_screenshot)  setSiteScreenshot(data.site_screenshot);
          if (data.screenshot_error) setScreenshotError(data.screenshot_error);
          if (data.url)              setReportUrl(data.url);
          if (data.verification)     setVerification(data.verification);

          const hasScreenshot    = Boolean(data.site_screenshot);
          const screenshotFailed = Boolean(data.screenshot_error);

          if ((data.report || data.url) && (hasScreenshot || screenshotFailed || data.status === "completed")) {
            isReady = true;
            setStatus("ready");
            setMessage("Your report is ready.");
          } else {
            setStatus(prev => prev === "ready" ? "ready" : "loading");
          }
        } else if (res.status === 202 || res.status === 404) {
          setStatus("loading");
        } else {
          setStatus("error");
          setMessage(`Failed to load report: ${await res.text()}`);
        }
      } catch (e: unknown) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Network error");
      } finally {
        if (!isReady) {
          setAttempts(prev => {
            const next = prev + 1;
            if (next > maxAttempts) {
              setStatus("timeout");
              setMessage("Report is taking longer than expected. We'll email it to you when it's ready.");
            } else {
              const delay = Math.min(Math.round(baseDelayMs * Math.pow(1.6, next - 1)), maxDelayMs);
              timeoutId = setTimeout(load, delay);
            }
            return next;
          });
        }
      }
    }

    if (sessionId) load();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [sessionId, retryTrigger]);

  useEffect(() => {
    if (status !== "loading" || attempts > maxAttempts) return;
    const iv1 = setInterval(() => {
      setProgress(prev => {
        const step = loadingSteps[loadingStep] ?? loadingSteps[0];
        return Math.round(Math.min(prev + Math.random() * 4 + 1, step.max) * 10) / 10;
      });
    }, 700);
    const iv2 = setInterval(() => setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1)), 5000);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, [status, loadingStep, attempts]);

  /* ── Loading ─────────────────────────────────────────────── */
  if (status === "loading" && attempts <= maxAttempts) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981]/10 mb-6">
            <svg className="w-8 h-8 text-[#10b981] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Generating Your Report</h1>
          <p className="text-[#64748b] text-sm mb-8">{loadingSteps[loadingStep]?.label ?? "Almost done!"}</p>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex justify-between text-xs text-[#94a3b8] mb-2">
              <span>Progress</span><span>{Math.min(Math.round(progress), 98)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
              <div className="h-2 rounded-full bg-[#10b981] transition-all duration-700" style={{ width: `${Math.min(progress, 98)}%` }} />
            </div>
            <p className="text-xs text-[#94a3b8] mt-4">Usually ready in under 2 minutes.</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryTrigger(t => t + 1)}
            className="mt-6 text-sm text-[#64748b] underline hover:text-[#0f172a] transition"
          >
            Refresh now
          </button>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-[#e2e8f0] p-10 shadow-sm">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Still processing…</h2>
          <p className="text-[#64748b] text-sm mb-6">{message}</p>
          <button
            type="button"
            onClick={() => { setStatus("loading"); setAttempts(0); setRetryTrigger(t => t + 1); }}
            className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-red-200 p-10 shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Something went wrong</h2>
          <p className="text-[#64748b] text-sm mb-6">{message}</p>
          <Link href="/pdpa" className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm">
            Back to PDPA Scan
          </Link>
        </div>
      </div>
    );
  }

  /* ── Report ready ─────────────────────────────────────────── */
  const riskScore  = report?.risk_assessment?.score ?? 0;
  const riskLevel  = report?.risk_assessment?.level ?? "";
  const findings   = report?.detailed_findings ?? [];
  const recs       = report?.recommendations ?? [];
  const riskCfg    = RISK_SCORE_CONFIG(riskScore);

  // Map recommendations by violation_type for inline display
  const recByType  = Object.fromEntries(recs.map(r => [r.violation_type ?? "", r]));

  const highCount   = findings.filter(f => f.severity === "HIGH" || f.severity === "CRITICAL").length;
  const medCount    = findings.filter(f => f.severity === "MEDIUM").length;
  const lowCount    = findings.filter(f => f.severity === "LOW").length;

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="bg-[#0f172a] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-2">PDPA Quick Scan</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Compliance Report</h1>
              {report?.report_metadata?.report_id && (
                <p className="text-xs text-white/40 mt-1">ID: {report.report_metadata.report_id}</p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {reportUrl && (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition"
                >
                  ⬇ Download PDF
                </a>
              )}
              <Link
                href="/pdpa"
                className="inline-flex items-center px-5 py-2.5 border border-white/20 text-white/80 text-sm font-medium rounded-xl hover:bg-white/5 transition"
              >
                New Scan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Risk score card ─────────────────────────────── */}
        {report?.risk_assessment && (
          <div className={`rounded-2xl border p-6 ${riskCfg.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Score dial */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${riskScore} ${100 - riskScore}`}
                      className={riskCfg.bar.replace("bg-", "stroke-")}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${riskCfg.color}`}>
                    {riskScore}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Risk Score</p>
                  <p className={`text-2xl font-bold ${riskCfg.color}`}>{riskCfg.label}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">100 = highest risk</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px self-stretch bg-[#e2e8f0]" />

              {/* Findings summary */}
              <div className="flex gap-4 flex-wrap">
                {highCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-600">{highCount}</p>
                    <p className="text-xs text-[#64748b]">High / Critical</p>
                  </div>
                )}
                {medCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-amber-600">{medCount}</p>
                    <p className="text-xs text-[#64748b]">Medium</p>
                  </div>
                )}
                {lowCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-blue-600">{lowCount}</p>
                    <p className="text-xs text-[#64748b]">Low</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-black text-[#0f172a]">{findings.length}</p>
                  <p className="text-xs text-[#64748b]">Total Issues</p>
                </div>
              </div>

              {/* Description */}
              {report.risk_assessment.description && (
                <>
                  <div className="hidden sm:block w-px self-stretch bg-[#e2e8f0]" />
                  <p className="text-sm text-[#64748b] leading-relaxed flex-1">{report.risk_assessment.description}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Blockchain verification ─────────────────────── */}
        {verification?.tx_hash && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#10b981] text-sm font-bold">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0f172a]">Blockchain-Anchored</p>
              <p className="text-xs text-[#64748b]">Cryptographically anchored on Polygon — cannot be altered or backdated</p>
            </div>
            {verification.verify_url && (
              <a
                href={verification.verify_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#10b981] hover:underline flex-shrink-0"
              >
                Verify on Polygonscan →
              </a>
            )}
          </div>
        )}

        {/* ── Website screenshot ──────────────────────────── */}
        {siteScreenshot && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">Website Scanned</p>
            <img
              src={siteScreenshot.startsWith("data:image") ? siteScreenshot : `data:image/png;base64,${siteScreenshot}`}
              alt="Scanned website"
              className="w-full rounded-xl border border-[#e2e8f0]"
            />
          </div>
        )}

        {/* ── Executive summary ───────────────────────────── */}
        {report?.executive_summary && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">Executive Summary</p>
            <div className="text-sm text-[#64748b] leading-relaxed space-y-3">
              {report.executive_summary.split("\n\n").map((p, i) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Findings (accordion, with remediation inline) ─ */}
        {findings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#0f172a]">Findings</p>
              <p className="text-xs text-[#94a3b8]">Click a row to expand</p>
            </div>
            <div className="space-y-2">
              {findings.map((f, i) => (
                <FindingCard
                  key={i}
                  f={f}
                  rec={recByType[f.type ?? ""]}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Legal references ────────────────────────────── */}
        {report?.legal_references && report.legal_references.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">Legal References</p>
            <ul className="space-y-2">
              {report.legal_references.map((ref, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-[#10b981]">•</span>
                  {ref.url ? (
                    <a href={ref.url} target="_blank" rel="noreferrer" className="text-[#10b981] hover:underline">
                      {ref.title}
                    </a>
                  ) : (
                    <span className="text-[#64748b]">{ref.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── PDF CTA ─────────────────────────────────────── */}
        {reportUrl && (
          <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-lg mb-1">Download your full PDF report</p>
            <p className="text-white/50 text-sm mb-6">All findings, remediation steps, and blockchain certificate</p>
            <a
              href={reportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition shadow-lg"
            >
              ⬇ Download Full PDF
            </a>
          </div>
        )}

        {/* ── Disclaimer ──────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">Disclaimer</p>
          <p className="leading-relaxed">
            This PDPA Quick Scan is a technical assessment tool, not a formal regulatory audit. It does not constitute legal advice and does not guarantee compliance with the PDPA or protect against PDPC enforcement action. Booppa is not affiliated with the PDPC or any Singapore government agency. Consult qualified data protection counsel for material compliance decisions.
          </p>
        </div>

      </div>
    </main>
  );
}
