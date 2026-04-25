"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserInfo {
  email: string;
  role: string;
  plan: string;
  stripe_customer_id?: string;
}

function CheckItem({
  text,
  color = "text-blue-500",
}: {
  text: string;
  color?: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm text-[#64748b]">
      <span className={`${color} font-bold flex-shrink-0`}>&#10003;</span>
      {text}
    </li>
  );
}

const WIZARD_QS = [
  {
    q: "How do you currently evaluate vendors?",
    options: [
      "Manually — spreadsheets and email",
      "Some tools, but nothing integrated",
      "Looking to automate end-to-end",
    ],
  },
  {
    q: "Do you need audit-ready evaluation records?",
    options: [
      "Yes — AGO / regulatory compliance required",
      "Not yet, but we may in future",
    ],
  },
  {
    q: "What best describes your team?",
    options: [
      "Solo procurement officer",
      "Small team (2–10 people)",
      "Large org or GLC (10+ people)",
    ],
  },
];

function getRecommendation(answers: (number | null)[]) {
  const [a1, a2, a3] = answers;
  if (a3 === 2 || (a2 === 0 && a1 === 2))
    return {
      plan: "Enterprise Pro",
      step: "Step 3",
      price: "SGD 1,499/mo",
      cta: "Book a Demo →",
      href: "/demo",
      desc: "Dedicated account manager, SLA, multi-sector views, and white-label reports for large teams.",
      color: "#2563eb",
    };
  if (a1 === 2 || a2 === 0)
    return {
      plan: "Enterprise",
      step: "Step 2",
      price: "SGD 499/mo",
      cta: "Evaluate Faster →",
      href: "#enterprise",
      desc: "Full analytics dashboard, vendor comparison engine, and audit trail export for buyer teams.",
      color: "#2563eb",
    };
  return {
    plan: "Free Tools",
    step: "Step 1",
    price: "SGD 0",
    cta: "Start Free →",
    href: "/vendors",
    desc: "Browse and compare vendors, verify documents, and use the full network — at no cost.",
    color: "#10b981",
  };
}

const JOURNEY_STEPS = [
  { n: "1", label: "Start Free",              color: "#10b981", bg: "#f0fdf4" },
  { n: "2", label: "Evaluate at Scale",       color: "#2563eb", bg: "#eff6ff" },
  { n: "3", label: "Dedicated Intelligence",  color: "#7c3aed", bg: "#f5f3ff" },
  { n: "4", label: "Custom Infrastructure",   color: "#d97706", bg: "#fffbeb" },
];

export default function SolutionsProcurementPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wAnswers,   setWAnswers]   = useState<(number | null)[]>([null, null, null]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data);
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(productType: string) {
    setLoadingProduct(productType);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType, prefill_email: user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to start checkout. Please try again.");
      }
    } catch {
      alert("Unable to start checkout. Please try again.");
    }
    setLoadingProduct(null);
  }

  async function handleBillingPortal() {
    window.location.href = "/api/stripe/portal";
  }

  function handleWizardAnswer(qi: number, ai: number) {
    const next = [...wAnswers];
    next[qi] = ai;
    setWAnswers(next);
    setWizardStep(qi + 1);
  }

  function resetWizard() {
    setWAnswers([null, null, null]);
    setWizardStep(0);
  }

  const isVendor = user?.role === "VENDOR";
  const isEnterprise = [
    "enterprise",
    "enterprise_pro",
    "standard_compliance",
    "pro_compliance",
  ].includes(user?.plan || "");

  return (
    <main className="bg-white min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="py-24 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          {isVendor && (
            <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/20 px-6 py-4 text-sm text-amber-300 max-w-2xl mx-auto">
              These plans are for buyer teams. Looking for vendor tools?{" "}
              <Link
                href="/solutions/vendors"
                className="underline hover:no-underline font-semibold"
              >
                View Vendor Solutions →
              </Link>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-full text-sm font-medium text-blue-400 mb-8 bg-blue-500/10">
            For Buyers
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Reduce vendor risk.
            <br />
            <span className="text-blue-400">Evaluate faster.</span>
            <br />
            Award confidently.
          </h1>
          <p className="text-xl text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed">
            Stop chasing vendors for compliance documents. BOOPPA gives your
            team instant access to blockchain-verified vendor evidence &mdash;
            so you can shortlist confidently and award faster.
          </p>
          {isEnterprise ? (
            <button
              onClick={handleBillingPortal}
              className="btn btn-primary px-10 py-5 text-xl font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
            >
              Manage Enterprise Billing
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#pricing"
                className="btn btn-primary px-10 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
              >
                View Pricing
              </a>
              <Link
                href="/demo"
                className="btn border border-white text-white px-10 py-4 text-lg font-bold hover:bg-white hover:text-[#0f172a] rounded-xl transition-all"
              >
                Book a Demo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">
              Your Path to Faster, Safer Procurement
            </h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
              Start with free tools. Upgrade to full analytics when your team needs more.
            </p>
          </div>

          {/* Journey path */}
          <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] px-6 py-5 mb-8">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {JOURNEY_STEPS.map((s, i, arr) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{ borderColor: s.color + "40", background: s.bg }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.n}
                    </div>
                    <span className="text-xs font-bold" style={{ color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-[#cbd5e1] font-bold text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Find My Plan wizard */}
          <div className="bg-white rounded-2xl border-2 border-[#e2e8f0] overflow-hidden mb-8">
            <button
              type="button"
              onClick={() => setWizardOpen((o) => !o)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f8fafc] transition-colors"
            >
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">
                  Find My Plan
                </p>
                <p className="text-base font-bold text-[#0f172a]">
                  Not sure which plan fits your team? Answer 3 quick questions →
                </p>
              </div>
              <span className="text-[#94a3b8] text-xl font-light ml-4">
                {wizardOpen ? "−" : "+"}
              </span>
            </button>

            {wizardOpen && (
              <div className="px-6 pb-6 border-t border-[#e2e8f0]">
                {wizardStep < 3 && (
                  <div className="pt-5">
                    <div className="flex gap-1 mb-4">
                      {(["q1", "q2", "q3"] as const).map((id, i) => (
                        <div
                          key={id}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= wizardStep ? "bg-blue-500" : "bg-[#e2e8f0]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">
                      Question {wizardStep + 1} of 3
                    </p>
                    <p className="text-lg font-bold text-[#0f172a] mb-4">
                      {WIZARD_QS[wizardStep].q}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {WIZARD_QS[wizardStep].options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            handleWizardAnswer(
                              wizardStep,
                              WIZARD_QS[wizardStep].options.indexOf(opt)
                            )
                          }
                          className="text-left px-4 py-3 rounded-xl border-2 border-[#e2e8f0] hover:border-blue-400 hover:bg-blue-50 text-sm font-semibold text-[#0f172a] transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {wizardStep === 3 &&
                  (() => {
                    const rec = getRecommendation(wAnswers);
                    return (
                      <div className="pt-5">
                        <p className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-3">
                          Your Recommended Plan
                        </p>
                        <div
                          className="rounded-xl border-2 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                          style={{
                            borderColor: rec.color + "50",
                            background: rec.color + "08",
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                                style={{ background: rec.color }}
                              >
                                {rec.step}
                              </span>
                              <span className="text-lg font-black text-[#0f172a]">
                                {rec.plan}
                              </span>
                              <span
                                className="text-base font-bold"
                                style={{ color: rec.color }}
                              >
                                {rec.price}
                              </span>
                            </div>
                            <p className="text-sm text-[#64748b]">{rec.desc}</p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Link
                              href={rec.href}
                              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold text-center transition hover:opacity-90"
                              style={{ background: rec.color }}
                            >
                              {rec.cta}
                            </Link>
                            <button
                              type="button"
                              onClick={resetWizard}
                              className="text-xs text-[#94a3b8] hover:text-[#64748b] text-center"
                            >
                              ← Start over
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>

          {/* Step 1: Free tools callout */}
          <div className="bg-[#f0fdf4] border-2 border-[#10b981]/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-black">1</div>
              <div>
                <p className="text-xs font-black text-[#10b981] uppercase tracking-widest">Step 1 · Start Free</p>
                <p className="text-sm font-bold text-[#0f172a]">Free Buyer Tools — no credit card needed</p>
              </div>
            </div>
            <div className="flex-1 flex flex-wrap gap-3">
              {[
                { label: "Browse Vendor Network", href: "/vendors" },
                { label: "Compare Vendors",       href: "/compare" },
                { label: "Verify Documents",      href: "/verify"  },
              ].map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="px-4 py-2 text-xs font-bold text-[#10b981] border border-[#10b981]/40 rounded-lg hover:bg-[#10b981] hover:text-white transition-colors"
                >
                  {t.label} →
                </Link>
              ))}
            </div>
          </div>

          {/* Connector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e2e8f0]" />
            <p className="text-xs font-bold text-[#94a3b8] whitespace-nowrap">Need full analytics & audit trails? Upgrade your team ↓</p>
            <div className="flex-1 h-px bg-[#e2e8f0]" />
          </div>

          {/* Step labels for paid plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[10px] font-black">2</div>
              <p className="text-xs font-black text-[#2563eb] uppercase tracking-widest">Step 2 · Evaluate at Scale</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[10px] font-black">3</div>
              <p className="text-xs font-black text-[#7c3aed] uppercase tracking-widest">Step 3 · Dedicated Intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#d97706] flex items-center justify-center text-white text-[10px] font-black">4</div>
              <p className="text-xs font-black text-[#d97706] uppercase tracking-widest">Step 4 · Custom Infrastructure</p>
            </div>
          </div>

          {/* Paid plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1 — Enterprise */}
            <div id="enterprise" className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
              <span className="text-xs font-black text-[#2563eb] uppercase tracking-widest mb-2">Step 2 · Evaluate at Scale</span>
              <h3 className="text-xl font-bold mb-1 text-[#0f172a]">Enterprise</h3>
              <p className="text-xs text-[#94a3b8] mb-3">Best for: Small–mid buyer teams that need full analytics and audit-ready reports</p>
              <div className="text-4xl font-black text-[#0f172a] mb-1">
                SGD 499
                <span className="text-lg text-[#64748b] font-normal">/mo</span>
              </div>
              <p className="text-sm text-[#64748b] mb-6">For buyer teams evaluating vendors</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Full procurement analytics dashboard",
                  "Vendor comparison engine — weighted scoring",
                  "Vendor risk signals & compliance posture",
                  "Compliance health scoring (0-100)",
                  "Audit trail export (PDF + CSV)",
                  "Self-service billing portal",
                  "5,000 blockchain notarizations/month",
                  "Priority support (4h SLA)",
                ].map((f) => (
                  <CheckItem key={f} text={f} />
                ))}
              </ul>
              <p className="text-xs text-[#94a3b8] mb-6 border-t border-[#e2e8f0] pt-4">
                For institutional buyer teams, GLCs, statutory boards
              </p>
              {isEnterprise ? (
                <button
                  onClick={handleBillingPortal}
                  className="block w-full text-center bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-[#1e293b] transition text-sm"
                >
                  Manage Billing
                </button>
              ) : isVendor ? (
                <Link
                  href="/solutions/vendors"
                  className="block w-full text-center bg-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm"
                >
                  Vendor? View Vendor Solutions →
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout("enterprise_monthly")}
                  disabled={loadingProduct === "enterprise_monthly"}
                  className="block w-full text-center bg-[#2563eb] text-white font-semibold py-3 rounded-xl hover:bg-blue-500 transition text-sm disabled:opacity-50"
                >
                  {loadingProduct === "enterprise_monthly"
                    ? "Redirecting..."
                    : "Evaluate Faster →"}
                </button>
              )}
            </div>

            {/* 2 — Enterprise Pro */}
            <div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-blue-500 shadow-2xl hover:-translate-y-1 transition-all relative flex flex-col">
              <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Recommended
              </div>
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Step 3 · Dedicated Intelligence</span>
              <h3 className="text-xl font-bold mb-1 text-white">Enterprise Pro</h3>
              <p className="text-xs text-white/40 mb-3">Best for: Large orgs, GLCs, and MNCs that need a dedicated account manager and multi-sector views</p>
              <div className="text-4xl font-black text-blue-400 mb-1">
                SGD 1,499
                <span className="text-lg text-white/60 font-normal">/mo</span>
              </div>
              <p className="text-sm text-white/60 mb-6">Dedicated account + SLA + multi-sector</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="text-sm font-semibold text-white">
                  Everything in Enterprise, plus:
                </li>
                {[
                  "Dedicated account manager + monthly review",
                  "SLA on data freshness & report turnaround",
                  "Multi-sector procurement views",
                  "Exportable datasets & custom filters",
                  "Historical trend analysis",
                  "MAS TRM, Cyber Hygiene & Third-Party Risk workflows",
                  "Unlimited blockchain notarizations",
                  "White-label reports (your branding)",
                  "24/7 priority support (2h SLA)",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-white/80"
                  >
                    <span className="text-blue-400 font-bold flex-shrink-0">
                      &#10003;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40 mb-6 border-t border-white/10 pt-4">
                For MNCs and government-linked companies
              </p>
              {isVendor ? (
                <Link
                  href="/solutions/vendors"
                  className="block w-full text-center bg-gray-500 text-white font-semibold py-3 rounded-xl transition text-sm"
                >
                  Vendor? View Vendor Solutions →
                </Link>
              ) : (
                <Link
                  href="/demo"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
                >
                  Book a Demo →
                </Link>
              )}
            </div>

            {/* 3 — Custom Enterprise */}
            <div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
              <span className="text-xs font-black text-[#d97706] uppercase tracking-widest mb-2">Step 4 · Custom Infrastructure</span>
              <h3 className="text-xl font-bold mb-1 text-[#0f172a]">Custom Enterprise</h3>
              <p className="text-xs text-[#94a3b8] mb-3">Best for: Government agencies, large statutory boards, or orgs needing on-premise or custom SLAs</p>
              <div className="text-4xl font-black text-[#0f172a] mb-1">Contact Us</div>
              <p className="text-sm text-[#64748b] mb-6">Tailored for your organization</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "On-premise deployment option",
                  "Custom compliance frameworks",
                  "Multi-subsidiary management",
                  "Dedicated infrastructure",
                  "Custom SLAs (e.g., 99.99% uptime)",
                  "SSO integration (SAML/OAuth)",
                  "Compliance team training",
                  "Government agency pricing",
                ].map((f) => (
                  <CheckItem key={f} text={f} color="text-[#d97706]" />
                ))}
              </ul>
              {isVendor ? (
                <Link
                  href="/solutions/vendors"
                  className="block w-full text-center bg-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
                >
                  Vendor? View Vendor Solutions →
                </Link>
              ) : (
                <Link
                  href="/demo"
                  className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
                >
                  Contact Enterprise Sales →
                </Link>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-[#94a3b8] mt-6">
            Start free → upgrade as your team grows. Every plan includes access to the full vendor network.
          </p>

        </div>
      </section>

      {/* Free Tools */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-white text-[10px] font-black">1</div>
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest">Step 1 · Start Free</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#0f172a] mb-2">
              Free Buyer Tools
            </h2>
            <p className="text-[#64748b]">
              Available to all buyer teams at no cost — no sign-up required
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Vendor Network",
                desc: "Browse the full directory of Singapore SMEs. Filter by compliance status, sector, and verification depth.",
                href: "/vendors",
                cta: "Browse Network →",
              },
              {
                title: "Vendor Comparison",
                desc: "Compare up to 4 vendors side-by-side across compliance scores, evidence, and procurement readiness.",
                href: "/compare",
                cta: "Compare Vendors →",
              },
              {
                title: "Document Verify",
                desc: "Verify any BOOPPA-issued document instantly. Paste a blockchain hash or scan a QR code to confirm authenticity.",
                href: "/verify",
                cta: "Verify a Document →",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold mb-2 text-[#0f172a]">
                  {t.title}
                </h3>
                <p className="text-sm text-[#64748b] mb-6">{t.desc}</p>
                <Link
                  href={t.href}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">
            Cut your vendor evaluation time in half.
          </h2>
          <p className="text-white/70 text-xl mb-10">
            Start with free tools. Upgrade when your team needs more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/vendors"
              className="inline-block px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xl rounded-2xl transition-colors shadow-lg"
            >
              Start Free →
            </Link>
            <Link
              href="/demo"
              className="inline-block px-10 py-5 border border-white/30 hover:border-white/60 text-white font-black text-xl rounded-2xl transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
