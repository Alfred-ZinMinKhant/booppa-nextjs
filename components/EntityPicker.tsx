"use client";

/**
 * Order-time subject picker for accounts that manage client companies (CSP / DPO).
 *
 * The problem this exists to solve: for these accounts the logged-in company is the
 * firm doing the compliance work, never the company being assessed. Prefilling the
 * order from `auth/me` produces a certificate about the wrong legal person that
 * looks entirely correct — so when the account has managed entities, the subject is
 * chosen from that list, and the choice travels to checkout as `managed_entity_id`
 * rather than as a typed name the backend has to re-guess.
 *
 * Adding a company here goes through POST /managed-entities, which verifies against
 * ACRA at entry. A contradicted UEN comes back 422 and is shown in place, while the
 * customer is still looking at the field. The same typo caught after payment is a
 * wrong-entity certificate.
 *
 * Renders nothing when the account has no managed entities — vendors assessing
 * themselves keep the existing free-text flow untouched.
 */

import { useEffect, useState } from "react";
import {
  ManagedEntity,
  createManagedEntity,
  entityLabel,
  listManagedEntities,
} from "@/lib/managedEntities";

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#059669] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
      ✓ ACRA verified
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"
      title="No registry match. Reports for this company will read “Not verified” rather than naming a legal entity."
    >
      Not verified
    </span>
  );
}

export default function EntityPicker({
  selected,
  onSelect,
  label = "Which company is this report about?",
}: {
  selected: ManagedEntity | null;
  onSelect: (e: ManagedEntity | null) => void;
  label?: string;
}) {
  const [entities, setEntities] = useState<ManagedEntity[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company_name: "", uen: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listManagedEntities()
      .then(setEntities)
      .finally(() => setLoaded(true));
  }, []);

  // An account with no managed entities is a self-assessing vendor. Showing an
  // empty dropdown there would invent a decision the customer doesn't have.
  if (!loaded || (entities.length === 0 && !adding)) return null;

  async function add() {
    const name = form.company_name.trim();
    if (!name) {
      setError("Company name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const entity = await createManagedEntity({
        company_name: name,
        uen: form.uen.trim() || undefined,
        website: form.website.trim() || undefined,
      });
      setEntities((prev) => [...prev, entity]);
      onSelect(entity);
      setAdding(false);
      setForm({ company_name: "", uen: "", website: "" });
    } catch (e: any) {
      // Shown verbatim: the backend's 422 names the conflicting registration, and
      // "that UEN belongs to <other company>" is the entire point of the message.
      setError(e?.message || "Could not add this company.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
        {label}
      </label>

      {!adding && (
        <>
          <select
            value={selected?.id || ""}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setAdding(true);
                setError(null);
                return;
              }
              onSelect(entities.find((x) => x.id === e.target.value) || null);
            }}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
          >
            <option value="">Select a client company…</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {entityLabel(e)}
                {e.verified ? " ✓" : " (not verified)"}
              </option>
            ))}
            <option value="__new__">+ Add a new company…</option>
          </select>

          {selected && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <VerifiedBadge verified={selected.verified} />
              {selected.uen && (
                <span className="text-xs text-[#64748b] font-mono">{selected.uen}</span>
              )}
              {!selected.verified && (
                <span className="text-xs text-[#64748b]">
                  This report will state the company as unverified.
                </span>
              )}
            </div>
          )}
        </>
      )}

      {adding && (
        <div className="rounded-xl border-2 border-[#e2e8f0] p-4 space-y-3">
          <p className="text-xs text-[#64748b]">
            We check the name against ACRA as you add it, so a mismatch is a
            correction now rather than a wrong-entity report later.
          </p>
          <input
            placeholder="Registered company name *"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
          />
          <input
            placeholder="UEN (optional)"
            value={form.uen}
            onChange={(e) => setForm((f) => ({ ...f, uen: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
          />
          <input
            placeholder="Website (optional)"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
          />
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 font-semibold">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={add}
              className="flex-1 bg-[#10b981] text-white font-bold py-2.5 rounded-xl hover:bg-[#059669] transition disabled:opacity-50 text-sm"
            >
              {busy ? "Checking ACRA…" : "Add company"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
              className="px-4 border-2 border-[#e2e8f0] text-[#475569] font-bold rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
