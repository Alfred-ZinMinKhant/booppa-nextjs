"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cspGet } from "@/lib/cspClient";
import { PageHeader, Card, RiskBadge, StatusBadge, EmptyState, PrimaryLink, fmtDate } from "@/components/csp/ui";

export default function CspClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState("");
  const [cdd, setCdd] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (risk) qs.set("risk_rating", risk);
    if (cdd) qs.set("cdd_status", cdd);
    cspGet(`clients${qs.toString() ? `?${qs}` : ""}`).then((r) => {
      if (r.ok && Array.isArray(r.data)) setClients(r.data);
      setLoading(false);
    });
  }, [risk, cdd]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Client registry — CDD is mandatory before providing any service."
        action={
          <div className="flex gap-2">
            <Link href="/csp/clients/bulk-import" className="inline-block border-2 border-[#0f172a] text-[#0f172a] font-bold px-4 py-2.5 rounded-xl hover:bg-[#0f172a] hover:text-white transition text-sm">
              Bulk import
            </Link>
            <PrimaryLink href="/csp/clients/new">+ New client</PrimaryLink>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#0f172a]">
          <option value="">All risk levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="very_high">Very high</option>
        </select>
        <select value={cdd} onChange={(e) => setCdd(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#0f172a]">
          <option value="">All CDD statuses</option>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-[#64748b]">Loading clients…</p>
      ) : clients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Register your first client or import a batch." cta={<PrimaryLink href="/csp/clients/new">+ New client</PrimaryLink>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-[#64748b]">
              <tr>
                <th className="text-left font-bold px-4 py-3">Name</th>
                <th className="text-left font-bold px-4 py-3">Type</th>
                <th className="text-left font-bold px-4 py-3">Risk</th>
                <th className="text-left font-bold px-4 py-3">CDD</th>
                <th className="text-left font-bold px-4 py-3">Next review</th>
                <th className="text-left font-bold px-4 py-3">Flags</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-[#f1f5f9] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <Link href={`/csp/clients/${c.id}`} className="font-semibold text-[#0f172a] hover:text-[#10b981]">{c.legal_name}</Link>
                    {c.uen_or_reg_no && <span className="block text-xs text-[#94a3b8]">{c.uen_or_reg_no}</span>}
                  </td>
                  <td className="px-4 py-3 text-[#475569] capitalize">{String(c.client_type || "").replace("_", " ")}</td>
                  <td className="px-4 py-3"><RiskBadge rating={c.risk_rating} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.cdd_status} /></td>
                  <td className="px-4 py-3 text-[#475569]">{fmtDate(c.cdd_next_review)}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.is_pep && <span className="mr-1 text-amber-600 font-bold">PEP</span>}
                    {c.sanctions_clear === false && <span className="mr-1 text-red-600 font-bold">SANCTIONS</span>}
                    {c.edd_required && <span className="text-orange-600 font-bold">EDD</span>}
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
