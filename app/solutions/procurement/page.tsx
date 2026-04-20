"use client";

import Link from "next/link";

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

export default function SolutionsProcurementPage() {
	return (
		<main className="bg-white min-h-screen overflow-x-hidden">
			{/* Hero */}
			<section className="py-24 px-6 bg-[#0f172a] text-white">
				<div className="max-w-[1200px] mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-full text-sm font-medium text-blue-400 mb-8 bg-blue-500/10">
						For Procurement / Buyers
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
				</div>
			</section>

			{/* 3 Procurement Cards */}
			<section className="py-20 px-6">
				<div className="max-w-[1100px] mx-auto">
					<div className="text-center mb-14">
						<h2 className="text-3xl lg:text-4xl font-black text-[#0f172a] mb-3">
							Choose Your Plan
						</h2>
						<p className="text-lg text-[#64748b] max-w-2xl mx-auto">
							Transparent pricing for procurement teams. No hidden fees.
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
									"Vendor comparison engine \u2014 weighted scoring",
									"Configurable procurement presets",
									"Vendor risk signals & compliance posture",
									"Self-service billing portal",
									"Access to /api/procurement/* routes",
								].map((f) => (
									<CheckItem key={f} text={f} />
								))}
							</ul>
							<p className="text-xs text-[#94a3b8] mb-6 border-t border-[#e2e8f0] pt-4">
								For institutional procurement teams, GLCs, statutory boards
							</p>
							<Link
								href="/demo"
								className="block w-full text-center border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white font-semibold py-3 rounded-xl transition text-sm"
							>
								Book Demo
							</Link>
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
									"Priority support response",
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
							<Link
								href="/demo"
								className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
							>
								Book Enterprise Pro Demo
							</Link>
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
									"Custom SLAs",
									"Compliance team training",
									"Regulatory filing assistance",
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

			{/* Free Tools */}
			<section className="py-20 px-6 bg-[#f8fafc]">
				<div className="max-w-[1100px] mx-auto">
					<div className="text-center mb-10">
						<h2 className="text-2xl lg:text-3xl font-black text-[#0f172a] mb-2">
							Free Procurement Tools
						</h2>
						<p className="text-[#64748b]">
							Available to all procurement teams at no cost
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								title: "Vendor Network",
								desc: "Browse the full directory of Singapore SMEs. Filter by compliance status, sector, and verification depth.",
								href: "/vendors",
								cta: "Browse Network \u2192",
							},
							{
								title: "Vendor Comparison",
								desc: "Compare up to 4 vendors side-by-side across compliance scores, evidence, and procurement readiness.",
								href: "/compare",
								cta: "Compare Vendors \u2192",
							},
							{
								title: "Document Verify",
								desc: "Verify any BOOPPA-issued document instantly. Paste a blockchain hash or scan a QR code to confirm authenticity.",
								href: "/verify",
								cta: "Verify a Document \u2192",
							},
						].map((t, i) => (
							<div
								key={i}
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
						Start browsing and verifying vendors now &mdash; free tools
						included.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							href="/vendors"
							className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl transition-colors shadow-lg"
						>
							Browse Vendor Network
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
