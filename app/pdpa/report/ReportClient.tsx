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

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session_id"));
    } catch (e) {
      setSessionId(null);
    }
  }, []);

  useEffect(() => {
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
            setStatus("not_ready");
            setMessage("Report not ready yet. We'll email you when it's available.");
          }
        } else if (res.status === 404) {
          setStatus("not_ready");
          setMessage("Report not found yet. Please check back later or contact support.");
        } else {
          const err = await res.text();
          setStatus("error");
          setMessage(`Failed to check report: ${err}`);
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Network error while checking report");
      }
    }

    if (sessionId) load();
  }, [sessionId]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">PDPA Quick Scan Report</h1>
        <p className="text-gray-500 mb-6">{message}</p>

        {status === "loading" && <div className="text-sm text-gray-400">Checking...</div>}
        {status === "ready" && (
          <div className="w-full text-left mt-6 space-y-6">
            {siteScreenshot && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Website Screenshot</h2>
                <img
                  src={`data:image/png;base64,${siteScreenshot}`}
                  alt="Website screenshot"
                  className="w-full rounded-lg border border-gray-800"
                />
              </section>
            )}
            {report?.report_metadata?.report_id && (
              <div className="text-xs text-gray-500">Report ID: {report.report_metadata.report_id}</div>
            )}

            {report?.executive_summary && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Executive Summary</h2>
                {report.executive_summary.split("\n\n").map((p, idx) => (
                  <p key={idx} className="text-gray-300 mb-2 whitespace-pre-line">{p}</p>
                ))}
              </section>
            )}

            {report?.risk_assessment && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Risk Assessment</h2>
                <p className="text-gray-300">Score: {report.risk_assessment.score ?? "N/A"}</p>
                <p className="text-gray-300">Level: {report.risk_assessment.level ?? "N/A"}</p>
                <p className="text-gray-400">{report.risk_assessment.description}</p>
              </section>
            )}

            {report?.detailed_findings?.length ? (
              <section>
                <h2 className="text-xl font-semibold mb-2">Detailed Findings</h2>
                <div className="space-y-4">
                  {report.detailed_findings.map((finding, idx) => (
                    <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                      <div className="text-sm text-gray-400">{finding.severity} • {finding.type?.replace(/_/g, " ")}</div>
                      {finding.description && <p className="text-gray-200 mt-2 whitespace-pre-line">{finding.description}</p>}
                      {finding.evidence && <p className="text-gray-400 mt-2">Evidence: {finding.evidence}</p>}
                      {finding.penalty?.amount && <p className="text-gray-400 mt-1">Penalty: {finding.penalty.amount}</p>}
                      {finding.deadline && <p className="text-gray-400 mt-1">Deadline: {finding.deadline}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {report?.recommendations?.length ? (
              <section>
                <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
                <div className="space-y-3">
                  {report.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                      <div className="text-sm text-gray-400">{rec.violation_type?.replace(/_/g, " ")} • {rec.severity}</div>
                      {rec.actions?.length ? (
                        <ul className="list-disc ml-5 mt-2 text-gray-200">
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
                <h2 className="text-xl font-semibold mb-2">Legal References</h2>
                <ul className="list-disc ml-5 text-gray-300">
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

            {reportUrl && (
              <a href={reportUrl} className="inline-block px-6 py-3 bg-teal-600 text-white rounded" target="_blank" rel="noreferrer">
                Download PDF
              </a>
            )}
          </div>
        )}

        {status === "not_ready" && (
          <div className="mt-4">
            <p className="text-sm text-gray-400">If you just completed payment, the report may take a few minutes to generate.</p>
            <a href="/admin/dashboard" className="mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded">Go to Dashboard</a>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 text-red-600">{message}</div>
        )}
      </div>
    </main>
  );
}
