"use client"

import { useEffect, useState } from "react";

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

export default function ReportClient() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking report availability...");
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [report, setReport] = useState<StructuredReport | null>(null);
  const [siteScreenshot, setSiteScreenshot] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session_id"));
    } catch (e) {
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

      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_BASE as string) ?? "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/reports/by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReport(data.report);
          }
          if (data.site_screenshot) {
            setSiteScreenshot(data.site_screenshot);
          }
          if (data.url) {
            setReportUrl(data.url);
          }
          if (data.report || data.url) {
            setStatus("ready");
            setMessage("Your report is ready. Review below.");
          } else {
            setStatus("loading");
            setMessage("Report is processing. Please wait...");
          }
        } else if (res.status === 404) {
          setStatus("loading");
          setMessage("Report is processing. Please wait...");
        } else {
          const err = await res.text();
          setStatus("error");
          setMessage(`Failed to check report: ${err}`);
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Network error while checking report");
      } finally {
        setAttempts((prev) => prev + 1);
        if (status !== "ready" && attempts < 30) {
          timeoutId = setTimeout(load, 5000);
        }
      }
    }

    if (sessionId) load();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId, attempts, status]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-3xl font-bold mb-4">PDPA Quick Scan Report</h1>
        <p className="text-gray-500 mb-6">{message}</p>

        {status === "loading" && <div className="text-sm text-gray-400">Checking...</div>}
        {status === "ready" && (
          <div className="w-full text-left mt-8 space-y-8">
            <section className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Audit Summary</h2>
                  <p className="text-sm text-gray-400">PDPA Quick Scan Report</p>
                </div>
                {report?.report_metadata?.report_id && (
                  <div className="rounded-full border border-gray-700 bg-black/40 px-4 py-2 text-xs text-gray-300">
                    Report ID: {report.report_metadata.report_id}
                  </div>
                )}
              </div>
            </section>

            {siteScreenshot && (
              <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
                <h3 className="text-xl font-semibold mb-3">Website Screenshot</h3>
                <img
                  src={`data:image/png;base64,${siteScreenshot}`}
                  alt="Website screenshot"
                  className="w-full rounded-xl border border-gray-800"
                />
              </section>
            )}

            {report?.risk_assessment && (
              <section>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Risk Score</div>
                    <div className="mt-2 text-3xl font-bold text-white">{report.risk_assessment.score ?? "N/A"}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Risk Level</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{report.risk_assessment.level ?? "N/A"}</div>
                    {report.risk_assessment.description && (
                      <div className="mt-1 text-sm text-gray-400">{report.risk_assessment.description}</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">AI Model</div>
                    <div className="mt-2 text-sm text-gray-300">{report.report_metadata?.ai_model ?? "Booppa"}</div>
                  </div>
                </div>
              </section>
            )}

            {report?.executive_summary && report?.detailed_findings?.length ? (
              <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                <h3 className="text-xl font-semibold mb-3">Executive Summary</h3>
                {report.executive_summary.split("\n\n").map((p, idx) => (
                  <p key={idx} className="text-gray-300 mb-3 whitespace-pre-line leading-relaxed">{p}</p>
                ))}
              </section>
            ) : null}

            {report?.detailed_findings?.length ? (
              <section>
                <h3 className="text-xl font-semibold mb-4">Detailed Findings</h3>
                <div className="space-y-4">
                  {report.detailed_findings.map((finding, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">{finding.severity}</span>
                        <span className="text-gray-300">{finding.type?.replace(/_/g, " ")}</span>
                      </div>
                      {finding.description && <p className="text-gray-200 mt-3 whitespace-pre-line leading-relaxed">{finding.description}</p>}
                      <div className="mt-3 grid gap-2 text-sm text-gray-400">
                        {finding.evidence && <div>Evidence: {finding.evidence}</div>}
                        {finding.penalty?.amount && <div>Penalty: {finding.penalty.amount}</div>}
                        {finding.deadline && <div>Deadline: {finding.deadline}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {report?.recommendations?.length ? (
              <section>
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {report.recommendations.map((rec, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                      <div className="text-sm text-gray-400">{rec.violation_type?.replace(/_/g, " ")} • {rec.severity}</div>
                      {rec.actions?.length ? (
                        <ul className="list-disc ml-5 mt-3 text-gray-200 space-y-1">
                          {rec.actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      ) : null}
                      {rec.timeline && <p className="text-gray-400 mt-2">Timeline: {rec.timeline}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {report?.legal_references?.length ? (
              <section>
                <h3 className="text-xl font-semibold mb-4">Legal References</h3>
                <ul className="list-disc ml-5 text-gray-300 space-y-1">
                  {report.legal_references.map((ref, idx) => (
                    <li key={idx}>
                      {ref.url ? (
                        <a className="text-teal-400 hover:underline" href={ref.url} target="_blank" rel="noreferrer">
                          {ref.title}
                        </a>
                      ) : (
                        <span>{ref.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {report?.executive_summary && !report?.detailed_findings?.length && (
              <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                <h3 className="text-xl font-semibold mb-3">Full Report</h3>
                <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{report.executive_summary}</pre>
              </section>
            )}

            {reportUrl && (
              <div className="pt-2">
                <a href={reportUrl} className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition" target="_blank" rel="noreferrer">
                  Download PDF
                </a>
              </div>
            )}
          </div>
        )}

        {status === "loading" && (
          <div className="mt-4">
            <p className="text-sm text-gray-400">If you just completed payment, the report may take a few minutes to generate.</p>
            <button
              onClick={() => setAttempts((prev) => prev + 1)}
              className="mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded"
            >
              Refresh
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 text-red-600">{message}</div>
        )}
      </div>
    </main>
  );
}
