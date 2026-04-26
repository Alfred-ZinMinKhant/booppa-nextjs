"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Shield,
	Eye,
	TrendingUp,
	ArrowRight,
	Zap,
	Building,
	CheckCircle2,
	Copy,
	Check,
	LogOut,
	AlertTriangle,
} from "lucide-react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
} from "recharts";
import VendorStatusBadge from "@/components/vendor/VendorStatusBadge";
import SectorPressureWidget from "@/components/vendor/SectorPressureWidget";
import CalDashboard from "@/components/vendor/CalDashboard";
import TenderWinProbabilityWidget from "@/components/vendor/TenderWinProbabilityWidget";
import TrustRing from "@/components/vendor/TrustRing";
import DepthLadder from "@/components/vendor/DepthLadder";
import AlertCard from "@/components/vendor/AlertCard";
import {
	generateAlerts,
	type VendorState,
} from "@/components/vendor/alertEngine";

interface BadgeData {
	active: boolean;
	html: string | null;
	profile_url: string | null;
	slug: string | null;
	compliance_score: number;
	verification_level: string;
}

export default function VendorDashboard() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState({
		stats: null,
		chartData: [],
		recentActivity: [],
	});
	const [loading, setLoading] = useState(true);
	const [badge, setBadge] = useState<BadgeData | null>(null);
	const [copied, setCopied] = useState(false);
	const [vendorState, setVendorState] = useState<VendorState | null>(null);
	const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
		new Set(),
	);

	useEffect(() => {
		setMounted(true);

		// Load dismissed alerts from localStorage
		try {
			const saved = localStorage.getItem("booppa_dismissed_alerts");
			if (saved) setDismissedAlerts(new Set(JSON.parse(saved)));
		} catch {}

		fetch("/api/dashboard")
			.then((res) => res.json())
			.then((fetchedData) => {
				if (!fetchedData.error) setData(fetchedData);
				setLoading(false);
			})
			.catch(() => setLoading(false));

		fetch("/api/vendor/badge")
			.then((res) => (res.ok ? res.json() : null))
			.then((d) => {
				if (d) setBadge(d);
			})
			.catch(() => {});

		fetch("/api/vendor/dashboard-alerts")
			.then((res) => (res.ok ? res.json() : null))
			.then((d) => {
				if (d && !d.error) setVendorState(d);
			})
			.catch(() => {});
	}, []);

	const handleDismissAlert = (id: string) => {
		setDismissedAlerts((prev) => {
			const next = new Set(prev);
			next.add(id);
			localStorage.setItem(
				"booppa_dismissed_alerts",
				JSON.stringify(Array.from(next)),
			);
			return next;
		});
	};

	const nextStepFromLevel = (
		level: string,
	): { href: string; label: string } => {
		switch (level?.toUpperCase()) {
			case "BASIC":
				return { href: "/notarization", label: "Notarize a Document" };
			case "STANDARD":
				return { href: "/pdpa", label: "Run PDPA Scan" };
			case "DEEP":
				return { href: "/rfp-acceleration", label: "Get RFP Complete" };
			default:
				return { href: "/notarization", label: "Notarize a Document" };
		}
	};

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/login");
	};

	const copyBadge = () => {
		if (!badge?.html) return;
		navigator.clipboard.writeText(badge.html).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	if (!mounted || loading) return null;

	const chartInfo = data.chartData;
	const stats = data.stats ?? {
		trustScore: 0,
		trustScoreDelta: null,
		enterpriseViews: 0,
		activeProcurements: 0,
		activeProcurementsSector: null,
		govAgencies: 0,
	};
	const history = data.recentActivity;

	const alerts = vendorState
		? generateAlerts(vendorState).filter((a) => !dismissedAlerts.has(a.id))
		: [];

	return (
		<div className="min-h-screen bg-neutral-950 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header section */}
				<div className="flex justify-between items-end border-b border-neutral-800 pb-6">
					<div>
						<h1 className="text-2xl font-bold text-white tracking-tight">
							Revenue Intelligence
						</h1>
						<p className="text-neutral-400 text-sm mt-1">
							Real-time enterprise procurement signals
						</p>
					</div>
					<div className="flex gap-3">
						<Link
							href="/vendor/referrals"
							className="px-4 py-2 bg-neutral-900 text-white rounded-md border border-neutral-800 text-sm font-medium hover:bg-neutral-800 transition"
						>
							Referrals
						</Link>
						<button className="px-4 py-2 bg-neutral-900 text-white rounded-md border border-neutral-800 text-sm font-medium hover:bg-neutral-800 transition">
							Share Proof
						</button>
						<button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
							Upgrade to Intel Pro
						</button>
						<button
							onClick={handleLogout}
							className="px-3 py-2 bg-neutral-900 text-neutral-400 rounded-md border border-neutral-800 text-sm font-medium hover:text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
							title="Sign out"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ── Trust Status Header ─────────────────────────────────── */}
				{vendorState && (
					<div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 flex items-center gap-6">
						<TrustRing score={vendorState.trustScore} />
						<div className="flex-1 min-w-0">
							<h2 className="text-lg font-bold text-white truncate">
								{vendorState.name}
							</h2>
							<div className="flex items-center gap-3 mt-1 flex-wrap">
								{vendorState.uen && (
									<span className="text-xs text-slate-500">
										UEN {vendorState.uen}
									</span>
								)}
								<span className="text-xs text-slate-500">
									{vendorState.sector}
								</span>
								{(() => {
									const subs: string[] = vendorState.activeSubscriptions || [];
									const p = vendorState.plan || "";
									const badges: { label: string; cls: string }[] = [];
									if (subs.includes("vendor_active")) badges.push({ label: "Vendor Active", cls: "text-emerald-400 bg-emerald-500/10" });
									if (subs.includes("pdpa_monitor")) badges.push({ label: "PDPA Monitor", cls: "text-blue-400 bg-blue-500/10" });
									if (subs.includes("enterprise_pro")) badges.push({ label: "Enterprise Pro", cls: "text-violet-400 bg-violet-500/10" });
									else if (subs.includes("enterprise")) badges.push({ label: "Enterprise", cls: "text-violet-400 bg-violet-500/10" });
									if (badges.length === 0) badges.push({ label: (p || "free").replace("free", "Free") + " plan", cls: "text-slate-400 bg-slate-800" });
									return badges.map(b => (
										<span key={b.label} className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${b.cls}`}>
											{b.label}
										</span>
									));
								})()}
							</div>
							<div className="mt-2">
								<DepthLadder current={vendorState.verificationDepth} />
							</div>
						</div>
						<div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
							<span className="text-xs text-slate-500">Sector Percentile</span>
							<span className="text-2xl font-bold text-white">
								{vendorState.sectorPercentile}
								<span className="text-sm text-slate-500">th</span>
							</span>
						</div>
					</div>
				)}

				{/* ── Contextual Alerts ───────────────────────────────────── */}
				{alerts.length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-semibold text-neutral-400">
								Action Required ({alerts.length})
							</h2>
							{dismissedAlerts.size > 0 && (
								<button
									onClick={() => {
										setDismissedAlerts(new Set());
										localStorage.removeItem("booppa_dismissed_alerts");
									}}
									className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
								>
									Show dismissed
								</button>
							)}
						</div>
						<div className="space-y-3">
							{alerts.map((alert) => (
								<AlertCard
									key={alert.id}
									alert={alert}
									onDismiss={handleDismissAlert}
								/>
							))}
						</div>
					</div>
				)}

				{/* Top KPIs */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
						<div className="p-6">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-neutral-400 text-sm font-medium">
										Global Trust Score
									</p>
									<h3 className="text-3xl font-bold text-white mt-2">
										{stats.trustScore}
										<span className="text-sm text-neutral-500 font-normal">
											/100
										</span>
									</h3>
								</div>
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<Shield className="h-5 w-5 text-blue-500" />
								</div>
							</div>
							<div className="mt-4 flex items-center text-xs">
								{stats.trustScoreDelta != null &&
								stats.trustScoreDelta !== 0 ? (
									<span className="text-emerald-400 flex items-center gap-1">
										<TrendingUp className="h-3 w-3" />+{stats.trustScoreDelta}{" "}
										pts from last assessment
									</span>
								) : (
									<span className="text-neutral-500">
										Add more evidence to improve
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-[0_0_20px_rgba(16,185,129,0.05)]">
						<div className="p-6">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-neutral-400 text-sm font-medium">
										Enterprise Views (7d)
									</p>
									<h3 className="text-3xl font-bold text-white mt-2">
										{stats.enterpriseViews}
									</h3>
								</div>
								<div className="p-2 bg-emerald-500/10 rounded-lg">
									<Eye className="h-5 w-5 text-emerald-500" />
								</div>
							</div>
							<div className="mt-4 text-xs">
								{stats.enterpriseViews > 0 ? (
									<span className="text-emerald-400 flex items-center gap-1">
										<TrendingUp className="h-3 w-3" />
										Unique domains viewed your profile
									</span>
								) : (
									<span className="text-neutral-500">
										No profile views yet this week
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
						<div className="p-6">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-neutral-400 text-sm font-medium">
										Open Tenders
									</p>
									<h3 className="text-3xl font-bold text-white mt-2">
										{stats.activeProcurements}
									</h3>
								</div>
								<div className="p-2 bg-amber-500/10 rounded-lg">
									<Zap className="h-5 w-5 text-amber-500" />
								</div>
							</div>
							<div className="mt-4 text-xs">
								{stats.activeProcurements > 0 ? (
									<span className="text-amber-400">
										Open GeBIZ tenders in{" "}
										{stats.activeProcurementsSector || "your sector"}
									</span>
								) : (
									<span className="text-neutral-500">
										No open tenders matched to your sector
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
						<div className="p-6">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-neutral-400 text-sm font-medium">
										Gov Agencies
									</p>
									<h3 className="text-3xl font-bold text-white mt-2">
										{stats.govAgencies}
									</h3>
								</div>
								<div className="p-2 bg-purple-500/10 rounded-lg">
									<Building className="h-5 w-5 text-purple-500" />
								</div>
							</div>
							<div className="mt-4 text-xs">
								{stats.govAgencies > 0 ? (
									<span className="text-purple-400">
										Unique .gov.sg domains viewed your profile
									</span>
								) : (
									<span className="text-neutral-500">
										No gov agency views yet
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* ── Vendor Active Subscription Panel ───────────────────────── */}
				{vendorState?.activeSubscriptions?.includes("vendor_active") && (
					<div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5">
						<div className="flex items-center gap-3 mb-4 flex-wrap">
							<div className="flex items-center gap-2">
								<Zap className="h-4 w-4 text-emerald-400" />
								<span className="text-sm font-bold text-white">
									Vendor Active
								</span>
								<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
									Subscription Active
								</span>
							</div>
							<span className="ml-auto text-xs text-neutral-500">
								Health check runs on the 1st of each month
							</span>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{/* Health check */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Profile health check
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Auto re-scores monthly
									</div>
									<div className="text-emerald-400 text-[11px] font-semibold mt-1">
										Current score: {vendorState.trustScore}/100
									</div>
								</div>
							</div>
							{/* Competitor alert */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								{vendorState.competitorElevated ? (
									<AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
								) : (
									<CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
								)}
								<div>
									<div className="text-white font-medium text-xs">
										Competitor alert
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Sector peer activity
									</div>
									<div
										className={`text-[11px] font-semibold mt-1 ${vendorState.competitorElevated ? "text-amber-400" : "text-neutral-400"}`}
									>
										{vendorState.elevatedPeers > 0
											? `${vendorState.elevatedPeers} peers elevated`
											: "No changes this cycle"}
									</div>
								</div>
							</div>
							{/* Shortlist priority */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Shortlist priority
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Strategy 1 &amp; 6
									</div>
									<div className="text-emerald-400 text-[11px] font-semibold mt-1">
										Ahead of STANDARD vendors
									</div>
								</div>
							</div>
							{/* Monthly metrics */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Monthly metrics
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Sector rank &amp; views
									</div>
									<div className="text-emerald-400 text-[11px] font-semibold mt-1">
										{vendorState.sectorPercentile}th percentile ·{" "}
										{vendorState.enterpriseViews7d} views
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* List raw subscription records if available (from dashboard-alerts) */}
				{vendorState?.subscriptions && vendorState.subscriptions.length > 0 && (
					<div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
						<h3 className="text-sm text-neutral-300 font-semibold mb-3">
							Active Subscriptions
						</h3>
						<div className="space-y-2">
							{vendorState.subscriptions.map((s: any, idx: number) => (
								<div
									key={idx}
									className="flex items-center justify-between bg-neutral-800/20 p-3 rounded"
								>
									<div>
										<div className="text-sm font-medium text-white">
											{s.tier || s.plan || s.price_id || "Subscription"}
										</div>
										{s.status && (
											<div className="text-xs text-neutral-400">
												Status: {s.status}
											</div>
										)}
										{s.current_period_end && (
											<div className="text-xs text-neutral-400">
												Renews:{" "}
												{new Date(s.current_period_end).toLocaleDateString()}
											</div>
										)}
									</div>
									<div className="text-xs text-neutral-400">{s.id || ""}</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ── PDPA Monitor Subscription Panel ────────────────────────── */}
				{vendorState?.activeSubscriptions?.includes("pdpa_monitor") && (
					<div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-5">
						<div className="flex items-center gap-3 mb-4 flex-wrap">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-blue-400" />
								<span className="text-sm font-bold text-white">
									PDPA Monitor
								</span>
								<span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
									Subscription Active
								</span>
							</div>
							<span className="ml-auto text-xs text-neutral-500">
								Quarterly re-scans on 1 Jan, Apr, Jul, Oct
							</span>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{/* Quarterly re-scan */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Quarterly re-scan
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Auto PDPA scan · SGD 79 value
									</div>
									<div className="text-blue-400 text-[11px] font-semibold mt-1">
										{vendorState.pdpaLastScan
											? `Last: ${new Date(vendorState.pdpaLastScan).toLocaleDateString("en-SG", { month: "short", year: "numeric" })}`
											: "Runs next quarter"}
									</div>
								</div>
							</div>
							{/* Monthly regulatory alert */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Regulatory alerts
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Monthly PDPC updates
									</div>
									<div className="text-blue-400 text-[11px] font-semibold mt-1">
										Delivered by email
									</div>
								</div>
							</div>
							{/* Score trending */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<TrendingUp className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										Score trending
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Compliance over time
									</div>
									<div className="text-blue-400 text-[11px] font-semibold mt-1">
										Current: {vendorState.trustScore}/100
									</div>
								</div>
							</div>
							{/* PDF download */}
							<div className="flex items-start gap-2.5 bg-neutral-900/50 rounded-lg p-3">
								<CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-white font-medium text-xs">
										PDF report
									</div>
									<div className="text-neutral-500 text-[11px] mt-0.5">
										Always current
									</div>
									<div className="text-blue-400 text-[11px] font-semibold mt-1">
										{vendorState.pdpaReportUrl ? (
											<a
												href={vendorState.pdpaReportUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="underline hover:text-blue-300"
											>
												Download PDF &darr;
											</a>
										) : vendorState.pdpaLastScan ? (
											<Link href="/compliance/locker" className="underline hover:text-blue-300">
												View in Compliance Locker
											</Link>
										) : (
											"Available after first scan"
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ── Vendor Proof Activation Panel ─────────────────────────── */}
				{badge?.active && (
					<div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-neutral-900 overflow-hidden">
						<div className="flex flex-col sm:flex-row sm:items-center gap-0">
							{/* Status block */}
							<div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-0">
								<div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
									<CheckCircle2 className="h-4 w-4 text-emerald-400" />
								</div>
								<div className="min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-white font-semibold text-sm">
											Vendor Proof Active
										</span>
										<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
											Verified
										</span>
									</div>
									<div className="flex items-center gap-3 mt-0.5 flex-wrap">
										<span className="text-neutral-400 text-xs">
											Score{" "}
											<span className="text-white font-medium">
												{badge.compliance_score}/100
											</span>
										</span>
										<span className="text-neutral-600 text-xs">·</span>
										<span className="text-neutral-400 text-xs capitalize">
											{badge.verification_level?.toLowerCase()} level
										</span>
										<span className="text-neutral-600 text-xs">·</span>
										<span className="text-emerald-400 text-xs font-medium">
											Visible in verified searches
										</span>
									</div>
								</div>
							</div>

							{/* Divider */}
							<div className="hidden sm:block w-px self-stretch bg-emerald-500/10" />

							{/* Badge embed */}
							<div className="px-5 py-4 flex items-center gap-3 flex-shrink-0">
								<div className="font-mono text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 max-w-[180px] truncate hidden md:block">
									{badge.html?.slice(0, 60)}…
								</div>
								<button
									type="button"
									onClick={copyBadge}
									className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
								>
									{copied ? (
										<Check className="h-3.5 w-3.5 text-emerald-400" />
									) : (
										<Copy className="h-3.5 w-3.5" />
									)}
									{copied ? "Copied!" : "Copy badge"}
								</button>
								{badge.profile_url && (
									<Link
										href={badge.profile_url}
										target="_blank"
										className="text-xs text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
									>
										Public profile →
									</Link>
								)}
							</div>

							{/* Divider */}
							<div className="hidden sm:block w-px self-stretch bg-emerald-500/10" />

							{/* Next step CTA */}
							<div className="px-5 py-4 flex-shrink-0">
								{(() => {
									const next = nextStepFromLevel(badge.verification_level);
									return (
										<Link
											href={next.href}
											className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors whitespace-nowrap"
										>
											{next.label} <ArrowRight className="h-3.5 w-3.5" />
										</Link>
									);
								})()}
							</div>
						</div>
					</div>
				)}

				{/* ── Vendor Proof CTA (unverified) ──────────────────────────── */}
				{badge && !badge.active && (
					<div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
						<div className="flex-1">
							<p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">
								Not yet verified
							</p>
							<h3 className="text-white font-semibold">
								Get Vendor Proof to appear in buyer searches
							</h3>
							<p className="text-neutral-400 text-sm mt-1">
								Procurement officers filter by verified vendors. Without it, you
								are invisible to any buyer who uses that filter.
							</p>
						</div>
						<Link
							href="/vendor-proof"
							className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
						>
							Get Verified — S$149
						</Link>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Chart */}
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm lg:col-span-2">
						<div className="flex flex-col space-y-1.5 p-6">
							<h3 className="text-base font-medium text-neutral-200">
								Attention Trajectory
							</h3>
						</div>
						<div className="p-6 pt-0">
							<div className="h-72 w-full mt-4">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartInfo}>
										<defs>
											<linearGradient
												id="colorViews"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="#10b981"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="#10b981"
													stopOpacity={0}
												/>
											</linearGradient>
											<linearGradient
												id="colorTriggers"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="#f59e0b"
													stopOpacity={0.3}
												/>
												<stop
													offset="95%"
													stopColor="#f59e0b"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="#262626"
											vertical={false}
										/>
										<XAxis
											dataKey="name"
											stroke="#525252"
											tick={{ fill: "#a3a3a3", fontSize: 12 }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											stroke="#525252"
											tick={{ fill: "#a3a3a3", fontSize: 12 }}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: "#171717",
												borderColor: "#262626",
												color: "#fff",
											}}
											itemStyle={{ color: "#fff" }}
										/>
										<Area
											type="monotone"
											dataKey="views"
											stroke="#10b981"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorViews)"
										/>
										<Area
											type="monotone"
											dataKey="triggers"
											stroke="#f59e0b"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorTriggers)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					{/* Activity Feed */}
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 text-card-foreground shadow-sm">
						<div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-800 pb-2">
							<div className="flex flex-row items-center justify-between">
								<h3 className="text-base font-medium text-neutral-200">
									Live Signals
								</h3>
								<div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
							</div>
						</div>
						<div className="p-6 pt-4 px-0">
							<div className="space-y-0">
								{history.map((item: any, i: number) => (
									<div
										key={i}
										className="px-6 py-3 hover:bg-neutral-800/50 transition border-l-2 border-transparent hover:border-neutral-500 cursor-pointer"
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="text-sm font-medium text-neutral-200">
													{item.domain || item.description}
												</p>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${item.bg || "bg-blue-400/10"} ${item.color || "text-blue-400"}`}
												>
													{item.type}
												</span>
											</div>
											<span className="text-xs text-neutral-500">
												{item.time ||
													new Date(item.timestamp).toLocaleTimeString()}
											</span>
										</div>
									</div>
								))}
							</div>
							<div className="px-6 mt-4">
								<button className="w-full py-2 text-sm text-neutral-400 hover:text-white transition flex items-center justify-center">
									View full logs <ArrowRight className="ml-1 h-3 w-3" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* ── V8 Trust & Activation Layer ─────────────────────────── */}
				<div
					id="activation-ladder"
					className="pt-2 border-t border-neutral-800 scroll-mt-6"
				>
					<h2 className="text-sm font-semibold text-neutral-400 mb-4">
						Trust & Activation
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
						<VendorStatusBadge />
						<SectorPressureWidget />
						<CalDashboard />
						<TenderWinProbabilityWidget />
					</div>
				</div>
			</div>
		</div>
	);
}
