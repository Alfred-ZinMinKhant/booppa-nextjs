"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users, Gift, Clock } from "lucide-react";
import { config as appConfig } from "@/lib/config";

interface Referral {
  referral_code: string;
  status: string;
  referred_email: string | null;
  reward_claimed: boolean;
  created_at: string | null;
}

interface MyReferralCode {
  referral_code: string;
  expires_at: string;
  status: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pending",    color: "text-yellow-400" },
  SIGNED_UP:  { label: "Signed up",  color: "text-blue-400" },
  CONVERTED:  { label: "Converted",  color: "text-emerald-400" },
  EXPIRED:    { label: "Expired",    color: "text-neutral-500" },
};

export default function ReferralsPage() {
  const [userId, setUserId]       = useState<string | null>(null);
  const [myCode, setMyCode]       = useState<MyReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Fetch current user id
  useEffect(() => {
    fetch(`${appConfig.apiUrl}/api/v1/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(me => {
        if (me?.id) setUserId(String(me.id));
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch referrals once we have userId
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/referrals?user_id=${userId}`)
      .then(r => r.json())
      .then((data: Referral[]) => {
        setReferrals(data || []);
        // The latest pending code is the active one
        const active = data.find(r => r.status === "PENDING");
        if (active) {
          setMyCode({ referral_code: active.referral_code, expires_at: "", status: "PENDING" });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  async function generateCode() {
    if (!userId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrer_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setMyCode(data);
      // Refresh list
      const list = await fetch(`/api/referrals?user_id=${userId}`).then(r => r.json());
      setReferrals(list || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function copyLink() {
    if (!myCode) return;
    const link = `${window.location.origin}/auth/register?ref=${myCode.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const signed  = referrals.filter(r => r.status === "SIGNED_UP" || r.status === "CONVERTED").length;
  const pending = referrals.filter(r => r.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Referral Program</h1>
          <p className="text-neutral-400 text-sm mt-1">Invite vendors to BOOPPA and earn rewards when they sign up.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map(i => <div key={i} className="h-28 rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse" />)}
          </div>
        ) : !userId ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
            <p className="text-neutral-400">Please <a href="/auth/login" className="text-indigo-400 underline">sign in</a> to access your referral dashboard.</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users,  label: "Total referrals", value: referrals.length },
                { icon: Check,  label: "Signed up",       value: signed },
                { icon: Clock,  label: "Pending",         value: pending },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-neutral-400 text-xs">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Referral code card */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Your referral link</h2>
              </div>

              {myCode ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-indigo-300 font-mono truncate">
                      {`${typeof window !== "undefined" ? window.location.origin : "https://booppa.io"}/auth/register?ref=${myCode.referral_code}`}
                    </code>
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition flex-shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Code: <span className="text-neutral-300 font-mono">{myCode.referral_code}</span>
                    {myCode.expires_at && ` · Expires ${new Date(myCode.expires_at).toLocaleDateString("en-SG")}`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-400 mb-4">You don't have an active referral code yet.</p>
                  {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
                  <button
                    onClick={generateCode}
                    disabled={creating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                  >
                    {creating ? "Generating…" : "Generate referral link"}
                  </button>
                </div>
              )}
            </div>

            {/* Referrals table */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-800">
                <h2 className="text-sm font-semibold text-white">Referral history</h2>
              </div>
              {referrals.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No referrals yet. Share your link to get started.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">Code</th>
                      <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">Referred email</th>
                      <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">Status</th>
                      <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {referrals.map((r, i) => {
                      const s = STATUS_LABEL[r.status] ?? { label: r.status, color: "text-neutral-400" };
                      return (
                        <tr key={i} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="px-5 py-3 font-mono text-indigo-400">{r.referral_code}</td>
                          <td className="px-5 py-3 text-neutral-300">{r.referred_email || <span className="text-neutral-600">—</span>}</td>
                          <td className={`px-5 py-3 font-medium ${s.color}`}>{s.label}</td>
                          <td className="px-5 py-3 text-neutral-500">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString("en-SG") : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
