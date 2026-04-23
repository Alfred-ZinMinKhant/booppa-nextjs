import React from "react";

export default function MiniDashboardMock() {
	return (
		<section className="py-10 px-6">
			<div className="max-w-[1000px] mx-auto">
				<h3 className="text-xl font-bold mb-4">Mini Dashboard Preview</h3>
				<div className="bg-white rounded-xl border p-4 shadow-sm">
					<div className="grid grid-cols-3 gap-4">
						<div className="col-span-2 p-4 bg-gray-50 rounded">
							<div className="flex justify-between items-center">
								<h4 className="font-bold">My Reports</h4>
								<span className="text-sm text-gray-500">3 reports</span>
							</div>
							<div className="mt-4 space-y-3">
								<div className="p-3 bg-white rounded border">
									PDPA Scan · 87/100 ·{" "}
									<span className="text-xs text-gray-500">Downloaded</span>
								</div>
								<div className="p-3 bg-white rounded border">
									Notarization · Verified ·{" "}
									<span className="text-xs text-gray-500">QR: available</span>
								</div>
							</div>
						</div>

						<aside className="p-4 bg-white rounded border">
							<h5 className="font-bold text-sm">Compliance Status</h5>
							<div className="mt-3 text-sm text-gray-600">
								Overall: Moderate risk
							</div>
							<h5 className="font-bold text-sm mt-4">Evidence History</h5>
							<ol className="mt-2 text-xs text-gray-500 list-decimal list-inside">
								<li>PDPA scan · 2026-03-12</li>
								<li>Document notarized · 2026-03-13</li>
							</ol>
						</aside>
					</div>
				</div>
			</div>
		</section>
	);
}
