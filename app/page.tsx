"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import ProcessPipeline from "@/components/home/ProcessPipeline";
import SegmentationSections from "@/components/home/SegmentationSections";
import ReportPreviewTop from "@/components/home/ReportPreviewTop";
import BlockchainProofTop from "@/components/home/BlockchainProofTop";
import MiniDashboardMock from "@/components/home/MiniDashboardMock";

export default function Home() {
	const [activePreview, setActivePreview] = useState<string | null>(null);
	const [vendorCount, setVendorCount] = useState("30,000+");

	useEffect(() => {
		fetch("/api/platform-stats")
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (data?.vendorsIndexed > 0) setVendorCount(data.vendorsIndexed.toLocaleString() + "+");
			})
			.catch(() => {});
	}, []);

	return (
		<main className="overflow-x-hidden">
			{/* 1. Hero (with segmentation + CTA) */}
			<HeroSection />

			{/* 2. Output Preview Layer (Sample Compliance Report) */}
			<ReportPreviewTop />

			{/* 3. Blockchain proof example (anchored sample) */}
			<BlockchainProofTop />

			{/* 4. Process Pipeline */}
			<ProcessPipeline />

			{/* 5. Mini Dashboard Preview (static mock) */}
			<MiniDashboardMock />

			{/* 6. Vendor vs Buyer Sections */}
			<SegmentationSections />

			{/* 6. Pricing / CTA with Integrated REAL Output Previews */}
			<section className="py-24 px-6 bg-[#f8fafc]">
				<div className="max-w-[1200px] mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">
							Transparent, Self-Serve Pricing
						</h2>
						<p className="text-xl text-[#64748b]">
							No sales calls required. Get your audit-ready evidence in minutes.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* PDPA Scan */}
						<div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:shadow-xl flex flex-col">
							<h3 className="text-xl font-bold mb-4">PDPA Scan</h3>
							<div className="text-3xl font-bold text-[#0f172a] mb-2">
								SGD 79
							</div>
							<p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">
								One-time technical scan
							</p>
							<ul className="mb-8 space-y-3 flex-1">
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> 8-section
									PDPA analysis
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> Risk
									severity report
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> Blockchain
									timestamp
								</li>
							</ul>

							{/* REAL OUTPUT PREVIEW: PDPA */}
							<div className="mb-6 p-4 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0]">
								<p className="text-[10px] font-black text-[#94a3b8] uppercase mb-3 tracking-widest">Report Preview (Sample)</p>
								<div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]">
									<div className="flex justify-between items-center mb-3">
										<span className="text-[10px] font-black text-[#0f172a]">PDPA SNAPSHOT</span>
										<span className="text-[10px] font-bold text-[#10b981]">SCORE: 87/100</span>
									</div>
									<div className="space-y-2">
										<div className="h-1.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
											<div className="h-full bg-[#10b981] w-[87%]" />
										</div>
										<div className="flex justify-between text-[8px] text-[#64748b] font-bold uppercase">
											<span>8 Obligations</span>
											<span className="text-[#10b981]">Passed</span>
										</div>
									</div>
									<div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
										<div className="w-6 h-6 bg-white border border-[#e2e8f0] rounded flex items-center justify-center text-[10px]">📄</div>
										<span className="text-[10px] text-[#0f172a] font-medium">Downloadable PDF</span>
									</div>
								</div>
							</div>

							<Link href="/pdpa" className="btn btn-outline w-full py-3">
								Get Report
							</Link>
						</div>

						{/* Notarization */}
						<div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:shadow-xl flex flex-col">
							<h3 className="text-xl font-bold mb-4">Notarization</h3>
							<div className="text-3xl font-bold text-[#0f172a] mb-2">
								SGD 69
							</div>
							<p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">
								Per document
							</p>
							<ul className="mb-8 space-y-3 flex-1">
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> Any
									compliance document
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> Polygon
									mainnet anchor
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> QR
									verification
								</li>
							</ul>

							{/* REAL OUTPUT PREVIEW: NOTARIZATION */}
							<div className="mb-6 p-4 bg-[#0f172a] rounded-2xl border border-white/10 text-white">
								<p className="text-[10px] font-black text-white/30 uppercase mb-3 tracking-widest">Blockchain-anchored proof (example)</p>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">⛓️</div>
									<div>
										<p className="text-[10px] font-black tracking-widest text-[#10b981]">POLYGON MAINNET</p>
										<p className="text-[8px] text-white/50 font-mono">0x8f3a...91c2</p>
									</div>
								</div>
								<div className="bg-white p-2 rounded-xl mb-3 flex items-center justify-center">
									<img src="/4-QR_Container.jpg" alt="QR Code" className="w-20 h-20 object-contain rounded-lg" />
								</div>
								<p className="text-[8px] text-[#10b981] text-center font-black tracking-widest uppercase">Verified & Immutable</p>
							</div>

							<Link
								href="/notarization"
								className="btn btn-outline w-full py-3"
							>
								Notarize
							</Link>
						</div>

						{/* RFP Kit (No Example) */}
						<div className="bg-[#0f172a] p-8 rounded-3xl border-2 border-[#10b981] shadow-lg relative transition-all hover:shadow-2xl flex flex-col">
							<div className="absolute top-[-15px] right-6 bg-[#10b981] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
								Enterprise
							</div>
							<h3 className="text-xl font-bold mb-4 text-white">RFP Kit</h3>
							<div className="text-3xl font-bold text-[#10b981] mb-2">
								SGD 599
							</div>
							<p className="text-white/70 text-sm mb-6 pb-6 border-b border-white/10">
								Full submission pack
							</p>
							<ul className="mb-8 space-y-3 flex-1">
								<li className="flex items-center gap-3 text-sm text-white/80">
									<span className="text-[#10b981] font-bold">✓</span> 15 RFP Q&A
									answers
								</li>
								<li className="flex items-center gap-3 text-sm text-white/80">
									<span className="text-[#10b981] font-bold">✓</span> Editable
									DOCX template
								</li>
								<li className="flex items-center gap-3 text-sm text-white/80">
									<span className="text-[#10b981] font-bold">✓</span> Priority
									delivery
								</li>
							</ul>
							
							<div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl mb-6 border border-white/5">
								<p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">RFP Content - No Preview</p>
							</div>

							<Link
								href="/pricing"
								className="btn btn-primary w-full py-3 shadow-lg"
							>
								Get RFP Kit
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* 8. Final CTA */}
			<section className="py-24 px-6 bg-white">
				<div className="max-w-[1200px] mx-auto bg-[#0f172a] rounded-[2.5rem] p-12 lg:p-24 text-center overflow-hidden relative">
					<div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

					<div className="relative z-10">
						<h2 className="text-3xl lg:text-6xl font-black text-white mb-6 leading-tight">
							Ready to get your
							<br />
							compliance report?
						</h2>
						<p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
							Join {vendorCount} vendors already using Booppa to prove their compliance and win more contracts.
						</p>
						<div className="flex flex-wrap justify-center gap-6 mb-6">
							<Link
								href="/pdpa"
								className="btn btn-primary px-10 py-5 text-xl font-black"
							>
								Get your report
							</Link>
							<Link
								href="/pdpa"
								className="btn btn-secondary bg-white text-[#0f172a] px-10 py-5 text-xl font-black hover:bg-white/90 border-0 transition-colors"
							>
								See sample output
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
