"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, ExternalLink, ShieldCheck } from "lucide-react"
import { config } from "@/lib/config"
import { POLYGON_NETWORK_NAME, polygonscanTxUrl, POLYGON_EXPLORER_HOST } from "@/lib/blockchain"

interface VerifyResponse {
	verify_id: string
	report_id: string
	framework: string
	company_name: string
	status: string
	tx_hash: string | null
	tx_network: string | null
	audit_hash: string | null
	anchored: boolean
	anchored_at: string | null
	tx_confirmed: string | null
	issued_at: string | null
	schema_version: number | null
	format: string
	verify_url: string
	disclaimer: string
}

export default function CoverSheetVerifyPage() {
	const params = useParams()
	const id = String(params?.id || "")
	const [data, setData] = useState<VerifyResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		if (!id) return
		let cancelled = false
		;(async () => {
			try {
				const res = await fetch(`${config.apiUrl}/api/v1/verify/cover-sheet/${encodeURIComponent(id)}`, {
					cache: "no-store",
				})
				if (!res.ok) {
					setError(res.status === 404 ? "We couldn't find this Cover Sheet." : "Verification temporarily unavailable.")
					return
				}
				const j = (await res.json()) as VerifyResponse
				if (!cancelled) setData(j)
			} catch {
				setError("Verification temporarily unavailable.")
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => { cancelled = true }
	}, [id])

	if (loading) {
		return (
			<main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
				<Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
			</main>
		)
	}

	if (error || !data) {
		return (
			<main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
				<div className="max-w-md text-center">
					<XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
					<h1 className="text-2xl font-black text-[#0f172a] mb-2">Cover Sheet not verified</h1>
					<p className="text-sm text-[#64748b] mb-6">{error || "No record found."}</p>
					<p className="text-xs text-[#94a3b8]">
						If you scanned this from a Booppa Cover Sheet PDF, the document may be a draft or its
						on-chain anchor may not have confirmed yet. Try again in a minute.
					</p>
				</div>
			</main>
		)
	}

	const ok = data.anchored && !!data.tx_hash

	return (
		<main className="min-h-screen bg-[#f8fafc] py-12 px-6">
			<div className="max-w-2xl mx-auto">
				{/* Verification verdict */}
				<div className={`rounded-2xl p-8 border-2 mb-6 ${ok ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"}`}>
					<div className="flex items-start gap-4">
						{ok ? (
							<CheckCircle2 className="w-12 h-12 text-emerald-600 flex-shrink-0" />
						) : (
							<Loader2 className="w-12 h-12 text-amber-600 animate-spin flex-shrink-0" />
						)}
						<div className="flex-1">
							<p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
								{ok ? "Verified" : "Anchoring in progress"}
							</p>
							<h1 className="text-2xl font-black text-[#0f172a] mb-1">
								{data.company_name}
							</h1>
							<p className="text-sm text-[#475569]">
								Compliance Cover Sheet · issued{" "}
								{data.issued_at ? new Date(data.issued_at).toLocaleDateString() : "—"}
							</p>
						</div>
					</div>
				</div>

				{/* Key facts */}
				<div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
					<h2 className="text-xs font-bold uppercase tracking-widest text-[#64748b] mb-4">
						Document facts
					</h2>
					<div className="space-y-3 text-sm">
						<Row label="Issued to" value={data.company_name} />
						<Row label="Document type" value="Compliance Evidence Pack — Cover Sheet" />
						<Row
							label="Issued (UTC)"
							value={data.issued_at ? new Date(data.issued_at).toLocaleString() : "—"}
						/>
						<Row
							label="Status"
							value={
								<span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
									{ok ? "Anchored on-chain" : "Anchor pending"}
								</span>
							}
						/>
						{data.schema_version && (
							<Row label="Schema version" value={`v${data.schema_version}`} />
						)}
					</div>
				</div>

				{/* On-chain receipt */}
				{(data.tx_hash || data.audit_hash) && (
					<div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
						<h2 className="text-xs font-bold uppercase tracking-widest text-[#64748b] mb-4 flex items-center gap-2">
							<ShieldCheck className="w-3.5 h-3.5" /> On-chain receipt
						</h2>
						<div className="space-y-3 text-sm">
							<Row label="Network" value={data.tx_network || POLYGON_NETWORK_NAME} />
							<Row label="Hash algorithm" value="SHA-256 → EvidenceAnchorV3 contract" />
							{data.audit_hash && (
								<div>
									<p className="text-xs text-[#64748b] mb-1">Evidence hash</p>
									<p className="text-xs font-mono break-all text-[#334155] bg-[#f8fafc] p-2 rounded">
										{data.audit_hash}
									</p>
								</div>
							)}
							{data.tx_hash && (
								<div>
									<p className="text-xs text-[#64748b] mb-1">Transaction</p>
									<a
										href={polygonscanTxUrl(data.tx_hash)}
										target="_blank"
										rel="noreferrer"
										className="text-xs font-mono break-all text-sky-600 hover:underline inline-flex items-start gap-1"
									>
										{data.tx_hash} <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
									</a>
									<p className="text-[10px] text-[#94a3b8] mt-1">
										View on {POLYGON_EXPLORER_HOST}
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Disclaimer */}
				<div className="text-xs text-[#94a3b8] leading-relaxed">
					{data.disclaimer}
				</div>

				{/* Footer */}
				<div className="text-center mt-10 text-xs text-[#94a3b8]">
					<Link href="/" className="hover:text-[#10b981]">
						Booppa Smart Care LLC · booppa.io
					</Link>
				</div>
			</div>
		</main>
	)
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-start gap-3">
			<p className="text-xs text-[#64748b] w-32 flex-shrink-0">{label}</p>
			<div className="flex-1 text-[#0f172a]">{value}</div>
		</div>
	)
}
