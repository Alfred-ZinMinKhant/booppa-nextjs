"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge, NotarizationBadge, EmptyState, fmtDate } from "@/components/csp/ui";

export default function NomineesPage() {
  const [nominees, setNominees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [assessId, setAssessId] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, any>>({ client_id: "", nominee_full_name: "", nominator_name: "", company_name: "", company_uen: "" });

  function load() {
    cspGet("nominees/directors").then((r) => {
      if (r.ok && Array.isArray(r.data)) setNominees(r.data);
      setLoading(false);
    });
    cspGet("clients").then((r) => { if (r.ok && Array.isArray(r.data)) setClients(r.data); });
  }
  useEffect(load, []);

  async function create() {
    setErr(null);
    if (!f.client_id) { setErr("Select the client this nominee acts for."); return; }
    if (!f.nominee_full_name || !f.nominator_name) { setErr("Nominee and nominator names are required."); return; }
    setBusy(true);
    const payload: Record<string, any> = { client_id: f.client_id, nominee_full_name: f.nominee_full_name, nominator_name: f.nominator_name };
    if (f.company_name) payload.company_name = f.company_name;
    if (f.company_uen) payload.company_uen = f.company_uen;
    const r = await cspSend("nominees/directors", "POST", payload);
    setBusy(false);
    if (r.ok) { setOpen(false); setF({ client_id: "", nominee_full_name: "", nominator_name: "", company_name: "", company_uen: "" }); load(); }
    else setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not register nominee.");
  }

  return (
    <>
      <PageHeader
        title="Nominee directors"
        subtitle="A fit-and-proper assessment is mandatory before a nominee can act (CSP Act s.15)."
        action={<button type="button" onClick={() => setOpen((o) => !o)} className="bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition text-sm">{open ? "Cancel" : "+ Register nominee"}</button>}
      />

      {open && (
        <Card className="p-6 mb-6">
          {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={f.client_id} onChange={(e) => setF((s) => ({ ...s, client_id: e.target.value }))} className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.legal_name}</option>)}
            </select>
            <input value={f.nominee_full_name} onChange={(e) => setF((s) => ({ ...s, nominee_full_name: e.target.value }))} placeholder="Nominee full name" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.nominator_name} onChange={(e) => setF((s) => ({ ...s, nominator_name: e.target.value }))} placeholder="Nominator name" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.company_name} onChange={(e) => setF((s) => ({ ...s, company_name: e.target.value }))} placeholder="Company name (optional)" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.company_uen} onChange={(e) => setF((s) => ({ ...s, company_uen: e.target.value }))} placeholder="Company UEN (optional)" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          </div>
          <button type="button" disabled={busy} onClick={create} className="mt-4 bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm">{busy ? "Saving…" : "Register nominee"}</button>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : nominees.length === 0 ? (
        <EmptyState title="No nominee directors registered" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-[#64748b]"><tr><th className="text-left font-bold px-4 py-3">Nominee</th><th className="text-left font-bold px-4 py-3">Nominator</th><th className="text-left font-bold px-4 py-3">Assessment</th><th className="text-left font-bold px-4 py-3">Next review</th><th className="text-left font-bold px-4 py-3">On-chain</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {nominees.map((n) => (
                <tr key={n.id} className="border-t border-[#f1f5f9]">
                  <td className="px-4 py-3 font-semibold text-[#0f172a]">{n.nominee_full_name}</td>
                  <td className="px-4 py-3 text-[#475569]">{n.nominator_name}</td>
                  <td className="px-4 py-3"><StatusBadge status={n.assessment_status} /></td>
                  <td className="px-4 py-3 text-[#475569]">{fmtDate(n.next_review)}</td>
                  <td className="px-4 py-3"><NotarizationBadge txHash={n.blockchain_tx_hash} polygonscanUrl={null} /></td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setAssessId(assessId === n.id ? null : n.id)} className="text-sm font-bold text-[#10b981] hover:underline">Assess</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assessId && <AssessForm nomineeId={assessId} onDone={() => { setAssessId(null); load(); }} />}
        </Card>
      )}
    </>
  );
}

function AssessForm({ nomineeId, onDone }: { nomineeId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, any>>({
    result: "fit_proper",
    assessed_by: "",
    assessment_outcome: "",
    criminal_check_done: false,
    bankruptcy_check_done: false,
    director_history_check: false,
    assessment_notes: "",
  });

  async function submit() {
    setErr(null);
    if (!f.assessed_by.trim()) { setErr("Assessed-by name is required."); return; }
    if (!f.assessment_outcome.trim()) { setErr("Assessment outcome is required."); return; }
    setBusy(true);
    const r = await cspSend(`nominees/directors/${nomineeId}/assess`, "POST", f);
    setBusy(false);
    if (r.ok) onDone(); else setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not record assessment.");
  }

  return (
    <div className="border-t border-[#e2e8f0] bg-[#f8fafc] p-5">
      <p className="font-bold text-[#0f172a] mb-3">Fit-and-proper assessment</p>
      {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={f.result} onChange={(e) => setF((s) => ({ ...s, result: e.target.value }))} className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
          <option value="fit_proper">Fit & proper</option>
          <option value="not_fit">Not fit</option>
          <option value="under_review">Under review</option>
        </select>
        <input value={f.assessed_by} onChange={(e) => setF((s) => ({ ...s, assessed_by: e.target.value }))} placeholder="Assessed by" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
        <input value={f.assessment_outcome} onChange={(e) => setF((s) => ({ ...s, assessment_outcome: e.target.value }))} placeholder="Outcome summary" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a] sm:col-span-2" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[["criminal_check_done", "Criminal check"], ["bankruptcy_check_done", "Bankruptcy check"], ["director_history_check", "Director history check"]].map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
            <input type="checkbox" checked={!!f[k]} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.checked }))} className="h-4 w-4 accent-[#10b981]" />
            {label}
          </label>
        ))}
      </div>
      <button type="button" disabled={busy} onClick={submit} className="mt-4 bg-[#0f172a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50 text-sm">{busy ? "Saving…" : "Record assessment"}</button>
    </div>
  );
}
