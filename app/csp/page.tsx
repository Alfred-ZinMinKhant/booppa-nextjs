"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { startCheckout } from "@/lib/checkout";

interface CspTier {
  tier: string;
  name: string;
  price_one_time: number;
  price_monthly: number;
  documents: number;
  features: string[];
  recommended: boolean;
}

const PRODUCT_TYPE_FOR_TIER: Record<string, { onetime?: string; monthly: string }> = {
  full: { onetime: "csp_pack_onetime", monthly: "csp_pack_monthly" },
  monitoring_only: { monthly: "csp_monitoring_monthly" },
};

function Check({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-[#475569]">
      <span className="text-[#10b981] font-bold flex-shrink-0">✓</span>
      {text}
    </li>
  );
}

export default function CspLandingPage() {
  const [tiers, setTiers] = useState<CspTier[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [billing, setBilling] = useState<"one-time" | "subscription">("one-time");

  useEffect(() => {
    // Public catalog — the /api/v1/* rewrite proxies straight to FastAPI, no auth needed.
    fetch("/api/v1/csp/pricing")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setTiers(d))
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !d.error) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  async function buy(productType: string) {
    if (!loggedIn) {
      window.location.href = `/login?from=${encodeURIComponent("/csp")}`;
      return;
    }
    setLoading(productType);
    await startCheckout(productType);
    setLoading(null);
  }

  const fullTier = tiers.find((t) => t.tier === "full");
  const monitoringTier = tiers.find((t) => t.tier === "monitoring_only");

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a]">
        <div className="container max-w-[1000px] mx-auto text-center">
          <span className="inline-block text-xs font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full mb-6">
            For Corporate Service Providers
          </span>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 text-white">
            ACRA-ready AML/CFT compliance, without the consultant fees
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-10">
            Under the ACRA RFA regime, every Corporate Service Provider must run a full AML/CFT/PF
            programme — client due diligence, STR decisioning, nominee and beneficial-owner registers,
            staff training, and an audit trail. The CSP Compliance Pack generates all of it, tracks it,
            and notarizes every decision on-chain.
          </p>
          <a
            href="#pricing"
            className="inline-block px-8 py-4 bg-[#10b981] text-white font-bold rounded-2xl hover:bg-[#059669] transition shadow-lg shadow-[#10b981]/20"
          >
            See pricing →
          </a>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 px-6">
        <div className="container max-w-[1100px] mx-auto">
          <h2 className="text-3xl font-black text-[#0f172a] mb-12 text-center">What&apos;s inside the pack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "8 AML/CFT programme documents", d: "AI-generated from your profile — IRA, AML/CFT policy, EDD procedures, STR SOP, training plan, and more. Each SHA-256 hashed and anchored on Polygon." },
              { t: "Client CDD/EDD registry", d: "Track customer due diligence for unlimited clients, with periodic-review scheduling and EDD workflows for PEPs and high-risk relationships." },
              { t: "Sanctions screening", d: "Screen clients against MAS, OFAC, UN, and EU lists. Hits auto-escalate to very-high risk with EDD required." },
              { t: "STR decision framework", d: "Log every suspicious-transaction decision with mandatory rationale — filed, not-filed, or escalated — with a tamper-evident audit trail." },
              { t: "Nominee & UBO registers", d: "Nominee director/shareholder registers with fit-and-proper assessments, plus beneficial-owner identification down to 25% ownership." },
              { t: "Compliance calendar", d: "15 seeded regulatory deadlines with automated reminders and escalation, so an ACRA filing never slips." },
            ].map((f) => (
              <div key={f.t} className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">{f.t}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-[#f8fafc] scroll-mt-20">
        <div className="container max-w-[1000px] mx-auto">
          <h2 className="text-3xl font-black text-[#0f172a] mb-4 text-center">Pricing</h2>
          <p className="text-[#64748b] text-center max-w-2xl mx-auto mb-10">
            One-time lifetime access or monthly with ongoing monitoring. Both unlock the full pack.
          </p>

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setBilling("one-time")}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billing === "one-time" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setBilling("subscription")}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billing === "subscription" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Full pack */}
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl relative flex flex-col">
              <div className="absolute top-[-14px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {billing === "one-time" ? "Best Value" : "Recommended"}
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{fullTier?.name || "CSP Compliance Pack — Full"}</h3>
              {billing === "one-time" ? (
                <div className="text-5xl font-black text-white mb-1">SGD {(fullTier?.price_one_time ?? 3999).toLocaleString()}</div>
              ) : (
                <div className="text-5xl font-black text-white mb-1">SGD {(fullTier?.price_monthly ?? 299).toLocaleString()}<span className="text-xl text-white/40 font-normal">/mo</span></div>
              )}
              <p className="text-xs text-white/50 mb-6">
                {billing === "one-time" ? "One-time · lifetime pack access" : "Monthly · cancel anytime · monitoring included"}
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {(fullTier?.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-[#10b981] font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={loading === (billing === "one-time" ? "csp_pack_onetime" : "csp_pack_monthly")}
                onClick={() => buy(billing === "one-time" ? PRODUCT_TYPE_FOR_TIER.full.onetime! : PRODUCT_TYPE_FOR_TIER.full.monthly)}
                className="w-full bg-[#10b981] text-white font-bold py-4 rounded-2xl hover:bg-[#059669] transition shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
              >
                {loading === (billing === "one-time" ? "csp_pack_onetime" : "csp_pack_monthly")
                  ? "Redirecting..."
                  : billing === "one-time" ? "Get the Pack →" : "Subscribe →"}
              </button>
            </div>

            {/* Monitoring add-on */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-[#0f172a] mb-2">{monitoringTier?.name || "CSP Monitoring Add-On"}</h3>
              <div className="text-4xl font-black text-[#0f172a] mb-1">SGD {(monitoringTier?.price_monthly ?? 299).toLocaleString()}<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
              <p className="text-xs text-[#64748b] mb-6">Subscription · continuous regulatory monitoring</p>
              <ul className="space-y-3 mb-8 flex-1">
                {(monitoringTier?.features || []).map((f) => <Check key={f} text={f} />)}
              </ul>
              <button
                type="button"
                disabled={loading === "csp_monitoring_monthly"}
                onClick={() => buy(PRODUCT_TYPE_FOR_TIER.monitoring_only.monthly)}
                className="w-full border-2 border-[#0f172a] text-[#0f172a] font-bold py-3.5 rounded-2xl hover:bg-[#0f172a] hover:text-white transition disabled:opacity-50"
              >
                {loading === "csp_monitoring_monthly" ? "Redirecting..." : "Subscribe — SGD 299/mo →"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#94a3b8] max-w-2xl mx-auto mt-10">
            BOOPPA provides compliance tooling and documentation — not regulatory certification or
            legal advice. You remain responsible for actual compliance with the ACRA RFA regime and
            AML/CFT obligations. Liability is capped per the CSP Terms of Service accepted at onboarding.
          </p>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-sm font-semibold text-[#10b981] hover:underline">
              Compare all BOOPPA plans →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
