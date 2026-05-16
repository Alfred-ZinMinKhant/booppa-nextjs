"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Tab =
	| "vendors"
	| "buyers"
	| "enterprise";

function CheckItem({
	text,
	color = "text-[#10b981]",
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

const BUNDLE_TYPES = new Set([
	"vendor_trust_pack",
	"rfp_accelerator",
	"enterprise_bid_kit",
	"compliance_evidence_pack",
]);

async function startCheckout(productType: string, extraBody?: Record<string, string>): Promise<void> {
	try {
		const res = await fetch("/api/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ productType, ...extraBody }),
		});
		const data = await res.json();
		if (data.url) {
			window.location.href = data.url;
		} else if (res.status === 409) {
			window.location.href = "/vendor/dashboard";
		} else if (res.status === 422 && /website/i.test(data.error || "")) {
			const website = prompt("We need your website URL to run your first scan.\n\nEnter your website (e.g. https://example.com):");
			if (website?.trim()) {
				await startCheckout(productType, { ...(extraBody || {}), website: website.trim() });
			}
		} else if (res.status === 422 && /company/i.test(data.error || "")) {
			const company = prompt("We need your company name to generate your bundle reports.\n\nEnter your company name:");
			if (company?.trim()) {
				await startCheckout(productType, { ...(extraBody || {}), company_name: company.trim() });
			}
		} else {
			alert(data.error || "Unable to start checkout. Please try again.");
		}
	} catch {
		alert("Unable to start checkout. Please try again.");
	}
}

export default function PricingPage() {
	const [activeTab, setActiveTab] = useState<Tab>("vendors");
	const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const [activeSubs, setActiveSubs] = useState<string[]>([]);
	const [platformStats, setPlatformStats] = useState({ vendorsIndexed: 0, verifiedEntities: 0, openTenders: 0 });

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => r.ok ? r.json() : null)
			.then((d) => {
				if (d && !d.error) setLoggedIn(true);
			})
			.catch(() => {});

		fetch('/api/platform-stats')
			.then(r => r.ok ? r.json() : null)
			.then(data => { if (data) setPlatformStats(data); })
			.catch(() => {});

		fetch(`/api/vendor/dashboard-alerts?t=${Date.now()}`)
			.then(r => r.ok ? r.json() : null)
			.then((alerts: any) => {
				const subs = alerts?.activeSubscriptions || [];
				setActiveSubs(subs);
			})
			.catch(() => {});
	}, []);

	const [bundleModal, setBundleModal] = useState<{ productType: string } | null>(null);
	const [bundleForm, setBundleForm] = useState({ website: "", company: "" });
	const [bundleError, setBundleError] = useState<string | null>(null);

	async function handleCheckout(productType: string) {
		if (!loggedIn) {
			const from = typeof window !== "undefined" ? `${window.location.pathname}${window.location.hash || ""}` : "/pricing";
			window.location.href = `/login?from=${encodeURIComponent(from)}`;
			return;
		}
		if (BUNDLE_TYPES.has(productType)) {
			try {
				const meRes = await fetch("/api/auth/me");
				if (meRes.ok) {
					const me = await meRes.json();
					setBundleForm({
						website: me?.website || me?.vendor_url || "",
						company: me?.company_name || me?.company || "",
					});
				}
			} catch {}
			setBundleError(null);
			setBundleModal({ productType });
			return;
		}
		setLoadingProduct(productType);
		await startCheckout(productType);
		setLoadingProduct(null);
	}

	async function submitBundleForm() {
		if (!bundleModal) return;
		let website = bundleForm.website.trim();
		const company = bundleForm.company.trim();
		if (!website) { setBundleError("Website URL is required."); return; }
		if (!company) { setBundleError("Company name is required."); return; }
		if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
		try {
			const u = new URL(website);
			if (!u.hostname.includes(".")) throw new Error("invalid host");
		} catch {
			setBundleError("Please enter a valid website (e.g. yourcompany.com).");
			return;
		}
		const productType = bundleModal.productType;
		setLoadingProduct(productType);
		setBundleModal(null);
		await startCheckout(productType, { vendor_url: website, company_name: company });
		setLoadingProduct(null);
	}

	const tabs: { id: Tab; label: string }[] = [
		{ id: "vendors", label: "For Vendors" },
		{ id: "buyers", label: "For Buyers" },
		{ id: "enterprise", label: "For Enterprise" },
	];

	return (
		<main className="bg-white min-h-screen">
			<section className="py-24 px-6">
				<div className="container max-w-[1200px] mx-auto">
					<div className="text-center mb-16">
						<h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0f172a]">
							Transparent Pricing
						</h1>
						<p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
							No hidden fees. No "contact sales" gatekeeping. Clear costs for
							Singapore B2B procurement trust infrastructure.
						</p>
					</div>

					{/* Tab bar */}
					<div className="flex justify-center mb-16">
						<div className="bg-[#f8fafc] p-1.5 rounded-full border border-[#e2e8f0] flex gap-1 flex-wrap justify-center">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
										activeTab === tab.id
											? "bg-[#10b981] text-white shadow-lg"
											: "text-[#64748b] hover:text-[#0f172a]"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{/* ── FOR VENDORS ─────────────────────────────────────────────────── */}
					{activeTab === "vendors" && (
						<div className="space-y-12">
							{/* Free Profile Ribbon */}
							<div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
										<span className="text-xl">🛡️</span>
									</div>
									<div>
										<h3 className="text-lg font-bold text-[#0f172a]">Free Company Profile</h3>
										<p className="text-sm text-[#64748b]">Claim your presence, appear in vendor searches, and track GeBIZ opportunities at no cost.</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-xs font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full">Always Free</span>
									<Link href={loggedIn ? "/vendor/dashboard" : "/auth/register"} className="px-6 py-3 bg-[#0f172a] text-white font-bold rounded-xl hover:bg-[#1e293b] transition shadow-lg shadow-[#0f172a]/20 text-sm whitespace-nowrap">
										{loggedIn ? "Go to Dashboard" : "Claim Free Profile"} →
									</Link>
								</div>
							</div>

							{/* Section: One-Time */}
							<div>
								<div className="flex items-center gap-3 mb-8">
									<div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-black">1</div>
									<h2 className="text-2xl font-black text-[#0f172a]">One-Time Packages</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{/* Vendor Proof */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-2">Vendor Proof</h3>
										<div className="text-4xl font-black text-[#10b981] mb-1">SGD 149</div>
										<p className="text-xs text-[#64748b] mb-6">One-time payment · Lifetime verified badge</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Verified badge on profile", "Appear in verified searches", "Trust scores activation", "Embeddable trust badge"].map(f => <CheckItem key={f} text={f} />)}
										</ul>
										<Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition shadow-lg shadow-[#10b981]/20">
											Get Verified →
										</Link>
									</div>

									{/* PDPA Snapshot */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-2">PDPA Snapshot</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 299</div>
										<p className="text-xs text-[#64748b] mb-6">One-time scan · Full risk report</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["8-dimension PDPA scan", "Risk severity breakdown", "Remediation guide", "Audit-ready PDF report"].map(f => <CheckItem key={f} text={f} color="text-blue-500" />)}
										</ul>
										<button 
											disabled={loadingProduct === "pdpa_quick_scan"}
											onClick={() => handleCheckout("pdpa_quick_scan")} 
											className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
										>
											{loadingProduct === "pdpa_quick_scan" ? "Redirecting..." : "Run Scan →"}
										</button>
									</div>

									{/* Notarization */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-2">Notarization</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 69</div>
										<p className="text-xs text-[#64748b] mb-6">Per document · Blockchain anchored</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Immutable proof of content", "MAS-compliant evidence", "Shareable verification link", "QR code verification"].map(f => <CheckItem key={f} text={f} color="text-violet-500" />)}
										</ul>
										<Link href="/notarization" className="block w-full text-center border-2 border-[#0f172a] text-[#0f172a] font-bold py-3 rounded-xl hover:bg-[#0f172a] hover:text-white transition">
											Notarize Now
										</Link>
									</div>

									{/* RFP Complete */}
									<div className="bg-white p-8 rounded-[2rem] border-2 border-amber-400 shadow-sm hover:-translate-y-1 transition-all flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-2">RFP Complete</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 599</div>
										<p className="text-xs text-[#64748b] mb-6">Per RFP · Full submission kit</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Full compliance dossier", "Ready-to-submit bid kit", "Fast 24-hour turnaround", "Expert review included"].map(f => <CheckItem key={f} text={f} color="text-amber-500" />)}
										</ul>
										<button
											type="button"
											disabled={loadingProduct === "rfp_complete"}
											onClick={() => handleCheckout("rfp_complete")}
											className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
										>
											{loadingProduct === "rfp_complete" ? "Redirecting..." : "Build Bid Kit →"}
										</button>
									</div>

									{/* Compliance Bundle */}
									<div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-[#10b981] shadow-2xl hover:-translate-y-1 transition-all relative flex flex-col lg:col-span-2">
										<div className="absolute top-[-14px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</div>
										<div className="flex flex-col lg:flex-row lg:items-center gap-8">
											<div className="flex-1">
												<h3 className="text-2xl font-black text-white mb-2">Compliance Bundle</h3>
												<p className="text-white/60 mb-6">The ultimate foundation for winning large-scale enterprise and government contracts.</p>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{["PDPA Scan (Full)", "RFP Complete Kit", "Blockchain Cover Sheet", "Full Evidence Archive"].map(f => (
														<div key={f} className="flex items-center gap-2 text-sm text-white/80">
															<span className="text-[#10b981] font-bold">✓</span>
															{f}
														</div>
													))}
												</div>
											</div>
											<div className="lg:w-64 flex flex-col items-center lg:items-end justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
												<div className="text-5xl font-black text-white mb-1">799</div>
												<div className="text-white/40 text-xs mb-6 text-center lg:text-right">SGD · One-time bundle<br/>Save over SGD 100</div>
												<button 
													disabled={loadingProduct === "compliance_evidence_pack"}
													onClick={() => handleCheckout("compliance_evidence_pack")} 
													className="w-full bg-[#10b981] text-white font-bold py-4 rounded-2xl hover:bg-[#059669] transition shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
												>
													{loadingProduct === "compliance_evidence_pack" ? "Redirecting..." : "Get Bundle →"}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Section: Subscription */}
							<div className="pt-8 border-t border-[#e2e8f0]">
								<div className="flex items-center gap-3 mb-8">
									<div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-black">2</div>
									<h2 className="text-2xl font-black text-[#0f172a]">Ongoing Subscriptions</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Vendor Active */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-1">Vendor Active</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 39<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
										<p className="text-xs text-[#64748b] mb-6">Essential visibility for active vendors</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Priority in searches", "Real-time GeBIZ alerts", "Unlimited probability checks", "Active badge status"].map(f => <CheckItem key={f} text={f} />)}
										</ul>
										<button 
											disabled={loadingProduct === "vendor_active_monthly"}
											onClick={() => handleCheckout("vendor_active_monthly")} 
											className="w-full border-2 border-blue-500 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-500 hover:text-white transition disabled:opacity-50"
										>
											{loadingProduct === "vendor_active_monthly" ? "Redirecting..." : "Subscribe"}
										</button>
									</div>

									{/* PDPA Monitor */}
									<div className="bg-white p-8 rounded-[2rem] border-2 border-blue-500 shadow-md relative flex flex-col">
										<div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Recommended</div>
										<h3 className="text-xl font-bold text-[#0f172a] mb-1">PDPA Monitor</h3>
										<div className="text-4xl font-black text-blue-600 mb-1">SGD 299<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
										<p className="text-xs text-[#64748b] mb-6">Automated data protection compliance</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Monthly automated scans", "Continuous risk monitoring", "Drift alerts & notifications", "Updated audit logs"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
										</ul>
										<button 
											disabled={loadingProduct === "pdpa_monitor_monthly"}
											onClick={() => handleCheckout("pdpa_monitor_monthly")} 
											className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
										>
											{loadingProduct === "pdpa_monitor_monthly" ? "Redirecting..." : "Start Monitoring"}
										</button>
									</div>

									{/* Compliance Evidence */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-1">Compliance Evidence</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 499<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
										<p className="text-xs text-[#64748b] mb-6">Automated evidence & bid readiness</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["All-in-one PDF/Docs evidence", "PDPA + RFP data coverage", "Blockchain-anchored cover sheets", "Priority procurement support"].map(f => <CheckItem key={f} text={f} color="text-violet-500" />)}
										</ul>
										<button 
											disabled={loadingProduct === "compliance_evidence_monthly"}
											onClick={() => handleCheckout("compliance_evidence_monthly")} 
											className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
										>
											{loadingProduct === "compliance_evidence_monthly" ? "Redirecting..." : "Select Plan"}
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* ── FOR BUYERS ──────────────────────────────────────────────────── */}
					{activeTab === "buyers" && (
						<div className="space-y-8">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-black text-[#0f172a] mb-4">Institutional Vendor Evaluation</h2>
								<p className="text-[#64748b] max-w-2xl mx-auto text-lg">Stop chasing documents. Get instant, verified compliance evidence on your entire supply chain.</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{/* Enterprise Buyer (Existing) */}
								<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
									<h3 className="text-xl font-bold text-[#0f172a] mb-3">Enterprise Buyer</h3>
									<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 499<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
									<p className="text-sm text-[#64748b] mb-6">For buyer teams evaluating vendors</p>
									<ul className="space-y-3 mb-8 flex-1">
										{["Full analytics dashboard", "Vendor comparison engine", "Risk signals & compliance posture", "200 notarizations/month"].map(f => <CheckItem key={f} text={f} />)}
									</ul>
									<button 
										disabled={loadingProduct === "enterprise_monthly"}
										onClick={() => handleCheckout("enterprise_monthly")} 
										className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50"
									>
										{loadingProduct === "enterprise_monthly" ? "Redirecting..." : "Select Plan"}
									</button>
								</div>

								{/* Evaluate Your Suppliers */}
								<div className="bg-white p-8 rounded-[2rem] border-2 border-blue-500 shadow-md hover:-translate-y-1 transition-all relative flex flex-col">
									<div className="absolute top-[-14px] left-8 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New</div>
									<h3 className="text-xl font-bold text-[#0f172a] mb-3">Evaluate Your Suppliers</h3>
									<div className="text-4xl font-black text-blue-600 mb-1">SGD 499<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
									<p className="text-sm text-[#64748b] mb-6">Deep insights into vendor health</p>
									<ul className="space-y-3 mb-8 flex-1">
										{["Enhanced vendor due diligence", "Automated risk scoring", "Compliance drift tracking", "Team collaboration tools"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
									</ul>
									<button 
										disabled={loadingProduct === "evaluate_suppliers_monthly"}
										onClick={() => handleCheckout("evaluate_suppliers_monthly")} 
										className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
									>
										{loadingProduct === "evaluate_suppliers_monthly" ? "Redirecting..." : "Select Plan"}
									</button>
								</div>

								{/* Verify your Supplier Evidence */}
								<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
									<h3 className="text-xl font-bold text-[#0f172a] mb-3">Verify Supplier Evidence</h3>
									<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 799<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
									<p className="text-sm text-[#64748b] mb-6">Full audit-ready verification suite</p>
									<ul className="space-y-3 mb-8 flex-1">
										{["Full evidence retrieval", "On-chain verification logs", "Custom evaluation frameworks", "Priority compliance support"].map(f => <CheckItem key={f} text={f} color="text-violet-500" />)}
									</ul>
									<button 
										disabled={loadingProduct === "verify_supplier_evidence_monthly"}
										onClick={() => handleCheckout("verify_supplier_evidence_monthly")} 
										className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50"
									>
										{loadingProduct === "verify_supplier_evidence_monthly" ? "Redirecting..." : "Select Plan"}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* ── FOR ENTERPRISE ──────────────────────────────────────────────── */}
					{activeTab === "enterprise" && (
						<div className="space-y-12">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-black text-[#0f172a] mb-4">Institutional Trust Infrastructure</h2>
								<p className="text-[#64748b] max-w-2xl mx-auto text-lg">From a first compliance check to full enterprise infrastructure — one platform, blockchain-anchored evidence at every tier.</p>
							</div>

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
										className="w-full bg-[#0f172a] text-white font-bold py-4 rounded-2xl hover:bg-[#1e293b] transition disabled:opacity-50"
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
										className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
									>
										{loadingProduct === "compliance_evidence_pack" ? "Redirecting..." : "Get Bundle — SGD 799 →"}
									</button>
								</div>

								{/* Standard Suite */}
								<div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
									<div className="flex justify-between items-start mb-2">
										<h3 className="text-xl font-bold text-[#0f172a]">Standard Suite</h3>
										<span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Suite</span>
									</div>
									<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 1,800<span className="text-lg text-[#64748b] font-normal">/month</span></div>
									<p className="text-xs text-[#64748b] mb-6">Subscription</p>
									<ul className="space-y-3 mb-8 flex-1">
										{["MAS TRM — all 13 domains", "AI gap analysis (Claude Haiku)", "50 notarizations/month", "RESTful API + webhooks"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
									</ul>
									<div className="pt-6 border-t border-[#f1f5f9] mb-6">
										<p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
										<p className="text-sm text-[#475569]">banks, fintechs, healthcare — MAS regulated</p>
									</div>
									<button 
										disabled={loadingProduct === "standard_suite_monthly"}
										onClick={() => handleCheckout("standard_suite_monthly")} 
										className="w-full border-2 border-[#0f172a] text-[#0f172a] font-bold py-3.5 rounded-2xl hover:bg-[#0f172a] hover:text-white transition disabled:opacity-50"
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
						</div>
					)}

					{/* FAQ */}
					<div className="mt-20 bg-[#f8fafc] p-8 lg:p-16 rounded-[3rem] border border-[#e2e8f0]">
						<h2 className="text-3xl font-black mb-12 text-center text-[#0f172a]">
							Pricing FAQ
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-5xl mx-auto">
							{[
								{
									q: "Is this PDPC-approved certification?",
									a: "No. BOOPPA provides technical evidence and documentation tools. This is not regulatory certification or legal advice. We help you generate operational compliance evidence — you remain responsible for actual compliance.",
								},
								{
									q: "Can I cancel anytime?",
									a: "Yes. Monthly plans are cancel-anytime with no long-term contracts. Your historical evidence and certificates remain accessible for 90 days after cancellation.",
								},
								{
									q: "What payment methods do you accept?",
									a: "All payments via Stripe: Visa, Mastercard, Amex. PayNow available for Singapore customers. Invoicing available for Enterprise plans.",
								},
								{
									q: "Is GST included?",
									a: "Prices shown exclude GST. 9% GST will be added for Singapore-registered businesses at checkout.",
								},
								{
									q: "When does Strategy 6 fire?",
									a: "Strategy 6 fires automatically when RFP Express is purchased (standalone or as part of the RFP Accelerator bundle). It does not fire for RFP Complete — that is a vendor-side credibility tool, not a lead generation mechanism.",
								},
							].map((faq) => (
								<div key={faq.q}>
									<h4 className="text-base font-bold mb-2 text-[#0f172a]">
										{faq.q}
									</h4>
									<p className="text-[#64748b] text-sm leading-relaxed">
										{faq.a}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{bundleModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setBundleModal(null)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
						<h3 className="text-xl font-black text-[#0f172a] mb-2">Activate your bundle</h3>
						<p className="text-sm text-[#64748b] mb-6 leading-relaxed">
							We need your website URL and company name so the included PDPA Quick Scan and Vendor Proof can run on the right entity.
						</p>
						<div className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2">Website URL</label>
								<input
									type="text"
									autoFocus
									placeholder="yourcompany.com"
									value={bundleForm.website}
									onChange={(e) => setBundleForm((f) => ({ ...f, website: e.target.value }))}
									className="w-full px-4 py-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
								/>
							</div>
							<div>
								<label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2">Company name</label>
								<input
									type="text"
									placeholder="As it should appear on your reports"
									value={bundleForm.company}
									onChange={(e) => setBundleForm((f) => ({ ...f, company: e.target.value }))}
									className="w-full px-4 py-3 rounded-xl border-2 border-[#e2e8f0] focus:border-[#10b981] focus:outline-none text-sm text-[#0f172a]"
								/>
							</div>
							{bundleError && (
								<p className="text-sm text-red-600 font-semibold">{bundleError}</p>
							)}
						</div>
						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={() => setBundleModal(null)}
								className="flex-1 py-3 rounded-xl border-2 border-[#e2e8f0] text-[#475569] font-bold text-sm hover:bg-[#f8fafc] transition"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={submitBundleForm}
								className="flex-1 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm shadow-lg shadow-[#10b981]/20 transition"
							>
								Continue to checkout →
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
