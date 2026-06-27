"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cspSend } from "@/lib/cspClient";
import { PageHeader, Card } from "@/components/csp/ui";

export default function NewClientPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({
    client_type: "company",
    legal_name: "",
    uen_or_reg_no: "",
    country_of_inc: "",
    registered_address: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    is_remote_onboarding: false,
    has_nominee_director: false,
    has_nominee_shareholder: false,
  });

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    if (!form.legal_name || form.legal_name.length < 2) {
      setError("Legal name is required.");
      return;
    }
    setBusy(true);
    const payload: Record<string, any> = { ...form, services_provided: [] };
    for (const k of ["uen_or_reg_no", "country_of_inc", "registered_address", "contact_name", "contact_email", "contact_phone"]) {
      if (!payload[k]) delete payload[k];
    }
    const r = await cspSend("clients", "POST", payload);
    setBusy(false);
    if (r.ok && r.data?.client_id) {
      router.push(`/csp/clients/${r.data.client_id}`);
    } else {
      setError(typeof r.data?.detail === "string" ? r.data.detail : "Could not register client.");
    }
  }

  return (
    <>
      <PageHeader title="New client" subtitle="CDD is required before providing any service." />
      <Card className="p-6 max-w-2xl">
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Client type</Label>
            <select value={form.client_type} onChange={(e) => set("client_type", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]">
              <option value="company">Company</option>
              <option value="individual">Individual</option>
              <option value="llp">LLP</option>
              <option value="foreign_co">Foreign company</option>
            </select>
          </div>
          <Input label="Legal name *" value={form.legal_name} onChange={(v) => set("legal_name", v)} />
          <Input label="UEN / reg. no" value={form.uen_or_reg_no} onChange={(v) => set("uen_or_reg_no", v)} />
          <Input label="Country of incorporation" value={form.country_of_inc} onChange={(v) => set("country_of_inc", v)} />
          <div className="sm:col-span-2">
            <Input label="Registered address" value={form.registered_address} onChange={(v) => set("registered_address", v)} />
          </div>
          <Input label="Contact name" value={form.contact_name} onChange={(v) => set("contact_name", v)} />
          <Input label="Contact email" type="email" value={form.contact_email} onChange={(v) => set("contact_email", v)} />
          <Input label="Contact phone" value={form.contact_phone} onChange={(v) => set("contact_phone", v)} />
        </div>

        <div className="mt-5 space-y-2">
          <Check label="Remote (non-face-to-face) onboarding — video call required at CDD" checked={form.is_remote_onboarding} onChange={(v) => set("is_remote_onboarding", v)} />
          <Check label="Has nominee director" checked={form.has_nominee_director} onChange={(v) => set("has_nominee_director", v)} />
          <Check label="Has nominee shareholder" checked={form.has_nominee_shareholder} onChange={(v) => set("has_nominee_shareholder", v)} />
        </div>

        <button type="button" disabled={busy} onClick={submit} className="mt-6 w-full bg-[#10b981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] transition disabled:opacity-50">
          {busy ? "Registering…" : "Register client →"}
        </button>
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
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#10b981]" />
      {label}
    </label>
  );
}
