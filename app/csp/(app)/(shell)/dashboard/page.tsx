"use client";

import { useEffect, useState } from "react";
import { cspGet } from "@/lib/cspClient";
import { PageHeader, StatCard, Card, RiskBadge, fmtDate, EmptyState } from "@/components/csp/ui";

export default function CspDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cspGet("dashboard").then((r) => {
      if (r.ok) setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-[#64748b]">Loading dashboard…</p>;
  if (!data) return <EmptyState title="Dashboard unavailable" hint="Please try again shortly." />;

  const score = data.compliance_score || {};
  const stats = data.client_stats || {};
  const pillars: Record<string, any> = score.pillars || {};

  return (
    <>
      <PageHeader
        title={data.profile?.legal_name || "Compliance Dashboard"}
        subtitle={`UEN ${data.profile?.uen || "—"} · ACRA ${String(data.profile?.acra_reg_status || "").replace(/.*\./, "") || "—"}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Compliance score" value={`${Math.round(score.overall_score || 0)}%`} tone={(score.overall_score || 0) >= 70 ? "ok" : "warn"} />
        <StatCard label="Total clients" value={stats.total ?? 0} />
        <StatCard label="High risk" value={stats.high_risk ?? 0} tone={(stats.high_risk || 0) > 0 ? "warn" : "default"} />
        <StatCard label="Sanctions hits" value={stats.sanctions_hits ?? 0} tone={(stats.sanctions_hits || 0) > 0 ? "danger" : "ok"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillars */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">9-pillar compliance</h2>
          <div className="space-y-3">
            {Object.entries(pillars).map(([key, p]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#475569] capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-bold text-[#0f172a]">{Math.round(p.score || 0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className={`h-full ${(p.score || 0) >= 70 ? "bg-[#10b981]" : (p.score || 0) >= 40 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${Math.min(100, Math.max(0, p.score || 0))}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(pillars).length === 0 && <p className="text-sm text-[#64748b]">No score computed yet.</p>}
          </div>
        </Card>

        {/* Urgent actions */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Urgent actions</h2>
          <ul className="space-y-2">
            {(score.urgent_actions || []).slice(0, 8).map((a: any, i: number) => (
              <li key={i} className="text-sm text-[#475569] flex gap-2">
                <span className="text-red-500 font-bold">!</span>
                {a.action || a.gap || a.message || JSON.stringify(a)}
              </li>
            ))}
            {(score.urgent_actions || []).length === 0 && <p className="text-sm text-[#64748b]">Nothing urgent. 🎉</p>}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Upcoming deadlines</h2>
          <DeadlineList items={data.upcoming_deadlines} empty="No deadlines in the next 30 days." />
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Overdue</h2>
          <DeadlineList items={data.overdue_items} empty="Nothing overdue." />
        </Card>
      </div>

      {(data.sanctions_alerts || []).length > 0 && (
        <Card className="p-6 mt-6 border-red-200">
          <h2 className="text-lg font-bold text-red-700 mb-4">Sanctions alerts</h2>
          <ul className="space-y-2">
            {data.sanctions_alerts.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-[#0f172a] font-semibold">{c.legal_name}</span>
                <RiskBadge rating={c.risk_rating} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function DeadlineList({ items, empty }: { items: any[]; empty: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-[#64748b]">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((d) => (
        <li key={d.id} className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">{d.title}</p>
            <p className="text-xs text-[#64748b]">{fmtDate(d.due_date)}{typeof d.days_remaining === "number" ? ` · ${d.days_remaining}d` : ""}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
