"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Bell, ShieldCheck, EyeOff, Eye } from "lucide-react";

interface VendorProMe {
	plan: string;
	notarization: { used: number; limit: number; month: string };
	pdpa: { last_scan_at: string | null; next_scan_at: string };
	lookup_opt_out: boolean;
}

interface CompetitorSignal {
	tender_no?: string;
	lookups_last_hour?: number;
	verified_lookups_last_hour?: number;
	sector?: string | null;
	agency?: string | null;
	ts?: string;
}

export default function VendorProPanel() {
	const [me, setMe] = useState<VendorProMe | null>(null);
	const [paywalled, setPaywalled] = useState<boolean>(false);
	const [signals, setSignals] = useState<CompetitorSignal[]>([]);
	const [optBusy, setOptBusy] = useState(false);
	const esRef = useRef<EventSource | null>(null);

	useEffect(() => {
		(async () => {
			const res = await fetch("/api/vendor-pro/me");
			if (res.status === 403) {
				setPaywalled(true);
				return;
			}
			if (res.ok) setMe(await res.json());
		})();

		// Subscribe to the SSE stream for live competitor signals.
		try {
			const es = new EventSource("/api/v1/sse/events");
			es.addEventListener("competitor_signal", (e: MessageEvent) => {
				try {
					const data = JSON.parse(e.data);
					setSignals((cur) =>
						[{ ...data, ts: new Date().toISOString() }, ...cur].slice(0, 10)
					);
				} catch {
					/* ignore malformed */
				}
			});
			es.onerror = () => {
				// Stream dropped; let it auto-reconnect.
			};
			esRef.current = es;
		} catch {
			/* SSE not supported */
		}
		return () => {
			esRef.current?.close();
		};
	}, []);

	async function toggleOptOut(next: boolean) {
		setOptBusy(true);
		try {
			const res = await fetch("/api/vendor-pro/lookup-opt-out", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ opt_out: next }),
			});
			if (res.ok) {
				const body = await res.json();
				setMe((m) => (m ? { ...m, lookup_opt_out: body.opt_out } : m));
			}
		} finally {
			setOptBusy(false);
		}
	}

	if (paywalled) {
		return (
			<div className="bg-neutral-900 border border-violet-700/40 rounded-2xl p-6">
				<div className="flex items-start gap-3">
					<Sparkles className="w-5 h-5 text-violet-400" />
					<div className="flex-1">
						<h3 className="text-sm font-semibold text-white">Upgrade to Vendor Pro</h3>
						<p className="text-xs text-neutral-400 mt-1 mb-3">
							SGD 99/mo — quarterly PDPA, 1 notarization/mo, tender analytics, and competitor signals.
						</p>
						<Link
							href="/pricing#vendor-pro"
							className="inline-flex text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
						>
							See plan →
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!me) {
		return (
			<div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
				<p className="text-xs text-neutral-500">Loading Vendor Pro panel…</p>
			</div>
		);
	}

	return (
		<div className="bg-neutral-900 border border-violet-700/40 rounded-2xl p-6 space-y-5">
			<header className="flex items-center gap-2">
				<Sparkles className="w-4 h-4 text-violet-400" />
				<h3 className="text-sm font-semibold text-white">Vendor Pro</h3>
			</header>

			{/* Flagship deliverable — consolidated monthly intelligence report */}
			<a
				href="/api/vendor-pro/monthly-report.pdf"
				className="flex items-center justify-between gap-2 rounded-xl border border-violet-700/40 bg-violet-500/10 px-4 py-3 hover:bg-violet-500/20 transition"
			>
				<div>
					<div className="text-sm font-semibold text-white">Monthly Intelligence Report</div>
					<div className="text-[11px] text-neutral-400">Scores, win-probability pipeline, competitor & PDPA drift — one PDF</div>
				</div>
				<span className="text-xs font-bold text-violet-300 whitespace-nowrap">Download ↓</span>
			</a>

			{/* Quota + PDPA */}
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-neutral-950 rounded-xl p-3">
					<div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
						<ShieldCheck className="w-3 h-3" />
						Notarization
					</div>
					<div className="text-lg font-bold text-white">
						{me.notarization.used}<span className="text-sm text-neutral-500">/{me.notarization.limit}</span>
					</div>
					<div className="text-[10px] text-neutral-500">{me.notarization.month}</div>
				</div>
				<div className="bg-neutral-950 rounded-xl p-3">
					<div className="text-xs text-neutral-500 mb-1">Next PDPA scan</div>
					<div className="text-sm font-semibold text-white">
						{new Date(me.pdpa.next_scan_at).toLocaleDateString()}
					</div>
					<div className="text-[10px] text-neutral-500">
						{me.pdpa.last_scan_at
							? `last ${new Date(me.pdpa.last_scan_at).toLocaleDateString()}`
							: "no prior scan"}
					</div>
				</div>
			</div>

			{/* Live competitor signals */}
			<div>
				<div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
					<Bell className="w-3 h-3" />
					Live competitor signals
				</div>
				{signals.length === 0 ? (
					<p className="text-xs text-neutral-600 italic">No activity in the last hour.</p>
				) : (
					<ul className="space-y-1.5 text-xs">
						{signals.map((s, i) => (
							<li key={i} className="bg-neutral-950 rounded-lg px-3 py-2 flex items-center justify-between">
								<span className="text-neutral-300 font-medium">{s.tender_no ?? "—"}</span>
								<span className="text-violet-400">
									{s.lookups_last_hour ?? 0} lookups
									{(s.verified_lookups_last_hour ?? 0) > 0 && (
										<span className="text-amber-400 ml-2">{s.verified_lookups_last_hour} verified</span>
									)}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Opt-out toggle */}
			<div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					{me.lookup_opt_out ? (
						<EyeOff className="w-3.5 h-3.5 text-neutral-500" />
					) : (
						<Eye className="w-3.5 h-3.5 text-violet-400" />
					)}
					<div>
						<div className="text-xs font-semibold text-white">Lookup logging</div>
						<div className="text-[10px] text-neutral-500">
							{me.lookup_opt_out
								? "You're excluded from competitor counts."
								: "Your lookups feed anonymised counts other Vendor Pro users see."}
						</div>
					</div>
				</div>
				<button
					disabled={optBusy}
					onClick={() => toggleOptOut(!me.lookup_opt_out)}
					className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium disabled:opacity-50"
				>
					{me.lookup_opt_out ? "Re-enable" : "Opt out"}
				</button>
			</div>
		</div>
	);
}
