"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	TrendingUp,
	Search,
	Target,
	BarChart3,
	Building,
	AlertCircle,
	ArrowRight,
	Zap,
	Clock,
	ExternalLink,
	Bookmark,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SectorBucket {
	key: string;
	awards: number;
	unique_winners?: number;
	total_value_sgd: number;
	avg_value_sgd: number;
	concentration?: number | null;
}

interface SectorTrendsResponse {
	window_months: number;
	since: string;
	total_awards: number;
	by_agency: SectorBucket[];
	by_sector: SectorBucket[];
	by_contract_size: SectorBucket[];
}

interface AwardRow {
	tender_no: string | null;
	awarded_date: string | null;
	supplier_name: string | null;
	award_amt_sgd: number | null;
	tender_description: string | null;
	procuring_entity: string | null;
	sector: string | null;
}

interface AwardsResponse {
	total: number;
	limit: number;
	offset: number;
	results: AwardRow[];
}

interface SupplierBenchmarkResponse {
	supplier_query: string;
	window_months: number;
	summary: {
		total_awards: number;
		total_value_sgd: number;
		avg_value_sgd: number;
		primary_sector: string | null;
		distinct_agencies: number;
		distinct_sectors: number;
	};
	peer_benchmark: {
		sector: string | null;
		peer_count: number;
		supplier_rank_in_sector: number | null;
		top_peers: { supplier_name: string; awards: number; total_value_sgd: number }[];
	};
	timeseries: { month: string; awards: number; total_value_sgd: number }[];
}

interface TimingResponse {
	tender_no: string;
	recommendation: "bid" | "watch" | "pass";
	confidence: number;
	win_probability_pct: number;
	thresholds: { bid: number; watch: number };
	agency: string | null;
	sector: string | null;
	comparable_awards: {
		awarded_date: string | null;
		supplier_name: string | null;
		award_amt_sgd: number | null;
		tender_description: string | null;
	}[];
}

