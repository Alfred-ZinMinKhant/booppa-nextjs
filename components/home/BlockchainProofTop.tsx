import React from "react";

export default function BlockchainProofTop() {
	const mockHash = "0x8f3a12b4c9...91c2";
	const timestamp = new Date().toISOString();

	return (
		<section className="py-6 px-6 bg-[#f8fafc]">
			<div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-6">
				<div className="flex-1">
					<h3 className="text-xl font-bold">
						Blockchain-anchored proof (example)
					</h3>
					<p className="text-sm text-gray-600 mt-2">
						An example notarization anchored to Polygon to illustrate verifiable
						evidence.
					</p>
				</div>
				<div className="w-full md:w-1/2 bg-white p-4 rounded-xl border flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-mono text-gray-700">Hash</span>
						<span className="text-xs font-mono text-gray-900">{mockHash}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-500">Timestamp</span>
						<span className="text-xs font-mono text-gray-900">{timestamp}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-500">Network</span>
						<span className="text-xs font-bold text-[#10b981]">Polygon</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-500">Status</span>
						<span className="text-xs font-bold text-green-600">Verified</span>
					</div>
					<button
						disabled
						className="mt-2 text-center text-sm bg-gray-100 py-2 rounded"
					>
						View transaction (example)
					</button>
				</div>
			</div>
		</section>
	);
}
