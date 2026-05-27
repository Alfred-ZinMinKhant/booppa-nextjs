"use client";

export default function ReportPreview() {
	return (
		<section id="sample-report" className="py-24 px-6 bg-white">
			<div className="max-w-[1200px] mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-4">
						Sample Compliance Report
					</h2>
					<p className="text-xl text-[#64748b] max-w-2xl mx-auto">
						Tangible proof of output. See exactly what buyer teams receive when you share your Booppa profile.
					</p>
				</div>

				<div className="bg-[#f8fafc] rounded-[2rem] p-8 lg:p-12 border border-[#e2e8f0] shadow-xl max-w-4xl mx-auto overflow-hidden relative">
					{/* PDF-style header */}
					<div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
						<div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center font-black text-xl">
									B
								</div>
								<div>
									<h3 className="font-bold leading-tight">BOOPPA COMPLIANCE</h3>
									<p className="text-[10px] text-white/60">OFFICIAL VERIFICATION REPORT</p>
								</div>
							</div>
							<div className="text-right">
								<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10b981] rounded-full text-[10px] font-black uppercase">
									Audit-Ready
								</div>
							</div>
						</div>

						<div className="p-8 lg:p-12">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
								<div>
									<label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">
										Vendor Information
									</label>
									<h4 className="text-2xl font-black text-[#0f172a] mb-1">Acme Cloud Solutions Pte Ltd</h4>
									<p className="text-sm text-[#64748b]">UEN: 202412345Z</p>
									<p className="text-sm text-[#64748b]">Verified since Jan 2026</p>
								</div>
								<div className="md:text-right">
									<label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">
										Compliance Score
									</label>
									<div className="text-6xl font-black text-[#10b981]">
										78<span className="text-2xl text-[#94a3b8]">/100</span>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
								<div className="p-6 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0]">
									<div className="text-2xl mb-2">🛡️</div>
									<h5 className="font-bold text-[#0f172a] mb-1">PDPA</h5>
									<p className="text-xs text-[#64748b]">8/8 Obligations Met</p>
								</div>
								<div className="p-6 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0]">
									<div className="text-2xl mb-2">📊</div>
									<h5 className="font-bold text-[#0f172a] mb-1">Data Risk</h5>
									<p className="text-xs text-[#64748b]">Low Severity</p>
								</div>
								<div className="p-6 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0]">
									<div className="text-2xl mb-2">🔐</div>
									<h5 className="font-bold text-[#0f172a] mb-1">Security</h5>
									<p className="text-xs text-[#64748b]">ISO 27001 Aligned</p>
								</div>
							</div>

							<div className="mb-12">
								<label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-4">
									Risk Flags (2)
								</label>
								<div className="space-y-3">
									<div className="flex gap-4 p-4 rounded-xl border border-orange-100 bg-orange-50/50">
										<div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
											!
										</div>
										<div>
											<p className="text-sm font-bold text-orange-900">Minor: Privacy Policy Update Required</p>
											<p className="text-xs text-orange-700">Section 12 reference: Notification obligation requires explicit purpose statement for marketing cookies.</p>
										</div>
									</div>
									<div className="flex gap-4 p-4 rounded-xl border border-orange-100 bg-orange-50/50">
										<div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
											!
										</div>
										<div>
											<p className="text-sm font-bold text-orange-900">Minor: DPO Contact Visibility</p>
											<p className="text-xs text-orange-700">DPO email is present but not prominently displayed on the primary contact page.</p>
										</div>
									</div>
								</div>
							</div>

							<div>
								<label className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-4">
									Executive Summary
								</label>
								<p className="text-[#64748b] leading-relaxed italic border-l-4 border-[#10b981] pl-6 py-2">
									&quot;Acme Cloud Solutions demonstrates a robust baseline for PDPA compliance. While minor administrative updates are recommended for full transparency, the organization meets all core legal requirements for data processing in Singapore. Recommended for procurement onboarding with standard monitoring.&quot;
								</p>
							</div>
						</div>

						<div className="bg-[#f8fafc] p-6 border-t border-[#e2e8f0] flex flex-wrap justify-between items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-white border border-[#e2e8f0] rounded flex items-center justify-center text-lg">
									QR
								</div>
								<span className="text-[10px] font-bold text-[#64748b]">Scan to verify authenticity</span>
							</div>
							<div className="text-[10px] text-[#94a3b8] font-mono">
								BLOCKCHAIN HASH: 0x8f3a2c91c2...91c24e6b
							</div>
						</div>
					</div>

					{/* Decorative blobs */}
					<div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#10b981] opacity-10 rounded-full blur-3xl pointer-events-none" />
					<div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl pointer-events-none" />
				</div>

				<div className="mt-12 text-center">
					<p className="text-[#64748b] mb-6 font-medium">Want your own audit-ready report?</p>
					<Link href="/pdpa" className="btn btn-primary px-10 py-4 text-lg font-black">
						Get your report — SGD 79
					</Link>
				</div>
			</div>
		</section>
	);
}

import Link from "next/link";
