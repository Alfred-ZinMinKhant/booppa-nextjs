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
	CheckCircle2,
	Copy,
	Check,
	LogOut,
	Share2,
	FileText,
	Layers,
	Key,
	Webhook,
	LockKeyhole,
	Building2,
	ListChecks,
	Award,
	UserPlus,
	UserCircle2,
	Archive,
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
import VendorProPanel from "@/components/vendor/VendorProPanel";
import RemediationSummaryCard from "@/components/vendor/RemediationSummaryCard";
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

// Order matches the strip rendered in Zone 5 — drives the "next step" CTA hint
// when none of these are active. Backend keys come from /api/vendor/status.
const SUB_TIERS: { key: string; label: string; href: string; color: string }[] = [
	{ key: "vendor_active", label: "Vendor Active", href: "/pricing", color: "emerald" },
	{ key: "pdpa_monitor", label: "PDPA Monitor", href: "/pdpa", color: "blue" },
	{ key: "intel_pro", label: "Intel Pro", href: "/pricing#intel-pro", color: "violet" },
];

// The sibling pages exist but most are unreachable from the dashboard today.
// Surfacing them in one strip is cheaper than re-thinking the global nav.
const SIBLING_LINKS: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
	{ href: "/vendor/profile",       label: "Profile",            Icon: UserCircle2 },
	{ href: "/vendor/subscription",  label: "Subscription",       Icon: Layers },
	{ href: "/vendor/evidence",      label: "Evidence",           Icon: Archive },
	{ href: "/compliance/locker",    label: "Compliance Locker",  Icon: LockKeyhole },
	{ href: "/vendor/remediations",  label: "Remediations",       Icon: ListChecks },
	{ href: "/vendor/achievements",  label: "Achievements",       Icon: Award },
	{ href: "/vendor/api-keys",      label: "API Keys",           Icon: Key },
	{ href: "/vendor/webhooks",      label: "Webhooks",           Icon: Webhook },
	{ href: "/vendor/sso",           label: "SSO",                Icon: Shield },
	{ href: "/vendor/subsidiaries",  label: "Subsidiaries",       Icon: Building2 },
	{ href: "/vendor/trm",           label: "MAS TRM",            Icon: FileText },
	{ href: "/vendor/referrals",     label: "Referrals",          Icon: UserPlus },
];

function nextStepFromLevel(level: string | undefined): { href: string; label: string } {
	switch ((level || "").toUpperCase()) {
		case "BASIC":     return { href: "/notarization", label: "Notarize a Document" };
		case "STANDARD":  return { href: "/pdpa",         label: "Run PDPA Scan" };
		case "DEEP":      return { href: "/pricing",      label: "Get RFP Complete" };
		default:          return { href: "/notarization", label: "Notarize a Document" };
	}
}

