"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Tab =
	| "oneoff"
	| "bundles"
	| "subscriptions"
	| "procurement"
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

async function startCheckout(productType: string): Promise<void> {
	try {
		const res = await fetch("/api/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ productType }),
		});
		const data = await res.json();
		if (data.url) {
			window.location.href = data.url;
		} else if (res.status === 409) {
			// Already subscribed — redirect to dashboard instead of showing an error
			window.location.href = "/vendor/dashboard";
		} else {
			alert(data.error || "Unable to start checkout. Please try again.");
		}
	} catch {
		alert("Unable to start checkout. Please try again.");
	}
}

export default function PricingPage() {
	const [activeTab, setActiveTab] = useState<Tab>("oneoff");
	const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const [userPlan, setUserPlan] = useState<string | null>(null);

	// Check auth on mount so we can swap CTAs for logged-in users and hide active subscription buttons
	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => r.ok ? r.json() : null)
			.then((d) => {
				if (d && !d.error) {
					setLoggedIn(true);
					if (d.plan) setUserPlan(d.plan);
				}
			})
			.catch(() => {});
	}, []);

	// Find My Plan wizard
	const [wizardOpen, setWizardOpen] = useState(false);
	const [wizardStep, setWizardStep] = useState(0);
	const [wAnswers, setWAnswers] = useState<(number | null)[]>([null, null, null]);

	const WIZARD_QS: { q: string; options: string[] }[] = [
		{
			q: "Are you currently bidding on a government tender?",
			options: ["Yes, I have an active tender", "Not yet — I'm building my profile"],
		},
		{
			q: "Do you already have compliance documentation?",
			options: ["Yes, I have ISO / PDPA docs", "No, I'm starting from scratch"],
		},
		{
			q: "What is your main goal right now?",
			options: ["Get verified & visible to buyers", "Build trust & credibility", "Win a specific tender", "Scale to enterprise"],
		},
	];

	function getRecommendation() {
		const [a1, a2, a3] = wAnswers;
		if (a3 === 3) return { plan: "Enterprise Bid Kit", step: "Step 4", price: "SGD 899", cta: "Go Enterprise →", href: "#bundles", desc: "Full submission pack — built for contracts over SGD 100k.", color: "#f59e0b" };
		if (a1 === 0 && a3 === 2) return { plan: "RFP Accelerator", step: "Step 3", price: "SGD 449", cta: "Win More Tenders →", href: "#bundles", desc: "Trust Pack + RFP Express bundled — 27% off. The fastest path from new vendor to winning bid.", color: "#7c3aed" };
		if (a1 === 0) return { plan: "RFP Express", step: "Step 3", price: "SGD 249", cta: "Win This Tender →", href: "/rfp-acceleration", desc: "Tender Readiness PDF + Strategy 6 shortlist alert. For your active tender right now.", color: "#7c3aed" };
		if (a2 === 1) return { plan: "Vendor Trust Pack", step: "Step 2", price: "SGD 249", cta: "Build Trust →", href: "#bundles", desc: "Vendor Proof + PDPA Scan + 2 Notarizations. Your complete credibility foundation.", color: "#10b981" };
		return { plan: "Vendor Proof", step: "Step 1", price: "SGD 149", cta: "Get Verified →", href: "/vendor-proof", desc: "Get your verified badge and appear in buyer-only searches immediately.", color: "#10b981" };
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

	async function handleCheckout(productType: string) {
		setLoadingProduct(productType);
		await startCheckout(productType);
		setLoadingProduct(null);
	}

	const tabs: { id: Tab; label: string }[] = [
		{ id: "oneoff", label: "One-Time" },
		{ id: "bundles", label: "Bundles" },
		{ id: "subscriptions", label: "Subscriptions" },
		{ id: "procurement", label: "Procurement" },
		{ id: "enterprise", label: "Enterprise" },
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

					{/* ── ONE-TIME ─────────────────────────────────────────────────── */}
					{activeTab === "oneoff" && (
						<div className="space-y-8">

							{/* ── Journey Path ── */}
							<div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] px-6 py-5">
								<p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-4 text-center">Your compliance journey — start small, upgrade as you grow</p>
								<div className="flex items-center justify-center flex-wrap gap-2">
									{[
										{ n: "1", label: "Get Verified", color: "#10b981", bg: "#f0fdf4" },
										{ n: "2", label: "Build Credibility", color: "#3b82f6", bg: "#eff6ff" },
										{ n: "3", label: "Win Tenders", color: "#7c3aed", bg: "#f5f3ff" },
										{ n: "4", label: "Go Enterprise", color: "#d97706", bg: "#fffbeb" },
									].map((s, i, arr) => (
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

							{/* ── Find My Plan Wizard ── */}
							<div className="bg-white rounded-2xl border-2 border-[#e2e8f0] overflow-hidden">
								<button
									type="button"
									onClick={() => setWizardOpen((o) => !o)}
									className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f8fafc] transition-colors"
								>
									<div>
										<p className="text-xs font-black text-[#10b981] uppercase tracking-widest mb-0.5">Find My Plan</p>
										<p className="text-base font-bold text-[#0f172a]">Not sure where to start? Answer 3 quick questions →</p>
									</div>
									<span className="text-[#94a3b8] text-xl font-light ml-4">{wizardOpen ? "−" : "+"}</span>
								</button>

								{wizardOpen && (
									<div className="px-6 pb-6 border-t border-[#e2e8f0]">
										{wizardStep < 3 && (
											<div className="pt-5">
												<div className="flex gap-1 mb-4">
													{(["q1", "q2", "q3"] as const).map((id, i) => (
														<div key={id} className={`h-1 flex-1 rounded-full transition-colors ${i <= wizardStep ? "bg-[#10b981]" : "bg-[#e2e8f0]"}`} />
													))}
												</div>
												<p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Question {wizardStep + 1} of 3</p>
												<p className="text-lg font-bold text-[#0f172a] mb-4">{WIZARD_QS[wizardStep].q}</p>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
													{WIZARD_QS[wizardStep].options.map((opt, ai) => (
														<button
															key={opt}
															type="button"
															onClick={() => handleWizardAnswer(wizardStep, ai)}
															className="text-left px-4 py-3 rounded-xl border-2 border-[#e2e8f0] hover:border-[#10b981] hover:bg-[#f0fdf4] text-sm font-semibold text-[#0f172a] transition-all"
														>
															{opt}
														</button>
													))}
												</div>
											</div>
										)}
										{wizardStep === 3 && (() => {
											const rec = getRecommendation();
											return (
												<div className="pt-5">
													<p className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-3">Your Recommended Plan</p>
													<div className="rounded-xl border-2 p-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderColor: rec.color + "50", background: rec.color + "08" }}>
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																<span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ background: rec.color }}>{rec.step}</span>
																<span className="text-lg font-black text-[#0f172a]">{rec.plan}</span>
																<span className="text-base font-bold" style={{ color: rec.color }}>{rec.price}</span>
															</div>
															<p className="text-sm text-[#64748b]">{rec.desc}</p>
														</div>
														<div className="flex flex-col gap-2 flex-shrink-0">
															<Link href={rec.href} className="px-5 py-2.5 rounded-xl text-white text-sm font-bold text-center transition hover:opacity-90" style={{ background: rec.color }}>
																{rec.cta}
															</Link>
															<button type="button" onClick={resetWizard} className="text-xs text-[#94a3b8] hover:text-[#64748b] text-center">
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

							{/* ── Step 1: Get Verified ── */}
							<div>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-black flex-shrink-0">1</div>
									<div>
										<p className="text-xs font-black text-[#10b981] uppercase tracking-widest">Step 1</p>
										<p className="text-base font-black text-[#0f172a]">Get Verified — establish your presence</p>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
										<div className="flex items-start justify-between mb-4">
											<h3 className="text-xl font-bold text-[#0f172a]">Free Profile</h3>
											<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#64748b]">Always free</span>
										</div>
										<div className="text-4xl font-black text-[#0f172a] mb-1">SGD 0</div>
										<p className="text-sm text-[#64748b] mb-1">Claim your presence on Booppa</p>
										<p className="text-xs text-[#94a3b8] mb-6 pb-6 border-b border-[#e2e8f0]">Best for: Vendors exploring Booppa before committing</p>
										<ul className="space-y-2 mb-8">
											{[
												"Claim your company profile",
												"Basic public listing",
												"Appear in vendor search",
												"GeBIZ opportunity feed",
												"Tender Win Probability calculator",
											].map((f) => (
												<CheckItem key={f} text={f} />
											))}
										</ul>
										{loggedIn ? (
											<Link href="/vendor/dashboard" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm">
												Go to Dashboard →
											</Link>
										) : (
											<Link href="/auth/register" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm">
												Claim Profile
											</Link>
										)}
									</div>

									<div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-[#10b981] shadow-2xl relative hover:-translate-y-1 transition-all">
										<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
											Start Here
										</div>
										<div className="flex items-start justify-between mb-4">
											<h3 className="text-xl font-bold text-white">Vendor Proof</h3>
											<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">Lifetime</span>
										</div>
										<div className="text-4xl font-black text-[#10b981] mb-1">SGD 149</div>
										<p className="text-sm text-white/60 mb-1">One-time payment, no renewal</p>
										<p className="text-xs text-white/40 mb-6 pb-6 border-b border-white/10">Best for: New vendors establishing their first verified presence on GeBIZ-linked searches</p>
										<ul className="space-y-2 mb-8">
											{[
												"Verified badge on public profile",
												"Visible in verified-only buyer searches",
												"complianceScore baseline (30/100)",
												"Embeddable trust badge",
												"CAL engine activated at Level 1",
												"Reachable by Strategy 6 shortlist alerts",
											].map((f) => (
												<li key={f} className="flex items-start gap-2 text-sm text-white/80">
													<span className="text-[#10b981] font-bold flex-shrink-0">✓</span>
													{f}
												</li>
											))}
										</ul>
										<Link href="/vendor-proof" className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-[#10b981]/30">
											Get Verified →
										</Link>
									</div>
								</div>
							</div>

							{/* ── Connector ── */}
							<div className="flex items-center gap-4">
								<div className="flex-1 h-px bg-[#e2e8f0]" />
								<p className="text-xs font-bold text-[#94a3b8] whitespace-nowrap">Already verified? Build your credibility next ↓</p>
								<div className="flex-1 h-px bg-[#e2e8f0]" />
							</div>

							{/* ── Step 2: Build Credibility ── */}
							<div>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-black flex-shrink-0">2</div>
									<div>
										<p className="text-xs font-black text-[#3b82f6] uppercase tracking-widest">Step 2</p>
										<p className="text-base font-black text-[#0f172a]">Build Credibility — document your compliance</p>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div className="bg-white p-7 rounded-[2rem] border-2 border-blue-200 shadow-sm hover:-translate-y-1 hover:border-[#3b82f6] transition-all">
										<h3 className="text-lg font-bold mb-1 text-[#0f172a]">PDPA Snapshot</h3>
										<p className="text-xs text-[#94a3b8] mb-3">Best for: Vendors who need documented PDPA evidence for buyer due diligence</p>
										<div className="text-3xl font-black text-[#0f172a] mb-1">SGD 79</div>
										<p className="text-xs text-[#64748b] mb-5">One-time scan</p>
										<ul className="space-y-2 mb-6">
											{[
												"8-dimension PDPA evaluation",
												"Risk severity report",
												"Legislation references",
												"Blockchain timestamp",
												"Downloadable PDF",
												"+8 to +25 pts to complianceScore",
											].map((f) => (
												<CheckItem key={f} text={f} />
											))}
										</ul>
										<Link href="/pdpa" className="block w-full text-center bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">
											Scan My PDPA →
										</Link>
									</div>

									<div className="bg-white p-7 rounded-[2rem] border-2 border-blue-200 shadow-sm hover:-translate-y-1 hover:border-[#3b82f6] transition-all">
										<h3 className="text-lg font-bold mb-1 text-[#0f172a]">Notarization</h3>
										<p className="text-xs text-[#94a3b8] mb-3">Best for: Vendors certifying existing ISO, security or compliance documents on-chain</p>
										<div className="text-3xl font-black text-[#0f172a] mb-1">SGD 69</div>
										<p className="text-xs text-[#64748b] mb-5">Per document</p>
										<ul className="space-y-2 mb-3">
											{[
												"SHA-256 cryptographic hash",
												"Blockchain timestamp anchor",
												"QR verification link",
												"Progression toward DEEP/CERTIFIED",
												"Polygonscan URL",
											].map((f) => (
												<CheckItem key={f} text={f} />
											))}
										</ul>
										<p className="text-xs text-[#94a3b8] mb-5">Batch: 10 docs SGD 390 · 50 docs SGD 1,750</p>
										<Link href="/notarization" className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-2.5 rounded-xl transition text-sm">
											View Packages
										</Link>
									</div>
								</div>
							</div>

							{/* ── Connector ── */}
							<div className="flex items-center gap-4">
								<div className="flex-1 h-px bg-[#e2e8f0]" />
								<p className="text-xs font-bold text-[#94a3b8] whitespace-nowrap">Bidding on a tender? Activate your winning edge ↓</p>
								<div className="flex-1 h-px bg-[#e2e8f0]" />
							</div>

							{/* ── Step 3 + 4: Win Tenders & Enterprise ── */}
							<div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
									<div className="flex items-center gap-3">
										<div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-black flex-shrink-0">3</div>
										<div>
											<p className="text-xs font-black text-[#7c3aed] uppercase tracking-widest">Step 3</p>
											<p className="text-base font-black text-[#0f172a]">Win Tenders</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<div className="w-7 h-7 rounded-full bg-[#d97706] flex items-center justify-center text-white text-xs font-black flex-shrink-0">4</div>
										<div>
											<p className="text-xs font-black text-[#d97706] uppercase tracking-widest">Step 4</p>
											<p className="text-base font-black text-[#0f172a]">Go Enterprise</p>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div className="bg-white p-7 rounded-[2rem] border-2 border-violet-300 shadow-xl relative hover:-translate-y-1 transition-all">
										<div className="absolute top-[-12px] right-5 bg-violet-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">GeBIZ Ready</div>
										<h3 className="text-lg font-bold mb-1 text-[#0f172a]">RFP Express</h3>
										<p className="text-xs text-[#94a3b8] mb-3">Best for: Vendors with an active GeBIZ tender who need a fast, structured bid package</p>
										<div className="text-3xl font-black text-[#0f172a] mb-1">SGD 249</div>
										<p className="text-xs text-[#64748b] mb-5">Per RFP, delivered in minutes</p>
										<ul className="space-y-2 mb-6">
											{[
												"Tender Readiness Score (0–100)",
												"Structured evidence checklist PDF",
												"Strategy 6 fires — sector shortlist alert",
												"Blockchain-anchored",
												"AutoActivation counter +1",
											].map((f) => (
												<li key={f} className="flex items-start gap-2 text-xs text-[#64748b]">
													<span className="text-violet-500 font-bold flex-shrink-0">✓</span>
													{f}
												</li>
											))}
										</ul>
										<Link href="/rfp-acceleration" className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl transition text-sm">
											Win More Tenders →
										</Link>
									</div>

									<div className="bg-white p-7 rounded-[2rem] border-2 border-amber-300 shadow-xl relative hover:-translate-y-1 transition-all">
										<div className="absolute top-[-12px] right-5 bg-amber-500 text-white px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">High-Value Bids</div>
										<h3 className="text-lg font-bold mb-1 text-[#0f172a]">RFP Complete</h3>
										<p className="text-xs text-[#94a3b8] mb-3">Best for: Enterprise vendors targeting contracts over SGD 100k who need a full dossier</p>
										<div className="text-3xl font-black text-[#0f172a] mb-1">SGD 599</div>
										<p className="text-xs text-[#64748b] mb-5">Per RFP, full procurement dossier</p>
										<ul className="space-y-2 mb-6">
											{[
												"Full procurement dossier",
												"Enterprise-tier visibility",
												"Multi-sector matching",
												"COMPLETE evidence package tier",
												"AutoActivation counter +1",
											].map((f) => (
												<CheckItem key={f} text={f} color="text-amber-500" />
											))}
										</ul>
										<Link href="/rfp-acceleration" className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded-xl transition text-sm">
											Go Enterprise →
										</Link>
									</div>
								</div>
							</div>

							{/* Tender Win Probability */}
							<div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
								<div className="flex-1">
									<span className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Free Tool</span>
									<h3 className="text-lg font-bold text-[#0f172a] mt-1">Tender Win Probability Calculator</h3>
									<p className="text-sm text-[#64748b] mt-1">
										Enter a GeBIZ tender number. See your current win probability vs what you'd achieve with RFP Express or RFP Complete.
									</p>
								</div>
								<Link href="/tender-check" className="flex-shrink-0 px-5 py-2.5 bg-[#0f172a] text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] transition">
									Try Free Calculator →
								</Link>
							</div>

							{/* ── How it works ── */}
							<div className="mt-4 pt-10 border-t border-[#e2e8f0]">
								<div className="text-center mb-10">
									<p className="text-xs font-black text-[#10b981] uppercase tracking-widest mb-2">How it works</p>
									<h2 className="text-2xl lg:text-3xl font-black text-[#0f172a]">Three steps. One complete bid.</h2>
									<p className="text-[#64748b] mt-2 max-w-xl mx-auto text-sm">
										Each tool covers a different decision point. Used together, they turn a bare profile into a submission that procurement officers trust.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
									{/* connector line (desktop) */}
									<div className="hidden md:block absolute top-[52px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-[#e2e8f0] z-0" />

									{[
										{
											step: "1",
											color: "#3b82f6",
											bg: "#eff6ff",
											border: "#bfdbfe",
											icon: "🔍",
											title: "Run a compliance check",
											product: "PDPA Snapshot · SGD 79",
											when: "Before submitting any tender or responding to a buyer due-diligence request",
											what: "Know exactly where your PDPA exposure sits. Get a scored PDF report with legislation references you can attach to any bid.",
											cta: "Run PDPA Scan →",
											href: "/pdpa",
										},
										{
											step: "2",
											color: "#7c3aed",
											bg: "#f5f3ff",
											border: "#ddd6fe",
											icon: "⛓",
											title: "Notarize your evidence",
											product: "Notarization · from SGD 69",
											when: "When you need verifiable proof that a document existed and was unaltered at a point in time",
											what: "Certify ISO certificates, security audits, or policy documents on-chain. Buyers, auditors and authorities can verify authenticity via QR code.",
											cta: "Notarize a Document →",
											href: "/notarization",
										},
										{
											step: "3",
											color: "#7c3aed",
											bg: "#f5f3ff",
											border: "#ddd6fe",
											icon: "📋",
											title: "Prepare and submit a stronger bid",
											product: "RFP Express · SGD 249 or RFP Complete · SGD 599",
											when: "Once you have an active GeBIZ tender and want a structured, evidence-backed submission",
											what: "Generate a tender readiness score, structured evidence checklist, and a blockchain-anchored bid kit — in minutes, not days.",
											cta: "Build My Bid →",
											href: "/rfp-acceleration",
										},
									].map((s, i) => (
										<div key={s.step} className="relative z-10 flex flex-col items-center text-center px-6 pb-6">
											{/* Step circle */}
											<div
												className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 border-2 bg-white shadow-sm"
												style={{ borderColor: s.border }}
											>
												{s.icon}
											</div>

											{/* Step number */}
											<p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>
												Step {s.step}
											</p>

											{/* Title */}
											<h3 className="text-base font-black text-[#0f172a] mb-1">{s.title}</h3>

											{/* Product label */}
											<p className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-3" style={{ background: s.bg, color: s.color }}>
												{s.product}
											</p>

											{/* When to use */}
											<div className="w-full rounded-xl border p-3 mb-3 text-left" style={{ borderColor: s.border, background: s.bg }}>
												<p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>When to use</p>
												<p className="text-xs text-[#0f172a] font-medium">{s.when}</p>
											</div>

											{/* What you get */}
											<p className="text-xs text-[#64748b] mb-4 leading-relaxed">{s.what}</p>

											{/* CTA */}
											<Link
												href={s.href}
												className="text-sm font-bold px-5 py-2.5 rounded-xl transition hover:opacity-90 text-white"
												style={{ background: s.color }}
											>
												{s.cta}
											</Link>

											{/* Mobile arrow */}
											{i < 2 && (
												<div className="md:hidden mt-6 text-[#cbd5e1] text-2xl font-bold">↓</div>
											)}
										</div>
									))}
								</div>

								{/* Bottom CTA */}
								<div className="mt-8 bg-[#0f172a] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
									<div className="flex-1">
										<p className="text-white font-bold text-sm">Not sure which step you're at?</p>
										<p className="text-white/60 text-xs mt-0.5">Answer 3 quick questions and get a personalised recommendation.</p>
									</div>
									<button
										type="button"
										onClick={() => { setWizardOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
										className="flex-shrink-0 px-5 py-2.5 bg-[#10b981] text-white text-sm font-bold rounded-xl hover:bg-[#059669] transition"
									>
										Find My Plan →
									</button>
								</div>
							</div>
						</div>
					)}

					{/* ── BUNDLES ──────────────────────────────────────────────────── */}
					{activeTab === "bundles" && (
						<div className="space-y-6">
							<div className="text-center max-w-2xl mx-auto space-y-1">
								<p className="text-[#64748b]">Bundles collapse multiple purchase decisions into one. Every bundle is a one-time payment — all components activate immediately.</p>
								<p className="text-sm font-bold text-[#0f172a]">Start small → upgrade as you grow: <span className="text-[#10b981]">Get Verified</span> → <span className="text-violet-600">Win Tenders</span> → <span className="text-amber-600">Scale to Enterprise</span></p>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
								{/* Vendor Trust Pack */}
								<div className="bg-white rounded-[2rem] border-2 border-[#10b981] shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
									<div className="bg-[#10b981] px-7 py-5">
										<p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
											Bundle · 32% off
										</p>
										<h3 className="text-2xl font-black text-white">
											Vendor Trust Pack
										</h3>
										<p className="text-white/80 text-sm mt-1">Step 1–2 · Get Verified + Build Credibility</p>
										<p className="text-white/50 text-xs mt-1">Best for: Vendors starting from scratch who want a verified, documented compliance foundation</p>
									</div>
									<div className="p-7">
										<div className="flex items-end gap-3 mb-1">
											<span className="text-4xl font-black text-[#0f172a]">
												SGD 249
											</span>
											<span className="text-[#94a3b8] line-through text-lg mb-1">
												SGD 366
											</span>
										</div>
										<p className="text-sm text-[#10b981] font-semibold mb-6">
											Save SGD 117
										</p>

										<div className="space-y-3 mb-6">
											<div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ Vendor Proof{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 149)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													VerifyRecord ACTIVE, verified badge, procurement
													filter
												</p>
											</div>
											<div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ PDPA Snapshot{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 79)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													8-dimension scan, PDF report, +8–25 pts compliance
												</p>
											</div>
											<div className="rounded-lg bg-[#f0fdf4] border border-[#10b981]/20 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ 2 Notarizations{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 138)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													2 documents certified, begins DEEP progression
												</p>
											</div>
										</div>

										<p className="text-xs text-[#94a3b8] mb-5">
											Same price as standalone RFP Express — get the full
											verification foundation instead.
										</p>

										<button
											onClick={() => handleCheckout("vendor_trust_pack")}
											disabled={loadingProduct === "vendor_trust_pack"}
											className="block w-full text-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/20"
										>
											{loadingProduct === "vendor_trust_pack"
												? "Redirecting…"
												: "Build Trust — SGD 249"}
										</button>
									</div>
								</div>

								{/* RFP Accelerator */}
								<div className="bg-[#0f172a] rounded-[2rem] border-2 border-violet-400 shadow-2xl hover:-translate-y-1 transition-all relative">
									<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-violet-500 text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
										Most Popular
									</div>
									<div className="bg-violet-600 px-7 py-5 rounded-t-[2rem]">
										<p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
											Bundle · 27% off
										</p>
										<h3 className="text-2xl font-black text-white">
											RFP Accelerator
										</h3>
										<p className="text-white/80 text-sm mt-1">Step 1–3 · Get Verified + Win Tenders</p>
										<p className="text-white/50 text-xs mt-1">Best for: Vendors with an active GeBIZ tender who want verification + a winning bid package in one</p>
									</div>
									<div className="p-7">
										<div className="flex items-end gap-3 mb-1">
											<span className="text-4xl font-black text-white">
												SGD 449
											</span>
											<span className="text-white/40 line-through text-lg mb-1">
												SGD 615
											</span>
										</div>
										<p className="text-sm text-violet-400 font-semibold mb-6">
											Save SGD 166
										</p>

										<div className="space-y-3 mb-6">
											<div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
												<p className="text-sm font-semibold text-white">
													✓ Vendor Trust Pack{" "}
													<span className="text-white/40 font-normal">
														(SGD 366)
													</span>
												</p>
												<p className="text-xs text-white/50">
													VP + PDPA + 2 Notarizations
												</p>
											</div>
											<div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
												<p className="text-sm font-semibold text-white">
													✓ RFP Express{" "}
													<span className="text-white/40 font-normal">
														(SGD 249)
													</span>
												</p>
												<p className="text-xs text-white/50">
													Tender Readiness PDF + Strategy 6 fires
												</p>
											</div>
										</div>

										<p className="text-xs text-white/40 mb-5">
											For vendors who arrive on Booppa with an active tender
											already in mind — the highest-intent segment.
										</p>

										<button
											onClick={() => handleCheckout("rfp_accelerator")}
											disabled={loadingProduct === "rfp_accelerator"}
											className="block w-full text-center bg-violet-500 hover:bg-violet-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
										>
											{loadingProduct === "rfp_accelerator"
												? "Redirecting…"
												: "Get RFP Accelerator — SGD 449"}
										</button>
									</div>
								</div>

								{/* Enterprise Bid Kit */}
								<div className="bg-white rounded-[2rem] border-2 border-amber-400 shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
									<div className="bg-amber-500 px-7 py-5">
										<p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
											Bundle · 31% off
										</p>
										<h3 className="text-2xl font-black text-white">
											Enterprise Bid Kit
										</h3>
										<p className="text-white/90 text-sm mt-1">Step 1–4 · Full journey in one purchase</p>
										<p className="text-white/60 text-xs mt-1">Best for: Enterprise vendors targeting high-value GeBIZ contracts of SGD 100k+</p>
									</div>
									<div className="p-7">
										<div className="flex items-end gap-3 mb-1">
											<span className="text-4xl font-black text-[#0f172a]">
												SGD 899
											</span>
											<span className="text-[#94a3b8] line-through text-lg mb-1">
												SGD 1,310
											</span>
										</div>
										<p className="text-sm text-amber-600 font-semibold mb-6">
											Save SGD 411
										</p>

										<div className="space-y-3 mb-6">
											<div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ Vendor Trust Pack{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 366)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													VP + PDPA + 2 Notarizations
												</p>
											</div>
											<div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ RFP Complete{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 599)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													Full procurement dossier, enterprise visibility
												</p>
											</div>
											<div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
												<p className="text-sm font-semibold text-[#0f172a]">
													✓ 5 Notarizations{" "}
													<span className="text-[#94a3b8] font-normal">
														(SGD 345)
													</span>
												</p>
												<p className="text-xs text-[#64748b]">
													7 total docs — pushes toward DEEP/CERTIFIED
												</p>
											</div>
										</div>

										<p className="text-xs text-[#94a3b8] mb-5">
											0.18% of a SGD 500k contract. Combined with Tender Win
											Probability showing 19% → 67% uplift, the decision is
											immediate.
										</p>

										<button
											onClick={() => handleCheckout("enterprise_bid_kit")}
											disabled={loadingProduct === "enterprise_bid_kit"}
											className="block w-full text-center bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
										>
											{loadingProduct === "enterprise_bid_kit"
												? "Redirecting…"
												: "Get Enterprise Bid Kit — SGD 899"}
										</button>
									</div>
								</div>
							</div>

							{/* Savings table */}
							<div className="overflow-x-auto rounded-2xl border border-[#e2e8f0]">
								<table className="w-full text-sm">
									<thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
										<tr>
											{[
												"Bundle",
												"Includes",
												"Separate Value",
												"Bundle Price",
												"Saving",
											].map((h) => (
												<th
													key={h}
													className="px-5 py-3 text-left font-semibold text-[#0f172a] text-xs uppercase tracking-wide"
												>
													{h}
												</th>
											))}
										</tr>
									</thead>
									<tbody className="divide-y divide-[#e2e8f0]">
										{[
											{
												name: "Vendor Trust Pack",
												includes: "VP + PDPA + 2 Notarizations",
												separate: "SGD 366",
												bundle: "SGD 249",
												saving: "SGD 117 (32%)",
											},
											{
												name: "RFP Accelerator",
												includes: "Trust Pack + RFP Express",
												separate: "SGD 615",
												bundle: "SGD 449",
												saving: "SGD 166 (27%)",
											},
											{
												name: "Enterprise Bid Kit",
												includes: "Trust Pack + RFP Complete + 5 Notarizations",
												separate: "SGD 1,310",
												bundle: "SGD 899",
												saving: "SGD 411 (31%)",
											},
										].map((row) => (
											<tr key={row.name} className="hover:bg-[#f8fafc]">
												<td className="px-5 py-4 font-semibold text-[#0f172a]">
													{row.name}
												</td>
												<td className="px-5 py-4 text-[#64748b]">
													{row.includes}
												</td>
												<td className="px-5 py-4 text-[#94a3b8] line-through">
													{row.separate}
												</td>
												<td className="px-5 py-4 font-bold text-[#0f172a]">
													{row.bundle}
												</td>
												<td className="px-5 py-4 text-[#10b981] font-semibold">
													{row.saving}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{/* ── SUBSCRIPTIONS ─────────────────────────────────────────────── */}
					{activeTab === "subscriptions" && (
						<div className="space-y-6">
							<p className="text-center text-[#64748b] max-w-2xl mx-auto">
								Subscriptions provide continuous monthly value — not just access
								to a static badge. Each delivers something new every month.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Vendor Active */}
								<div className="bg-white rounded-[2rem] border-2 border-[#10b981] shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
									<div className="px-8 py-6 border-b border-[#e2e8f0]">
										<div className="flex items-start justify-between mb-2">
											<h3 className="text-xl font-bold text-[#0f172a]">
												Vendor Active
											</h3>
											<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">
												For Vendors
											</span>
										</div>
										<div className="flex items-end gap-4">
											<div>
												<span className="text-4xl font-black text-[#0f172a]">
													SGD 39
												</span>
												<span className="text-[#64748b]">/mo</span>
											</div>
											<div className="text-sm text-[#64748b]">
												or SGD 390/yr{" "}
												<span className="text-[#10b981] font-semibold">
													(2 months free)
												</span>
											</div>
										</div>
									</div>
									<div className="p-8">
										<p className="text-sm font-semibold text-[#0f172a] mb-4">
											What you receive every month:
										</p>
										<ul className="space-y-3 mb-8">
											{[
												"Profile health check — auto re-evaluation of complianceScore",
												"Competitor alert when a sector peer improves verificationDepth",
												"Shortlist priority — ordered ahead of equivalent STANDARD vendors in Strategy 1 and Strategy 6",
												"Monthly metrics — search appearances, sector views, movement vs prior month",
											].map((f) => (
												<CheckItem key={f} text={f} />
											))}
										</ul>
										<p className="text-xs text-[#94a3b8] mb-6">
											Vendor Proof (SGD 149) is the entry credential. Vendor
											Active is the ongoing monitoring layer. Both can coexist.
										</p>
										{userPlan === "vendor_active" ? (
											<div className="flex flex-col gap-3">
												<div className="w-full text-center bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-bold py-3 rounded-xl text-sm">
													✓ Subscription Active
												</div>
												<Link href="/vendor/dashboard" className="block w-full text-center border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5 font-semibold py-3 rounded-xl transition text-sm">
													Manage Subscription →
												</Link>
											</div>
										) : (
											<div className="flex flex-col gap-3">
												<button
													onClick={() => handleCheckout("vendor_active_monthly")}
													disabled={loadingProduct === "vendor_active_monthly"}
													className="block w-full text-center bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
												>
													{loadingProduct === "vendor_active_monthly"
														? "Redirecting…"
														: "Start Monthly — SGD 39/mo"}
												</button>
												<button
													onClick={() => handleCheckout("vendor_active_annual")}
													disabled={loadingProduct === "vendor_active_annual"}
													className="block w-full text-center border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5 disabled:opacity-60 font-semibold py-3 rounded-xl transition text-sm"
												>
													{loadingProduct === "vendor_active_annual"
														? "Redirecting…"
														: "Annual — SGD 390/yr (save SGD 78)"}
												</button>
											</div>
										)}
									</div>
								</div>

								{/* PDPA Monitor */}
								<div className="bg-white rounded-[2rem] border-2 border-blue-400 shadow-xl overflow-hidden hover:-translate-y-1 transition-all">
									<div className="px-8 py-6 border-b border-[#e2e8f0]">
										<div className="flex items-start justify-between mb-2">
											<h3 className="text-xl font-bold text-[#0f172a]">
												PDPA Monitor
											</h3>
											<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
												Compliance
											</span>
										</div>
										<div className="flex items-end gap-4">
											<div>
												<span className="text-4xl font-black text-[#0f172a]">
													SGD 49
												</span>
												<span className="text-[#64748b]">/mo</span>
											</div>
											<div className="text-sm text-[#64748b]">
												or SGD 490/yr{" "}
												<span className="text-blue-500 font-semibold">
													(2 months free)
												</span>
											</div>
										</div>
									</div>
									<div className="p-8">
										<p className="text-sm font-semibold text-[#0f172a] mb-4">
											What you receive every month:
										</p>
										<ul className="space-y-3 mb-8">
											{[
												"Quarterly automatic re-scan — full PDPA Snapshot every 3 months (SGD 79 value each)",
												"Monthly regulatory alert — plain-language summary of new PDPC guidelines relevant to your sector",
												"Score trending — running chart of complianceScore over time on your dashboard",
												"Current PDF report available for download and sharing with buyers at any time",
											].map((f) => (
												<CheckItem key={f} text={f} color="text-blue-500" />
											))}
										</ul>
										<p className="text-xs text-[#94a3b8] mb-6">
											Quarterly re-scans: SGD 237/yr underlying value. Annual
											plan: SGD 490. For vendors in healthcare, fintech, HR
											tech, or professional services.
										</p>
										{userPlan === "pdpa_monitor" ? (
											<div className="flex flex-col gap-3">
												<div className="w-full text-center bg-blue-500/10 border border-blue-400/30 text-blue-600 font-bold py-3 rounded-xl text-sm">
													✓ Subscription Active
												</div>
												<Link href="/vendor/dashboard" className="block w-full text-center border border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition text-sm">
													Manage Subscription →
												</Link>
											</div>
										) : (
											<div className="flex flex-col gap-3">
												<button
													onClick={() => handleCheckout("pdpa_monitor_monthly")}
													disabled={loadingProduct === "pdpa_monitor_monthly"}
													className="block w-full text-center bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
												>
													{loadingProduct === "pdpa_monitor_monthly"
														? "Redirecting…"
														: "Start Monthly — SGD 49/mo"}
												</button>
												<button
													onClick={() => handleCheckout("pdpa_monitor_annual")}
													disabled={loadingProduct === "pdpa_monitor_annual"}
													className="block w-full text-center border border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-60 font-semibold py-3 rounded-xl transition text-sm"
												>
													{loadingProduct === "pdpa_monitor_annual"
														? "Redirecting…"
														: "Annual — SGD 490/yr (save SGD 98)"}
												</button>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Subscription value table */}
							<div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6">
								<h3 className="font-semibold text-[#0f172a] mb-4">
									Annual plan comparison
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-[#e2e8f0]">
												{[
													"",
													"Monthly",
													"Annual",
													"Annual/mo",
													"Annual saving",
												].map((h) => (
													<th
														key={h}
														className="py-2 px-3 text-left text-xs font-semibold text-[#64748b]"
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody className="divide-y divide-[#e2e8f0]">
											{[
												{
													name: "Vendor Active",
													monthly: "SGD 39",
													annual: "SGD 390",
													permo: "SGD 32.50",
													saving: "SGD 78 (17%)",
												},
												{
													name: "PDPA Monitor",
													monthly: "SGD 49",
													annual: "SGD 490",
													permo: "SGD 40.83",
													saving: "SGD 98 (17%)",
												},
											].map((r) => (
												<tr key={r.name}>
													<td className="py-3 px-3 font-medium text-[#0f172a]">
														{r.name}
													</td>
													<td className="py-3 px-3 text-[#64748b]">
														{r.monthly}
													</td>
													<td className="py-3 px-3 font-semibold text-[#0f172a]">
														{r.annual}
													</td>
													<td className="py-3 px-3 text-[#64748b]">
														{r.permo}
													</td>
													<td className="py-3 px-3 text-[#10b981] font-semibold">
														{r.saving}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* ── ENTERPRISE ───────────────────────────────────────────────── */}
					{/* ── PROCUREMENT ─────────────────────────────────────────────── */}
					{activeTab === "procurement" && (
						<div className="space-y-16">
							{/* Procurement Plans */}
							<div>
								<div className="text-center mb-10">
									<h2 className="text-2xl lg:text-3xl font-black text-[#0f172a] mb-2">
										Buyer Plans
									</h2>
									<p className="text-[#64748b]">
										For Buyer teams evaluating and managing vendors
									</p>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
										<h3 className="text-xl font-bold mb-4 text-[#0f172a]">
											Enterprise
										</h3>
										<div className="text-4xl font-bold text-[#0f172a] mb-2">
											SGD 499
											<span className="text-xl text-[#64748b] font-normal">
												/mo
											</span>
										</div>
										<p className="text-sm text-[#64748b] mb-8">
											For buyer teams evaluating vendors
										</p>
										<ul className="space-y-3 mb-10">
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
										<p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">
											For institutional buyer teams, GLCs, statutory
											boards
										</p>
										<button
											onClick={() => handleCheckout("enterprise_monthly")}
											disabled={loadingProduct === "enterprise_monthly"}
											className="block w-full text-center bg-[#0f172a] text-white hover:bg-[#1e293b] disabled:opacity-50 font-semibold py-3 rounded-xl transition text-sm"
										>
											{loadingProduct === "enterprise_monthly"
												? "Redirecting…"
												: "Get Enterprise — SGD 499/mo"}
										</button>
									</div>

									<div className="bg-[#0f172a] p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl hover:-translate-y-1 transition-all relative">
										<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
											Recommended
										</div>
										<h3 className="text-xl font-bold mb-4 text-white">
											Enterprise Pro
										</h3>
										<div className="text-4xl font-bold text-[#10b981] mb-2">
											SGD 1,499
											<span className="text-xl text-white/60 font-normal">
												/mo
											</span>
										</div>
										<p className="text-sm text-white/60 mb-8">
											Dedicated account + SLA + multi-sector
										</p>
										<ul className="space-y-3 mb-10">
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
													<span className="text-[#10b981] font-bold flex-shrink-0">
														✓
													</span>
													{f}
												</li>
											))}
										</ul>
										<p className="pt-6 border-t border-white/10 text-xs text-white/40 mb-8">
											For MNCs and government-linked companies
										</p>
										<Link
											href="/demo"
											className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/30"
										>
											Book Enterprise Pro Demo
										</Link>
									</div>

									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between">
										<div>
											<h3 className="text-xl font-bold mb-6 text-[#0f172a]">
												Custom Enterprise
											</h3>
											<div className="text-3xl font-bold text-[#0f172a] mb-8">
												Contact Us
											</div>
											<ul className="space-y-3 mb-8">
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
													<CheckItem key={f} text={f} />
												))}
											</ul>
										</div>
										<Link
											href="/demo"
											className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
										>
											Contact Enterprise Sales
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* ── ENTERPRISE ───────────────────────────────────────────────── */}
					{activeTab === "enterprise" && (
						<div className="space-y-16">
							{/* Procurement Plans */}
							<div>
								<div className="text-center mb-10">
									<h2 className="text-2xl lg:text-3xl font-black text-[#0f172a] mb-2">
										Enterprise Buyer
									</h2>
									<p className="text-[#64748b]">
										Institutional-grade vendor evaluation and management for
										organizations
									</p>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
										<h3 className="text-xl font-bold mb-4 text-[#0f172a]">
											Enterprise
										</h3>
										<div className="text-4xl font-bold text-[#0f172a] mb-2">
											SGD 499
											<span className="text-xl text-[#64748b] font-normal">
												/mo
											</span>
										</div>
										<p className="text-sm text-[#64748b] mb-8">
											For buyer teams evaluating vendors
										</p>
										<ul className="space-y-3 mb-10">
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
										<p className="pt-6 border-t border-[#e2e8f0] text-xs text-[#94a3b8] mb-8">
											For institutional buyer teams, GLCs, statutory
											boards
										</p>
										<button
											onClick={() => handleCheckout("enterprise_monthly")}
											disabled={loadingProduct === "enterprise_monthly"}
											className="block w-full text-center bg-[#0f172a] text-white hover:bg-[#1e293b] disabled:opacity-50 font-semibold py-3 rounded-xl transition text-sm"
										>
											{loadingProduct === "enterprise_monthly"
												? "Redirecting…"
												: "Get Enterprise — SGD 499/mo"}
										</button>
									</div>

									<div className="bg-[#0f172a] p-10 rounded-[2.5rem] border-2 border-[#10b981] shadow-2xl hover:-translate-y-1 transition-all relative">
										<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-[#10b981] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
											Recommended
										</div>
										<h3 className="text-xl font-bold mb-4 text-white">
											Enterprise Pro
										</h3>
										<div className="text-4xl font-bold text-[#10b981] mb-2">
											SGD 1,499
											<span className="text-xl text-white/60 font-normal">
												/mo
											</span>
										</div>
										<p className="text-sm text-white/60 mb-8">
											Dedicated account + SLA + multi-sector
										</p>
										<ul className="space-y-3 mb-10">
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
													<span className="text-[#10b981] font-bold flex-shrink-0">
														✓
													</span>
													{f}
												</li>
											))}
										</ul>
										<p className="pt-6 border-t border-white/10 text-xs text-white/40 mb-8">
											For MNCs and government-linked companies
										</p>
										<Link
											href="/demo"
											className="block w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#10b981]/30"
										>
											Book Enterprise Pro Demo
										</Link>
									</div>

									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between">
										<div>
											<h3 className="text-xl font-bold mb-6 text-[#0f172a]">
												Custom Enterprise
											</h3>
											<div className="text-3xl font-bold text-[#0f172a] mb-8">
												Contact Us
											</div>
											<ul className="space-y-3 mb-8">
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
													<CheckItem key={f} text={f} />
												))}
											</ul>
										</div>
										<Link
											href="/demo"
											className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
										>
											Contact Enterprise Sales
										</Link>
									</div>
								</div>
							</div>

							{/* Compliance Suites */}
							<div>
								<div className="text-center mb-10">
									<h2 className="text-2xl lg:text-3xl font-black text-[#0f172a] mb-2">
										Compliance Suites
									</h2>
									<p className="text-[#64748b]">
										Automated evidence & blockchain notarization infrastructure
										for regulated organizations
									</p>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all">
										<h3 className="text-xl font-bold mb-4 text-[#0f172a]">
											Standard Suite
										</h3>
										<div className="text-4xl font-bold text-[#0f172a] mb-2">
											Contact Us
										</div>
										<p className="text-sm text-[#64748b] mb-8">
											MAS + MTCS operational workflows
										</p>
										<ul className="space-y-3 mb-10">
											{[
												"MAS Technology Risk Management (TRM) workflows",
												"Cyber Hygiene monitoring (MAS Notice 644)",
												"Third-party risk tracking (MAS Notice 655)",
												"5,000 blockchain notarizations/month included",
												"Enterprise dashboard (real-time)",
												"Compliance health scoring (0-100)",
												"Audit trail export (PDF + CSV)",
												"Evidence archive (12 months retention)",
												"API access (RESTful + webhooks)",
												"Priority support (4h SLA)",
											].map((f) => (
												<CheckItem key={f} text={f} />
											))}
										</ul>
										<Link
											href="/demo"
											className="block w-full text-center border-2 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-bold py-3 rounded-xl transition text-sm"
										>
											Book a Demo
										</Link>
									</div>

									<div className="bg-[#0f172a] p-10 rounded-[2.5rem] border-2 border-blue-500 shadow-2xl relative hover:-translate-y-1 transition-all">
										<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0f172a] to-[#1e40af] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
											Recommended
										</div>
										<h3 className="text-xl font-bold mb-4 text-white">
											Pro Suite
										</h3>
										<div className="text-4xl font-bold text-blue-400 mb-2">
											Contact Us
										</div>
										<p className="text-sm text-white/60 mb-8">
											Full enterprise evidence infrastructure
										</p>
										<ul className="space-y-3 mb-10">
											<li className="text-sm font-semibold text-white">
												Everything in Standard Suite, plus:
											</li>
											{[
												"Unlimited blockchain notarizations",
												"Custom API endpoints & rate limits",
												"Dedicated compliance manager (monthly calls)",
												"24/7 priority support (2h SLA)",
												"White-label reports (your company branding)",
												"Multi-subsidiary management",
												"Custom compliance frameworks",
												"SSO integration (SAML/OAuth)",
												"On-premise deployment option",
												"Quarterly compliance strategy sessions",
											].map((f) => (
												<li
													key={f}
													className="flex items-start gap-2 text-sm text-white/80"
												>
													<span className="text-blue-400 font-bold flex-shrink-0">
														✓
													</span>
													{f}
												</li>
											))}
										</ul>
										<Link
											href="/demo"
											className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
										>
											Book a Demo
										</Link>
									</div>

									<div className="bg-white p-10 rounded-[2.5rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between">
										<div>
											<h3 className="text-xl font-bold mb-6 text-[#0f172a]">
												Custom Enterprise
											</h3>
											<div className="text-3xl font-bold text-[#0f172a] mb-8">
												Contact Us
											</div>
											<ul className="space-y-3 mb-8">
												{[
													"100,000+ notarizations/month",
													"On-premise infrastructure",
													"Air-gapped deployment",
													"Custom SLAs (e.g., 99.99% uptime)",
													"Dedicated account team",
													"Custom integration development",
													"Compliance team training",
													"Government agency pricing",
												].map((f) => (
													<CheckItem key={f} text={f} />
												))}
											</ul>
										</div>
										<Link
											href="/demo"
											className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
										>
											Contact Enterprise Sales
										</Link>
									</div>
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
									q: "Do bundles require Vendor Proof first?",
									a: "No — all three bundles include Vendor Proof as a component. One purchase activates everything simultaneously.",
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
		</main>
	);
}
