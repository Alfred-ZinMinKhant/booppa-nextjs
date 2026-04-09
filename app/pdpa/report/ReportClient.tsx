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
  blockchain_evidence?: { steps?: string[]; purpose?: string };
  report_metadata?: { ai_model?: string; report_id?: string };
};

const SEVERITY_STYLE: Record<string, string> = {
  HIGH:     "bg-red-50 text-red-700 border-red-200",
  MEDIUM:   "bg-amber-50 text-amber-700 border-amber-200",
  LOW:      "bg-blue-50 text-blue-700 border-blue-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

const RISK_LEVEL_COLOR: Record<string, string> = {
  LOW:      "text-emerald-600",
  MEDIUM:   "text-amber-600",
  HIGH:     "text-red-600",
  CRITICAL: "text-red-700",
};

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
  const [verification, setVerification]   = useState<any>(null);

  const maxAttempts = 12;
  const baseDelayMs = 5000;
  const maxDelayMs  = 60000;

  const loadingSteps = [
    { label: "Preparing scan…",         max: 35 },
    { label: "Scanning your website…",  max: 65 },
    { label: "Analysing PDPA gaps…",    max: 85 },
    { label: "Almost done!",            max: 95 },
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
      if (!sessionId) {
        setStatus("error");
        setMessage("No session ID provided.");
        return;
      }

      let isReady = false;
      try {
        const res = await fetch(`${config.apiUrl}/api/reports/by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report)            setReport(data.report);
          if (data.site_screenshot)   setSiteScreenshot(data.site_screenshot);
          if (data.screenshot_error)  setScreenshotError(data.screenshot_error);
          if (data.url)               setReportUrl(data.url);
          if (data.verification)      setVerification(data.verification);

          const hasScreenshot   = Boolean(data.site_screenshot);
          const screenshotFailed = Boolean(data.screenshot_error);

          if ((data.report || data.url) && (hasScreenshot || screenshotFailed || data.status === "completed")) {
            isReady = true;
            setStatus("ready");
            setMessage("Your report is ready.");
          } else {
            setStatus(prev => prev === "ready" ? "ready" : "loading");
            setMessage(prev => prev === "Your report is ready." ? prev : "Report is processing. Please wait...");
          }
        } else if (res.status === 202 || res.status === 404) {
          setStatus("loading");
          setMessage("Report is processing. Please wait...");
        } else {
          const err = await res.text();
          setStatus("error");
          setMessage(`Failed to load report: ${err}`);
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Network error while checking report");
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
    const iv2 = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
    }, 5000);
    return () => { clearInterval(iv1); clearInterval(iv2); };
  }, [status, loadingStep]);

  /* ── Loading overlay ─────────────────────────────────────────── */
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
              <span>Progress</span>
              <span>{Math.min(Math.round(progress), 98)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
              <div
                className="h-2 rounded-full bg-[#10b981] transition-all duration-700"
                style={{ width: `${Math.min(progress, 98)}%` }}
              />
            </div>
            <p className="text-xs text-[#94a3b8] mt-4">Usually ready in under 2 minutes.</p>
          </div>
          <button
            onClick={() => setRetryTrigger(t => t + 1)}
            className="mt-6 text-sm text-[#64748b] underline hover:text-[#0f172a] transition"
          >
            Refresh now
          </button>
        </div>
      </div>
    );
  }

  /* ── Timeout ──────────────────────────────────────────────────── */
  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-[#e2e8f0] p-10 shadow-sm">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Still processing…</h2>
          <p className="text-[#64748b] text-sm mb-6">{message}</p>
          <button
            onClick={() => { setStatus("loading"); setAttempts(0); setRetryTrigger(t => t + 1); }}
            className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */
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

  /* ── Report ready ─────────────────────────────────────────────── */
  const riskScore = report?.risk_assessment?.score;
  const riskLevel = report?.risk_assessment?.level ?? "";
  const findings  = report?.detailed_findings ?? [];
  const recs      = report?.recommendations ?? [];

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <section className="bg-[#0f172a] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-2">PDPA Quick Scan</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Compliance Report</h1>
              {report?.report_metadata?.report_id && (
                <p className="text-xs text-white/40 mt-1">Report ID: {report.report_metadata.report_id}</p>
              )}
            </div>
            <div className="flex gap-3">
              {reportUrl && (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition"
                >
                  <span>⬇</span> Download PDF
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

        {/* Risk summary cards */}
        {report?.risk_assessment && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8] mb-2">Risk Score</p>
              <p className={`text-4xl font-black ${RISK_LEVEL_COLOR[riskLevel] ?? "text-[#0f172a]"}`}>
                {riskScore ?? "—"}
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">out of 100</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8] mb-2">Risk Level</p>
              <p className={`text-2xl font-bold ${RISK_LEVEL_COLOR[riskLevel] ?? "text-[#0f172a]"}`}>
                {riskLevel || "—"}
              </p>
              {report.risk_assessment.description && (
                <p className="text-xs text-[#64748b] mt-1 leading-snug">{report.risk_assessment.description}</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8] mb-2">Findings</p>
              <p className="text-4xl font-black text-[#0f172a]">{findings.length}</p>
              <p className="text-xs text-[#94a3b8] mt-1">issues identified</p>
            </div>
          </div>
        )}

        {/* Blockchain verification */}
        {verification?.tx_hash && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                <span className="text-[#10b981] text-xs font-bold">✓</span>
              </div>
              <h2 className="text-base font-bold text-[#0f172a]">Blockchain-Anchored Report</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {verification.qr_image && (
                <img
                  src={`data:image/png;base64,${verification.qr_image}`}
                  alt="Verification QR"
                  className="w-20 h-20 rounded-lg border border-[#e2e8f0] flex-shrink-0"
                />
              )}
              <div className="space-y-2 text-sm">
                <p className="text-[#64748b]">This report has been cryptographically anchored on the Polygon blockchain. The hash cannot be altered or backdated.</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#94a3b8] text-xs">TX Hash:</span>
                  <a
                    href={verification.polygonscan_url || `https://amoy.polygonscan.com/tx/${verification.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-[#10b981] hover:underline"
                  >
                    {verification.tx_hash.substring(0, 16)}…{verification.tx_hash.substring(verification.tx_hash.length - 8)}
                  </a>
                </div>
                {verification.verify_url && (
                  <a href={verification.verify_url} target="_blank" rel="noreferrer" className="text-xs text-[#10b981] hover:underline">
                    Verify report on Polygonscan →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Website screenshot */}
        {siteScreenshot && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0f172a] mb-4">Website Scanned</h2>
            <img
              src={siteScreenshot.startsWith("data:image") ? siteScreenshot : `data:image/png;base64,${siteScreenshot}`}
              alt="Website screenshot"
              className="w-full rounded-xl border border-[#e2e8f0]"
            />
          </div>
        )}

        {/* Executive summary */}
        {report?.executive_summary && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0f172a] mb-4">Executive Summary</h2>
            <div className="text-sm text-[#64748b] leading-relaxed space-y-3">
              {report.executive_summary.split("\n\n").map((p, i) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* Detailed findings */}
        {findings.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#0f172a] mb-4">Detailed Findings</h2>
            <div className="space-y-4">
              {findings.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {f.severity && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${SEVERITY_STYLE[f.severity] ?? "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"}`}>
                        {f.severity}
                      </span>
                    )}
                    {f.type && (
                      <span className="text-sm font-medium text-[#0f172a]">{f.type.replace(/_/g, " ")}</span>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-sm text-[#64748b] leading-relaxed whitespace-pre-line mb-3">{f.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#94a3b8]">
                    {f.evidence  && <div><span className="font-medium text-[#64748b]">Evidence:</span> {f.evidence}</div>}
                    {f.penalty?.amount && <div><span className="font-medium text-[#64748b]">Penalty:</span> {f.penalty.amount}</div>}
                    {f.deadline  && <div><span className="font-medium text-[#64748b]">Deadline:</span> {f.deadline}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#0f172a] mb-4">Recommendations</h2>
            <div className="space-y-4">
              {recs.map((rec, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {rec.severity && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${SEVERITY_STYLE[rec.severity] ?? "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"}`}>
                        {rec.severity}
                      </span>
                    )}
                    {rec.violation_type && (
                      <span className="text-sm font-medium text-[#0f172a]">{rec.violation_type.replace(/_/g, " ")}</span>
                    )}
                  </div>
                  {rec.actions && rec.actions.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {rec.actions.map((action, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[#64748b]">
                          <span className="text-[#10b981] font-bold mt-0.5">→</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  )}
                  {rec.timeline && (
                    <p className="text-xs text-[#94a3b8]">Timeline: {rec.timeline}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal references */}
        {report?.legal_references && report.legal_references.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0f172a] mb-4">Legal References</h2>
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

        {/* Download CTA */}
        {reportUrl && (
          <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-lg mb-2">Download your full PDF report</p>
            <p className="text-white/60 text-sm mb-6">Includes all findings, recommendations, and blockchain verification certificate</p>
            <a
              href={reportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition shadow-lg"
            >
              <span>⬇</span> Download Full PDF
            </a>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">Disclaimer</p>
          <p className="leading-relaxed">
            This PDPA Quick Scan is a technical assessment tool, not a formal regulatory audit. It does not constitute legal advice and does not guarantee compliance with the PDPA or protect against PDPC enforcement action. Booppa is not affiliated with the PDPC or any Singapore government agency. Consult qualified data protection counsel for material compliance decisions.
          </p>
        </div>

      </div>
    </main>
  );
}
