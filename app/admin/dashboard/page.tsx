"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { endpoints } from "@/lib/config";

interface FeatureFlag {
  flag_name: string;
  enabled: boolean;
  description?: string;
  auto_activate_threshold?: number;
}

interface GrowthMetrics {
  vendors: number;
  users: number;
  reports: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const router = useRouter();

  // Load dashboard data — cookies are sent automatically (httpOnly)
  useEffect(() => {
    Promise.all([
      fetch(`/api/v1${endpoints.features.list}`, { credentials: 'include' }).then(r => {
        if (r.status === 401) { router.replace("/admin/login"); return null; }
        return r.ok ? r.json() : null;
      }),
      fetch(`/api/v1${endpoints.features.metrics}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch(`/api/v1${endpoints.funnel.summary}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([flagData, metricsData, funnelData]) => {
      setFlags(flagData?.flags || flagData || []);
      setMetrics(metricsData);
      setFunnel(funnelData?.stages || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const toggleFlag = async (flagName: string, currentValue: boolean) => {
    try {
      const res = await fetch(
        `/api/v1${endpoints.features.set(flagName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ enabled: !currentValue }),
        }
      );
      if (res.ok) {
        setFlags(prev =>
          prev.map(f => f.flag_name === flagName ? { ...f, enabled: !currentValue } : f)
        );
      }
    } catch { /* silent */ }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <section className="py-4 px-6 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0f172a]">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/import"
              className="px-4 py-2 bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors text-sm"
            >
              Import Vendors
            </Link>
            <Link
              href="/admin/intelligence"
              className="px-4 py-2 border border-[#e2e8f0] text-[#64748b] font-medium rounded-lg hover:border-[#10b981] transition-colors text-sm"
            >
              Intelligence
            </Link>
            <button onClick={handleLogout} className="text-sm text-[#64748b] hover:text-red-500 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-[1200px] mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        </div>
      )}

      <section className="py-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Growth Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
                <div className="text-sm text-[#64748b] mb-1">Marketplace Vendors</div>
                <div className="text-3xl font-bold text-[#0f172a]">{metrics.vendors}</div>
                <div className="mt-2 text-xs text-[#94a3b8]">
                  Phase 2: 50 · Phase 3: 200 · Phase 4: 500
                </div>
                <div className="mt-2 w-full bg-[#e2e8f0] rounded-full h-2">
                  <div
                    className="bg-[#10b981] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (metrics.vendors / 500) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
                <div className="text-sm text-[#64748b] mb-1">Users</div>
                <div className="text-3xl font-bold text-[#0f172a]">{metrics.users}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
                <div className="text-sm text-[#64748b] mb-1">Reports</div>
                <div className="text-3xl font-bold text-[#0f172a]">{metrics.reports}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Flags */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0]">
              <div className="p-6 border-b border-[#e2e8f0]">
                <h2 className="text-lg font-bold text-[#0f172a]">Feature Flags</h2>
              </div>
              <div className="divide-y divide-[#e2e8f0]">
                {flags.map((flag) => (
                  <div key={flag.flag_name} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#0f172a]">{flag.flag_name}</div>
                      {flag.description && <div className="text-xs text-[#64748b]">{flag.description}</div>}
                    </div>
                    <button
                      onClick={() => toggleFlag(flag.flag_name, flag.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? "bg-[#10b981]" : "bg-[#e2e8f0]"}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${flag.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
                {flags.length === 0 && (
                  <div className="p-6 text-center text-sm text-[#64748b]">No feature flags configured yet.</div>
                )}
              </div>
            </div>

            {/* Funnel */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0]">
              <div className="p-6 border-b border-[#e2e8f0]">
                <h2 className="text-lg font-bold text-[#0f172a]">Conversion Funnel</h2>
              </div>
              {funnel.length > 0 ? (
                <div className="p-6 space-y-3">
                  {funnel.map((stage) => {
                    const maxCount = Math.max(...funnel.map(s => s.count), 1);
                    const width = (stage.count / maxCount) * 100;
                    return (
                      <div key={stage.stage} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-[#64748b] text-right">{stage.stage}</div>
                        <div className="flex-1 bg-[#f1f5f9] rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-[#10b981] rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(width, 5)}%` }}
                          >
                            <span className="text-[10px] text-white font-medium">{stage.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[#64748b]">No funnel data yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
