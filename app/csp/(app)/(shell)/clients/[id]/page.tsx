"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, RiskBadge, StatusBadge, NotarizationBadge, fmtDate, EmptyState } from "@/components/csp/ui";

export default function ClientDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const [client, setClient] = useState<any>(null);
  const [cdd, setCdd] = useState<any[]>([]);
  const [ubos, setUbos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [c, h, u] = await Promise.all([
      cspGet(`clients/${id}`),
      cspGet(`clients/${id}/cdd`),
      cspGet(`clients/${id}/ubos`),
    ]);
    if (c.ok) setClient(c.data);
    if (h.ok && Array.isArray(h.data)) setCdd(h.data);
    if (u.ok && Array.isArray(u.data)) setUbos(u.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <p className="text-sm text-[#64748b]">Loading client…</p>;
  if (!client) return <EmptyState title="Client not found" />;

  return (
    <>
      <PageHeader
        title={client.legal_name}
        subtitle={`${String(client.client_type || "").replace("_", " ")}${client.uen_or_reg_no ? ` · ${client.uen_or_reg_no}` : ""}`}
        action={<RiskBadge rating={client.risk_rating} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Mini label="CDD status"><StatusBadge status={client.cdd_status} /></Mini>
        <Mini label="Next review">{fmtDate(client.cdd_next_review)}</Mini>
        <Mini label="PEP">{client.is_pep ? "Yes" : "No"}</Mini>
        <Mini label="Sanctions">{client.sanctions_clear === false ? "HIT" : client.sanctions_clear === true ? "Clear" : "Not screened"}</Mini>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskSection id={id} onDone={reload} />
        <SanctionsSection id={id} client={client} onDone={reload} />
      </div>

      <CddSection id={id} client={client} records={cdd} onDone={reload} />
      <UboSection id={id} ubos={ubos} onDone={reload} />
    </>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-3">
      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-[#0f172a] mt-1">{children}</p>
    </div>
  );
}

// ── Risk classification (notarized) ──────────────────────────────────────────
function RiskSection({ id, onDone }: { id: string; onDone: () => void }) {
  const [rating, setRating] = useState("low");
  const [rationale, setRationale] = useState("");
  const [by, setBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (rationale.trim().length < 20) { setErr("Rationale must be at least 20 characters (mandatory audit trail)."); return; }
    if (!by.trim()) { setErr("Classified-by name is required."); return; }
    setBusy(true);
    const r = await cspSend(`clients/${id}/risk`, "PATCH", { risk_rating: rating, risk_rationale: rationale, classified_by: by });
    setBusy(false);
    if (r.ok) { setRationale(""); onDone(); } else { setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not update risk."); }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-[#0f172a] mb-1">Risk classification</h2>
      <p className="text-xs text-[#64748b] mb-4">Every change is notarized on Polygon as a customer-input audit.</p>
      {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
      <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full mb-3 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="very_high">Very high</option>
      </select>
      <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Rationale (min 20 chars)…" rows={3} className="w-full mb-1 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
      <p className="text-xs text-[#94a3b8] mb-3">{rationale.trim().length}/20</p>
      <input value={by} onChange={(e) => setBy(e.target.value)} placeholder="Classified by (name & role)" className="w-full mb-3 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
      <button type="button" disabled={busy} onClick={submit} className="w-full bg-[#0f172a] text-white font-bold py-2.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50 text-sm">
        {busy ? "Saving…" : "Update & notarize risk"}
      </button>
    </Card>
  );
}

// ── Sanctions screening (async poll) ─────────────────────────────────────────
function SanctionsSection({ id, client, onDone }: { id: string; client: any; onDone: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function screen() {
    setBusy(true);
    setResult(null);
    const r = await cspSend(`clients/${id}/sanctions/screen`, "POST");
    if (!r.ok || !r.data?.task_id) { setBusy(false); setStatus("error"); return; }
    const taskId = r.data.task_id;
    setStatus("pending");
    // Poll the result for up to ~30s.
    for (const ms of [1500, 2000, 2500, 3000, 4000, 5000, 6000, 6000]) {
      await new Promise((res) => setTimeout(res, ms));
      const p = await cspGet(`clients/${id}/sanctions/result?task_id=${encodeURIComponent(taskId)}`);
      if (p.ok && (p.data?.status === "completed" || p.data?.status === "failed" || p.data?.status === "unknown")) {
        setStatus(p.data.status);
        setResult(p.data);
        break;
      }
    }
    setBusy(false);
    onDone();
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-[#0f172a] mb-1">Sanctions screening</h2>
      <p className="text-xs text-[#64748b] mb-4">Screens against MAS, OFAC, UN, EU lists. A hit auto-escalates to very-high risk + EDD.</p>
      <div className="text-sm text-[#475569] mb-4">
        Last result:{" "}
        {client.sanctions_clear === false ? <span className="text-red-600 font-bold">HIT</span>
          : client.sanctions_clear === true ? <span className="text-[#10b981] font-bold">Clear</span>
          : <span className="text-[#94a3b8]">not screened</span>}
        {client.sanctions_screened_at && <span className="text-xs text-[#94a3b8]"> · {fmtDate(client.sanctions_screened_at)}</span>}
      </div>
      {status === "pending" && <p className="text-xs text-amber-600 font-semibold mb-3">Screening in progress…</p>}
      {result && (
        <pre className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 mb-3 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
      <button type="button" disabled={busy} onClick={screen} className="w-full bg-[#0f172a] text-white font-bold py-2.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50 text-sm">
        {busy ? "Screening…" : "Run sanctions screening"}
      </button>
    </Card>
  );
}

// ── CDD ──────────────────────────────────────────────────────────────────────
function CddSection({ id, client, records, onDone }: { id: string; client: any; records: any[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, any>>({
    review_type: "initial",
    completed_by: "",
    business_purpose: "",
    source_of_funds: "",
    id_doc_verified: false,
    corp_registration_verified: false,
    sanctions_screened: false,
    pep_screening_done: false,
    adverse_media_checked: false,
    video_call_completed: false,
  });

  async function submit() {
    setErr(null);
    setBusy(true);
    const payload = { ...f, non_face_to_face: !!client.is_remote_onboarding };
    const r = await cspSend(`clients/${id}/cdd`, "POST", payload);
    setBusy(false);
    if (r.ok) { setOpen(false); onDone(); } else { setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not submit CDD."); }
  }

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">CDD history</h2>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm font-bold text-[#10b981] hover:underline">
          {open ? "Cancel" : "+ Submit CDD"}
        </button>
      </div>

      {open && (
        <div className="mb-6 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
          {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
          {client.is_remote_onboarding && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
              Remote onboarding: a completed video call is required (CSP Regulations 2025 s.20).
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={f.review_type} onChange={(e) => setF((s) => ({ ...s, review_type: e.target.value }))} className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
              <option value="initial">Initial</option>
              <option value="periodic">Periodic</option>
              <option value="triggered">Triggered</option>
              <option value="offboarding">Offboarding</option>
            </select>
            <input value={f.completed_by} onChange={(e) => setF((s) => ({ ...s, completed_by: e.target.value }))} placeholder="Completed by" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.business_purpose} onChange={(e) => setF((s) => ({ ...s, business_purpose: e.target.value }))} placeholder="Business purpose" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
            <input value={f.source_of_funds} onChange={(e) => setF((s) => ({ ...s, source_of_funds: e.target.value }))} placeholder="Source of funds" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              ["id_doc_verified", "ID document verified"],
              ["corp_registration_verified", "Corp registration verified"],
              ["sanctions_screened", "Sanctions screened"],
              ["pep_screening_done", "PEP screening done"],
              ["adverse_media_checked", "Adverse media checked"],
              ["video_call_completed", "Video call completed"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
                <input type="checkbox" checked={!!f[k]} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.checked }))} className="h-4 w-4 accent-[#10b981]" />
                {label}
              </label>
            ))}
          </div>
          <p className="text-xs text-[#94a3b8] mt-2">To complete CDD, set a verification (ID or corp registration) and fill &quot;completed by&quot;.</p>
          <button type="button" disabled={busy} onClick={submit} className="mt-4 bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm">
            {busy ? "Submitting…" : "Submit CDD"}
          </button>
        </div>
      )}

      {records.length === 0 ? (
        <p className="text-sm text-[#64748b]">No CDD records yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-[#64748b]">
            <tr><th className="text-left font-bold py-2">Type</th><th className="text-left font-bold py-2">Status</th><th className="text-left font-bold py-2">By</th><th className="text-left font-bold py-2">Date</th><th className="text-left font-bold py-2">On-chain</th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t border-[#f1f5f9]">
                <td className="py-2 capitalize">{r.review_type}</td>
                <td className="py-2"><StatusBadge status={r.status} /></td>
                <td className="py-2 text-[#475569]">{r.completed_by || "—"}</td>
                <td className="py-2 text-[#475569]">{fmtDate(r.completed_at || r.created_at)}</td>
                <td className="py-2"><NotarizationBadge txHash={r.blockchain_tx_hash} polygonscanUrl={r.polygonscan_url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ── UBOs ─────────────────────────────────────────────────────────────────────
function UboSection({ id, ubos, onDone }: { id: string; ubos: any[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<Record<string, any>>({ ubo_full_name: "", ubo_nationality: "", ownership_percentage: "", control_mechanism: "", is_pep: false });

  async function submit() {
    setBusy(true);
    const payload: Record<string, any> = { client_id: id, ubo_full_name: f.ubo_full_name, is_pep: !!f.is_pep };
    if (f.ubo_nationality) payload.ubo_nationality = f.ubo_nationality;
    if (f.control_mechanism) payload.control_mechanism = f.control_mechanism;
    if (f.ownership_percentage) payload.ownership_percentage = parseFloat(f.ownership_percentage);
    const r = await cspSend(`clients/${id}/ubos`, "POST", payload);
    setBusy(false);
    if (r.ok) { setOpen(false); setF({ ubo_full_name: "", ubo_nationality: "", ownership_percentage: "", control_mechanism: "", is_pep: false }); onDone(); }
  }

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">Beneficial owners (≥25%)</h2>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm font-bold text-[#10b981] hover:underline">{open ? "Cancel" : "+ Add UBO"}</button>
      </div>
      {open && (
        <div className="mb-6 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={f.ubo_full_name} onChange={(e) => setF((s) => ({ ...s, ubo_full_name: e.target.value }))} placeholder="Full name" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <input value={f.ubo_nationality} onChange={(e) => setF((s) => ({ ...s, ubo_nationality: e.target.value }))} placeholder="Nationality" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <input value={f.ownership_percentage} onChange={(e) => setF((s) => ({ ...s, ownership_percentage: e.target.value }))} placeholder="Ownership %" type="number" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <input value={f.control_mechanism} onChange={(e) => setF((s) => ({ ...s, control_mechanism: e.target.value }))} placeholder="Control mechanism" className="px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
          <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer"><input type="checkbox" checked={f.is_pep} onChange={(e) => setF((s) => ({ ...s, is_pep: e.target.checked }))} className="h-4 w-4 accent-[#10b981]" />PEP</label>
          <div className="sm:col-span-2">
            <button type="button" disabled={busy || !f.ubo_full_name} onClick={submit} className="bg-[#10b981] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm">{busy ? "Adding…" : "Add UBO"}</button>
          </div>
        </div>
      )}
      {ubos.length === 0 ? (
        <p className="text-sm text-[#64748b]">No beneficial owners recorded.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-[#64748b]"><tr><th className="text-left font-bold py-2">Name</th><th className="text-left font-bold py-2">Ownership</th><th className="text-left font-bold py-2">PEP</th><th className="text-left font-bold py-2">Verified</th><th className="text-left font-bold py-2">On-chain</th></tr></thead>
          <tbody>
            {ubos.map((u) => (
              <tr key={u.id} className="border-t border-[#f1f5f9]">
                <td className="py-2 font-semibold text-[#0f172a]">{u.ubo_full_name}</td>
                <td className="py-2 text-[#475569]">{u.ownership_percentage != null ? `${u.ownership_percentage}%` : "—"}</td>
                <td className="py-2">{u.is_pep ? "Yes" : "No"}</td>
                <td className="py-2">{u.identity_verified ? "Yes" : "No"}</td>
                <td className="py-2"><NotarizationBadge txHash={u.blockchain_tx_hash} polygonscanUrl={null} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
