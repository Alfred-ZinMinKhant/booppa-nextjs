"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Shield, RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
	CheckCircle2, Clock, ArrowRight, FileText, Activity,
} from "lucide-react";

// ── Types (mirror /api/v1/pdpa/dashboard) ───────────────────────────────────
type TrendPoint = { label: string; score: number; reportId: string; completedAt: string };
type OpenFinding = {
	findingKey: string; label: string; severity: string; daysOpen: number;
	firstSeen: string | null; urgent: boolean; reportId: string;
	remediationStatus: string | null; remediationConfirmation: string | null;
};
type DriftEvent = {
	framework: string; severity: string; previousScore: number | null;
	currentScore: number | null; delta: number | null; deltaPct: number | null;
	occurredAt: string | null;
};
type ScanRow = { reportId: string; date: string | null; score: number | null; delta: number | null; pdfUrl: string | null };
type Dashboard = {
	latestScore: number | null; scoreDelta: number | null; lastScannedAt: string | null;
	scannedUrl: string | null; trend: TrendPoint[]; openFindings: OpenFinding[];
	driftEvents: DriftEvent[]; scanHistory: ScanRow[];
};

const fmtDate = (iso: string | null) =>
	iso ? new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const scoreColor = (s: number | null) =>
	s == null ? "text-neutral-400" : s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";

// ── Trend chart (dependency-free inline SVG line) ────────────────────────────
function TrendChart({ points }: { points: TrendPoint[] }) {
	if (points.length < 2) {
		return <p className="text-sm text-neutral-500">Your compliance trend appears after your second scan.</p>;
	}
	const w = 520, h = 120, pad = 24;
	const xs = points.map((_, i) => pad + (i * (w - 2 * pad)) / (points.length - 1));
	const ys = points.map((p) => h - pad - ((p.score) / 100) * (h - 2 * pad));
	const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
	return (
		<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
			<line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#262626" strokeWidth="1" />
			<path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
			{xs.map((x, i) => (
				<g key={points[i].reportId}>
					<circle cx={x} cy={ys[i]} r="3" fill="#10b981" />
					<text x={x} y={ys[i] - 8} textAnchor="middle" className="fill-neutral-300" fontSize="9">{points[i].score}</text>
					<text x={x} y={h - pad + 14} textAnchor="middle" className="fill-neutral-500" fontSize="9">{points[i].label}</text>
				</g>
			))}
		</svg>
	);
}

