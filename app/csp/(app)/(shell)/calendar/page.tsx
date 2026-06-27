"use client";

import { useEffect, useState } from "react";
import { cspGet, cspSend } from "@/lib/cspClient";
import { PageHeader, Card, StatusBadge, EmptyState, fmtDate } from "@/components/csp/ui";

export default function CalendarPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    cspGet("calendar?days_ahead=365").then((r) => { if (r.ok && Array.isArray(r.data)) setItems(r.data); setLoading(false); });
  }
  useEffect(load, []);

  async function complete(id: string) {
    const by = prompt("Mark complete — who completed this item? (name & role)");
    if (!by?.trim()) return;
    setBusyId(id);
    const r = await cspSend(`calendar/${id}/complete?completed_by=${encodeURIComponent(by.trim())}`, "PATCH");
    setBusyId(null);
    if (r.ok) load();
  }

  return (
    <>
      <PageHeader title="Compliance calendar" subtitle="Regulatory deadlines with statutory basis and penalties for missing them." />
      {loading ? (
        <p className="text-sm text-[#64748b]">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No calendar items" hint="Items are seeded when you create your profile." />
      ) : (
        <div className="space-y-3">
          {items.map((i) => {
            const overdue = i.status === "pending" && typeof i.days_remaining === "number" && i.days_remaining < 0;
            return (
              <Card key={i.id} className={`p-5 flex items-start justify-between gap-4 ${overdue ? "border-red-200" : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#0f172a]">{i.title}</h3>
                    <StatusBadge status={overdue ? "overdue" : i.status} />
                  </div>
                  {i.description && <p className="text-sm text-[#64748b] mt-1">{i.description}</p>}
                  <p className="text-xs text-[#94a3b8] mt-2">
                    Due {fmtDate(i.due_date)}
                    {typeof i.days_remaining === "number" ? ` · ${i.days_remaining}d remaining` : ""}
                    {i.legal_basis ? ` · ${i.legal_basis}` : ""}
                  </p>
                  {i.penalty_if_missed && <p className="text-xs text-red-600 mt-1">Penalty: {i.penalty_if_missed}</p>}
                </div>
                {i.status !== "completed" && (
                  <button type="button" disabled={busyId === i.id} onClick={() => complete(i.id)} className="flex-shrink-0 border-2 border-[#0f172a] text-[#0f172a] font-bold px-4 py-2 rounded-xl hover:bg-[#0f172a] hover:text-white transition text-xs disabled:opacity-50">
                    {busyId === i.id ? "…" : "Mark complete"}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
