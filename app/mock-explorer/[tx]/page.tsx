import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mock Explorer - Booppa",
	description: "Local mock blockchain explorer for demo transactions",
};

export default function MockExplorerPage({
	params,
}: {
	params: { tx: string };
}) {
	const { tx } = params;
	const short = tx.slice(0, 10) + "..." + tx.slice(-6);

	return (
		<main className="min-h-screen p-8 bg-gray-50">
			<div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
				<h1 className="text-2xl font-black mb-4">Mock Explorer</h1>
				<p className="text-sm text-gray-600 mb-6">
					Viewing mock transaction{" "}
					<span className="font-mono text-sm">{short}</span>
				</p>

				<div className="grid grid-cols-1 gap-4">
					<div className="p-4 border rounded-lg bg-gray-50">
						<div className="font-mono text-xs break-all">Hash: {tx}</div>
						<div className="text-xs text-gray-500 mt-2">
							Status: <span className="text-green-600 font-bold">Verified</span>
						</div>
						<div className="text-xs text-gray-500">Network: Polygon (mock)</div>
						<div className="text-xs text-gray-500">Block: 45781234</div>
						<div className="text-xs text-gray-500">Confirmations: 12</div>
						<div className="text-xs text-gray-500">
							Timestamp: 2026-04-23T04:22:10Z
						</div>
					</div>

					<div className="p-4 border rounded-lg">
						<h3 className="font-bold mb-2">Transaction Details (mock)</h3>
						<pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">{`{
  \"tx\": \"${tx}\",
  \"from\": \"0xAaBbCc...\",
  \"to\": \"0xDdEeFf...\",
  \"value\": \"0\",
  \"data\": \"Notarization: Booppa sample evidence pack\"
}`}</pre>
					</div>

					<div className="p-4 border rounded-lg bg-[#f8fafc]">
						<h3 className="font-bold mb-2">How this maps to your report</h3>
						<ul className="text-sm text-gray-700 list-disc pl-5">
							<li>
								Hash above anchors the PDF report to the blockchain for
								integrity.
							</li>
							<li>Timestamp provides an immutable proof of existence.</li>
							<li>
								Use the PDF report's Evidence Pack to verify local contents
								against this hash.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</main>
	);
}
