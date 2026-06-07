"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Plus, Loader2, AlertTriangle, CheckCircle2,
  XCircle, Eye, RefreshCw, Trash2, ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type RiskSignal = "CLEAN" | "WATCH" | "FLAGGED" | "CRITICAL" | "UNKNOWN";
type VendorStatus = "ACTIVE" | "ARCHIVED" | "PENDING_INVITE";

interface VendorRow {
  id: string;
  vendor_user_id: string | null;
  vendor_name: string | null;
  vendor_email: string | null;
  status: VendorStatus;
  label: string | null;
  alert_threshold: string;
  risk_signal: RiskSignal;
  verification_depth: string | null;
  procurement_readiness: string | null;
  compliance_score: number | null;
  cache_refreshed_at: string | null;
  added_at: string | null;
}

interface RiskCounts {
  CLEAN: number;
  WATCH: number;
  FLAGGED: number;
  CRITICAL: number;
  UNKNOWN: number;
}

interface PortfolioData {
  enterprise_user_id: string;
  vendors: VendorRow[];
  total: number;
  risk_summary: RiskCounts;
  generated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskSignal, { label: string; color: string; bg: string; border: string; badge: string }> = {
  CLEAN: {
    label: "Clean",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  WATCH: {
    label: "Watch",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  FLAGGED: {
    label: "Flagged",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
  },
  CRITICAL: {
    label: "Critical",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  UNKNOWN: {
    label: "Unknown",
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
  },
};

const READINESS_LABELS: Record<string, string> = {
  ready: "Procurement Ready",
  partial: "Partial",
  not_ready: "Not Ready",
  not_registered: "Not on Booppa",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function RiskIcon({ signal }: { signal: RiskSignal }) {
  if (signal === "CLEAN") return <CheckCircle2 size={16} className="text-emerald-600" />;
  if (signal === "CRITICAL") return <XCircle size={16} className="text-red-600" />;
  return <AlertTriangle size={16} className="text-amber-500" />;
}

// ── Summary Bar ───────────────────────────────────────────────────────────────

function RiskSummaryBar({ counts, total }: { counts: RiskCounts; total: number }) {
  const items: { key: RiskSignal; label: string }[] = [
    { key: "CLEAN", label: "Clean" },
    { key: "WATCH", label: "Watch" },
    { key: "FLAGGED", label: "Flagged" },
    { key: "CRITICAL", label: "Critical" },
    { key: "UNKNOWN", label: "Unknown" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map(({ key, label }) => {
        const cfg = RISK_CONFIG[key];
        const count = counts[key] ?? 0;
        return (
          <div key={key} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 text-center`}>
            <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">{label}</p>
            {total > 0 && (
              <p className="text-xs text-[#94a3b8] mt-1">{Math.round((count / total) * 100)}%</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Vendor Card ───────────────────────────────────────────────────────────────

function VendorCard({
  vendor,
  onArchive,
  onRefresh,
}: {
  vendor: VendorRow;
  onArchive: (id: string) => void;
  onRefresh: (id: string) => void;
}) {
  const signal = (vendor.risk_signal || "UNKNOWN") as RiskSignal;
  const cfg = RISK_CONFIG[signal];

  return (
    <div className={`bg-white rounded-2xl border-2 ${cfg.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RiskIcon signal={signal} />
            <h3 className="font-bold text-[#0f172a] truncate">
              {vendor.vendor_name || vendor.vendor_email || "Unknown Vendor"}
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>

          {vendor.vendor_email && (
            <p className="text-xs text-[#94a3b8] mb-2">{vendor.vendor_email}</p>
          )}

          {vendor.label && (
            <p className="text-xs font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full inline-block mb-2">
              {vendor.label}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-[#64748b]">
            {vendor.compliance_score !== null && (
              <span>Score: <strong className="text-[#0f172a]">{vendor.compliance_score}</strong>/100</span>
            )}
            {vendor.procurement_readiness && (
              <span>{READINESS_LABELS[vendor.procurement_readiness] || vendor.procurement_readiness}</span>
            )}
            {vendor.verification_depth && vendor.verification_depth !== "none" && (
              <span className="capitalize">{vendor.verification_depth.replace("_", " ")}</span>
            )}
            <span>Added {formatDate(vendor.added_at)}</span>
          </div>

          {vendor.status === "PENDING_INVITE" && (
            <p className="text-xs text-amber-600 font-medium mt-2">
              Not yet on Booppa — compliance data unavailable.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {vendor.vendor_user_id && (
            <Link
              href={`/check-status?vendor=${vendor.vendor_user_id}`}
              className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-colors"
              title="View vendor profile"
            >
              <Eye size={16} />
            </Link>
          )}
          <button
            onClick={() => onRefresh(vendor.id)}
            className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-colors"
            title="Refresh compliance snapshot"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => onArchive(vendor.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-[#94a3b8] hover:text-red-500 transition-colors"
            title="Archive vendor"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Vendor Modal ──────────────────────────────────────────────────────────

function AddVendorModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email && !name) {
      setErr("Enter an email or company name.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/supply-chain/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_email: email || null,
          vendor_name: name || null,
          label: label || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.error || "Failed to add vendor.");
      }
      onAdded();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold text-[#0f172a] mb-1">Add Vendor to Portfolio</h2>
        <p className="text-sm text-[#64748b] mb-6">
          We&apos;ll check their Booppa compliance profile automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">
              Vendor Email (Booppa registered)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@company.com"
              className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">
              Company Name (if not on Booppa)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Pte Ltd"
              className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">
              Internal Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Primary IT Supplier"
              className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
            />
          </div>

          {err && <p className="text-sm text-red-600 font-medium">{err}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : "Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SupplyChainPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<RiskSignal | "ALL">("ALL");

  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function fetchPortfolio() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/supply-chain/portfolio");
      if (!res.ok) throw new Error("Failed to load portfolio.");
      const data = await res.json();
      setPortfolio(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(vendorId: string) {
    if (!confirm("Archive this vendor from your portfolio?")) return;
    try {
      const res = await fetch(`/api/v1/supply-chain/vendors/${vendorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive.");
      fetchPortfolio();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Archive failed.");
    }
  }

  async function handleRefresh(vendorId: string) {
    try {
      const res = await fetch(`/api/v1/supply-chain/vendors/${vendorId}/refresh`);
      if (!res.ok) throw new Error("Failed to refresh.");
      fetchPortfolio();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Refresh failed.");
    }
  }

  const vendors = portfolio?.vendors ?? [];
  const filtered = filter === "ALL" ? vendors : vendors.filter((v) => v.risk_signal === filter);

  // ── Loading ──

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#10b981] mx-auto mb-4" size={36} />
          <p className="text-[#64748b] font-medium">Loading your vendor portfolio…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <XCircle className="text-red-500 mx-auto mb-3" size={32} />
          <p className="font-bold text-red-700 mb-2">Could not load portfolio</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <p className="text-sm text-[#64748b]">
            Please{" "}
            <Link href="/auth/login" className="text-[#10b981] font-bold hover:underline">
              sign in
            </Link>{" "}
            to view your supply chain portfolio.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {showAddModal && (
        <AddVendorModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchPortfolio}
        />
      )}

      <main className="min-h-screen bg-[#f8fafc]">
        {/* Header */}
        <section className="bg-[#0f172a] text-white py-14 px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-[#10b981]" />
                  <span className="text-[#10b981] font-bold text-xs uppercase tracking-widest">
                    Supply Chain Risk
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black mb-2">Vendor Risk Portfolio</h1>
                <p className="text-white/60 max-w-lg text-sm leading-relaxed">
                  Monitor compliance risk across your vendor supply chain.
                  Each vendor&apos;s Booppa compliance profile is reflected here automatically.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors text-sm flex-shrink-0"
              >
                <Plus size={16} /> Add Vendor
              </button>
            </div>

            {/* Risk summary bar */}
            {portfolio && portfolio.total > 0 && (
              <div className="mt-8">
                <RiskSummaryBar counts={portfolio.risk_summary} total={portfolio.total} />
              </div>
            )}
          </div>
        </section>

        {/* Vendor list */}
        <section className="py-10 px-6">
          <div className="max-w-[1100px] mx-auto">
            {vendors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#e2e8f0]">
                <Shield size={40} className="text-[#cbd5e1] mx-auto mb-4" />
                <h3 className="font-bold text-[#0f172a] text-xl mb-2">No vendors yet</h3>
                <p className="text-[#64748b] mb-6 max-w-sm mx-auto text-sm">
                  Add your first vendor to start tracking compliance risk across your supply chain.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors text-sm inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Add Your First Vendor
                </button>
              </div>
            ) : (
              <>
                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {(["ALL", "CLEAN", "WATCH", "FLAGGED", "CRITICAL"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        filter === f
                          ? "bg-[#0f172a] text-white"
                          : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#10b981] hover:text-[#0f172a]"
                      }`}
                    >
                      {f === "ALL" ? `All (${vendors.length})` : f}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filtered.length === 0 ? (
                    <p className="text-center text-[#94a3b8] py-12 text-sm">
                      No vendors with signal: {filter}
                    </p>
                  ) : (
                    filtered.map((v) => (
                      <VendorCard
                        key={v.id}
                        vendor={v}
                        onArchive={handleArchive}
                        onRefresh={handleRefresh}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 px-6 border-t border-[#e2e8f0]">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-[#0f172a] mb-2">Your Compliance Locker</h3>
              <p className="text-sm text-[#64748b] mb-4">
                View your own Singapore compliance evidence — PDPA, ACRA, GeBIZ, and MAS.
              </p>
              <Link href="/vendor/compliance-locker" className="text-sm text-[#10b981] font-bold hover:underline">
                Open Compliance Locker →
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-[#0f172a] mb-2">Enterprise Procurement</h3>
              <p className="text-sm text-[#64748b] mb-4">
                Full procurement intelligence — RFP signals, vendor scoring, and procurement readiness.
              </p>
              <Link href="/enterprise/procurement" className="text-sm text-[#10b981] font-bold hover:underline">
                Open Procurement Dashboard →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
