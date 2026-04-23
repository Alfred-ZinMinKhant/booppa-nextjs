import React from "react";
import Link from "next/link";

export default function ReportPreviewTop() {
	return (
		<section className="py-12 px-6 bg-white">
			<div className="max-w-[1000px] mx-auto">
				<h2 className="text-2xl font-black mb-4">Sample Compliance Report</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-bold text-lg">Fictional Vendor Co.</h3>
								<p className="text-sm text-gray-600">
									Audit-ready summary · anonymized
								</p>
							</div>
							<div className="text-right">
								<div className="text-3xl font-extrabold">78/100</div>
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
							<div className="text-sm text-green-600 font-bold">
								Audit-ready
							</div>
							<div className="text-sm text-gray-500">
								Generated PDF example available
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
						<a
							href="/api/mock/report"
							className="block mt-4 text-center bg-blue-600 text-white py-2 rounded"
							target="_blank"
							rel="noreferrer"
						>
							Download PDF example
						</a>
					</aside>
				</div>
			</div>
		</section>
	);
}
