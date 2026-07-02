"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SUBSCRIPTION_PRODUCTS } from "@/lib/pricing";
import { startCheckout } from "@/lib/checkout";

const BUYER_TIER_KEYS = ["buyer_starter_monthly", "buyer_pro_monthly", "buyer_enterprise_monthly"] as const;

type Tab =
	| "vendors"
	| "buyers"
	| "enterprise"
	| "csps";

type Faq = { q: string; a: string };

// Questions that apply to every audience — appended after the tab-specific set.
const COMMON_FAQ: Faq[] = [
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
];

const FAQ_BY_TAB: Record<Tab, Faq[]> = {
	vendors: [
		{
			q: "Is this PDPC-approved certification?",
			a: "No. BOOPPA provides technical evidence and documentation tools. This is not regulatory certification or legal advice. We help you generate operational compliance evidence — you remain responsible for actual compliance.",
		},
		{
			q: "When does Strategy 6 fire?",
			a: "Strategy 6 fires automatically when RFP Express is purchased. It does not fire for RFP Complete — that is a vendor-side credibility tool, not a lead generation mechanism.",
		},
		{
			q: "What's the difference between a one-time scan and monthly monitoring?",
			a: "A one-time scan gives you a point-in-time PDPA risk report and verified badge. Monthly monitoring re-scans automatically, tracks drift, and keeps your audit log and badge current — so your compliance posture stays evidenced over time.",
		},
	],
	buyers: [
		{
			q: "What do buyer plans actually give me?",
			a: "Procurement intelligence: verify vendors against ACRA/PDPC/GeBIZ, browse and compare verified suppliers, and monitor supply-chain risk. Higher tiers add more seats, deeper analytics, and bulk verification.",
		},
		{
			q: "Can I verify vendors who aren't on BOOPPA yet?",
			a: "Yes. You can run a verification on any Singapore-registered entity by UEN — the vendor doesn't need an existing BOOPPA profile for you to check their compliance signals.",
		},
		{
			q: "Is this regulatory certification of my suppliers?",
			a: "No. BOOPPA surfaces compliance evidence and risk signals to support your own due diligence. It is not certification or legal advice — your procurement decisions remain yours.",
		},
	],
	enterprise: [
		{
			q: "What's included in Enterprise suites?",
			a: "Multi-entity/subsidiary management, SSO, API access, webhooks, org-level controls, and priority support — on top of the vendor and procurement tooling. Suites are billed monthly with annual options available.",
		},
		{
			q: "Do you support multiple subsidiaries or entities?",
			a: "Yes. Enterprise supports a parent organisation with multiple subsidiaries, each with its own profiles, reports, and evidence, managed under one account.",
		},
		{
			q: "Can we get invoicing and a custom contract?",
			a: "Yes. Enterprise plans support invoicing and custom terms. Contact us to arrange procurement-friendly billing and any required security/legal review.",
		},
	],
	csps: [
		{
			q: "Is this an ACRA licence or ACRA-approved certification?",
			a: "No. The CSP Compliance Pack is compliance tooling and documentation — it generates your AML/CFT/PF programme, tracks your obligations, and produces a tamper-evident evidence trail. It is not regulatory certification or legal advice. You remain responsible for actual compliance with the ACRA RFA regime.",
		},
		{
			q: "What's the difference between the Full pack and the Monitoring Add-On?",
			a: "The Full pack does the whole programme: 8 AI-generated documents, the client CDD/EDD registry, STR framework, nominee & UBO registers, scoring, calendar, and training — and monitoring is already included. The Monitoring Add-On is a separate, standalone subscription for CSPs who already run their own AML programme and only want ongoing alerts. If you buy the Full pack you do not need the add-on.",
		},
		{
			q: "One-time vs monthly — what do I actually get?",
			a: "Both unlock the full pack. One-time (SGD 3,999) is lifetime access to the pack and your generated programme. Monthly (SGD 299/mo) is the same pack plus continuous monitoring and regulatory updates, cancel anytime.",
		},
		{
			q: "Is my clients' personal data (NRIC, passport) secure?",
			a: "Yes. Sensitive identity fields are encrypted at rest with AES (Fernet) before they touch the database, and every CDD, STR decision, nominee and training record is SHA-256 hashed and notarized on-chain so the audit trail is tamper-evident.",
		},
	],
};

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
	"compliance_evidence_pack",
]);

