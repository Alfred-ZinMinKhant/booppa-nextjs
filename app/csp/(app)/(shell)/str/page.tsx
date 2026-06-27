"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge, NotarizationBadge, EmptyState, fmtDate } from "@/components/csp/ui";

export default function StrPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, any>>({
    trigger_type: "",
    trigger_detail: "",
    decision: "pending",
    decision_by: "",
    decision_rationale: "",
    amount_involved: "",
    currency: "SGD",
    service_declined: false,
  });

  function load() {
    cspGet("str").then((r) => {
      if (r.ok && Array.isArray(r.data)) setReports(r.data);
      setLoading(false);
    });
  }
  useEffect(load, []);

  async function submit() {
    setErr(null);
    if (!f.trigger_type) { setErr("Trigger type is required."); return; }
    if (f.trigger_detail.trim().length < 20) { setErr("Trigger detail must be at least 20 characters."); return; }
    if (!f.decision_by.trim()) { setErr("Decision-by name is required."); return; }
    if (f.decision_rationale.trim().length < 20) { setErr("Decision rationale must be at least 20 characters — mandatory even when not filing."); return; }
    setBusy(true);
    const payload: Record<string, any> = {
      trigger_type: f.trigger_type,
      trigger_detail: f.trigger_detail,
      decision: f.decision,
      decision_by: f.decision_by,
      decision_rationale: f.decision_rationale,
      currency: f.currency,
      service_declined: !!f.service_declined,
    };
    if (f.amount_involved) payload.amount_involved = parseFloat(f.amount_involved);
    const r = await cspSend("str", "POST", payload);
    setBusy(false);
    if (r.ok) { setOpen(false); setF({ trigger_type: "", trigger_detail: "", decision: "pending", decision_by: "", decision_rationale: "", amount_involved: "", currency: "SGD", service_declined: false }); load(); }
    else setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not log STR decision.");
  }

  return (
    <>
      <PageHeader
        title="STR decisions"
        subtitle="Log every suspicious-transaction decision — mandatory even when you do NOT file."
        action={<button type="button" onClick={() => setOpen((o) => !o)} className="bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition text-sm">{open ? "Cancel" : "+ Log decision"}</button>}
      />

      {open && (
        <Card className="p-6 mb-6">
          {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={f.trigger_type} onChange={(e) => setF((s) => ({ ...s, trigger_type: e.target.value }))} placeholder="Trigger type (e.g. unusual transaction)" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.decision_by} onChange={(e) => setF((s) => ({ ...s, decision_by: e.target.value }))} placeholder="Decision by (name & role)" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <select value={f.decision} onChange={(e) => setF((s) => ({ ...s, decision: e.target.value }))} className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
              <option value="pending">Pending</option>
              <option value="filed">Filed</option>
              <option value="not_filed">Not filed</option>
              <option value="escalated">Escalated</option>
            </select>
            <input value={f.amount_involved} onChange={(e) => setF((s) => ({ ...s, amount_involved: e.target.value }))} placeholder="Amount involved (optional)" type="number" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          </div>
          <textarea value={f.trigger_detail} onChange={(e) => setF((s) => ({ ...s, trigger_detail: e.target.value }))} rows={2} placeholder="Trigger detail (min 20 chars)" className="w-full mb-3 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <textarea value={f.decision_rationale} onChange={(e) => setF((s) => ({ ...s, decision_rationale: e.target.value }))} rows={3} placeholder="Decision rationale (min 20 chars — required even if not filing)" className="w-full mb-3 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer mb-4">
            <input type="checkbox" checked={f.service_declined} onChange={(e) => setF((s) => ({ ...s, service_declined: e.target.checked }))} className="h-4 w-4 accent-[#10b981]" />
            Service declined
          </label>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
            Never tip off the client about an STR — tipping-off is a criminal offence (CDSA s.48A).
          </p>
          <button type="button" disabled={busy} onClick={submit} className="bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm">{busy ? "Saving…" : "Log & notarize decision"}</button>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : reports.length === 0 ? (
        <EmptyState title="No STR decisions logged" hint="Document each decision for your audit trail." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-[#64748b]"><tr><th className="text-left font-bold px-4 py-3">Trigger</th><th className="text-left font-bold px-4 py-3">Decision</th><th className="text-left font-bold px-4 py-3">By</th><th className="text-left font-bold px-4 py-3">Date</th><th className="text-left font-bold px-4 py-3">On-chain</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-[#f1f5f9]">
                  <td className="px-4 py-3 text-[#0f172a]">{r.trigger_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.decision} /></td>
                  <td className="px-4 py-3 text-[#475569]">{r.decision_by}</td>
                  <td className="px-4 py-3 text-[#475569]">{fmtDate(r.decision_date || r.created_at)}</td>
                  <td className="px-4 py-3"><NotarizationBadge txHash={r.blockchain_tx_hash} polygonscanUrl={r.polygonscan_url} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
