"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge, NotarizationBadge, EmptyState, fmtDate } from "@/components/csp/ui";

export default function TrainingPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, any>>({
    staff_name: "", staff_role: "", is_rqi: false,
    training_type: "", training_title: "", provider: "",
    completion_date: "",
  });

  function load() {
    cspGet("training").then((r) => { if (r.ok && Array.isArray(r.data)) setRecords(r.data); setLoading(false); });
  }
  useEffect(load, []);

  async function submit() {
    setErr(null);
    if (!f.staff_name || !f.staff_role || !f.training_type || !f.training_title || !f.provider) {
      setErr("Staff name, role, training type, title and provider are required."); return;
    }
    setBusy(true);
    const payload: Record<string, any> = {
      staff_name: f.staff_name, staff_role: f.staff_role, is_rqi: !!f.is_rqi,
      training_type: f.training_type, training_title: f.training_title, provider: f.provider,
    };
    if (f.completion_date) payload.completion_date = new Date(f.completion_date).toISOString();
    const r = await cspSend("training", "POST", payload);
    setBusy(false);
    if (r.ok) { setOpen(false); setF({ staff_name: "", staff_role: "", is_rqi: false, training_type: "", training_title: "", provider: "", completion_date: "" }); load(); }
    else setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not log training.");
  }

  return (
    <>
      <PageHeader
        title="Staff training"
        subtitle="AML/CFT training records for the RQI and all staff."
        action={<button type="button" onClick={() => setOpen((o) => !o)} className="bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition text-sm">{open ? "Cancel" : "+ Log training"}</button>}
      />

      {open && (
        <Card className="p-6 mb-6">
          {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={f.staff_name} onChange={(e) => setF((s) => ({ ...s, staff_name: e.target.value }))} placeholder="Staff name" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.staff_role} onChange={(e) => setF((s) => ({ ...s, staff_role: e.target.value }))} placeholder="Staff role" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.training_type} onChange={(e) => setF((s) => ({ ...s, training_type: e.target.value }))} placeholder="Training type (e.g. AML refresher)" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.training_title} onChange={(e) => setF((s) => ({ ...s, training_title: e.target.value }))} placeholder="Training title" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.provider} onChange={(e) => setF((s) => ({ ...s, provider: e.target.value }))} placeholder="Provider" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Completion date</label>
              <input type="date" value={f.completion_date} onChange={(e) => setF((s) => ({ ...s, completion_date: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer mt-3">
            <input type="checkbox" checked={f.is_rqi} onChange={(e) => setF((s) => ({ ...s, is_rqi: e.target.checked }))} className="h-4 w-4 accent-[#10b981]" />
            This is the Registered Qualified Individual (RQI)
          </label>
          <button type="button" disabled={busy} onClick={submit} className="mt-4 bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm">{busy ? "Saving…" : "Log training"}</button>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : records.length === 0 ? (
        <EmptyState title="No training records yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-[#64748b]"><tr><th className="text-left font-bold px-4 py-3">Staff</th><th className="text-left font-bold px-4 py-3">Title</th><th className="text-left font-bold px-4 py-3">Provider</th><th className="text-left font-bold px-4 py-3">Status</th><th className="text-left font-bold px-4 py-3">Completed</th><th className="text-left font-bold px-4 py-3">On-chain</th></tr></thead>
            <tbody>
              {records.map((t) => (
                <tr key={t.id} className="border-t border-[#f1f5f9]">
                  <td className="px-4 py-3"><span className="font-semibold text-[#0f172a]">{t.staff_name}</span>{t.is_rqi && <span className="ml-2 text-[10px] font-black text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">RQI</span>}<span className="block text-xs text-[#94a3b8]">{t.staff_role}</span></td>
                  <td className="px-4 py-3 text-[#475569]">{t.training_title}</td>
                  <td className="px-4 py-3 text-[#475569]">{t.provider}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-[#475569]">{fmtDate(t.completion_date)}</td>
                  <td className="px-4 py-3"><NotarizationBadge txHash={t.blockchain_tx_hash} polygonscanUrl={null} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
