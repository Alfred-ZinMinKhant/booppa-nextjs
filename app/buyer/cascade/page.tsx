"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Unlock, CheckCircle2, AlertTriangle, Eye, Send, RefreshCw, FileText } from "lucide-react";

type CascadeResultItem = {
  vendor_email?: string | null;
  vendor_name: string;
  sent: boolean;
  skip_reason?: string | null;
};

export default function BuyerCascadePage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [previewList, setPreviewList] = useState<CascadeResultItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendMsg, setSendMsg] = useState("");

  const handleAuthorize = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/v1/buyer-dashboard/authorize-name-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      if (res.ok) {
        setIsAuthorized(true);
      }
    } catch {
      // fallback
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRevoke = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/v1/buyer-dashboard/revoke-name-usage", {
        method: "POST",
      });
      if (res.ok) {
        setIsAuthorized(false);
        setPreviewList([]);
      }
    } catch {
      // fallback
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/v1/buyer-dashboard/cascade/preview", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewList(data.preview || []);
      }
    } catch {
      // fallback
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendCascade = async () => {
    setSendStatus("sending");
    setSendMsg("");
    try {
      const res = await fetch("/api/v1/buyer-dashboard/cascade/send", {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 403) {
          throw new Error("Legal Name-Usage Authorization Required: You must check and sign the Name-Usage Authorization above before sending notifications to your vendor pool.");
        }
        throw new Error(err.detail || "Failed to trigger vendor cascade");
      }
      const data = await res.json();
      setSendStatus("success");
      setSendMsg(`Cascade executed! Processed ${data.results?.length || 0} vendors in your pool.`);
    } catch (err: any) {
      setSendStatus("error");
      setSendMsg(err.message || "Failed to execute cascade.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 font-sans text-slate-100 sm:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <ShieldCheck className="h-4 w-4" /> Buyer Procurement Portal
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Vendor Pool Cascade & Authorization
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Require your vendor pool to obtain a Booppa Trust Passport. Notifications are sent on your organization&apos;s behalf with a 30-day qualification deadline.
          </p>
        </div>

        {/* Legal Authorization Gate Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-semibold text-white">
              {isAuthorized ? (
                <Unlock className="h-5 w-5 text-emerald-400" />
              ) : (
                <Lock className="h-5 w-5 text-amber-400" />
              )}
              <span>Legal Name-Usage Authorization Gate</span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isAuthorized
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
            >
              {isAuthorized ? "Authorized" : "Action Required"}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 leading-relaxed font-mono">
            &ldquo;I authorize Booppa Smart Care LLC to use my company&apos;s name in communications addressed to the vendors in my verification pool, for the specific purpose of requesting that they obtain a Trust Passport as a condition of remaining qualified in my procurement process.&rdquo;
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {!isAuthorized ? (
              <button
                onClick={handleAuthorize}
                disabled={authLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Sign & Authorize Name Usage
              </button>
            ) : (
              <button
                onClick={handleRevoke}
                disabled={authLoading}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                Revoke Authorization
              </button>
            )}
          </div>
        </div>

        {/* Cascade Actions Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Execute Pool Notification Cascade</h2>
            <p className="mt-1 text-xs text-slate-400">
              Preview vendor eligibility or trigger the automated 30-day deadline cascade to active pool vendors.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePreview}
              disabled={!isAuthorized || previewLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
            >
              {previewLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Preview Vendor Pool Eligibility
            </button>

            <button
              onClick={handleSendCascade}
              disabled={!isAuthorized || sendStatus === "sending"}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-40"
            >
              {sendStatus === "sending" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Cascade Notifications
            </button>
          </div>

          {sendStatus === "success" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              {sendMsg}
            </div>
          )}
          {sendStatus === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              {sendMsg}
            </div>
          )}

          {/* Preview Results Table */}
          {previewList.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Vendor Pool Preview ({previewList.length} vendors)
              </h3>
              <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                {previewList.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{item.vendor_name}</span>
                      <p className="text-slate-500 font-mono">{item.vendor_email || "No email on file"}</p>
                    </div>

                    <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-400">
                      {item.skip_reason ? `Skipped: ${item.skip_reason}` : "Eligible for notification"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