interface ForecastResponse {
	filters: { sector: string | null; agency: string | null };
	history_months: number;
	horizon_months: number;
	fit_quality: { r2_award_count: number; r2_total_value: number };
	history: { month: string; awards: number; total_value_sgd: number }[];
	forecast: {
		month: string;
		expected_awards: number;
		expected_total_value_sgd: number;
	}[];
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function fmtSGD(v: number | null | undefined) {
	if (v === null || v === undefined) return "—";
	return `S$${Math.round(v).toLocaleString()}`;
}

function PaywallNotice() {
	return (
		<div className="max-w-3xl mx-auto mt-16 p-8 bg-white border border-violet-200 rounded-2xl shadow-sm">
			<div className="flex items-start gap-4">
				<div className="p-3 bg-violet-50 rounded-xl">
					<AlertCircle className="w-6 h-6 text-violet-600" />
				</div>
				<div className="flex-1">
					<h2 className="text-2xl font-black text-[#0f172a] mb-2">Subscription required</h2>
					<p className="text-[#64748b] mb-6">
						Tender Intelligence is a paid product. Subscribe (SGD 149/mo or
						SGD 1,499/yr) to unlock sector trends, historical award data,
						AI-driven bid timing, supplier benchmarking, and the monthly
						digest.
					</p>
					<Link
						href="/pricing#tender-intelligence"
						className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-violet-500 transition"
					>
						View pricing <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
}

function Panel({
	icon: Icon,
	title,
	description,
	children,
}: {
	icon: any;
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
			<header className="flex items-start gap-3 mb-4">
				<div className="p-2 bg-violet-50 rounded-lg">
					<Icon className="w-5 h-5 text-violet-600" />
				</div>
				<div className="flex-1">
					<h2 className="text-lg font-bold text-[#0f172a]">{title}</h2>
					{description && <p className="text-xs text-[#64748b] mt-0.5">{description}</p>}
				</div>
			</header>
			{children}
		</section>
	);
}

function recColors(rec: "bid" | "watch" | "pass") {
	if (rec === "bid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
	if (rec === "watch") return "bg-amber-50 text-amber-700 border-amber-200";
	return "bg-rose-50 text-rose-700 border-rose-200";
}

function badgeColors(label: string | null) {
	const l = (label || "").toLowerCase();
	if (l === "bid") return recColors("bid");
	if (l === "watch") return recColors("watch");
	return recColors("pass");
}

// ── Live feed types ───────────────────────────────────────────────────────────
type IntentValue = "bid" | "watch" | "pass" | "not_bidding";

interface FeedItem {
	tenderNo: string;
	title: string | null;
	agency: string | null;
	sector: string | null;
	estimatedValue: number | null;
	closingDate: string | null;
	daysToClose: number | null;
	url: string | null;
	bidLabel: string | null;
	bidReason: string | null;
	bidConfidence: number | null;
	urgent: boolean;
	intent: IntentValue | null;
	notes?: string | null;
	closed?: boolean;
}

const INTENT_BUTTONS: { value: IntentValue; label: string }[] = [
	{ value: "bid", label: "Bidding" },
	{ value: "watch", label: "Watching" },
	{ value: "pass", label: "Pass" },
	{ value: "not_bidding", label: "Not bidding" },
];

const fmtSgd = (v: number | null) =>
	v == null ? "—" : v >= 1_000_000 ? `S$${(v / 1_000_000).toFixed(1)}M` : `S$${Math.round(v).toLocaleString()}`;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TenderIntelligencePage() {
	const [paywalled, setPaywalled] = useState<boolean | null>(null);

	// Sector trends state
	const [trends, setTrends] = useState<SectorTrendsResponse | null>(null);
	const [trendsLoading, setTrendsLoading] = useState(true);
	const [trendsError, setTrendsError] = useState<string | null>(null);
	const [trendsSector, setTrendsSector] = useState("");
	const [trendsMonths, setTrendsMonths] = useState(12);

	// Awards search state
	const [awardsAgency, setAwardsAgency] = useState("");
	const [awardsSupplier, setAwardsSupplier] = useState("");
	const [awards, setAwards] = useState<AwardsResponse | null>(null);
	const [awardsLoading, setAwardsLoading] = useState(false);

	// Supplier benchmark state
	const [supplier, setSupplier] = useState("");
	const [bench, setBench] = useState<SupplierBenchmarkResponse | null>(null);
	const [benchLoading, setBenchLoading] = useState(false);
	const [benchError, setBenchError] = useState<string | null>(null);

	// Timing state
	const [tenderNo, setTenderNo] = useState("");
	const [timing, setTiming] = useState<TimingResponse | null>(null);
	const [timingLoading, setTimingLoading] = useState(false);
	const [timingError, setTimingError] = useState<string | null>(null);

	// Forecast state
	const [forecastSector, setForecastSector] = useState("");
	const [forecast, setForecast] = useState<ForecastResponse | null>(null);
	const [forecastLoading, setForecastLoading] = useState(false);

	// Live feed + intent tracking state
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [feedLoading, setFeedLoading] = useState(true);
	const [tracked, setTracked] = useState<FeedItem[]>([]);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [savingIntent, setSavingIntent] = useState<Record<string, boolean>>({});

	// ── Initial load: sector trends doubles as the paywall probe ────────────
	async function loadTrends(sector: string, months: number) {
		setTrendsLoading(true);
		setTrendsError(null);
		try {
			const params = new URLSearchParams({ months: String(months) });
			if (sector) params.set("sector", sector);
			const res = await fetch(`/api/tender-intelligence/sector-trends?${params}`);
			if (res.status === 403) {
				setPaywalled(true);
				return;
			}
			if (!res.ok) {
				setTrendsError(`Failed (${res.status})`);
				return;
			}
			setPaywalled(false);
			const data = (await res.json()) as SectorTrendsResponse;
			setTrends(data);
		} catch (e: any) {
			setTrendsError(e?.message || "Network error");
		} finally {
			setTrendsLoading(false);
		}
	}
	useEffect(() => {
		loadTrends("", 12);
		loadForecast("");
		loadFeed();
		loadIntents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function loadFeed() {
		setFeedLoading(true);
		try {
			const res = await fetch("/api/tender-intelligence/feed");
			if (res.status === 403) {
				setPaywalled(true);
				return;
			}
			if (res.ok) {
				const data = await res.json();
				setFeed(Array.isArray(data.items) ? data.items : []);
			}
		} finally {
			setFeedLoading(false);
		}
	}

	async function loadIntents() {
		try {
			const res = await fetch("/api/tender-intelligence/intents");
			if (res.ok) {
				const data = await res.json();
				setTracked(Array.isArray(data.items) ? data.items : []);
			}
		} catch {
			/* non-blocking */
		}
	}

	async function setIntent(item: FeedItem, intent: IntentValue) {
		// Toggle off if the same intent is clicked again → untrack.
		const clearing = item.intent === intent;
		setSavingIntent((p) => ({ ...p, [item.tenderNo]: true }));
		// Optimistic update in the feed.
		setFeed((prev) =>
			prev.map((f) => (f.tenderNo === item.tenderNo ? { ...f, intent: clearing ? null : intent } : f)),
		);
		try {
			if (clearing) {
				await fetch(`/api/tender-intelligence/intents/${encodeURIComponent(item.tenderNo)}`, { method: "DELETE" });
			} else {
				await fetch("/api/tender-intelligence/intents", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ tender_no: item.tenderNo, intent }),
				});
			}
			await loadIntents();
		} finally {
			setSavingIntent((p) => ({ ...p, [item.tenderNo]: false }));
		}
	}

	async function loadAwards() {
		setAwardsLoading(true);
		try {
			const params = new URLSearchParams({ limit: "20" });
			if (awardsAgency) params.set("agency", awardsAgency);
			if (awardsSupplier) params.set("supplier", awardsSupplier);
			const res = await fetch(`/api/tender-intelligence/awards?${params}`);
			if (res.ok) setAwards(await res.json());
		} finally {
			setAwardsLoading(false);
		}
	}

	async function loadBenchmark() {
		if (!supplier.trim()) return;
		setBenchLoading(true);
		setBenchError(null);
		setBench(null);
		try {
			const res = await fetch(
				`/api/tender-intelligence/supplier-benchmark/${encodeURIComponent(supplier.trim())}`
			);
			if (res.status === 404) {
				setBenchError("No awards found for this supplier in the window.");
				return;
			}
			if (!res.ok) {
				setBenchError(`Failed (${res.status})`);
				return;
			}
			setBench(await res.json());
		} finally {
			setBenchLoading(false);
		}
	}

	async function loadTiming() {
		if (!tenderNo.trim()) return;
		setTimingLoading(true);
		setTimingError(null);
		setTiming(null);
		try {
			const res = await fetch(
				`/api/tender-intelligence/timing/${encodeURIComponent(tenderNo.trim())}`
			);
			if (res.status === 404) {
				setTimingError(`Tender '${tenderNo}' not found.`);
				return;
			}
			if (!res.ok) {
				setTimingError(`Failed (${res.status})`);
				return;
			}
			setTiming(await res.json());
		} finally {
			setTimingLoading(false);
		}
	}

	async function loadForecast(sector: string) {
		setForecastLoading(true);
		try {
			const params = new URLSearchParams({ horizon_months: "3" });
			if (sector) params.set("sector", sector);
			const res = await fetch(`/api/tender-intelligence/forecast?${params}`);
			if (res.ok) setForecast(await res.json());
			else setForecast(null);
		} finally {
			setForecastLoading(false);
		}
	}

	if (paywalled) {
		return (
			<div className="min-h-screen bg-[#f8fafc] px-4 py-12">
				<PaywallNotice />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f8fafc]">
			<div className="max-w-7xl mx-auto px-4 py-10">
				{/* Header */}
				<header className="mb-10">
					<p className="text-xs font-bold tracking-widest uppercase text-violet-600 mb-2">
						Tender Intelligence
					</p>
					<h1 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-2">
						GeBIZ analytics dashboard
					</h1>
					<p className="text-[#64748b] max-w-2xl">
						Sector trends, historical awards, bid timing, supplier benchmarking,
						and 3-month forecasts — sourced from data.gov.sg and GeBIZ live
						tenders.
					</p>
				</header>

				{/* ── Live opportunities (BID/WATCH/PASS feed + intent) ──────────── */}
				<div className="mb-6">
					<Panel
						icon={Zap}
						title="Live opportunities"
						description="Open GeBIZ tenders scored for your profile — same engine as your monthly digest"
					>
						{feedLoading ? (
							<p className="text-sm text-[#64748b]">Loading live tenders…</p>
						) : feed.length === 0 ? (
							<p className="text-sm text-[#64748b]">No open tenders match right now. Check back soon.</p>
						) : (
							<div className="space-y-3">
								{feed.map((item) => (
									<div
										key={item.tenderNo}
										className={`rounded-xl border p-4 ${item.urgent ? "border-rose-300 bg-rose-50/40" : "border-[#e2e8f0] bg-white"}`}
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColors(item.bidLabel)}`}>
														{item.bidLabel || "—"}
													</span>
													{item.urgent && (
														<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
															<Clock className="w-3 h-3" /> Closing in {item.daysToClose}d
														</span>
													)}
												</div>
												<p className="text-sm font-semibold text-[#0f172a] mt-1.5">{item.title || item.tenderNo}</p>
												<p className="text-xs text-[#64748b] mt-0.5">
													{item.agency || "—"} · {fmtSgd(item.estimatedValue)}
													{item.daysToClose != null && !item.urgent ? ` · closes in ${item.daysToClose}d` : ""}
												</p>
											</div>
											<div className="flex items-center gap-2">
												{item.url && (
													<a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
														GeBIZ <ExternalLink className="w-3 h-3" />
													</a>
												)}
											</div>
										</div>

										{item.bidReason && (
											<button
												onClick={() => setExpanded((p) => ({ ...p, [item.tenderNo]: !p[item.tenderNo] }))}
												className="mt-2 text-xs text-violet-600 hover:text-violet-700 font-medium"
											>
												{expanded[item.tenderNo] ? "Hide reasoning" : "Why?"}
											</button>
										)}
										{expanded[item.tenderNo] && item.bidReason && (
											<p className="mt-1.5 text-xs text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-2.5">
												{item.bidReason}
												{item.bidConfidence != null ? ` (confidence ${item.bidConfidence}%)` : ""}
											</p>
										)}

										<div className="mt-3 flex flex-wrap gap-2">
											{INTENT_BUTTONS.map((b) => {
												const active = item.intent === b.value;
												return (
													<button
														key={b.value}
														onClick={() => setIntent(item, b.value)}
														disabled={!!savingIntent[item.tenderNo]}
														className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-60 ${active ? "bg-violet-600 text-white border-violet-600" : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]"}`}
													>
														{b.label}
													</button>
												);
											})}
										</div>
									</div>
								))}
							</div>
						)}
					</Panel>
				</div>

				{/* ── Tracked tenders ───────────────────────────────────────────── */}
				{tracked.length > 0 && (
					<div className="mb-6">
						<Panel
							icon={Bookmark}
							title={`Tracked tenders (${tracked.length})`}
							description="Tenders you've marked — badges update as ratings change"
						>
							<div className="divide-y divide-[#e2e8f0]">
								{tracked.map((t) => (
									<div key={t.tenderNo} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
										<div className="min-w-0">
											<p className="text-sm text-[#0f172a] truncate">{t.title || t.tenderNo}</p>
											<p className="text-xs text-[#64748b]">{t.agency || "—"} · {fmtSgd(t.estimatedValue)}{t.closed ? " · closed" : ""}</p>
										</div>
										<div className="flex items-center gap-2">
											<span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColors(t.bidLabel)}`}>{t.bidLabel || "—"}</span>
											<span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 capitalize">{(t.intent || "").replace("_", " ")}</span>
										</div>
									</div>
								))}
							</div>
						</Panel>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* ── Sector Trends ─────────────────────────────────────────── */}
					<Panel
						icon={TrendingUp}
						title="Sector trends"
						description="Win-rate patterns over a rolling window"
					>
						<div className="flex gap-2 mb-4">
							<input
								value={trendsSector}
								onChange={(e) => setTrendsSector(e.target.value)}
								placeholder="Sector (IT, CONSTRUCTION…)"
								className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<select
								value={trendsMonths}
								onChange={(e) => setTrendsMonths(Number(e.target.value))}
								className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							>
								<option value={6}>6 mo</option>
								<option value={12}>12 mo</option>
								<option value={24}>24 mo</option>
							</select>
							<button
								onClick={() => loadTrends(trendsSector, trendsMonths)}
								className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500"
							>
								Apply
							</button>
						</div>
						{trendsLoading && <p className="text-sm text-[#64748b]">Loading…</p>}
						{trendsError && <p className="text-sm text-rose-600">{trendsError}</p>}
						{trends && !trendsLoading && (
							<div className="space-y-4">
								<p className="text-xs text-[#64748b]">
									{trends.total_awards} awards since {trends.since}
								</p>
								<MiniTable
									header={["Agency", "Awards", "Total"]}
									rows={trends.by_agency.slice(0, 6).map((r) => [
										r.key,
										String(r.awards),
										fmtSGD(r.total_value_sgd),
									])}
								/>
								<MiniTable
									header={["Sector", "Awards", "Unique winners"]}
									rows={trends.by_sector.slice(0, 6).map((r) => [
										r.key,
										String(r.awards),
										String(r.unique_winners ?? "—"),
									])}
								/>
								<MiniTable
									header={["Contract size", "Awards", "Avg"]}
									rows={trends.by_contract_size.map((r) => [
										r.key,
										String(r.awards),
										fmtSGD(r.avg_value_sgd),
									])}
								/>
							</div>
						)}
					</Panel>

					{/* ── Bid Timing ────────────────────────────────────────────── */}
					<Panel
						icon={Target}
						title="Bid / watch / pass"
						description="AI timing recommendation per live tender"
					>
						<div className="flex gap-2 mb-4">
							<input
								value={tenderNo}
								onChange={(e) => setTenderNo(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && loadTiming()}
								placeholder="GeBIZ tender no. (e.g. ITQ202500001)"
								className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<button
								onClick={loadTiming}
								disabled={timingLoading}
								className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 disabled:opacity-50"
							>
								{timingLoading ? "…" : "Analyse"}
							</button>
						</div>
						{timingError && <p className="text-sm text-rose-600">{timingError}</p>}
						{timing && (
							<div className="space-y-4">
								<div
									className={`inline-flex items-center gap-3 px-4 py-2 border rounded-xl font-bold uppercase tracking-wider text-sm ${recColors(
										timing.recommendation
									)}`}
								>
									{timing.recommendation}
									<span className="text-xs font-normal opacity-70">
										conf {(timing.confidence * 100).toFixed(0)}%
									</span>
								</div>
								<div className="text-sm text-[#0f172a]">
									Win probability: <strong>{timing.win_probability_pct}%</strong>
									{timing.agency && (
										<> · Agency: <em>{timing.agency}</em></>
									)}
									{timing.sector && (
										<> · Sector: <em>{timing.sector}</em></>
									)}
								</div>
								{timing.comparable_awards.length > 0 && (
									<MiniTable
										header={["Date", "Supplier", "Amount"]}
										rows={timing.comparable_awards.slice(0, 5).map((c) => [
											c.awarded_date ?? "—",
											c.supplier_name ?? "—",
											fmtSGD(c.award_amt_sgd),
										])}
									/>
								)}
							</div>
						)}
					</Panel>

					{/* ── Supplier Benchmark ────────────────────────────────────── */}
					<Panel
						icon={Building}
						title="Supplier benchmark"
						description="Rank a supplier against peers in their primary sector"
					>
						<div className="flex gap-2 mb-4">
							<input
								value={supplier}
								onChange={(e) => setSupplier(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && loadBenchmark()}
								placeholder="Supplier name"
								className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<button
								onClick={loadBenchmark}
								disabled={benchLoading}
								className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 disabled:opacity-50"
							>
								{benchLoading ? "…" : "Benchmark"}
							</button>
						</div>
						{benchError && <p className="text-sm text-rose-600">{benchError}</p>}
						{bench && (
							<div className="space-y-4">
								<div className="grid grid-cols-3 gap-3 text-center">
									<Stat label="Awards" value={String(bench.summary.total_awards)} />
									<Stat label="Total" value={fmtSGD(bench.summary.total_value_sgd)} />
									<Stat
										label="Sector rank"
										value={
											bench.peer_benchmark.supplier_rank_in_sector
												? `#${bench.peer_benchmark.supplier_rank_in_sector}`
												: "—"
										}
									/>
								</div>
								{bench.summary.primary_sector && (
									<p className="text-xs text-[#64748b]">
										Primary sector: <strong>{bench.summary.primary_sector}</strong>{" "}
										· {bench.peer_benchmark.peer_count} peers in window
									</p>
								)}
								<MiniTable
									header={["Top peer", "Awards", "Total"]}
									rows={bench.peer_benchmark.top_peers.slice(0, 5).map((p) => [
										p.supplier_name,
										String(p.awards),
										fmtSGD(p.total_value_sgd),
									])}
								/>
							</div>
						)}
					</Panel>

					{/* ── Forecast ─────────────────────────────────────────────── */}
					<Panel
						icon={BarChart3}
						title="3-month forecast"
						description="Linear projection over the historical monthly series"
					>
						<div className="flex gap-2 mb-4">
							<input
								value={forecastSector}
								onChange={(e) => setForecastSector(e.target.value)}
								placeholder="Sector (optional)"
								className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<button
								onClick={() => loadForecast(forecastSector)}
								disabled={forecastLoading}
								className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 disabled:opacity-50"
							>
								{forecastLoading ? "…" : "Forecast"}
							</button>
						</div>
						{forecast && (
							<div className="space-y-3">
								<p className="text-xs text-[#64748b]">
									Fit quality: R²={forecast.fit_quality.r2_award_count} (count) ·{" "}
									R²={forecast.fit_quality.r2_total_value} (value)
								</p>
								<MiniTable
									header={["Month", "Expected awards", "Expected value"]}
									rows={forecast.forecast.map((f) => [
										f.month,
										String(f.expected_awards),
										fmtSGD(f.expected_total_value_sgd),
									])}
								/>
							</div>
						)}
					</Panel>
				</div>

				{/* ── Awards search ─────────────────────────────────────────────── */}
				<div className="mt-6">
					<Panel
						icon={Search}
						title="Historical award lookup"
						description="Search winners, prices, and dates across the GeBIZ award history"
					>
						<div className="flex flex-wrap gap-2 mb-4">
							<input
								value={awardsAgency}
								onChange={(e) => setAwardsAgency(e.target.value)}
								placeholder="Agency contains…"
								className="flex-1 min-w-[12rem] px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<input
								value={awardsSupplier}
								onChange={(e) => setAwardsSupplier(e.target.value)}
								placeholder="Supplier contains…"
								className="flex-1 min-w-[12rem] px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
							/>
							<button
								onClick={loadAwards}
								disabled={awardsLoading}
								className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-500 disabled:opacity-50"
							>
								{awardsLoading ? "…" : "Search"}
							</button>
						</div>
						{awards && (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-left text-[#737373] border-b border-[#e2e8f0]">
											<th className="py-2 pr-4">Date</th>
											<th className="py-2 pr-4">Agency</th>
											<th className="py-2 pr-4">Supplier</th>
											<th className="py-2 pr-4">Amount</th>
											<th className="py-2">Description</th>
										</tr>
									</thead>
									<tbody>
										{awards.results.map((r, i) => (
											<tr key={i} className="border-b border-[#f1f5f9]">
												<td className="py-2 pr-4 whitespace-nowrap">{r.awarded_date ?? "—"}</td>
												<td className="py-2 pr-4">{r.procuring_entity ?? "—"}</td>
												<td className="py-2 pr-4">{r.supplier_name ?? "—"}</td>
												<td className="py-2 pr-4 whitespace-nowrap">{fmtSGD(r.award_amt_sgd)}</td>
												<td className="py-2 text-[#64748b]">
													{(r.tender_description ?? "").slice(0, 90)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
								<p className="text-xs text-[#64748b] mt-3">
									Showing {awards.results.length} of {awards.total}
								</p>
							</div>
						)}
					</Panel>
				</div>
			</div>
		</div>
	);
}

// ── Small components ──────────────────────────────────────────────────────────

function MiniTable({ header, rows }: { header: string[]; rows: string[][] }) {
	if (!rows.length) return <p className="text-xs text-[#64748b]">No data.</p>;
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left text-[#737373] border-b border-[#e2e8f0]">
						{header.map((h) => (
							<th key={h} className="py-1.5 pr-4 font-semibold text-xs uppercase tracking-wide">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr key={i} className="border-b border-[#f1f5f9]">
							{row.map((c, j) => (
								<td key={j} className="py-1.5 pr-4">
									{c}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-[#f8fafc] rounded-lg p-3">
			<div className="text-xs text-[#64748b] mb-1">{label}</div>
			<div className="text-lg font-bold text-[#0f172a]">{value}</div>
		</div>
	);
}
