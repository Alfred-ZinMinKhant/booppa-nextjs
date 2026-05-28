"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SUBSCRIPTION_PRODUCTS } from "@/lib/pricing";

const BUYER_TIER_KEYS = ["buyer_starter_monthly", "buyer_pro_monthly", "buyer_enterprise_monthly"] as const;

interface UserInfo {
  email: string;
  role: string;
  plan: string;
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
      <span className={`${color} font-bold flex-shrink-0`}>✓</span>
      {text}
    </li>
  );
}

const JOURNEY_STEPS = [
  { n: "1", label: "Start Free",         color: "#10b981", bg: "#f0fdf4" },
  { n: "2", label: "Buyer Essentials",   color: "#0ea5e9", bg: "#f0f9ff" },
  { n: "3", label: "Buyer Professional", color: "#2563eb", bg: "#eff6ff" },
  { n: "4", label: "Buyer Enterprise",   color: "#7c3aed", bg: "#f5f3ff" },
];

export default function SolutionsProcurementPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data);
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(productType: string) {
    if (!user) {
        window.location.href = `/login?from=/solutions/procurement`;
        return;
    }
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

  const isVendor = user?.role === "VENDOR";

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
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Reduce vendor risk.
            <br />
            <span className="text-blue-400">Evaluate faster.</span>
            <br />
            Award confidently.
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop chasing vendors for compliance documents. BOOPPA gives your
            team instant access to blockchain-verified vendor evidence &mdash;
            so you can shortlist confidently and award faster.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
                href="#pricing"
                className="px-10 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
            >
                View Pricing
            </a>
            <Link
                href="/demo"
                className="border border-white text-white px-10 py-4 text-lg font-bold hover:bg-white hover:text-[#0f172a] rounded-xl transition-all"
            >
                Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">Institutional Evaluation Tools</h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">Stop chasing documents. Get instant, verified compliance evidence on your entire supply chain.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-6 py-5 mb-16 max-w-3xl mx-auto shadow-sm">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {JOURNEY_STEPS.map((s, i, arr) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: s.color + "40", background: s.bg }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: s.color }}>{s.n}</div>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <span className="text-[#cbd5e1] font-bold text-sm">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUYER_TIER_KEYS.map((key) => {
              const p = SUBSCRIPTION_PRODUCTS[key];
              const isFeatured = key === "buyer_pro_monthly";
              const accent = isFeatured ? "text-blue-600" : "text-[#0f172a]";
              const cardBorder = isFeatured ? "border-2 border-blue-500 shadow-md" : "border border-[#e2e8f0] shadow-sm";
              const btnBg = isFeatured ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "bg-[#0f172a]";
              return (
                <div key={key} className={`bg-white p-8 rounded-[2rem] ${cardBorder} hover:-translate-y-1 transition-all relative flex flex-col`}>
                  {p.badge && (
                    <div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{p.badge}</div>
                  )}
                  <h3 className="text-xl font-bold text-[#0f172a] mb-3">{p.name}</h3>
                  <div className={`text-4xl font-black mb-1 ${accent}`}>SGD {p.price}<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
                  <p className="text-sm text-[#64748b] mb-6">{p.description}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map(f => <CheckItem key={f} text={f} color={isFeatured ? "text-blue-600" : "text-[#10b981]"} />)}
                  </ul>
                  <button
                    disabled={loadingProduct === key}
                    onClick={() => handleCheckout(key)}
                    className={`w-full ${btnBg} text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50`}
                  >
                    {loadingProduct === key ? "Redirecting..." : "Select Plan"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Notana Document Add-On */}
          {(() => {
            const addon = SUBSCRIPTION_PRODUCTS.notana_document_monthly;
            return (
              <div className="mt-12 bg-gradient-to-r from-amber-50 to-white p-8 rounded-[2rem] border border-amber-200 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="inline-block bg-amber-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">{addon.badge}</div>
                  <h3 className="text-2xl font-black text-[#0f172a] mb-2">{addon.name} — for buyers who need certified vendor documents</h3>
                  <p className="text-sm text-[#64748b] mb-3">Notarisations are a Vendor tool by default. Add Notana Document to any Buyer plan if your procurement workflow requires buyer-initiated notarisation of vendor evidence.</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    {addon.features.map(f => <CheckItem key={f} text={f} color="text-amber-600" />)}
                  </ul>
                </div>
                <div className="flex-shrink-0 text-center md:text-right">
                  <div className="text-3xl font-black text-[#0f172a] mb-1">SGD {addon.price}<span className="text-base text-[#64748b] font-normal">/mo</span></div>
                  <button
                    disabled={loadingProduct === "notana_document_monthly"}
                    onClick={() => handleCheckout("notana_document_monthly")}
                    className="bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 hover:bg-amber-700"
                  >
                    {loadingProduct === "notana_document_monthly" ? "Redirecting..." : "Add to Plan"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto text-center">
            <h2 className="text-3xl font-black text-[#0f172a] mb-12">Free Tools for All Buyer Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-blue-400 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Vendor Network</h3>
                    <p className="text-sm text-[#64748b] mb-6">Browse and search the directory of verified Singapore vendors at no cost.</p>
                    <Link href="/vendors" className="text-blue-600 font-bold hover:underline">Browse Network →</Link>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-blue-400 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Comparison Engine</h3>
                    <p className="text-sm text-[#64748b] mb-6">Compare vendors side-by-side on verification depth and readiness scores.</p>
                    <Link href="/compare" className="text-blue-600 font-bold hover:underline">Compare Vendors →</Link>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] hover:border-blue-400 hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold mb-4 text-[#0f172a]">Document Verify</h3>
                    <p className="text-sm text-[#64748b] mb-6">Verify document authenticity via blockchain hash or QR code instantly.</p>
                    <Link href="/verify" className="text-blue-600 font-bold hover:underline">Verify Document →</Link>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#0f172a] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">Cut your evaluation time in half.</h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">Start with free tools. Upgrade to full analytics when your team needs more depth.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/vendors" className="px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xl rounded-2xl transition shadow-lg">Start Free →</Link>
            <Link href="/demo" className="px-10 py-5 border border-white/20 hover:border-white/50 text-white font-black text-xl rounded-2xl transition">Book a Demo</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
