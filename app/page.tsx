"use client";

import { useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import ReportPreview from "@/components/home/ReportPreview";
import BlockchainProof from "@/components/home/BlockchainProof";
import ProcessPipeline from "@/components/home/ProcessPipeline";
import DashboardPreview from "@/components/home/DashboardPreview";
import SegmentationSections from "@/components/home/SegmentationSections";

export default function Home() {
	const [activePreview, setActivePreview] = useState<string | null>(null);

	return (
		<main className="overflow-x-hidden">
			{/* 1. Hero (with segmentation + CTA) */}
			<HeroSection />

			{/* 2. Output Preview (Report) */}
			<ReportPreview />

			{/* 3. Blockchain Proof Block */}
			<BlockchainProof />

			{/* 4. Process Pipeline */}
			<ProcessPipeline />

			{/* 5. Mini Dashboard Preview */}
			<DashboardPreview />

			{/* 6. Vendor vs Buyer Sections */}
			<SegmentationSections />

			{/* 7. Pricing / CTA with Integrated Previews */}
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

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

							{/* Preview Trigger */}
							<button
								onClick={() => setActivePreview(activePreview === "pdpa" ? null : "pdpa")}
								className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-4 hover:underline text-left flex items-center gap-2"
							>
								{activePreview === "pdpa" ? "Close Preview" : "See Sample Report →"}
							</button>

							{activePreview === "pdpa" && (
								<div className="mb-6 p-4 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] animate-fade-in">
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
							)}

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

							{/* Preview Trigger */}
							<button
								onClick={() => setActivePreview(activePreview === "notarization" ? null : "notarization")}
								className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-4 hover:underline text-left flex items-center gap-2"
							>
								{activePreview === "notarization" ? "Close Preview" : "View Example Proof →"}
							</button>

							{activePreview === "notarization" && (
								<div className="mb-6 p-4 bg-[#0f172a] rounded-2xl border border-white/10 animate-fade-in text-white">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-lg">⛓️</div>
										<div>
											<p className="text-[10px] font-black tracking-widest text-[#10b981]">POLYGON ANCHOR</p>
											<p className="text-[8px] text-white/50 font-mono">0x8f3a...91c2</p>
										</div>
									</div>
									<div className="bg-white p-2 rounded-lg mb-3">
										<img src="/4-QR_Container.jpg" alt="QR Code" className="w-full h-auto rounded" />
									</div>
									<p className="text-[8px] text-white/40 text-center font-bold tracking-widest uppercase">Verified on Polygon mainnet</p>
								</div>
							)}

							<Link
								href="/notarization"
								className="btn btn-outline w-full py-3"
							>
								Notarize
							</Link>
						</div>

						{/* RFP Express (includes Vendor Proof) */}
						<div className="bg-white p-8 rounded-3xl border-2 border-[#e2e8f0] transition-all hover:shadow-xl flex flex-col">
							<h3 className="text-xl font-bold mb-4">RFP Express</h3>
							<div className="text-3xl font-bold text-[#0f172a] mb-2">
								SGD 249
							</div>
							<p className="text-[#64748b] text-sm mb-6 pb-6 border-b border-[#e2e8f0]">
								Fast procurement evidence
							</p>
							<ul className="mb-8 space-y-3 flex-1">
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> 5 RFP Q&A
									answers
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> Vendor
									Proof Certificate
								</li>
								<li className="flex items-center gap-3 text-sm text-[#64748b]">
									<span className="text-[#10b981] font-bold">✓</span> 24-hour delivery
								</li>
							</ul>

							{/* Preview Trigger */}
							<button
								onClick={() => setActivePreview(activePreview === "vendor-proof" ? null : "vendor-proof")}
								className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-4 hover:underline text-left flex items-center gap-2"
							>
								{activePreview === "vendor-proof" ? "Close Preview" : "View Vendor Badge →"}
							</button>

							{activePreview === "vendor-proof" && (
								<div className="mb-6 p-6 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl animate-fade-in text-white text-center shadow-lg border-2 border-white/20">
									<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
										<span className="text-3xl">🛡️</span>
									</div>
									<h4 className="text-sm font-black uppercase tracking-tighter mb-1">Booppa Verified</h4>
									<p className="text-[10px] font-bold text-white/80">TRUST SCORE: 87</p>
									<div className="mt-4 py-2 px-3 bg-black/20 rounded-lg text-[8px] font-mono border border-white/10">
										VERIFIED VENDOR 2026
									</div>
								</div>
							)}

							<Link
								href="/rfp-acceleration#express"
								className="btn btn-outline w-full py-3"
							>
								Get Express
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
							
							<div className="h-8" /> {/* Spacer instead of preview */}

							<Link
								href="/rfp-acceleration#complete"
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
							Join 30,000+ vendors already using Booppa to prove their compliance and win more contracts.
						</p>
						<div className="flex flex-wrap justify-center gap-6 mb-6">
							<Link
								href="/pdpa"
								className="btn btn-primary px-10 py-5 text-xl font-black"
							>
								Get your report
							</Link>
							<Link
								href="#sample-report"
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
