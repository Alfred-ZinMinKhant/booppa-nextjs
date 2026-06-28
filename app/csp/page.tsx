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

          {/* Full pack — the toggle above governs only this card */}
          <div className="max-w-xl mx-auto">
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
          </div>

          {/* Standalone Monitoring Add-On — a separate SKU, not a billing variant */}
          <div className="max-w-3xl mx-auto mt-14 pt-12 border-t border-[#e2e8f0]">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-[#0f172a]">Already run your own AML programme?</h3>
              <p className="text-[#64748b] text-sm max-w-xl mx-auto mt-2">
                Monitoring is already included in the Full pack. If you only need ongoing regulatory
                alerts — not the documents or registers — subscribe to the add-on on its own.
              </p>
            </div>
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[#0f172a] mb-1">{monitoringTier?.name || "CSP Monitoring Add-On"}</h4>
                <p className="text-xs text-[#64748b] mb-4">Subscription · continuous regulatory monitoring</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {(monitoringTier?.features || []).map((f) => <Check key={f} text={f} />)}
                </ul>
                <div className="mt-4">
                  <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
                  <p className="text-sm text-[#475569]">CSPs with their own AML programme who need ongoing alerts</p>
                </div>
              </div>
              <div className="lg:w-56 lg:text-right lg:border-l lg:border-[#f1f5f9] lg:pl-6 flex flex-col items-stretch lg:items-end">
                <div className="text-3xl font-black text-[#0f172a] mb-1">SGD {(monitoringTier?.price_monthly ?? 299).toLocaleString()}<span className="text-base text-[#64748b] font-normal">/mo</span></div>
                <button
                  type="button"
                  disabled={loading === "csp_monitoring_monthly"}
                  onClick={() => buy(PRODUCT_TYPE_FOR_TIER.monitoring_only.monthly)}
                  className="mt-3 w-full lg:w-auto border-2 border-[#0f172a] text-[#0f172a] font-bold px-6 py-3 rounded-2xl hover:bg-[#0f172a] hover:text-white transition disabled:opacity-50 whitespace-nowrap"
                >
                  {loading === "csp_monitoring_monthly" ? "Redirecting..." : "Subscribe →"}
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#94a3b8] max-w-2xl mx-auto mt-10">
            Prices exclude GST; 9% GST is added at checkout for Singapore-registered businesses.
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

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="container max-w-[1000px] mx-auto">
          <h2 className="text-3xl font-black text-[#0f172a] mb-12 text-center">Frequently asked questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              {
                q: "Is this an ACRA licence or ACRA-approved certification?",
                a: "No. The CSP Compliance Pack is compliance tooling and documentation — it generates your AML/CFT/PF programme, tracks your obligations, and produces a tamper-evident evidence trail. It is not regulatory certification or legal advice. You remain responsible for actual compliance with the ACRA RFA regime.",
              },
              {
                q: "What's the difference between the Full pack and the Monitoring Add-On?",
                a: "The Full pack does the whole programme: 8 AI-generated documents, the client CDD/EDD registry, STR framework, nominee & UBO registers, scoring, calendar, and training records — and monitoring is already included. The Monitoring Add-On is a separate, standalone subscription for CSPs who already run their own AML programme and only want ongoing regulatory alerts. If you buy the Full pack you do not need the add-on.",
              },
              {
                q: "One-time vs monthly — what do I actually get?",
                a: "Both unlock the full pack. One-time (SGD 3,999) is lifetime access to the pack and your generated programme. Monthly (SGD 299/mo) is the same pack plus continuous monitoring and regulatory updates, cancel anytime.",
              },
              {
                q: "Do I need a Registered Qualified Individual (RQI) or compliance officer?",
                a: "The ACRA RFA regime expects a qualified individual and a named AML/CFT compliance officer. You enter these during onboarding and the pack tracks their training records — but appointing them is your responsibility. The pack documents and evidences the roles; it does not replace them.",
              },
              {
                q: "Is my clients' personal data (NRIC, passport) secure?",
                a: "Yes. Sensitive identity fields — NRIC/passport numbers, addresses, nominee details — are encrypted at rest with AES (Fernet) before they touch the database. Every CDD, STR decision, nominee and training record is also SHA-256 hashed and notarized on-chain so the audit trail is tamper-evident.",
              },
              {
                q: "Can I cancel anytime? What happens to my records?",
                a: "Monthly plans are cancel-anytime with no lock-in. Your historical compliance records, generated documents, and on-chain evidence remain accessible after cancellation so you keep your ACRA renewal evidence package. One-time purchases retain lifetime pack access.",
              },
              {
                q: "Is GST included in the price?",
                a: "Prices shown exclude GST. 9% GST is added at checkout for Singapore-registered businesses. Payment is via Stripe (Visa, Mastercard, Amex; PayNow for Singapore customers).",
              },
              {
                q: "How fast can I be up and running?",
                a: "After checkout you complete a short onboarding (company profile + Terms of Service acceptance), then the 8 programme documents generate automatically and your compliance calendar is seeded with regulatory deadlines. You can start adding clients and running CDD the same day.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h4 className="text-base font-bold mb-2 text-[#0f172a]">{faq.q}</h4>
                <p className="text-[#64748b] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
