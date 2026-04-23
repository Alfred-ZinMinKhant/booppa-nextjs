import React from "react";
import Link from "next/link";

export default function ReportPreviewTop() {
	return (
		<section id="sample-report" className="py-12 px-6 bg-white">
			<div className="max-w-[1000px] mx-auto">
				<h2 className="text-2xl font-black mb-4">Sample Compliance Report</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-bold text-lg">
									Fictional Vendor • ███●● Co.
								</h3>
								<p className="text-sm text-gray-600">
									Audit-ready summary · anonymized
								</p>
							</div>
							<div className="text-right">
								<div className="inline-flex items-center gap-3">
									<span className="px-3 py-1 bg-[#10b981] text-white text-xs font-black rounded-full">
										Audit‑ready
									</span>
									<div className="text-3xl font-extrabold">78/100</div>
								</div>
								<div className="text-xs text-gray-500">Compliance Score</div>
							</div>
						</div>

						<div className="mt-6 space-y-3">
							<p className="text-sm text-gray-700">
								Summary: Automated assessment finds acceptable controls across
								most obligations, with two medium-risk flags requiring
								attention.
							</p>
							<ul className="mt-3 space-y-2 text-sm text-gray-600">
								<li>• Missing retention policy (Risk: Medium)</li>
								<li>• Incomplete vendor contract terms (Risk: Low)</li>
								<li>• Unencrypted backups (Risk: Medium)</li>
							</ul>
						</div>

						<div className="mt-6 flex items-center justify-between">
							<div className="text-sm text-gray-500">
								Generated PDF example available
							</div>
							<div className="flex items-center gap-3">
								<div className="w-12 h-16 bg-white rounded border flex items-center justify-center text-sm text-gray-400">
									PDF
								</div>
								<Link
									href="/api/mock/report"
									className="text-sm bg-blue-600 text-white px-3 py-2 rounded"
								>
									Download sample PDF
								</Link>
							</div>
						</div>
					</div>

					<aside className="bg-white p-4 rounded-xl border">
						<div className="mb-4">
							<p className="text-xs font-black uppercase text-gray-500 tracking-widest">
								Risk Flags
							</p>
							<ol className="mt-2 text-sm text-gray-600 list-decimal list-inside">
								<li>Missing retention policy</li>
								<li>Unencrypted backups</li>
								<li>Outdated third-party agreements</li>
							</ol>
						</div>
						<div className="mt-4">
							<p className="text-xs font-black uppercase text-gray-500 tracking-widest mb-2">
								Audit Evidence
							</p>
							<div className="bg-[#f8fafc] p-3 rounded-lg border text-sm text-gray-700">
								<div className="font-mono text-xs break-all">
									Hash: 0x8f3a2c91c2...91c24e6b
								</div>
								<div className="text-xs text-gray-500 mt-2">
									Timestamp: 2026-04-23T04:22:10Z
								</div>
								<div className="text-xs text-[#10b981] font-bold mt-2">
									Network: Polygon (example)
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
}
