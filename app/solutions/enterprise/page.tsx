"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function EnterprisePage() {
	const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
	const [user, setUser] = useState<UserInfo | null>(null);
	const [billingTab, setBillingTab] = useState<"one-time" | "subscription">("one-time");

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
			window.location.href = `/login?from=/solutions/enterprise`;
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

	return (
		<main className="bg-white min-h-screen overflow-x-hidden">
			{/* Hero */}
			<section className="py-24 px-6 bg-[#0f172a] text-white">
				<div className="max-w-[1200px] mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-full text-sm font-medium text-blue-400 mb-8 bg-blue-500/10">
						Enterprise Solutions
					</div>
					<h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
						Everything Booppa offers.
						<br />
						<span className="text-blue-400">One Trusted Platform.</span>
					</h1>
					<p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
						From a first compliance check to full enterprise infrastructure — blockchain-anchored evidence at every tier.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/demo"
                            className="px-10 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
                        >
                            Book a Demo
                        </Link>
                        <Link
                            href="/vendors"
                            className="border border-white text-white px-10 py-4 text-lg font-bold hover:bg-white hover:text-[#0f172a] rounded-xl transition-all"
                        >
                            Browse Network
                        </Link>
					</div>
				</div>
			</section>

            {/* Enterprise Plans */}
			<section id="pricing" className="py-24 px-6 bg-[#f8fafc]">
				<div className="max-w-[1200px] mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">Available Now</h2>
						<p className="text-lg text-[#64748b] max-w-2xl mx-auto">Institutional-grade tools for teams that need verified trust.</p>
					</div>

					{/* Billing-type toggle */}
					<div className="flex justify-center mb-12">
						<div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-[#e2e8f0]">
							<button
								type="button"
								onClick={() => setBillingTab("one-time")}
								className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billingTab === "one-time" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
							>
								One-Time
							</button>
							<button
								type="button"
								onClick={() => setBillingTab("subscription")}
								className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${billingTab === "subscription" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
							>
								Subscription
							</button>
						</div>
					</div>

					{/* One-Time packages */}
					{billingTab === "one-time" && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* PDPA Quick Scan */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold text-[#0f172a] mb-2">PDPA Quick Scan</h3>
                            <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 299</div>
                            <p className="text-xs text-[#64748b] mb-6">one-time payment</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {["Public-facing compliance check", "Score + findings report (PDF)", "Polygon Amoy Testnet timestamp", "Independent hash verification"].map(f => <CheckItem key={f} text={f} />)}
                            </ul>
                            <div className="pt-6 border-t border-[#f1f5f9] mb-6">
                                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
                                <p className="text-sm text-[#475569]">SMEs, awareness, first-step compliance</p>
                            </div>
                            <button 
								disabled={loadingProduct === "pdpa_quick_scan"}
								onClick={() => handleCheckout("pdpa_quick_scan")} 
								className="block w-full text-center bg-[#0f172a] text-white font-bold py-4 rounded-2xl hover:bg-[#1e293b] transition disabled:opacity-50"
							>
                                {loadingProduct === "pdpa_quick_scan" ? "Redirecting..." : "Run My Scan — SGD 299 →"}
                            </button>
                        </div>

                        {/* Compliance Bundle */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-[#0f172a]">Compliance Bundle</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">3-doc pack</span>
                            </div>
                            <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 799</div>
                            <p className="text-xs text-[#64748b] mb-6">one-time payment</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {["PDPA Quick Scan included", "RFP Complete — 15 Q&A", "Compliance Cover Sheet v3", "All 3 documents on Amoy Testnet"].map(f => <CheckItem key={f} text={f} color="text-violet-500" />)}
                            </ul>
                            <div className="pt-6 border-t border-[#f1f5f9] mb-6">
                                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
                                <p className="text-sm text-[#475569]">tender response, vendor onboarding</p>
                            </div>
                            <button 
								disabled={loadingProduct === "compliance_evidence_pack"}
								onClick={() => handleCheckout("compliance_evidence_pack")} 
								className="block w-full text-center bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
							>
                                {loadingProduct === "compliance_evidence_pack" ? "Redirecting..." : "Get Bundle — SGD 799 →"}
                            </button>
                        </div>
                    </div>
                    )}

                    {/* Subscriptions */}
                    {billingTab === "subscription" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Standard Suite */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-[#0f172a]">Standard Suite</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Suite</span>
                            </div>
                            <div className="text-4xl font-black text-[#0f172a] mb-1">SGD 1,800<span className="text-lg text-[#64748b] font-normal">/month</span></div>
                            <p className="text-xs text-[#64748b] mb-6">Subscription</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {["MAS TRM — all 13 domains", "AI gap analysis (DeepSeek)", "50 notarizations/month", "RESTful API + webhooks"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
                            </ul>
                            <div className="pt-6 border-t border-[#f1f5f9] mb-6">
                                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
                                <p className="text-sm text-[#475569]">banks, fintechs, healthcare — MAS regulated</p>
                            </div>
                            <button 
								disabled={loadingProduct === "standard_suite_monthly"}
								onClick={() => handleCheckout("standard_suite_monthly")} 
								className="block w-full text-center border-2 border-[#0f172a] text-[#0f172a] font-bold py-3.5 rounded-2xl hover:bg-[#0f172a] hover:text-white transition disabled:opacity-50"
							>
                                {loadingProduct === "standard_suite_monthly" ? "Redirecting..." : "Subscribe — SGD 1,800/mo →"}
                            </button>
                        </div>

                        {/* Pro Suite */}
                        <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border-2 border-blue-500 shadow-2xl relative flex flex-col lg:col-span-2">
                            <div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">★ Most Popular</div>
                            <div className="flex flex-col lg:flex-row gap-8 h-full">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-white mb-2">Pro Suite</h3>
                                    <div className="text-5xl font-black text-blue-400 mb-1">SGD 4,500<span className="text-xl text-white/40 font-normal">/month</span></div>
                                    <p className="text-sm text-white/60 mb-8 leading-relaxed">Full enterprise evidence infrastructure. Multi-subsidiary management and a generous 100 notarizations every month.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {["SSO — SAML 2.0 + OIDC", "White-label reports", "Multi-subsidiary management", "100 notarizations/month"].map(f => (
                                            <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                                                <span className="text-blue-400 font-bold">✓</span>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:w-72 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Includes</p>
                                    <p className="text-sm text-white/80 mb-8 italic">Everything in Standard Suite</p>
                                    <div className="mb-8">
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Best for</p>
                                        <p className="text-sm text-white/60">groups, GLC subsidiaries, corporate procurement, enterprise vendors managing multiple entities</p>
                                    </div>
                                    <button 
										disabled={loadingProduct === "pro_suite_monthly"}
										onClick={() => handleCheckout("pro_suite_monthly")} 
										className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/30 text-center disabled:opacity-50"
									>
                                        {loadingProduct === "pro_suite_monthly" ? "Redirecting..." : "Subscribe — SGD 4,500/mo →"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Custom Enterprise */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
                            <h3 className="text-xl font-bold text-[#0f172a] mb-2">Custom Enterprise</h3>
                            <div className="text-4xl font-black text-[#0f172a] mb-8">Contact Us</div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {["Everything in Pro Suite", "On-premise infrastructure", "99.99% uptime SLA (multi-AZ)", "GeBIZ-ready documentation"].map(f => <CheckItem key={f} text={f} color="text-amber-500" />)}
                            </ul>
                            <div className="pt-6 border-t border-[#f1f5f9] mb-6">
                                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
                                <p className="text-sm text-[#475569]">government agencies, statutory boards</p>
                            </div>
                            <Link href="/demo" className="block w-full text-center border-2 border-[#0f172a] text-[#0f172a] font-bold py-3.5 rounded-2xl hover:bg-[#0f172a] hover:text-white transition">
                                Contact Sales →
                            </Link>
                        </div>
                    </div>
                    )}
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-24 px-6 bg-[#0f172a] text-white text-center">
				<div className="max-w-2xl mx-auto">
					<h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
						Ready for institutional trust?
					</h2>
					<p className="text-white/70 text-xl mb-10">
						Join leading statutory boards and MNCs scaling their compliance with BOOPPA.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							href="/demo"
							className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl transition-colors shadow-lg"
						>
							Book an Enterprise Demo
						</Link>
						<Link
							href="/vendors"
							className="inline-block px-10 py-5 border border-white/30 hover:border-white/60 text-white font-black text-xl rounded-2xl transition-colors"
						>
							Browse Vendor Network
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
