"use client";

import Link from "next/link";

export default function SegmentationSections() {
	return (
		<section className="py-24 px-6 bg-white">
			<div className="max-w-[1200px] mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Vendor Section */}
					<div className="p-8 lg:p-12 rounded-[2.5rem] bg-[#f8fafc] border border-[#e2e8f0] flex flex-col hover:border-[#10b981] transition-all group">
						<div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 transition-transform">
							🏢
						</div>
						<h2 className="text-3xl font-black text-[#0f172a] mb-4">For Vendors</h2>
						<p className="text-lg text-[#64748b] mb-8 flex-1">
							Build trust with procurement teams instantly. Get verified, prove your compliance, and win more contracts with audit-ready evidence.
						</p>
						<ul className="space-y-4 mb-10">
							<li className="flex items-center gap-3 text-sm font-bold text-[#0f172a]">
								<span className="text-[#10b981]">✓</span> Instant Compliance Scoring
							</li>
							<li className="flex items-center gap-3 text-sm font-bold text-[#0f172a]">
								<span className="text-[#10b981]">✓</span> Blockchain-anchored Proof
							</li>
							<li className="flex items-center gap-3 text-sm font-bold text-[#0f172a]">
								<span className="text-[#10b981]">✓</span> RFP Acceleration Kits
							</li>
						</ul>
						<Link
							href="/pdpa"
							className="bg-[#10b981] hover:bg-[#059669] text-white text-center py-4 rounded-xl font-black transition-colors"
						>
							Get verified and win more contracts
						</Link>
					</div>

					{/* Buyer Section */}
					<div className="p-8 lg:p-12 rounded-[2.5rem] bg-[#0f172a] text-white flex flex-col hover:ring-4 hover:ring-[#10b981]/20 transition-all group">
						<div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 transition-transform">
							🔍
						</div>
						<h2 className="text-3xl font-black mb-4 text-white">For Buyer Teams</h2>
						<p className="text-lg text-white/70 mb-8 flex-1">
							Reduce evaluation risk and eliminate manual compliance document chasing. Access verified vendor data with immutable proof.
						</p>
						<ul className="space-y-4 mb-10">
							<li className="flex items-center gap-3 text-sm font-bold text-white/90">
								<span className="text-[#10b981]">✓</span> Continuous Risk Monitoring
							</li>
							<li className="flex items-center gap-3 text-sm font-bold text-white/90">
								<span className="text-[#10b981]">✓</span> Automated Vendor Evaluation
							</li>
							<li className="flex items-center gap-3 text-sm font-bold text-white/90">
								<span className="text-[#10b981]">✓</span> Audit-Ready Evidence Hub
							</li>
						</ul>
						<Link
							href="/solutions/procurement"
							className="bg-white hover:bg-white/90 text-[#0f172a] text-center py-4 rounded-xl font-black transition-colors"
						>
							Evaluate vendors with audit-ready evidence
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