export default function VendorDashboard() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<{
		stats: any;
		chartData: any[];
		recentActivity: any[];
	}>({ stats: null, chartData: [], recentActivity: [] });
	const [loading, setLoading] = useState(true);
	const [badge, setBadge] = useState<BadgeData | null>(null);
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);
	const [vendorState, setVendorState] = useState<VendorState | null>(null);
	const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

	useEffect(() => {
		setMounted(true);
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
			.then((d) => { if (d) setBadge(d); })
			.catch(() => {});

		fetch(`/api/vendor/dashboard-alerts?t=${Date.now()}`)
			.then((res) => (res.ok ? res.json() : null))
			.then((d) => { if (d && !d.error) setVendorState(d); })
			.catch(() => {});
	}, []);

	const handleDismissAlert = (id: string) => {
		setDismissedAlerts((prev) => {
			const next = new Set(prev);
			next.add(id);
			localStorage.setItem("booppa_dismissed_alerts", JSON.stringify(Array.from(next)));
			return next;
		});
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

	// Share Proof — native Web Share API when available, copy-link fallback so
	// desktop browsers without share intents still get a usable outcome.
	const handleShareProof = async () => {
		if (!badge?.active || !badge.profile_url) return;
		const shareData = {
			title: `${vendorState?.name || "Booppa Verified Vendor"} — verified on Booppa`,
			text: `Verified profile · Trust ${badge.compliance_score}/100`,
			url: badge.profile_url,
		};
		try {
			if (typeof navigator !== "undefined" && (navigator as any).share) {
				await (navigator as any).share(shareData);
				return;
			}
		} catch { /* user dismissed share sheet — fall through to copy */ }
		try {
			await navigator.clipboard.writeText(badge.profile_url);
			setShared(true);
			setTimeout(() => setShared(false), 2000);
		} catch {}
	};

	if (!mounted || loading) {
		// Skeleton mirrors the real layout — buyer doesn't see a jarring layout
		// shift when the data arrives. Pulsing placeholders for header, identity
		// row, KPIs, chart, signals. Total skeleton time should be < 1.5s.
		return (
			<div className="min-h-screen bg-neutral-950 p-6">
				<div className="max-w-7xl mx-auto space-y-6 animate-pulse">
					<div className="h-16 bg-neutral-900/60 rounded-md border border-neutral-800" />
					<div className="h-12 bg-neutral-900/40 rounded-lg" />
					<div className="h-28 bg-neutral-900/60 rounded-xl border border-neutral-800" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="h-28 bg-neutral-900 rounded-lg border border-neutral-800" />
						<div className="h-28 bg-neutral-900 rounded-lg border border-neutral-800" />
						<div className="h-28 bg-neutral-900 rounded-lg border border-neutral-800" />
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="h-80 bg-neutral-900 rounded-lg border border-neutral-800 lg:col-span-2" />
						<div className="h-80 bg-neutral-900 rounded-lg border border-neutral-800" />
					</div>
				</div>
			</div>
		);
	}

	const chartInfo = data.chartData || [];
	const stats = data.stats ?? {
		trustScore: 0,
		trustScoreDelta: null,
		enterpriseViews: 0,
		activeProcurements: 0,
		activeProcurementsSector: null,
	};
	const history = data.recentActivity || [];

	const alerts = vendorState
		? generateAlerts(vendorState).filter((a) => !dismissedAlerts.has(a.id))
		: [];

	const activeSubs = vendorState?.activeSubscriptions || [];
	const hasSub = (key: string) => activeSubs.some((s) => s.startsWith(key));

	const shareDisabled = !badge?.active || !badge.profile_url;

	return (
		<div className="min-h-screen bg-neutral-950 p-6">
			<div className="max-w-7xl mx-auto space-y-6">

				{/* ── Header bar ───────────────────────────────────────────────
				    Title + just 3 utilitarian buttons. The Intel Pro upsell
				    used to compete with primary nav; it now lives in the
				    subscription strip (Zone 5) where it belongs. Share Proof
				    only shows when the buyer has something verifiable to share. */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-neutral-800 pb-6">
					<div>
						<h1 className="text-2xl font-bold text-white tracking-tight">
							Vendor Dashboard
						</h1>
						<p className="text-neutral-400 text-sm mt-1">
							Real-time enterprise procurement signals
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{badge?.active && (
							<button
								onClick={handleShareProof}
								disabled={shareDisabled}
								title={shareDisabled ? "Activate Vendor Proof to share" : "Share your verified profile"}
								className="px-4 py-2 bg-neutral-900 text-white rounded-md border border-neutral-800 text-sm font-medium hover:bg-neutral-800 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
							>
								{shared ? (
									<><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</>
								) : (
									<><Share2 className="h-3.5 w-3.5" /> Share Proof</>
								)}
							</button>
						)}
						<button
							onClick={handleLogout}
							className="px-3 py-2 bg-neutral-900 text-neutral-400 rounded-md border border-neutral-800 text-sm font-medium hover:text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
							title="Sign out"
						>
							<LogOut className="h-4 w-4" /> Sign out
						</button>
					</div>
				</div>

				{/* ── Quick nav (was Zone 6 — promoted to top per UX feedback) ─
				    Horizontal scrollable strip with icon + label per page. Sticky
				    so it stays accessible as the buyer scrolls through long
				    activity feeds / insight rows. */}
				<nav
					aria-label="Vendor pages"
					className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-neutral-950/95 backdrop-blur border-b border-neutral-800/80"
				>
					<div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
						{SIBLING_LINKS.map(({ href, label, Icon }) => (
							<Link
								key={href}
								href={href}
								className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-700 transition px-3 py-2 flex items-center gap-2 text-xs text-neutral-300 whitespace-nowrap"
							>
								<Icon className="h-3.5 w-3.5 text-neutral-500" />
								<span>{label}</span>
							</Link>
						))}
					</div>
				</nav>

				{/* ── Zone 1: Identity ──────────────────────────────────────── */}
				{vendorState && (
					<div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
						<div className="flex flex-col lg:flex-row lg:items-center gap-5">
							<TrustRing score={vendorState.trustScore} />
							<div className="flex-1 min-w-0">
								<div className="flex items-baseline gap-3 flex-wrap">
									<h2 className="text-lg font-bold text-white truncate">
										{vendorState.name}
									</h2>
									{badge?.active && (
										<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
											Verified
										</span>
									)}
								</div>
								<div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
									{vendorState.uen && <span>UEN {vendorState.uen}</span>}
									<span>{vendorState.sector}</span>
								</div>
								<div className="mt-3">
									<DepthLadder current={vendorState.verificationDepth} />
								</div>
							</div>
							<div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
								<div className="text-right">
									<div className="text-xs text-slate-500">Sector Percentile</div>
									<div className="text-2xl font-bold text-white leading-none mt-1">
										{vendorState.sectorPercentile}
										<span className="text-sm text-slate-500">th</span>
									</div>
								</div>
								<Link
									href="/vendor/subscription"
									className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1"
								>
									Manage subscription <ArrowRight className="h-3 w-3" />
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* ── Zone 2: Action queue ──────────────────────────────────── */}
				{/* Always renders: AlertCards (when present), RemediationSummaryCard
				    (self-hides), and a single next-step / unverified CTA. */}
				<div className="space-y-3">
						{alerts.length > 0 && (
							<>
								<div className="flex items-center justify-between">
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
							</>
						)}
						{/* RemediationSummaryCard self-hides when there are no remediations */}
						<RemediationSummaryCard />
						{/* Next step CTA — only shown when there's a verified Vendor Proof
						    badge AND no alerts already pointing at the next step. */}
						{badge?.active && alerts.length === 0 && (
							<div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
								<div className="flex-1">
									<div className="text-sm font-semibold text-white">You&apos;re verified — keep momentum</div>
									<div className="text-xs text-neutral-400 mt-0.5">
										Score {badge.compliance_score}/100 · {badge.verification_level?.toLowerCase()} level
									</div>
								</div>
								<Link
									href={nextStepFromLevel(badge.verification_level).href}
									className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
								>
									{nextStepFromLevel(badge.verification_level).label} <ArrowRight className="h-3.5 w-3.5" />
								</Link>
							</div>
						)}
						{/* Unverified CTA — single inline card */}
						{badge && !badge.active && (
							<div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
								<div className="flex-1">
									<div className="text-sm font-semibold text-white">Not yet verified</div>
									<p className="text-xs text-neutral-400 mt-0.5">
										Procurement officers filter by verified vendors. Without it, you&apos;re invisible to that filter.
									</p>
								</div>
								<Link
									href="/vendor-proof"
									className="flex-shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
								>
									Get Verified — S$149
								</Link>
							</div>
						)}
					</div>

				{/* ── Zone 3: 3 compact KPIs ──────────────────────────────────
				    Each card has: KPI title, big value, contextual subtext + a
				    one-click action when the value is empty (turns the empty
				    state into a CTA instead of dead text). */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Trust Score */}
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Trust Score</p>
								<h3 className="text-3xl font-bold text-white mt-2">
									{stats.trustScore}
									<span className="text-sm text-neutral-500 font-normal">/100</span>
								</h3>
							</div>
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Shield className="h-5 w-5 text-blue-500" />
							</div>
						</div>
						<div className="mt-3 text-xs">
							{stats.trustScoreDelta != null && stats.trustScoreDelta !== 0 ? (
								<span className="text-emerald-400 flex items-center gap-1">
									<TrendingUp className="h-3 w-3" />+{stats.trustScoreDelta} from last assessment
								</span>
							) : (
								<Link href="/pdpa" className="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-1">
									Run a PDPA scan to improve <ArrowRight className="h-3 w-3" />
								</Link>
							)}
						</div>
					</div>

					{/* Enterprise Views */}
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Enterprise Views</p>
								<h3 className="text-3xl font-bold text-white mt-2">{stats.enterpriseViews}</h3>
							</div>
							<div className="p-2 bg-emerald-500/10 rounded-lg">
								<Eye className="h-5 w-5 text-emerald-500" />
							</div>
						</div>
						<div className="mt-3 text-xs">
							{stats.enterpriseViews > 0 ? (
								<span className="text-emerald-400 flex items-center gap-1">
									<TrendingUp className="h-3 w-3" /> Unique domains, last 7 days
								</span>
							) : !badge?.active ? (
								<Link href="/vendor-proof" className="text-emerald-400 hover:text-emerald-300 transition inline-flex items-center gap-1">
									Get verified to appear in buyer searches <ArrowRight className="h-3 w-3" />
								</Link>
							) : (
								<span className="text-neutral-500">No profile views this week</span>
							)}
						</div>
					</div>

					{/* Open Tenders */}
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Open Tenders</p>
								<h3 className="text-3xl font-bold text-white mt-2">{stats.activeProcurements}</h3>
							</div>
							<div className="p-2 bg-amber-500/10 rounded-lg">
								<Zap className="h-5 w-5 text-amber-500" />
							</div>
						</div>
						<div className="mt-3 text-xs">
							{stats.activeProcurements > 0 ? (
								<span className="text-amber-400">
									In {stats.activeProcurementsSector || "your sector"}
								</span>
							) : (
								<Link href="/vendor/profile" className="text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1">
									Set your sector to match tenders <ArrowRight className="h-3 w-3" />
								</Link>
							)}
						</div>
					</div>
				</div>

				{/* ── Zone 4: Activity & insights ───────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="rounded-lg bg-neutral-900 border border-neutral-800 lg:col-span-2">
						<div className="flex flex-col space-y-1.5 p-6">
							<h3 className="text-base font-medium text-neutral-200">Attention Trajectory</h3>
						</div>
						<div className="p-6 pt-0">
							<div className="h-72 w-full mt-4">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartInfo}>
										<defs>
											<linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
												<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
											</linearGradient>
											<linearGradient id="colorTriggers" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
												<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
										<XAxis dataKey="name" stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
										<YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 12 }} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", color: "#fff" }} itemStyle={{ color: "#fff" }} />
										<Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
										<Area type="monotone" dataKey="triggers" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTriggers)" />
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col">
						<div className="flex flex-col space-y-1.5 p-6 border-b border-neutral-800 pb-3">
							<div className="flex flex-row items-center justify-between">
								<h3 className="text-base font-medium text-neutral-200">Live Signals</h3>
								<div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
							</div>
						</div>
						<div className="flex-1 max-h-80 overflow-y-auto">
							{history.length === 0 ? (
								<div className="px-6 py-8 text-center text-xs text-neutral-500">
									No recent activity yet.
								</div>
							) : (
								history.map((item: any, i: number) => (
									<div
										key={i}
										className="px-6 py-3 hover:bg-neutral-800/50 transition border-l-2 border-transparent hover:border-neutral-500"
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
											<span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
												{item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "")}
											</span>
										</div>
									</div>
								))
							)}
						</div>
						<div className="border-t border-neutral-800 px-6 py-3">
							<Link
								href="/compliance/locker"
								className="w-full text-sm text-neutral-400 hover:text-white transition flex items-center justify-center"
							>
								View full activity in Compliance Locker <ArrowRight className="ml-1 h-3 w-3" />
							</Link>
						</div>
					</div>
				</div>

				{/* Insights row — sector / cal / tender probability */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					<SectorPressureWidget />
					<CalDashboard />
					<TenderWinProbabilityWidget />
				</div>

				{/* VendorStatusBadge + VendorProPanel are self-gated (render null
				    when their backend returns 403 / empty), so we can drop them
				    here without growing the dashboard for non-subscribers. */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
					<VendorStatusBadge />
				</div>
				<VendorProPanel />

				{/* ── Zone 5: Subscription strip ────────────────────────────── */}
				<div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
							Subscriptions
						</h2>
						<Link
							href="/vendor/subscription"
							className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1"
						>
							Manage <ArrowRight className="h-3 w-3" />
						</Link>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{SUB_TIERS.map((t) => {
							const active = hasSub(t.key);
							const palette: Record<string, string> = {
								emerald: active
									? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300"
									: "border-neutral-800 bg-neutral-900 text-neutral-400",
								blue: active
									? "border-blue-500/40 bg-blue-500/5 text-blue-300"
									: "border-neutral-800 bg-neutral-900 text-neutral-400",
								violet: active
									? "border-violet-500/40 bg-violet-500/5 text-violet-300"
									: "border-neutral-800 bg-neutral-900 text-neutral-400",
							};
							return (
								<Link
									key={t.key}
									href={active ? "/vendor/subscription" : t.href}
									className={`rounded-lg border px-3 py-2.5 flex items-center justify-between transition hover:border-neutral-600 ${palette[t.color]}`}
								>
									<div className="flex items-center gap-2">
										{active ? (
											<CheckCircle2 className="h-4 w-4" />
										) : (
											<span className="h-4 w-4 rounded-full border border-current opacity-50" />
										)}
										<span className="text-sm font-semibold">{t.label}</span>
									</div>
									<span className="text-[10px] uppercase tracking-widest opacity-70">
										{active ? "Active" : "Available"}
									</span>
								</Link>
							);
						})}
					</div>
					{/* Vendor Proof inline status — copy badge / link to profile only
					    when verified; the unverified CTA already lives in Zone 2. */}
					{badge?.active && (
						<div className="mt-3 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
							<span className="text-neutral-400">
								<span className="text-emerald-400 font-semibold">Vendor Proof active</span>
								{" · "}Trust {badge.compliance_score}/100
							</span>
							<div className="flex gap-3 sm:ml-auto">
								<button
									onClick={copyBadge}
									className="text-neutral-400 hover:text-white transition flex items-center gap-1"
								>
									{copied ? (
										<><Check className="h-3 w-3 text-emerald-400" /> Copied</>
									) : (
										<><Copy className="h-3 w-3" /> Copy embed badge</>
									)}
								</button>
								{badge.profile_url && (
									<Link
										href={badge.profile_url}
										target="_blank"
										className="text-neutral-400 hover:text-white transition"
									>
										Public profile →
									</Link>
								)}
							</div>
						</div>
					)}
				</div>

			</div>
		</div>
	);
}
