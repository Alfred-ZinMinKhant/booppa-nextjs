"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PDPAReportPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking report availability...");
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

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
          // Expecting { url: string } from backend when report is ready
          if (data.url) {
            setReportUrl(data.url);
            setStatus("ready");
            setMessage("Your report is ready. Download below.");
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

    load();
  }, [sessionId]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">PDPA Quick Scan Report</h1>
        <p className="text-gray-500 mb-6">{message}</p>

        {status === "loading" && <div className="text-sm text-gray-400">Checking...</div>}
        {status === "ready" && reportUrl && (
          <a href={reportUrl} className="inline-block px-6 py-3 bg-teal-600 text-white rounded" target="_blank" rel="noreferrer">
            Download Report
          </a>
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
