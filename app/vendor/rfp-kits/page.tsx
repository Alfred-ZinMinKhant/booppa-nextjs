"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Download, Plus, ArrowRight } from "lucide-react";

interface KitRow {
	reportId: string;
	sessionId: string | null;
	companyName: string | null;
	vendorUrl: string | null;
	productType: string;
	createdAt: string | null;
	downloadUrl: string | null;
	docxUrl: string | null;
	declarationUrl: string | null;
	appendixDUrl: string | null;
}

const fmtDate = (iso: string | null) =>
	iso ? new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "—";

function DownloadLink({ href, label }: { href: string | null; label: string }) {
	if (!href) return null;
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
			<Download className="h-3 w-3" /> {label}
		</a>
	);
}

export default function RfpKitsPage() {
	const [kits, setKits] = useState<KitRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/rfp-intake/kits")
			.then((r) => (r.ok ? r.json() : { items: [] }))
			.then((d) => setKits(Array.isArray(d.items) ? d.items : []))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="min-h-screen bg-neutral-950 p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold text-white flex items-center gap-2">
							<FileText className="h-6 w-6 text-emerald-500" /> My RFP kits
						</h1>
						<p className="text-sm text-neutral-400 mt-1">Every RFP Complete Kit you&apos;ve generated, in one place.</p>
					</div>
					<Link href="/pricing#rfp-complete" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
						<Plus className="h-4 w-4" /> New RFP kit
					</Link>
				</div>

				{loading ? (
					<div className="h-32 bg-neutral-900 rounded-xl border border-neutral-800 animate-pulse" />
				) : kits.length === 0 ? (
					<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-8 text-center">
						<FileText className="h-8 w-8 text-emerald-500 mx-auto" />
						<p className="mt-3 text-neutral-300 font-medium">No RFP kits yet</p>
						<p className="mt-1 text-sm text-neutral-500">Generate your first kit and it will appear here for reuse.</p>
						<Link href="/pricing#rfp-complete" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
							Get RFP Complete <ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					<div className="space-y-3">
						{kits.map((k) => (
							<div key={k.reportId} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-sm font-semibold text-white">{k.companyName || "RFP kit"}</p>
										<p className="text-xs text-neutral-500 mt-0.5">
											{k.vendorUrl ? `${k.vendorUrl} · ` : ""}{fmtDate(k.createdAt)} · {k.productType === "rfp_complete" ? "Complete Kit" : "Express"}
										</p>
									</div>
									{k.sessionId && (
										<Link href={`/rfp-acceleration/result?session_id=${encodeURIComponent(k.sessionId)}`} className="text-xs text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1">
											Open <ArrowRight className="h-3 w-3" />
										</Link>
									)}
								</div>
								<div className="mt-3 flex flex-wrap gap-4">
									<DownloadLink href={k.downloadUrl} label="PDF" />
									<DownloadLink href={k.docxUrl} label="Editable DOCX" />
									<DownloadLink href={k.declarationUrl} label="Supplier Declaration" />
									<DownloadLink href={k.appendixDUrl} label="Appendix D" />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