export default function PricingPage() {
	const [activeTab, setActiveTab] = useState<Tab>("vendors");
	const [billingTab, setBillingTab] = useState<"one-time" | "subscription">("one-time");
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
		{ id: "csps", label: "For CSPs" },
	];

	const [cspBilling, setCspBilling] = useState<"one-time" | "subscription">("one-time");

	return (
		<main className="bg-white min-h-screen">
			<section className="py-24 px-6">
				<div className="container max-w-[1200px] mx-auto">
					<div className="text-center mb-16">
						<h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0f172a]">
							Transparent Pricing
						</h1>
						<p className="text-xl text-[#64748b] max-w-3xl mx-auto leading-relaxed">
							No hidden fees. No &quot;contact sales&quot; gatekeeping. Clear costs for
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

							{/* Billing-type toggle */}
							<div className="flex justify-center mb-12">
								<div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]">
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

							{/* Section: One-Time */}
							{billingTab === "one-time" && (
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
											{["11-dimension PDPA scan", "Risk severity breakdown", "PDPC enforcement precedents per finding", "Remediation guide", "Audit-ready PDF report"].map(f => <CheckItem key={f} text={f} color="text-blue-500" />)}
										</ul>
										<button 
											disabled={loadingProduct === "pdpa_quick_scan"}
											onClick={() => handleCheckout("pdpa_quick_scan")} 
											className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
										>
											{loadingProduct === "pdpa_quick_scan" ? "Redirecting..." : "Run Scan →"}
										</button>
									</div>

									{/* RFP Complete */}
									<div className="bg-white p-8 rounded-[2rem] border-2 border-amber-400 shadow-sm hover:-translate-y-1 transition-all flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-2">RFP Complete</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 599</div>
										<p className="text-xs text-[#64748b] mb-6">Per RFP · Compliance &amp; security answers</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Full compliance dossier (15 Q&A)", "PDF + editable DOCX deliverable", "Generated in under 2 minutes", "Answers verified against ACRA, PDPC, SSL, GeBIZ"].map(f => <CheckItem key={f} text={f} color="text-amber-500" />)}
										</ul>
										<button
											type="button"
											disabled={loadingProduct === "rfp_complete"}
											onClick={() => handleCheckout("rfp_complete")}
											className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
										>
											{loadingProduct === "rfp_complete" ? "Redirecting..." : "Generate Compliance Pack →"}
										</button>
									</div>

									{/* Compliance Bundle */}
									<div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-[#10b981] shadow-2xl hover:-translate-y-1 transition-all relative flex flex-col lg:col-span-2">
										<div className="absolute top-[-14px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Best Value</div>
										<div className="flex flex-col lg:flex-row lg:items-start gap-8">
											<div className="flex-1">
												<h3 className="text-2xl font-black text-white mb-2">Compliance Bundle</h3>
												<p className="text-white/60 mb-6">The ultimate foundation for winning large-scale enterprise and government contracts.</p>
												<div className="space-y-3">
													{[
														{
															label: "PDPA Governance Pack (7 documents)",
															scope: "DPMP, ROPA, Data Inventory, Third-Party/DPA Register, Breach Response Runbook, Staff Training Register, and Security Review Log — AI-drafted from your intake and grounded in a live website + PDPA scan, each SHA-256 hashed and anchored. Review & sign before evidentiary use.",
														},
														{
															label: "PDPA Scan (Full)",
															scope: "Scans privacy policy, DPO contact, cookie consent, breach notification surfaces. Identifies findings across PDPA's 7 obligations. Report + Polygon Amoy anchor.",
														},
														{
															label: "RFP Complete Kit",
															scope: "15-question regulator-ready Q&A: PDPA, ISO 27001, encryption, hosting region, sub-processors, breach history, DR/BCP. Answers verified against your website where possible. PDF + blockchain anchor.",
														},
														{
															label: "Blockchain Cover Sheet",
															scope: "9-section PDF summarising PDPA + RFP findings. You sign in-browser (or download + wet-sign) → final receipt anchored on-chain.",
														},
														{
															label: "Full Evidence Archive",
															scope: "All anchored artifacts (7 governance docs + PDPA scan + RFP kit + cover sheet) retained in your Compliance Locker (re-downloadable anytime, no retention expiry).",
														},
													].map(item => (
														<details key={item.label} className="group bg-white/5 rounded-lg border border-white/10">
															<summary className="cursor-pointer list-none px-3 py-2 flex items-center gap-2 text-sm text-white/90 font-semibold">
																<span className="text-[#10b981] font-bold">✓</span>
																<span className="flex-1">{item.label}</span>
																<span className="text-xs text-white/40 group-open:rotate-180 transition-transform">▼</span>
															</summary>
															<div className="px-3 pb-3 pt-1 text-xs text-white/70 leading-relaxed border-t border-white/10">
																{item.scope}
															</div>
														</details>
													))}
												</div>
												<div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
													<div className="bg-white/5 rounded-lg px-3 py-2">
														<p className="text-white/40 uppercase tracking-widest font-bold text-[10px]">Delivery</p>
														<p className="text-white/80 mt-0.5">PDPA + Cover Sheet in ~5 min; RFP kit ~5 min after you submit the brief.</p>
													</div>
													<div className="bg-white/5 rounded-lg px-3 py-2">
														<p className="text-white/40 uppercase tracking-widest font-bold text-[10px]">Best for</p>
														<p className="text-white/80 mt-0.5">GeBIZ tender response · enterprise vendor onboarding · regulator-ready evidence pack.</p>
													</div>
												</div>
												<a
													href="/samples/compliance-cover-sheet-sample.pdf"
													target="_blank"
													rel="noreferrer"
													className="inline-block mt-4 text-xs font-semibold text-[#10b981] hover:underline"
												>
													See a sample Cover Sheet PDF →
												</a>
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
							)}

							{/* Section: Subscription */}
							{billingTab === "subscription" && (
							<div>
								<div className="flex items-center gap-3 mb-8">
									<div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-black">2</div>
									<h2 className="text-2xl font-black text-[#0f172a]">Ongoing Subscriptions</h2>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{/* Vendor Active */}
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col">
										<h3 className="text-xl font-bold text-[#0f172a] mb-1">Vendor Active</h3>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 39<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
										<p className="text-xs text-[#64748b] mb-6">Your monthly procurement intelligence layer</p>
										<ul className="space-y-3 mb-8 flex-1">
											{["Monthly intelligence report — emailed branded PDF", "Personalized tender matches (BID / WATCH / PASS)", "Sector benchmark + Trust-score trend", "Priority placement & Active badge", "Unlimited win-probability checks"].map(f => <CheckItem key={f} text={f} />)}
										</ul>
										<button 
											disabled={loadingProduct === "vendor_active_monthly"}
											onClick={() => handleCheckout("vendor_active_monthly")} 
											className="w-full border-2 border-blue-500 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-500 hover:text-white transition disabled:opacity-50"
										>
											{loadingProduct === "vendor_active_monthly" ? "Redirecting..." : "Subscribe (SGD 39/mo)"}
										</button>
										<button
											disabled={loadingProduct === "vendor_active_annual"}
											onClick={() => handleCheckout("vendor_active_annual")}
											className="w-full mt-2 border border-blue-500 text-blue-600 font-semibold py-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 text-sm"
										>
											{loadingProduct === "vendor_active_annual" ? "Redirecting..." : "Annual SGD 390 · save 2 mo"}
										</button>
									</div>

									{/* Vendor Pro — bridge tier */}
									<div className="bg-white p-8 rounded-[2rem] border-2 border-violet-500 shadow-md relative flex flex-col">
										<div className="absolute top-[-14px] left-8 bg-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New</div>
										<h3 className="text-xl font-bold text-[#0f172a] mb-1">Vendor Pro</h3>
										<div className="text-4xl font-black text-violet-600 mb-1">SGD 99<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
										<p className="text-xs text-[#64748b] mb-6">Full procurement intelligence for growing vendors</p>
										<ul className="space-y-3 mb-8 flex-1">
											{[
												"Everything in Vendor Active",
												"Consolidated monthly Intelligence Report (PDF)",
												"Win-probability tender pipeline",
												"Sector competitor intelligence",
												"Quarterly PDPA Snapshot with drift tracking",
												"1 notarization/month (SGD 69 value)",
												"Priority email support",
											].map(f => <CheckItem key={f} text={f} color="text-violet-600" />)}
										</ul>
										<button
											disabled={loadingProduct === "vendor_pro_monthly"}
											onClick={() => handleCheckout("vendor_pro_monthly")}
											className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
										>
											{loadingProduct === "vendor_pro_monthly" ? "Redirecting..." : "Subscribe (SGD 99/mo)"}
										</button>
										<button
											disabled={loadingProduct === "vendor_pro_annual"}
											onClick={() => handleCheckout("vendor_pro_annual")}
											className="w-full mt-2 border border-violet-500 text-violet-600 font-semibold py-2 rounded-xl hover:bg-violet-50 transition disabled:opacity-50 text-sm"
										>
											{loadingProduct === "vendor_pro_annual" ? "Redirecting..." : "Annual SGD 1,099 · save 2 mo"}
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
											{loadingProduct === "pdpa_monitor_monthly" ? "Redirecting..." : "Start Monitoring (SGD 299/mo)"}
										</button>
										<button
											disabled={loadingProduct === "pdpa_monitor_annual"}
											onClick={() => handleCheckout("pdpa_monitor_annual")}
											className="w-full mt-2 border border-blue-500 text-blue-600 font-semibold py-2 rounded-xl hover:bg-blue-50 transition disabled:opacity-50 text-sm"
										>
											{loadingProduct === "pdpa_monitor_annual" ? "Redirecting..." : "Annual SGD 2,990 · save 2 mo"}
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

								{/* Tender Intelligence — standalone GeBIZ analytics subscription */}
								<div className="mt-6">
									<div className="bg-white p-8 rounded-[2rem] border-2 border-violet-500 shadow-md relative flex flex-col lg:flex-row gap-8 items-start">
										<div className="absolute top-[-14px] left-8 bg-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New</div>
										<div className="flex-1">
											<h3 className="text-xl font-bold text-[#0f172a] mb-1">Tender Intelligence</h3>
											<div className="flex items-baseline gap-3 mb-1">
												<div className="text-4xl font-black text-violet-600">SGD 149<span className="text-lg text-[#64748b] font-normal">/mo</span></div>
												<div className="text-sm text-[#64748b]">or SGD 1,499/yr · save SGD 289</div>
											</div>
											<p className="text-xs text-[#64748b] mb-6">Win the right bids — GeBIZ tender analytics in one subscription</p>
											<ul className="space-y-3 mb-2">
												{[
													"Monthly sector trend reports (win-rate by agency × sector × contract size)",
													"Historical award lookup — winners, prices, dates",
													"AI bid / watch / pass timing per live tender",
													"Per-supplier benchmarking dashboard",
													"Monthly digest email with PDF report",
												].map(f => <CheckItem key={f} text={f} color="text-violet-600" />)}
											</ul>
										</div>
										<div className="w-full lg:w-72 flex flex-col gap-3 lg:pt-2">
											<button
												disabled={loadingProduct === "tender_intelligence_monthly"}
												onClick={() => handleCheckout("tender_intelligence_monthly")}
												className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
											>
												{loadingProduct === "tender_intelligence_monthly" ? "Redirecting..." : "Subscribe monthly"}
											</button>
											<button
												disabled={loadingProduct === "tender_intelligence_annual"}
												onClick={() => handleCheckout("tender_intelligence_annual")}
												className="w-full border-2 border-violet-500 text-violet-600 font-bold py-3 rounded-xl hover:bg-violet-50 transition disabled:opacity-50"
											>
												{loadingProduct === "tender_intelligence_annual" ? "Redirecting..." : "Annual · save 2 mo"}
											</button>
										</div>
									</div>
								</div>
							</div>
							)}
						</div>
					)}

					{/* ── FOR BUYERS ──────────────────────────────────────────────────── */}
					{activeTab === "buyers" && (
						<div className="space-y-8">
							<div className="text-center mb-12">
								<h2 className="text-3xl font-black text-[#0f172a] mb-4">Institutional Vendor Evaluation</h2>
								<p className="text-[#64748b] max-w-2xl mx-auto text-lg">Stop chasing documents. Get instant, verified compliance evidence on your entire supply chain — priced by the depth of scans you run.</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{BUYER_TIER_KEYS.map((key) => {
									const p = SUBSCRIPTION_PRODUCTS[key];
									const annualKey = key.replace("_monthly", "_annual") as keyof typeof SUBSCRIPTION_PRODUCTS;
									const annualPrice = (p as { priceAnnual?: number }).priceAnnual
										?? (SUBSCRIPTION_PRODUCTS[annualKey] as { price?: number } | undefined)?.price;
									const annualSavings = annualPrice ? (p.price * 12 - annualPrice) : 0;
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
												{loadingProduct === key ? "Redirecting..." : `Subscribe (SGD ${p.price}/mo)`}
											</button>
											{annualPrice && (
												<button
													disabled={loadingProduct === annualKey}
													onClick={() => handleCheckout(annualKey)}
													className={`w-full mt-2 border ${isFeatured ? "border-blue-500 text-blue-600 hover:bg-blue-50" : "border-[#0f172a] text-[#0f172a] hover:bg-[#f1f5f9]"} font-semibold py-2 rounded-xl transition disabled:opacity-50 text-sm`}
												>
													{loadingProduct === annualKey
														? "Redirecting..."
														: `Annual SGD ${annualPrice.toLocaleString()}${annualSavings > 0 ? ` · save SGD ${annualSavings.toLocaleString()}` : ""}`}
												</button>
											)}
										</div>
									);
								})}
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
								{/* PDPA Snapshot */}
								<div className="bg-white p-8 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm flex flex-col">
									<h3 className="text-xl font-bold text-[#0f172a] mb-2">PDPA Snapshot</h3>
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
										<span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">10-doc pack</span>
									</div>
									<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 799</div>
									<p className="text-xs text-[#64748b] mb-6">one-time payment</p>
									<div className="space-y-2 mb-6 flex-1">
										{[
											{
												label: "PDPA Governance Pack — 7 documents",
												scope: "DPMP, ROPA, Data Inventory, Vendor/DPA Register, Breach Runbook, Training Register, and Security Review Log — AI-drafted from your intake and grounded in a live website + PDPA scan, each anchored. Review & sign before evidentiary use.",
											},
											{
												label: "PDPA Snapshot included",
												scope: "Privacy policy + DPO contact + cookie consent + breach notification scan. Findings across PDPA's 7 obligations.",
											},
											{
												label: "RFP Complete — 15 Q&A",
												scope: "Regulator-ready Q&A across PDPA, ISO 27001, encryption, hosting, sub-processors. Answers verified against your website where possible.",
											},
											{
												label: "Compliance Cover Sheet v4",
												scope: "9-section PDF you sign in-browser (ETA s. 8) or wet-sign. Signed copy anchored on-chain.",
											},
											{
												label: "All documents on Amoy Testnet",
												scope: "Retained in your Compliance Locker — re-downloadable anytime, no retention expiry.",
											},
										].map(item => (
											<details key={item.label} className="group rounded-md border border-[#f1f5f9]">
												<summary className="cursor-pointer list-none px-2.5 py-1.5 flex items-center gap-2 text-sm text-[#0f172a]">
													<span className="text-violet-500 font-bold">✓</span>
													<span className="flex-1">{item.label}</span>
													<span className="text-xs text-[#94a3b8] group-open:rotate-180 transition-transform">▼</span>
												</summary>
												<p className="px-2.5 pb-2 pt-0.5 text-xs text-[#64748b] leading-relaxed border-t border-[#f1f5f9]">
													{item.scope}
												</p>
											</details>
										))}
									</div>
									<div className="pt-4 border-t border-[#f1f5f9] mb-4">
										<p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Delivery</p>
										<p className="text-sm text-[#475569]">PDPA + Cover Sheet in ~5 min; RFP kit ~5 min after brief.</p>
									</div>
									<div className="pb-4 mb-2">
										<p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
										<p className="text-sm text-[#475569]">GeBIZ tender response, enterprise vendor onboarding</p>
									</div>
									<a
										href="/samples/compliance-cover-sheet-sample.pdf"
										target="_blank"
										rel="noreferrer"
										className="text-xs font-semibold text-violet-600 hover:underline mb-4"
									>
										See a sample Cover Sheet PDF →
									</a>
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
										{["MAS TRM — all 13 domains", "AI gap analysis (DeepSeek)", "50 notarizations/month", "RESTful API + webhooks"].map(f => <CheckItem key={f} text={f} color="text-blue-600" />)}
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

					{/* ── FOR CSPs ────────────────────────────────────────────────────── */}
					{activeTab === "csps" && (
						<div className="space-y-12">
							<div className="text-center mb-8">
								<h2 className="text-3xl font-black text-[#0f172a] mb-4">CSP Compliance Pack</h2>
								<p className="text-[#64748b] max-w-2xl mx-auto text-lg">
									AML/CFT/PF compliance infrastructure for ACRA-registered Corporate Service
									Providers — client CDD, STR framework, nominee &amp; UBO registers, and 8
									AI-generated, blockchain-notarized programme documents.
								</p>
								<Link href="/csp" className="inline-block mt-4 text-sm font-semibold text-[#10b981] hover:underline">
									Learn more about the CSP Compliance Pack →
								</Link>
							</div>

							{/* Full pack — one-time vs monthly toggle */}
							<div className="flex justify-center mb-4">
								<div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-[#f1f5f9] border border-[#e2e8f0]">
									<button
										type="button"
										onClick={() => setCspBilling("one-time")}
										className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${cspBilling === "one-time" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
									>
										One-Time
									</button>
									<button
										type="button"
										onClick={() => setCspBilling("subscription")}
										className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all ${cspBilling === "subscription" ? "bg-[#10b981] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}
									>
										Monthly
									</button>
								</div>
							</div>

							{/* Full pack — the toggle above governs only this card */}
							<div className="max-w-xl mx-auto">
								<div className="bg-[#0f172a] p-8 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl relative flex flex-col">
									<div className="absolute top-[-14px] left-8 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
										{cspBilling === "one-time" ? "Best Value" : "Recommended"}
									</div>
									<h3 className="text-2xl font-black text-white mb-2">CSP Compliance Pack — Full</h3>
									{cspBilling === "one-time" ? (
										<div className="text-5xl font-black text-white mb-1">SGD 3,999</div>
									) : (
										<div className="text-5xl font-black text-white mb-1">SGD 299<span className="text-xl text-white/40 font-normal">/mo</span></div>
									)}
									<p className="text-xs text-white/50 mb-6">
										{cspBilling === "one-time" ? "One-time · lifetime pack access" : "Monthly · cancel anytime · monitoring included"}
									</p>
									<ul className="space-y-3 mb-8 flex-1">
										{[
											"Complete AML/CFT/PF Programme — 8 AI documents, blockchain-notarized",
											"Client registry with CDD/EDD tracker (unlimited clients)",
											"STR decision framework with rationale logging",
											"Nominee Director + Shareholder registers (fit-and-proper workflow)",
											"Beneficial Owner (UBO) verification tracker",
											"Risk-Based Approach scoring per client",
											"Regulatory Compliance Calendar with alerts",
											"Staff AML/CFT training records",
											"Completion Certificate for ACRA licence renewal",
										].map(f => (
											<li key={f} className="flex items-start gap-2 text-sm text-white/80">
												<span className="text-[#10b981] font-bold flex-shrink-0">✓</span>
												{f}
											</li>
										))}
									</ul>
									<button
										type="button"
										disabled={loadingProduct === (cspBilling === "one-time" ? "csp_pack_onetime" : "csp_pack_monthly")}
										onClick={() => handleCheckout(cspBilling === "one-time" ? "csp_pack_onetime" : "csp_pack_monthly")}
										className="w-full bg-[#10b981] text-white font-bold py-4 rounded-2xl hover:bg-[#059669] transition shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
									>
										{loadingProduct === (cspBilling === "one-time" ? "csp_pack_onetime" : "csp_pack_monthly")
											? "Redirecting..."
											: cspBilling === "one-time" ? "Get the Pack — SGD 3,999 →" : "Subscribe — SGD 299/mo →"}
									</button>
								</div>
							</div>

							{/* Standalone Monitoring Add-On — a separate SKU, not a billing variant */}
							<div className="max-w-3xl mx-auto pt-12 border-t border-[#e2e8f0]">
								<div className="text-center mb-6">
									<h3 className="text-2xl font-black text-[#0f172a]">Already run your own AML programme?</h3>
									<p className="text-[#64748b] text-sm max-w-xl mx-auto mt-2">
										Monitoring is already included in the Full pack. If you only need ongoing
										regulatory alerts — not the documents or registers — subscribe to the add-on on its own.
									</p>
								</div>
								<div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm flex flex-col lg:flex-row lg:items-center gap-6">
									<div className="flex-1">
										<h4 className="text-lg font-bold text-[#0f172a] mb-1">CSP Monitoring Add-On</h4>
										<p className="text-xs text-[#64748b] mb-4">Subscription · continuous regulatory monitoring</p>
										<ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
											{[
												"Continuous monitoring of ACRA enforcement decisions",
												"FATF grey/black list updates",
												"PDPC enforcement alerts for CSP data handling",
												"Sanctions list updates — OFAC, UN & EU (MAS via World-Check)",
												"Regulatory deadline reminders with escalation",
												"Monthly compliance health report",
											].map(f => <CheckItem key={f} text={f} />)}
										</ul>
										<div className="mt-4">
											<p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Best for</p>
											<p className="text-sm text-[#475569]">CSPs with their own AML programme who need ongoing alerts</p>
										</div>
									</div>
									<div className="lg:w-56 lg:text-right lg:border-l lg:border-[#f1f5f9] lg:pl-6 flex flex-col items-stretch lg:items-end">
										<div className="text-3xl font-black text-[#0f172a] mb-1">SGD 299<span className="text-base text-[#64748b] font-normal">/mo</span></div>
										<button
											type="button"
											disabled={loadingProduct === "csp_monitoring_monthly"}
											onClick={() => handleCheckout("csp_monitoring_monthly")}
											className="mt-3 w-full lg:w-auto border-2 border-[#0f172a] text-[#0f172a] font-bold px-6 py-3 rounded-2xl hover:bg-[#0f172a] hover:text-white transition disabled:opacity-50 whitespace-nowrap"
										>
											{loadingProduct === "csp_monitoring_monthly" ? "Redirecting..." : "Subscribe →"}
										</button>
									</div>
								</div>
							</div>

							<p className="text-center text-xs text-[#94a3b8] max-w-2xl mx-auto">
								Prices exclude GST; 9% GST is added at checkout for Singapore-registered businesses.
								BOOPPA provides compliance tooling and documentation — not regulatory
								certification or legal advice. You remain responsible for actual compliance
								with the ACRA RFA regime and AML/CFT obligations.
							</p>
						</div>
					)}

					{/* FAQ — reflects the active tab */}
					<div className="mt-20 bg-[#f8fafc] p-8 lg:p-16 rounded-[3rem] border border-[#e2e8f0]">
						<h2 className="text-3xl font-black mb-12 text-center text-[#0f172a]">
							{tabs.find((t) => t.id === activeTab)?.label || "Pricing"} — FAQ
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-5xl mx-auto">
							{[...FAQ_BY_TAB[activeTab], ...COMMON_FAQ].map((faq) => (
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
							We need your website URL and company name so the included PDPA Snapshot and Vendor Proof can run on the right entity.
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
