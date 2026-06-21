"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

type Trend = {
	total: number | null;
	total_delta: number | null;
	compliance: number | null;
	compliance_delta: number | null;
	sector_percentile: number | null;
} | null;

type Benchmark = { sector: string; percentile: number } | null;

type Match = {
	tenderNo: string | null;
	title: string | null;
	agency: string | null;
	closingDate: string | null;
	url: string | null;
	label: "BID" | "WATCH" | "PASS" | null;
	reason: string | null;
	confidence: number | null;
};

type Insights = { trend: Trend; sectorBenchmark: Benchmark; tenderMatches: Match[] };

const LABEL_STYLE: Record<string, string> = {
	BID: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
	WATCH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
	PASS: "bg-neutral-700/40 text-neutral-400 border-neutral-700",
};

function Delta({ value }: { value: number | null }) {
	if (value === null || value === undefined) return null;
	if (value > 0)
		return (
			<span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
				<TrendingUp className="h-3 w-3" /> {value}
			</span>
		);
	if (value < 0)
		return (
			<span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-semibold">
				<TrendingDown className="h-3 w-3" /> {Math.abs(value)}
			</span>
		);
	return (
		<span className="inline-flex items-center gap-0.5 text-neutral-500 text-xs">
			<Minus className="h-3 w-3" />
		</span>
	);
}

/**
 * Vendor Active / Vendor Pro insight panel: score trend vs last cycle, sector
 * benchmark bar, and personalised BID/WATCH/PASS tender matches. Self-gated —
 * renders null when the backend has no insights (non-subscribers / no data).
 */
export default function VendorInsightsPanel() {
	const [data, setData] = useState<Insights | null>(null);

	useEffect(() => {
		fetch("/api/vendor/insights")
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => { if (d) setData(d); })
			.catch(() => {});
	}, []);

	if (!data) return null;
	const { trend, sectorBenchmark: bench, tenderMatches: matches } = data;
	const hasAnything = trend || bench || (matches && matches.length > 0);
	if (!hasAnything) return null;

	const pct = bench?.percentile ?? null;

	return (
		<div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-5">
			<div className="flex items-center justify-between">
				<h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
					Your monthly intelligence
				</h2>
				<Link href="/vendor/subscription" className="text-xs text-neutral-500 hover:text-white transition">
					Vendor Active
				</Link>
			</div>

			{/* Trend + benchmark */}
			{(trend || bench) && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{trend && (
						<div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
							<div className="flex items-center gap-3">
								<div className="text-2xl font-bold text-white">{trend.total ?? "—"}<span className="text-sm text-neutral-500">/100</span></div>
								<Delta value={trend.total_delta} />
								<span className="text-xs text-neutral-500">Trust vs last cycle</span>
							</div>
							<div className="flex items-center gap-3 mt-2">
								<div className="text-lg font-semibold text-neutral-200">{trend.compliance ?? "—"}<span className="text-xs text-neutral-500">/100</span></div>
								<Delta value={trend.compliance_delta} />
								<span className="text-xs text-neutral-500">Compliance</span>
							</div>
						</div>
					)}
					{bench && pct !== null && (
						<div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
							<div className="text-sm text-neutral-300">
								Top <span className="text-emerald-400 font-bold">{Math.max(1, 100 - pct)}%</span> in {bench.sector}
							</div>
							<div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden">
								<div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
							</div>
							<div className="text-xs text-neutral-500 mt-1.5">Ahead of {pct}% of peers in your sector</div>
						</div>
					)}
				</div>
			)}

			{/* Tender matches */}
			{matches && matches.length > 0 && (
				<div>
					<div className="text-sm font-semibold text-neutral-300 mb-2">Tender matches — should you bid?</div>
					<div className="space-y-2">
						{matches.map((m, i) => (
							<a
								key={m.tenderNo || i}
								href={m.url || "#"}
								target={m.url ? "_blank" : undefined}
								rel="noreferrer"
								className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 hover:border-neutral-700 transition"
							>
								<div className="min-w-0">
									<div className="text-sm text-neutral-200 truncate">{m.title || "Tender"}</div>
									<div className="text-xs text-neutral-500 truncate">
										{m.agency || ""}{m.closingDate ? ` · closes ${new Date(m.closingDate).toLocaleDateString()}` : ""}
									</div>
								</div>
								{m.label && (
									<span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded border ${LABEL_STYLE[m.label] || LABEL_STYLE.PASS}`}>
										{m.label}
									</span>
								)}
							</a>
						))}
					</div>
					<div className="text-[11px] text-neutral-600 mt-2">
						Data-driven guidance from real GeBIZ history, not guarantees.
					</div>
				</div>
			)}

			<Link href="/vendor/subscription" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
				Full monthly report arrives by email <ArrowRight className="h-3 w-3" />
			</Link>
		</div>
	);
}
