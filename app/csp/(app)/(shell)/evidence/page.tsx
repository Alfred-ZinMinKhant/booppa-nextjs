"use client";

import { useEffect, useState } from "react";
import { cspGet } from "@/lib/cspClient";
import { PageHeader, Card, EmptyState, fmtDate } from "@/components/csp/ui";

export default function EvidencePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cspGet("evidence?limit=200").then((r) => { if (r.ok && Array.isArray(r.data)) setRecords(r.data); setLoading(false); });
  }, []);

  return (
    <>
      <PageHeader title="Blockchain evidence ledger" subtitle="Every notarized CDD, STR, risk classification, training, and programme record." />
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : records.length === 0 ? (
        <EmptyState title="No evidence anchored yet" hint="Records appear here once their blockchain notarization completes." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-[#64748b]">
              <tr>
                <th className="text-left font-bold px-4 py-3">Type</th>
                <th className="text-left font-bold px-4 py-3">Title</th>
                <th className="text-left font-bold px-4 py-3">Hash</th>
                <th className="text-left font-bold px-4 py-3">Network</th>
                <th className="text-left font-bold px-4 py-3">Date</th>
                <th className="text-left font-bold px-4 py-3">Proof</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-[#f1f5f9]">
                  <td className="px-4 py-3 text-[#475569] capitalize">{String(r.record_type || "").replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-[#0f172a]">{r.record_title || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">{r.document_hash ? `${r.document_hash.slice(0, 10)}…` : "—"}</td>
                  <td className="px-4 py-3 text-[#475569]">{r.network || "—"}</td>
                  <td className="px-4 py-3 text-[#475569]">{fmtDate(r.timestamp || r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.polygonscan || r.tx_hash ? (
                      <a href={r.polygonscan || `https://polygonscan.com/tx/${r.tx_hash}`} target="_blank" rel="noreferrer" className="text-xs text-[#10b981] font-semibold hover:underline">View ↗</a>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold">pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
