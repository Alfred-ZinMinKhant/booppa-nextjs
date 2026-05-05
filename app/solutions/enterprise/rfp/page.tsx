"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, PlayCircle, ChevronDown, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface RfpRequirement {
  id: string;
  label: string;
  description: string | null;
  minimumVerificationDepth: string;
  minimumPercentile: number;
  requireActiveMonitoring: boolean;
  requireNoOpenAnomalies: boolean;
  minimumDaysUntilExpiry: number;
  createdAt: string;
}

interface Flag {
  vendorId: string;
  overallStatus: "MEETS" | "PARTIAL" | "MISSING";
  details: Array<{ requirementKey: string; status: string; actual: any; required: any }>;
  evaluatedAt: string;
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "MEETS" | "PARTIAL" | "MISSING" }) {
  if (status === "MEETS")   return <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Meets</span>;
  if (status === "PARTIAL") return <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium"><AlertCircle className="h-3.5 w-3.5" /> Partial</span>;
  return                           <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><XCircle className="h-3.5 w-3.5" /> Missing</span>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RfpRequirementsPage() {
  const [requirements, setRequirements]   = useState<RfpRequirement[]>([]);
  const [activeReq, setActiveReq]         = useState<RfpRequirement | null>(null);
  const [flags, setFlags]                 = useState<Flag[]>([]);
  const [showCreate, setShowCreate]       = useState(false);
  const [loading, setLoading]             = useState(true);
  const [evaluating, setEvaluating]       = useState(false);
  const [slugInput, setSlugInput]         = useState("");

  // Form state
  const [form, setForm] = useState({
    label: "", description: "",
    minimum_verification_depth: "NONE",
    minimum_percentile: 0,
    require_active_monitoring: false,
    require_no_open_anomalies: false,
    minimum_days_until_expiry: 0,
  });

  function loadRequirements() {
    fetch("/api/rfp-requirements")
      .then(r => r.json())
      .then(d => { setRequirements(d.requirements || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadRequirements(); }, []);

  function loadFlags(reqId: string) {
    fetch(`/api/rfp-requirements/${reqId}/flags`)
      .then(r => r.json())
      .then(d => setFlags(d.flags || []));
  }

  async function createRequirement(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/rfp-requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowCreate(false); loadRequirements(); }
  }

  async function evaluate(reqId: string) {
    setEvaluating(true);
    const slugs = slugInput.split(",").map(s => s.trim()).filter(Boolean);
    await fetch(`/api/rfp-requirements/${reqId}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    });
    loadFlags(reqId);
    setEvaluating(false);
  }

  async function archiveRequirement(reqId: string) {
    await fetch(`/api/rfp-requirements/${reqId}`, { method: "DELETE" });
    setActiveReq(null);
    loadRequirements();
  }

  const depths = ["NONE", "BASIC", "STANDARD", "DEEP", "CERTIFIED"];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-neutral-800 pb-6">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Enterprise Pro</p>
            <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">RFP Requirements</h1>
            <p className="mt-1 text-sm text-neutral-400">Define vendor qualification criteria. Vendors are never notified.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition shadow-[0_0_15px_rgba(99,102,241,0.25)]"
          >
            <Plus className="h-4 w-4" /> New Requirement
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">New Requirement Spec</h2>
              <button onClick={() => setShowCreate(false)} className="text-neutral-500 hover:text-white transition"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={createRequirement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">Label *</label>
                  <input
                    required className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Critical Infrastructure RFP"
                    value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">Min Verification Depth</label>
                  <select
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none"
                    value={form.minimum_verification_depth}
                    onChange={e => setForm({...form, minimum_verification_depth: e.target.value})}
                  >
                    {depths.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">Description</label>
                <textarea
                  rows={2} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none resize-none"
                  placeholder="Optional description…"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">Min Percentile (%)</label>
                  <input
                    type="number" min={0} max={100}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none"
                    value={form.minimum_percentile}
                    onChange={e => setForm({...form, minimum_percentile: +e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">Min Days Until Expiry</label>
                  <input
                    type="number" min={0}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none"
                    value={form.minimum_days_until_expiry}
                    onChange={e => setForm({...form, minimum_days_until_expiry: +e.target.value})}
                  />
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" className="rounded border-neutral-700 accent-indigo-500"
                      checked={form.require_active_monitoring}
                      onChange={e => setForm({...form, require_active_monitoring: e.target.checked})}
                    />
                    <span className="text-xs text-neutral-400">Active monitoring</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" className="rounded border-neutral-700 accent-indigo-500"
                      checked={form.require_no_open_anomalies}
                      onChange={e => setForm({...form, require_no_open_anomalies: e.target.checked})}
                    />
                    <span className="text-xs text-neutral-400">No anomalies</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition">Save Requirement</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-5 gap-6">
          {/* Requirements list */}
          <div className="col-span-2 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[0,1,2].map(i => <div key={i} className="h-20 rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse" />)}
              </div>
            ) : requirements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center">
                <p className="text-neutral-500 text-sm">No requirements yet. Create one to start evaluating vendors.</p>
              </div>
            ) : (
              requirements.map(req => (
                <button
                  key={req.id}
                  onClick={() => { setActiveReq(req); loadFlags(req.id); }}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    activeReq?.id === req.id
                      ? "border-indigo-500/40 bg-indigo-500/5"
                      : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{req.label}</p>
                      {req.description && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{req.description}</p>}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {req.minimumVerificationDepth !== "NONE" && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">≥{req.minimumVerificationDepth}</span>
                    )}
                    {req.minimumPercentile > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">≥{req.minimumPercentile}th pct</span>
                    )}
                    {req.requireActiveMonitoring && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active monitoring</span>
                    )}
                    {req.requireNoOpenAnomalies && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[10px]">No anomalies</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Flags panel */}
          <div className="col-span-3">
            {!activeReq ? (
              <div className="rounded-xl border border-dashed border-neutral-800 h-full flex items-center justify-center p-8">
                <p className="text-neutral-500 text-sm text-center">Select a requirement to evaluate vendors and view results.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden h-full flex flex-col">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{activeReq.label}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{flags.length} vendors evaluated</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => archiveRequirement(activeReq.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Archive requirement"
                    ><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Evaluate input */}
                <div className="px-5 py-3 border-b border-neutral-800 flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-1.5 bg-neutral-800 border border-neutral-700 text-sm text-white rounded-lg focus:outline-none focus:border-indigo-500 placeholder:text-neutral-500"
                    placeholder="Vendor slugs (comma separated)"
                    value={slugInput}
                    onChange={e => setSlugInput(e.target.value)}
                  />
                  <button
                    disabled={evaluating || !slugInput.trim()}
                    onClick={() => evaluate(activeReq.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {evaluating ? "Evaluating…" : "Evaluate"}
                  </button>
                </div>

                {/* Flag results */}
                <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
                  {flags.length === 0 ? (
                    <div className="p-6 text-center text-neutral-500 text-sm">No evaluations yet. Enter vendor slugs above.</div>
                  ) : (
                    flags.map((flag) => (
                      <div key={flag.vendorId} className="px-5 py-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">{flag.vendorId.slice(0, 12)}…</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(flag.evaluatedAt).toLocaleString()}</p>
                          </div>
                          <StatusBadge status={flag.overallStatus} />
                        </div>
                        <div className="space-y-1.5">
                          {flag.details.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span>{d.requirementKey}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-400">actual: <span className="text-white">{String(d.actual)}</span></span>
                                <StatusBadge status={d.status as any} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
