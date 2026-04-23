"use client";

import React, { useState } from "react";

export default function BlockchainProofTop() {
	const mockHash = "0x8f3a12b4c9de..91c24e6b";
	const timestamp = new Date().toISOString();
	const [open, setOpen] = useState(false);

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

					<div className="flex gap-2">
						<button
							onClick={() => setOpen(true)}
							className="mt-2 flex-1 text-center text-sm bg-white border border-[#e2e8f0] py-2 rounded"
						>
							View transaction (example)
						</button>
						<a
							href={`/mock-explorer/${mockHash}`}
							target="_blank"
							rel="noreferrer"
							className="mt-2 text-center text-sm bg-[#10b981] text-white py-2 px-3 rounded"
						>
							Open in mock explorer
						</a>
					</div>
				</div>
			</div>

			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setOpen(false)}
					/>
					<div className="relative z-10 max-w-lg w-full bg-white rounded-xl p-6 shadow-lg">
						<div className="flex justify-between items-start mb-4">
							<h4 className="text-lg font-bold">Mock Transaction Details</h4>
							<button
								onClick={() => setOpen(false)}
								className="text-sm text-gray-500"
							>
								Close
							</button>
						</div>

						<div className="font-mono text-xs bg-[#f8fafc] p-3 rounded mb-4">
							Hash: {mockHash}
							<br />
							Network: Polygon
							<br />
							Status: Verified
							<br />
							Block: 45781234
							<br />
							Timestamp: {timestamp}
						</div>

						<div className="text-sm text-gray-700">
							This is a mock transaction view intended to demonstrate the
							verification flow without linking to a live blockchain
							transaction.
						</div>

						<div className="mt-6 flex justify-end">
							<a
								href={`/mock-explorer/${mockHash}`}
								target="_blank"
								rel="noreferrer"
								className="text-sm bg-[#10b981] text-white px-4 py-2 rounded"
							>
								Open mock explorer
							</a>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
