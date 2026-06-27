"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge, NotarizationBadge, EmptyState, fmtDate } from "@/components/csp/ui";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveId, setApproveId] = useState<string | null>(null);

  function load() {
    cspGet("documents").then((r) => { if (r.ok && Array.isArray(r.data)) setDocs(r.data); setLoading(false); });
  }
  useEffect(load, []);

  return (
    <>
      <PageHeader title="AML/CFT documents" subtitle="Your 8 programme documents. Each must be approved with a 3-part attestation before evidentiary use." />
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : docs.length === 0 ? (
        <EmptyState title="Documents are generating" hint="Your 8 AML/CFT documents are produced after profile creation (~10 minutes). Refresh shortly." />
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#0f172a]">AML/CFT Programme v{d.version}</h3>
                    <StatusBadge status={d.status} />
                    {d.is_current && <span className="text-[10px] font-black text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">CURRENT</span>}
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Generated {fmtDate(d.generated_at)}
                    {d.approved_by ? ` · approved by ${d.approved_by} (${fmtDate(d.approved_at)})` : ""}
                  </p>
                  <div className="mt-2"><NotarizationBadge txHash={d.blockchain_tx} polygonscanUrl={d.polygonscan} /></div>
                </div>
                {d.requires_attestation && (
                  <button type="button" onClick={() => setApproveId(approveId === d.id ? null : d.id)} className="flex-shrink-0 bg-[#10b981] text-white font-bold px-4 py-2 rounded-xl hover:bg-[#059669] transition text-xs">
                    {approveId === d.id ? "Cancel" : "Approve"}
                  </button>
                )}
              </div>
              {approveId === d.id && <ApproveForm programmeId={d.id} onDone={() => { setApproveId(null); load(); }} />}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function ApproveForm({ programmeId, onDone }: { programmeId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [by, setBy] = useState("");
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);

  async function submit() {
    setErr(null);
    if (!by.trim()) { setErr("Approver name & role is required."); return; }
    if (!(d1 && d2 && d3)) { setErr("All three declarations must be confirmed."); return; }
    setBusy(true);
    const r = await cspSend(`documents/${programmeId}/approve`, "POST", {
      approved_by: by,
      declaration_content_accurate: d1,
      declaration_legal_advice_considered: d2,
      declaration_sole_responsible: d3,
    });
    setBusy(false);
    if (r.ok) onDone(); else setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not approve.");
  }

  return (
    <div className="mt-4 border-t border-[#e2e8f0] pt-4">
      {err && <p className="text-sm text-red-600 font-semibold mb-3">{err}</p>}
      <input value={by} onChange={(e) => setBy(e.target.value)} placeholder="Approved by (name & role)" className="w-full mb-3 px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]" />
      <div className="space-y-2">
        <Decl checked={d1} onChange={setD1} text="I have personally verified the content accurately reflects my CSP's operating procedures." />
        <Decl checked={d2} onChange={setD2} text="I have considered AML/CFT legal advice, or deem specialist advice unnecessary for this document." />
        <Decl checked={d3} onChange={setD3} text="My CSP remains solely responsible for regulatory compliance; approval does not transfer that responsibility to Booppa." />
      </div>
      <button type="button" disabled={busy} onClick={submit} className="mt-4 bg-[#0f172a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50 text-sm">{busy ? "Approving…" : "Approve & notarize"}</button>
    </div>
  );
}

function Decl({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
  return (
    <label className="flex gap-2 items-start text-sm text-[#475569] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#10b981]" />
      {text}
    </label>
  );
}
