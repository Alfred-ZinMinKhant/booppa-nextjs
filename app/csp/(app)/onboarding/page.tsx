"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cspGet, cspSend } from "@/lib/cspClient";

interface Tos {
  version: string;
  clauses: Record<string, string>;
  liability_cap_explanation: string;
}

// Clause key → checkbox field + short English label. Order matches the backend.
const CLAUSES: { key: string; field: string; label: string }[] = [
  { key: "ai_disclaimer", field: "checkbox_ai_disclaimer", label: "AI-generated content disclaimer" },
  { key: "data_accuracy", field: "checkbox_data_accuracy", label: "Data accuracy is my responsibility" },
  { key: "sanctions_limitation", field: "checkbox_sanctions_limitation", label: "Sanctions screening limitation" },
  { key: "regulatory_change", field: "checkbox_regulatory_change", label: "Regulatory-change risk" },
  { key: "liability_cap", field: "checkbox_liability_cap", label: "Limitation of liability (cap)" },
];

const SERVICES = [
  { field: "offers_company_formation", label: "Company formation" },
  { field: "offers_nominee_director", label: "Nominee director" },
  { field: "offers_nominee_shareholder", label: "Nominee shareholder" },
  { field: "offers_registered_address", label: "Registered address" },
  { field: "offers_corp_secretarial", label: "Corporate secretarial" },
  { field: "offers_shelf_company", label: "Shelf company" },
];

export default function CspOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [tos, setTos] = useState<Tos | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState<Record<string, any>>({
    legal_name: "",
    uen: "",
    registered_address: "",
    business_email: "",
    business_phone: "",
    rqi_name: "",
    rqi_qualification: "",
    aml_compliance_officer: "",
  });
  const [services, setServices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    cspGet<Tos>("tos").then((r) => {
      if (r.ok) setTos(r.data);
    });
  }, []);

  const allChecked = CLAUSES.every((c) => checks[c.field]);

  async function acceptTos() {
    setError(null);
    if (!allChecked) {
      setError("Please confirm all five clauses to continue.");
      return;
    }
    setBusy(true);
    const r = await cspSend("tos/accept", "POST", {
      tos_version: tos?.version || "1.0",
      checkbox_ai_disclaimer: true,
      checkbox_data_accuracy: true,
      checkbox_sanctions_limitation: true,
      checkbox_regulatory_change: true,
      checkbox_liability_cap: true,
    });
    setBusy(false);
    if (r.ok) {
      setStep(2);
    } else {
      setError(typeof r.data?.detail === "string" ? r.data.detail : "Could not record acceptance. Please try again.");
    }
  }

  async function createProfile() {
    setError(null);
    if (!profile.legal_name || profile.legal_name.length < 2) {
      setError("Legal name is required.");
      return;
    }
    if (!profile.uen || profile.uen.length < 9) {
      setError("A valid UEN (min 9 characters) is required.");
      return;
    }
    setBusy(true);
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(profile)) {
      if (v !== "" && v != null) payload[k] = v;
    }
    for (const s of SERVICES) payload[s.field] = !!services[s.field];
    const r = await cspSend("profile", "POST", payload);
    setBusy(false);
    if (r.ok || r.status === 409) {
      router.push("/csp/dashboard");
    } else {
      setError(typeof r.data?.detail === "string" ? r.data.detail : "Could not create profile. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0f172a]">Set up your CSP Compliance Pack</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Step {step} of 2 — {step === 1 ? "accept the Terms of Service" : "create your compliance profile"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-semibold">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            {!tos ? (
              <p className="text-sm text-[#64748b]">Loading terms…</p>
            ) : (
              <>
                <p className="text-sm text-[#64748b] mb-4">
                  You must confirm each clause individually before generating any compliance documents.
                </p>
                <div className="space-y-4">
                  {CLAUSES.map((c) => (
                    <label key={c.field} className="flex gap-3 items-start cursor-pointer bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                      <input
                        type="checkbox"
                        checked={!!checks[c.field]}
                        onChange={(e) => setChecks((s) => ({ ...s, [c.field]: e.target.checked }))}
                        className="mt-1 h-4 w-4 flex-shrink-0 accent-[#10b981]"
                      />
                      <span>
                        <span className="block text-sm font-bold text-[#0f172a]">{c.label}</span>
                        <span className="block text-xs text-[#64748b] mt-1 leading-relaxed">{tos.clauses?.[c.key]}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[#94a3b8] mt-4 leading-relaxed">{tos.liability_cap_explanation}</p>
                <button
                  type="button"
                  disabled={busy || !allChecked}
                  onClick={acceptTos}
                  className="mt-6 w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50"
                >
                  {busy ? "Recording…" : "Accept & Continue →"}
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Legal name *" value={profile.legal_name} onChange={(v) => setProfile((p) => ({ ...p, legal_name: v }))} />
              <Field label="UEN *" value={profile.uen} onChange={(v) => setProfile((p) => ({ ...p, uen: v }))} />
              <Field label="Business email" type="email" value={profile.business_email} onChange={(v) => setProfile((p) => ({ ...p, business_email: v }))} />
              <Field label="Business phone" value={profile.business_phone} onChange={(v) => setProfile((p) => ({ ...p, business_phone: v }))} />
              <div className="sm:col-span-2">
                <Field label="Registered address" value={profile.registered_address} onChange={(v) => setProfile((p) => ({ ...p, registered_address: v }))} />
              </div>
              <Field label="RQI name" value={profile.rqi_name} onChange={(v) => setProfile((p) => ({ ...p, rqi_name: v }))} />
              <Field label="RQI qualification" value={profile.rqi_qualification} onChange={(v) => setProfile((p) => ({ ...p, rqi_qualification: v }))} />
              <div className="sm:col-span-2">
                <Field label="AML compliance officer" value={profile.aml_compliance_officer} onChange={(v) => setProfile((p) => ({ ...p, aml_compliance_officer: v }))} />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2">Services offered</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((s) => (
                  <label key={s.field} className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!services[s.field]}
                      onChange={(e) => setServices((st) => ({ ...st, [s.field]: e.target.checked }))}
                      className="h-4 w-4 accent-[#10b981]"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={createProfile}
              className="mt-6 w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create profile & generate documents →"}
            </button>
            <p className="text-xs text-[#94a3b8] mt-3 text-center">
              Your compliance calendar is seeded with 15 regulatory deadlines and your 8 AML/CFT
              documents start generating (~10 minutes).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
      />
    </div>
  );
}
