"use client";

import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
	const [segment, setSegment] = useState<"vendor" | "procurement">("vendor");

	return (
		<section className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2 gap-16 px-6 py-24 max-w-[1400px] mx-auto items-center">
			<div className="animate-fade-in-up">
				{/* Segmentation Selector */}
				<div className="flex p-1 bg-[#f1f5f9] rounded-xl w-fit mb-8 border border-[#e2e8f0]">
					<button
						onClick={() => setSegment("vendor")}
						className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
							segment === "vendor"
								? "bg-white text-[#10b981] shadow-sm"
								: "text-[#64748b] hover:text-[#0f172a]"
						}`}
					>
						For Vendors
					</button>
					<button
						onClick={() => setSegment("procurement")}
						className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
							segment === "procurement"
								? "bg-white text-[#10b981] shadow-sm"
								: "text-[#64748b] hover:text-[#0f172a]"
						}`}
					>
						For Buyer Teams
					</button>
				</div>

				<div className="inline-flex items-center gap-2 px-4 py-2 border border-[#10b981] rounded-full text-sm font-medium text-[#059669] mb-6 bg-[rgba(16,185,129,0.1)]">
					<span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
					{segment === "vendor"
						? "Get Verified & Win More Contracts"
						: "Evaluate Vendors with Audit-Ready Evidence"}
				</div>

				<h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight text-[#0f172a]">
					Get a verified <span className="text-[#10b981]">compliance report</span>
					<br />
					with score, risk flags, and audit-ready evidence.
				</h1>

				<p className="text-xl text-[#64748b] mb-8 max-w-xl leading-relaxed">
					{segment === "vendor"
						? "Stop losing RFPs because of missing paperwork. Get a downloadable audit-ready report with verifiable proof in hours."
						: "Eliminate evaluation risk. Access continuously updated compliance status and blockchain-anchored proof for any vendor."}
				</p>

				{/* Social proof */}
				<div className="flex flex-wrap gap-x-6 gap-y-2 mb-10 text-sm text-[#64748b]">
					<span className="flex items-center gap-1.5">
						<span className="font-bold text-[#0f172a]">30,000+</span> vendors
						verified
					</span>
					<span className="text-[#e2e8f0]">|</span>
					<span className="flex items-center gap-1.5">
						<span className="font-bold text-[#0f172a]">Polygon</span> anchored
						proof
					</span>
					<span className="text-[#e2e8f0]">|</span>
					<span className="flex items-center gap-1.5">
						<span className="font-bold text-[#0f172a]">ISO</span> format
						reports
					</span>
				</div>

				<div className="flex flex-wrap gap-4 mb-12">
					<Link
						href={segment === "vendor" ? "/pdpa" : "/solutions/procurement"}
						className="btn btn-primary text-lg px-8"
					>
						Get your report
					</Link>
					<Link
						href="#sample-report"
						className="btn btn-secondary text-lg px-8 bg-white hover:bg-slate-50 border-2 border-[#e2e8f0]"
					>
						See sample report
					</Link>
				</div>

				{/* Concrete Outputs */}
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="flex items-center gap-3 p-3 rounded-xl border border-[#e2e8f0] bg-white/50">
						<div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-xl">
							📄
						</div>
						<div className="text-xs font-bold text-[#0f172a]">PDF Report</div>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-xl border border-[#e2e8f0] bg-white/50">
						<div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-xl">
							🔗
						</div>
						<div className="text-xs font-bold text-[#0f172a]">Blockchain Hash</div>
					</div>
				</div>
			</div>

			{/* Right panel — Output Preview Card */}
			<div className="lg:block hidden animate-fade-in-right">
				<div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
					<div className="absolute top-0 right-0 p-4">
						<div className="w-24 h-24 bg-[#10b981] opacity-5 rounded-full -mr-12 -mt-12" />
					</div>

					<div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e8f0]">
						<div className="flex flex-col">
							<span className="font-black text-sm text-[#0f172a] uppercase tracking-tighter">
								Compliance Output
							</span>
							<span className="text-[10px] text-[#94a3b8]">Report ID: BPP-2026-X92</span>
						</div>
						<span className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(16,185,129,0.1)] text-[#059669] rounded-full text-xs font-bold ring-1 ring-[#10b981]">
							Verified
						</span>
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex justify-between items-end">
							<div className="flex flex-col">
								<span className="text-xs font-bold text-[#64748b] uppercase mb-1">
									Compliance Score
								</span>
								<span className="text-5xl font-black text-[#0f172a]">
									87<span className="text-xl text-[#94a3b8]">/100</span>
								</span>
							</div>
							<div className="text-right">
								<span className="text-[10px] font-bold text-[#10b981] block mb-1">
									Low Risk
								</span>
								<div className="flex gap-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className={`w-4 h-1 rounded-full ${
												i <= 4 ? "bg-[#10b981]" : "bg-[#e2e8f0]"
											}`}
										/>
									))}
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
								<span className="text-xs font-bold text-[#0f172a]">PDPA Obligations</span>
								<span className="text-xs font-black text-[#10b981]">PASS (8/8)</span>
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
								<span className="text-xs font-bold text-[#0f172a]">Data Protection Trustmark</span>
								<span className="text-xs font-black text-[#10b981]">Verified</span>
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
								<span className="text-xs font-bold text-orange-800">Risk Flags Detected</span>
								<span className="text-xs font-black text-orange-600">2 Minor</span>
							</div>
						</div>

						<div className="pt-4 border-t border-[#e2e8f0]">
							<div className="flex items-center gap-2 mb-2">
								<div className="w-2 h-2 rounded-full bg-[#10b981]" />
								<span className="text-[10px] font-bold text-[#0f172a] uppercase">
									Blockchain Anchor Proof
								</span>
							</div>
							<div className="bg-[#f1f5f9] p-3 rounded-lg font-mono text-[10px] text-[#64748b] break-all leading-relaxed">
								0x8f3a2c91c2...91c24e6b
								<br />
								Timestamp: 2026-04-23T04:22:10Z
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
