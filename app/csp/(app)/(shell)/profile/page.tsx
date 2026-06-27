"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge } from "@/components/csp/ui";

const ACRA_STATUSES = ["not_started", "in_progress", "submitted", "approved", "rejected"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, any>>({});

  function load() {
    cspGet("profile").then((r) => {
      if (r.ok) {
        setProfile(r.data);
        setEdit({
          acra_reg_status: String(r.data.acra_reg_status || "").replace(/.*\./, "") || "not_started",
          acra_reg_number: r.data.acra_reg_number || "",
          rqi_name: r.data.rqi_name || "",
          rqi_qualification: r.data.rqi_qualification || "",
          aml_compliance_officer: r.data.aml_compliance_officer || "",
          business_email: r.data.business_email || "",
          business_phone: r.data.business_phone || "",
          registered_address: r.data.registered_address || "",
        });
      }
      setLoading(false);
    });
  }
  useEffect(load, []);

  async function save() {
    setMsg(null); setErr(null); setBusy(true);
    const r = await cspSend("profile", "PATCH", edit);
    setBusy(false);
    if (r.ok) { setMsg("Profile updated."); load(); } else { setErr(typeof r.data?.detail === "string" ? r.data.detail : "Could not update profile."); }
  }

  if (loading) return <p className="text-sm text-[#64748b]">Loading profile…</p>;
  if (!profile) return <p className="text-sm text-[#64748b]">Profile not found.</p>;

  return (
    <>
      <PageHeader
        title={profile.legal_name}
        subtitle={`UEN ${profile.uen} · pack tier: ${profile.csp_pack_tier || "full"}`}
        action={<StatusBadge status={profile.acra_reg_status} />}
      />

      {msg && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-semibold">{msg}</div>}
      {err && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">{err}</div>}

      <Card className="p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>ACRA registration status</Label>
            <select value={edit.acra_reg_status} onChange={(e) => setEdit((s) => ({ ...s, acra_reg_status: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-sm text-[#0f172a]">
              {ACRA_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <Input label="ACRA registration number" value={edit.acra_reg_number} onChange={(v) => setEdit((s) => ({ ...s, acra_reg_number: v }))} />
          <Input label="RQI name" value={edit.rqi_name} onChange={(v) => setEdit((s) => ({ ...s, rqi_name: v }))} />
          <Input label="RQI qualification" value={edit.rqi_qualification} onChange={(v) => setEdit((s) => ({ ...s, rqi_qualification: v }))} />
          <Input label="AML compliance officer" value={edit.aml_compliance_officer} onChange={(v) => setEdit((s) => ({ ...s, aml_compliance_officer: v }))} />
          <Input label="Business email" type="email" value={edit.business_email} onChange={(v) => setEdit((s) => ({ ...s, business_email: v }))} />
          <Input label="Business phone" value={edit.business_phone} onChange={(v) => setEdit((s) => ({ ...s, business_phone: v }))} />
          <div className="sm:col-span-2">
            <Input label="Registered address" value={edit.registered_address} onChange={(v) => setEdit((s) => ({ ...s, registered_address: v }))} />
          </div>
        </div>
        <button type="button" disabled={busy} onClick={save} className="mt-6 bg-[#10b981] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#059669] transition disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
      </Card>

      <Card className="p-6 max-w-2xl mt-6">
        <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Services offered</p>
        <div className="flex flex-wrap gap-2">
          {(profile.services || []).length === 0 ? (
            <span className="text-sm text-[#64748b]">None recorded.</span>
          ) : (
            (profile.services || []).map((s: string) => (
              <span key={s} className="text-xs font-semibold bg-[#f1f5f9] text-[#475569] px-2.5 py-1 rounded-full">{s}</span>
            ))
          )}
        </div>
      </Card>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">{children}</label>;
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]" />
    </div>
  );
}
