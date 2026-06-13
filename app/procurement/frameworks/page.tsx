"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SlidersHorizontal, Check, Plus, Loader2, ArrowLeft, Star } from "lucide-react";

const WEIGHT_KEYS = ["COMPLIANCE", "VISIBILITY", "ENGAGEMENT", "RECENCY", "PROCUREMENT_INTEREST"] as const;
type WeightKey = (typeof WEIGHT_KEYS)[number];
type Weights = Record<WeightKey, number>;

interface Framework {
  id: string;
  name: string;
  frameworkType: string;
  sector: string | null;
  weights: Weights;
  isBuiltin: boolean;
  isActive: boolean;
}

const LABEL: Record<WeightKey, string> = {
  COMPLIANCE: "Compliance",
  VISIBILITY: "Visibility",
  ENGAGEMENT: "Engagement",
  RECENCY: "Recency",
  PROCUREMENT_INTEREST: "Procurement interest",
};

const DEFAULT_WEIGHTS: Weights = {
  COMPLIANCE: 0.3, VISIBILITY: 0.2, ENGAGEMENT: 0.2, RECENCY: 0.15, PROCUREMENT_INTEREST: 0.15,
};

const pct = (n: number) => `${Math.round(n * 100)}%`;
const sum = (w: Weights) => WEIGHT_KEYS.reduce((a, k) => a + (w[k] || 0), 0);

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procurement/frameworks");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setFrameworks(data.frameworks || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load frameworks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activate = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/procurement/frameworks/${id}/activate`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json())?.detail || "Activate failed");
      await load();
    } catch (e: any) {
      setError(e?.message || "Activate failed");
    } finally {
      setBusy(null);
    }
  };

  const total = sum(weights);
  const sumValid = Math.abs(total - 1) <= 0.01;

  const create = async () => {
    if (!name.trim() || !sumValid) return;
    setBusy("create");
    try {
      const res = await fetch("/api/procurement/frameworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), weights, sector: sector.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || "Create failed");
      setShowCreate(false);
      setName(""); setSector(""); setWeights({ ...DEFAULT_WEIGHTS });
      await load();
    } catch (e: any) {
      setError(e?.message || "Create failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/procurement/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight">Scoring frameworks</h1>
          </div>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New framework
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-6 max-w-xl leading-relaxed">
          Weight profiles that decide how vendors are ranked. Activate one as your default,
          or tag a profile with a sector (e.g. <span className="text-slate-300">fintech</span>) so vendors in that
          sector are scored under it automatically.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {error}
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-4">New custom framework</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Framework name"
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
              <input
                value={sector} onChange={(e) => setSector(e.target.value)}
                placeholder="Sector (optional, e.g. fintech)"
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-3">
              {WEIGHT_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-44 text-sm text-slate-300">{LABEL[k]}</span>
                  <input
                    type="range" min={0} max={1} step={0.05} value={weights[k]}
                    onChange={(e) => setWeights((w) => ({ ...w, [k]: parseFloat(e.target.value) }))}
                    className="flex-1 accent-sky-500"
                  />
                  <span className="w-12 text-right text-sm text-slate-400 tabular-nums">{pct(weights[k])}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className={`text-sm ${sumValid ? "text-emerald-400" : "text-amber-400"}`}>
                Total: {pct(total)} {sumValid ? "✓" : "(must equal 100%)"}
              </span>
              <button
                onClick={create}
                disabled={!name.trim() || !sumValid || busy === "create"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-sm font-semibold"
              >
                {busy === "create" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create framework
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-sky-400 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {frameworks.map((f) => (
              <div key={f.id} className={`rounded-xl border p-4 ${f.isActive ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{f.name}</span>
                      {f.isBuiltin && <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-slate-400">Template</span>}
                      {f.sector && <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-500/30 text-sky-300">sector: {f.sector}</span>}
                      {f.isActive && <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-300"><Star className="w-2.5 h-2.5" /> active default</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      {WEIGHT_KEYS.map((k) => (
                        <span key={k}>{LABEL[k]} <span className="text-slate-200 tabular-nums">{pct(f.weights[k])}</span></span>
                      ))}
                    </div>
                  </div>
                  {!f.isActive && (
                    <button
                      onClick={() => activate(f.id)}
                      disabled={busy === f.id}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-sm font-medium"
                    >
                      {busy === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Set active
                    </button>
                  )}
                </div>
              </div>
            ))}
            {frameworks.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-10">No frameworks yet.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
