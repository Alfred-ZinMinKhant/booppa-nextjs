"use client";

import { useState } from "react";
import { PageHeader, Card } from "@/components/csp/ui";

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [autoScreen, setAutoScreen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) { setError("Choose a CSV or Excel file first."); return; }
    setError(null);
    setResult(null);
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("auto_screen", String(autoScreen));
    const res = await fetch("/api/csp/bulk-import", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (res.ok) {
      setResult(data);
    } else {
      setError(
        data?.detail?.file_errors
          ? `File errors: ${JSON.stringify(data.detail.file_errors)}`
          : typeof data?.detail === "string" ? data.detail : "Import failed.",
      );
    }
  }

  return (
    <>
      <PageHeader title="Bulk import clients" subtitle="Upload a CSV or Excel file (max 500 rows). CDD is still required per client afterwards." />
      <Card className="p-6 max-w-2xl">
        <a href="/api/csp/bulk-import/template" className="inline-block text-sm font-semibold text-[#10b981] hover:underline mb-5">
          ↓ Download CSV template
        </a>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">{error}</div>}

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-[#475569] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0f172a] file:text-white file:font-bold file:cursor-pointer mb-4"
        />
        <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer mb-5">
          <input type="checkbox" checked={autoScreen} onChange={(e) => setAutoScreen(e.target.checked)} className="h-4 w-4 accent-[#10b981]" />
          Run sanctions screening during import
        </label>

        <button type="button" disabled={busy || !file} onClick={upload} className="w-full bg-[#10b981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] transition disabled:opacity-50">
          {busy ? "Importing…" : "Import clients"}
        </button>

        {result && (
          <div className="mt-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
            <p className="font-bold text-[#0f172a] mb-2">Import summary</p>
            <ul className="text-sm text-[#475569] space-y-1">
              <li>Total rows: <b>{result.import_summary?.total_rows}</b></li>
              <li>Imported: <b className="text-[#10b981]">{result.import_summary?.imported}</b></li>
              <li>Skipped: <b className="text-amber-600">{result.import_summary?.invalid_skipped}</b></li>
            </ul>
            {Array.isArray(result.import_summary?.errors) && result.import_summary.errors.length > 0 && (
              <pre className="text-xs mt-3 overflow-x-auto">{JSON.stringify(result.import_summary.errors, null, 2)}</pre>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