function SeverityBadge({ severity, urgent, daysOpen }: { severity: string; urgent: boolean; daysOpen: number }) {
	const color = severity === "HIGH" ? "text-red-400 bg-red-500/10" : severity === "MEDIUM" ? "text-amber-400 bg-amber-500/10" : "text-neutral-300 bg-neutral-500/10";
	return (
		<div className="flex items-center gap-2">
			<span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${color}`}>{severity}</span>
			<span className={`inline-flex items-center gap-1 text-[11px] ${urgent ? "text-red-400 font-semibold" : "text-neutral-500"}`}>
				<Clock className="h-3 w-3" />{daysOpen}d open{urgent ? " · overdue" : ""}
			</span>
		</div>
	);
}

export default function PdpaMonitorPage() {
	const [data, setData] = useState<Dashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [locked, setLocked] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rescanning, setRescanning] = useState(false);
	const [rescanMsg, setRescanMsg] = useState<string | null>(null);
	const [fixing, setFixing] = useState<Record<string, boolean>>({});

	const load = () => {
		fetch("/api/pdpa/dashboard")
			.then(async (r) => {
				if (r.status === 403) { setLocked(true); setLoading(false); return; }
				const b = await r.json().catch(() => null);
				if (!r.ok) { setError(b?.detail || "Failed to load your PDPA dashboard."); setLoading(false); return; }
				setData(b); setLoading(false);
			})
			.catch(() => { setError("Failed to load your PDPA dashboard."); setLoading(false); });
	};
	useEffect(load, []);

	const handleRescan = async () => {
		setRescanning(true); setRescanMsg(null);
		try {
			const r = await fetch("/api/pdpa/rescan", { method: "POST" });
			const b = await r.json().catch(() => ({}));
			setRescanMsg(r.ok
				? "Re-scan started — your new results will appear here in a few minutes."
				: (b?.detail || "Could not start a re-scan right now."));
		} catch {
			setRescanMsg("Could not start a re-scan right now.");
		} finally {
			setRescanning(false);
		}
	};

	const markFixed = async (f: OpenFinding) => {
		setFixing((p) => ({ ...p, [f.findingKey]: true }));
		try {
			const r = await fetch(`/api/remediations/reports/${f.reportId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ finding_key: f.findingKey, status: "fixed" }),
			});
			if (r.ok && data) {
				setData({
					...data,
					openFindings: data.openFindings.map((x) =>
						x.findingKey === f.findingKey
							? { ...x, remediationStatus: "fixed", remediationConfirmation: "pending" }
							: x),
				});
			}
		} finally {
			setFixing((p) => ({ ...p, [f.findingKey]: false }));
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-neutral-950 p-6">
				<div className="max-w-5xl mx-auto space-y-6 animate-pulse">
					<div className="h-28 bg-neutral-900 rounded-xl border border-neutral-800" />
					<div className="h-48 bg-neutral-900 rounded-xl border border-neutral-800" />
					<div className="h-64 bg-neutral-900 rounded-xl border border-neutral-800" />
				</div>
			</div>
		);
	}

	if (locked) {
		return (
			<div className="min-h-screen bg-neutral-950 p-6 flex items-center justify-center">
				<div className="max-w-md text-center rounded-2xl bg-neutral-900 border border-neutral-800 p-8">
					<Shield className="h-10 w-10 text-emerald-500 mx-auto" />
					<h1 className="mt-4 text-xl font-bold text-white">PDPA Monitor</h1>
					<p className="mt-2 text-sm text-neutral-400">
						Track your compliance score over time, see open findings as they age, and get re-scans on demand.
						This dashboard is included with a PDPA Monitor or Vendor Pro subscription.
					</p>
					<Link href="/pdpa" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
						Get PDPA Monitor <ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		);
	}

	const d = data!;
	const hasScans = (d.scanHistory?.length ?? 0) > 0;

	return (
		<div className="min-h-screen bg-neutral-950 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-white flex items-center gap-2">
							<Shield className="h-6 w-6 text-emerald-500" /> PDPA Monitor
						</h1>
						<p className="text-sm text-neutral-400 mt-1">
							{d.scannedUrl ? <>Monitoring <span className="text-neutral-300">{d.scannedUrl}</span> · </> : null}
							Last scan {fmtDate(d.lastScannedAt)}
						</p>
					</div>
					<button
						onClick={handleRescan}
						disabled={rescanning}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
					>
						<RefreshCw className={`h-4 w-4 ${rescanning ? "animate-spin" : ""}`} /> Re-scan now
					</button>
				</div>
				{rescanMsg && <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300">{rescanMsg}</div>}
				{error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">{error}</div>}

				{!hasScans ? (
					<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-8 text-center">
						<Activity className="h-8 w-8 text-emerald-500 mx-auto" />
						<p className="mt-3 text-neutral-300 font-medium">No PDPA scans yet</p>
						<p className="mt-1 text-sm text-neutral-500">Run your first scan to start tracking compliance over time.</p>
						<Link href="/pdpa" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
							Run a PDPA scan <ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					<>
						{/* Score + trend */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
							<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
								<p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Compliance Score</p>
								<div className="mt-2 flex items-baseline gap-2">
									<span className={`text-4xl font-bold ${scoreColor(d.latestScore)}`}>{d.latestScore ?? "—"}</span>
									<span className="text-sm text-neutral-500">/100</span>
								</div>
								{d.scoreDelta != null && d.scoreDelta !== 0 && (
									<p className={`mt-2 text-xs inline-flex items-center gap-1 ${d.scoreDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
										{d.scoreDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
										{d.scoreDelta > 0 ? "+" : ""}{d.scoreDelta} since last scan
									</p>
								)}
							</div>
							<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 lg:col-span-2">
								<p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">Compliance Trend</p>
								<TrendChart points={d.trend || []} />
							</div>
						</div>

						{/* Open findings */}
						<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
							<div className="flex items-center justify-between">
								<h2 className="text-white font-semibold flex items-center gap-2">
									<AlertTriangle className="h-4 w-4 text-amber-500" /> Open Findings
									<span className="text-xs text-neutral-500 font-normal">({d.openFindings?.length ?? 0})</span>
								</h2>
							</div>
							{(!d.openFindings || d.openFindings.length === 0) ? (
								<p className="mt-3 text-sm text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No open findings in your latest scan.</p>
							) : (
								<div className="mt-4 divide-y divide-neutral-800">
									{d.openFindings.map((f) => {
										const marked = f.remediationStatus === "fixed";
										return (
											<div key={f.findingKey} className="py-3 flex flex-wrap items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="text-sm text-neutral-200">{f.label}</p>
													<div className="mt-1"><SeverityBadge severity={f.severity} urgent={f.urgent} daysOpen={f.daysOpen} /></div>
												</div>
												{marked ? (
													<span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
														<CheckCircle2 className="h-4 w-4" />
														{f.remediationConfirmation === "regressed" ? "Marked fixed — still detected" : "Marked fixed — confirms on next scan"}
													</span>
												) : (
													<button
														onClick={() => markFixed(f)}
														disabled={!!fixing[f.findingKey]}
														className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors disabled:opacity-60"
													>
														{fixing[f.findingKey] ? "Saving…" : "I fixed this"}
													</button>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Drift timeline */}
						{d.driftEvents && d.driftEvents.length > 0 && (
							<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
								<h2 className="text-white font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-blue-400" /> Drift Events</h2>
								<div className="mt-3 space-y-2">
									{d.driftEvents.map((e, i) => (
										<div key={i} className="flex items-center justify-between text-sm">
											<span className="text-neutral-300">
												Score moved {e.previousScore ?? "—"} → <span className={scoreColor(e.currentScore)}>{e.currentScore ?? "—"}</span>
												{e.severity && e.severity !== "INFO" ? <span className="ml-2 text-amber-400 text-xs">({e.severity})</span> : null}
											</span>
											<span className="text-neutral-500 text-xs">{fmtDate(e.occurredAt)}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Scan history */}
						<div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
							<h2 className="text-white font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-neutral-400" /> Scan History</h2>
							<div className="mt-3 divide-y divide-neutral-800">
								{d.scanHistory.map((s) => (
									<div key={s.reportId} className="py-2.5 flex items-center justify-between gap-3 text-sm">
										<span className="text-neutral-400">{fmtDate(s.date)}</span>
										<div className="flex items-center gap-4">
											<span className={`font-semibold ${scoreColor(s.score)}`}>{s.score ?? "—"}</span>
											{s.delta != null && s.delta !== 0 && (
												<span className={`text-xs ${s.delta > 0 ? "text-emerald-400" : "text-red-400"}`}>{s.delta > 0 ? "+" : ""}{s.delta}</span>
											)}
											{s.pdfUrl ? (
												<a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">View PDF</a>
											) : (
												<span className="text-neutral-600 text-xs">—</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
