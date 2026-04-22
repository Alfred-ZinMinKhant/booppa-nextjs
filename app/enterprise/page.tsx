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

export default function EnterprisePage() {
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
					<div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-full text-sm font-medium text-blue-400 mb-8 bg-blue-500/10">
						Enterprise Solutions
					</div>
					<h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
						Enterprise-Grade
						<br />
						<span className="text-blue-400">Trust & Compliance.</span>
					</h1>
					<p className="text-xl text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed">
						Scale your procurement operations with blockchain-verified vendor
						evidence, automated compliance workflows, and institutional-grade
						risk management.
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
								View Enterprise Plans
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

			{/* Pricing — Procurement Plans */}
			<section id="pricing" className="py-20 px-6">
				<div className="max-w-[1100px] mx-auto">
					<div className="text-center mb-14">
						<h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">
							Enterprise Buyer
						</h2>
						<p className="text-lg text-[#64748b] max-w-2xl mx-auto">
							Institutional-grade vendor evaluation and management solutions for
							organizations, GLCs, and statutory boards.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* 1 — Enterprise */}
						<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
							<h3 className="text-xl font-bold mb-3 text-[#0f172a]">
								Enterprise
							</h3>
							<div className="text-4xl font-black text-[#0f172a] mb-1">
								SGD 499
								<span className="text-lg text-[#64748b] font-normal">/mo</span>
							</div>
							<p className="text-sm text-[#64748b] mb-6">
								For procurement teams evaluating vendors
							</p>
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
								For institutional procurement teams, GLCs, statutory boards
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
									className="block w-full text-center bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-[#1e293b] transition text-sm disabled:opacity-50"
								>
									{loadingProduct === "enterprise_monthly"
										? "Redirecting..."
										: "Get Enterprise — SGD 499/mo"}
								</button>
							)}
						</div>

						{/* 2 — Enterprise Pro */}
						<div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-blue-500 shadow-2xl hover:-translate-y-1 transition-all relative flex flex-col">
							<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
								Recommended
							</div>
							<h3 className="text-xl font-bold mb-3 text-white">
								Enterprise Pro
							</h3>
							<div className="text-4xl font-black text-blue-400 mb-1">
								SGD 1,499
								<span className="text-lg text-white/60 font-normal">/mo</span>
							</div>
							<p className="text-sm text-white/60 mb-6">
								Dedicated account + SLA + multi-sector
							</p>
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
									Book Enterprise Pro Demo
								</Link>
							)}
						</div>

						{/* 3 — Custom Enterprise */}
						<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
							<h3 className="text-xl font-bold mb-3 text-[#0f172a]">
								Custom Enterprise
							</h3>
							<div className="text-4xl font-black text-[#0f172a] mb-1">
								Contact Us
							</div>
							<p className="text-sm text-[#64748b] mb-6">
								Tailored for your organization
							</p>
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
									<CheckItem key={f} text={f} />
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
									Contact Enterprise Sales
								</Link>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Compliance Suites */}
			<section className="py-20 px-6 bg-[#f8fafc]">
				<div className="max-w-[1100px] mx-auto">
					<div className="text-center mb-14">
						<h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">
							Compliance Suites
						</h2>
						<p className="text-lg text-[#64748b] max-w-2xl mx-auto">
							Automated evidence & blockchain notarization infrastructure for
							regulated organizations.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Standard Suite */}
						<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
							<h3 className="text-xl font-bold mb-3 text-[#0f172a]">
								Standard Suite
							</h3>
							<div className="text-4xl font-black text-[#0f172a] mb-1">
								Contact Us
							</div>
							<p className="text-sm text-[#64748b] mb-6">
								MAS + MTCS operational workflows
							</p>
							<ul className="space-y-3 mb-8 flex-1">
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
							{isVendor ? (
								<Link
									href="/solutions/vendors"
									className="block w-full text-center bg-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm"
								>
									Vendor? View Vendor Solutions →
								</Link>
							) : (
								<Link
									href="/demo"
									className="block w-full text-center border-2 border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-bold py-3 rounded-xl transition text-sm"
								>
									Book a Demo
								</Link>
							)}
						</div>

						{/* Pro Suite */}
						<div className="bg-[#0f172a] p-8 rounded-[2rem] border-2 border-blue-500 shadow-2xl hover:-translate-y-1 transition-all relative flex flex-col">
							<div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0f172a] to-[#1e40af] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
								Recommended
							</div>
							<h3 className="text-xl font-bold mb-3 text-white">Pro Suite</h3>
							<div className="text-4xl font-black text-blue-400 mb-1">
								Contact Us
							</div>
							<p className="text-sm text-white/60 mb-6">
								Full enterprise evidence infrastructure
							</p>
							<ul className="space-y-3 mb-8 flex-1">
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
											&#10003;
										</span>
										{f}
									</li>
								))}
							</ul>
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
									Book a Demo
								</Link>
							)}
						</div>

						{/* Custom Enterprise */}
						<div className="bg-white p-8 rounded-[2rem] border border-[#e2e8f0] shadow-sm hover:-translate-y-1 transition-all flex flex-col">
							<h3 className="text-xl font-bold mb-3 text-[#0f172a]">
								Custom Enterprise
							</h3>
							<div className="text-4xl font-black text-[#0f172a] mb-1">
								Contact Us
							</div>
							<p className="text-sm text-[#64748b] mb-6">
								Tailored compliance infrastructure
							</p>
							<ul className="space-y-3 mb-8 flex-1">
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
							<Link
								href="/demo"
								className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm mt-auto"
							>
								Contact Enterprise Sales
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 px-6 bg-[#0f172a] text-white text-center">
				<div className="max-w-2xl mx-auto">
					<h2 className="text-3xl lg:text-5xl font-black mb-6">
						Ready for institutional trust?
					</h2>
					<p className="text-white/70 text-xl mb-10">
						Join leading statutory boards and MNCs scaling their compliance with
						BOOPPA.
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
