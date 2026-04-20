import { config, endpoints } from "@/lib/config";
import Link from "next/link";
import type { Metadata } from "next";

interface VendorPageProps {
	params: { slug: string };
}

async function getVendor(slug: string) {
	try {
		const res = await fetch(
			`${config.apiUrl}/api/v1${endpoints.marketplace.vendor(slug)}`,
			{ next: { revalidate: 300 } },
		);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

async function getIndustryData(slug: string) {
	try {
		const res = await fetch(
			`${config.apiUrl}/api/v1${endpoints.seo.industry(slug)}`,
			{ next: { revalidate: 300 } },
		);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params,
}: VendorPageProps): Promise<Metadata> {
	const vendor = await getVendor(params.slug);
	if (vendor) {
		return {
			title: `${vendor.company_name} — Vendor Profile | Booppa`,
			description:
				vendor.short_description ||
				`View trust score and compliance details for ${vendor.company_name}`,
		};
	}

	const industry = await getIndustryData(params.slug);
	if (industry) {
		return {
			title: `Top ${industry.industry} Vendors in Singapore | Booppa`,
			description:
				industry.description ||
				`Discover verified ${industry.industry} vendors in Singapore`,
		};
	}

	return { title: "Vendor | Booppa" };
}

export default async function VendorSlugPage({ params }: VendorPageProps) {
	const vendor = await getVendor(params.slug);

	if (vendor) {
		return <VendorProfile vendor={vendor} />;
	}

	const industry = await getIndustryData(params.slug);

	if (industry) {
		return <IndustryPage industry={industry} />;
	}

	return (
		<main className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
			<div className="text-center">
				<div className="text-6xl mb-4">🔍</div>
				<h1 className="text-2xl font-bold text-[#0f172a] mb-2">Not Found</h1>
				<p className="text-[#64748b] mb-6">
					This vendor or industry page doesn&apos;t exist.
				</p>
				<Link
					href="/vendors"
					className="text-[#10b981] font-bold hover:underline"
				>
					← Back to directory
				</Link>
			</div>
		</main>
	);
}

function scoreBar(val: number) {
	const color =
		val >= 70 ? "#10b981" : val >= 40 ? "#f59e0b" : "#ef4444";
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
				<div
					className="h-full rounded-full transition-all"
					style={{ width: `${Math.min(100, val)}%`, backgroundColor: color }}
				/>
			</div>
			<span className="text-xs font-bold w-7 text-right" style={{ color }}>
				{val}
			</span>
		</div>
	);
}

function depthBadge(d: string) {
	const map: Record<string, string> = {
		CERTIFIED: "bg-[#10b981]/10 text-[#10b981]",
		DEEP: "bg-[#10b981]/10 text-[#10b981]",
		STANDARD: "bg-blue-50 text-blue-600",
		BASIC: "bg-yellow-50 text-yellow-600",
		UNVERIFIED: "bg-[#f1f5f9] text-[#94a3b8]",
	};
	return (
		<span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${map[d] ?? "bg-[#f1f5f9] text-[#94a3b8]"}`}>
			{d}
		</span>
	);
}

function riskBadge(r: string) {
	const map: Record<string, string> = {
		CLEAN: "bg-[#10b981]/10 text-[#10b981]",
		WATCH: "bg-yellow-50 text-yellow-600",
		FLAGGED: "bg-orange-50 text-orange-600",
		CRITICAL: "bg-red-50 text-red-600",
	};
	return (
		<span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${map[r] ?? "bg-[#f1f5f9] text-[#94a3b8]"}`}>
			{r}
		</span>
	);
}

function readinessBadge(p: string) {
	const map: Record<string, string> = {
		READY: "bg-[#10b981]/10 text-[#10b981]",
		CONDITIONAL: "bg-blue-50 text-blue-600",
		NEEDS_ATTENTION: "bg-yellow-50 text-yellow-600",
		NOT_READY: "bg-[#f1f5f9] text-[#94a3b8]",
	};
	return (
		<span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${map[p] ?? "bg-[#f1f5f9] text-[#94a3b8]"}`}>
			{p.replace(/_/g, " ")}
		</span>
	);
}

function VendorProfile({ vendor }: { vendor: any }) {
	const initials =
		vendor.company_name
			?.split(" ")
			.slice(0, 2)
			.map((w: string) => w[0])
			.join("")
			.toUpperCase() || "V";

	const location = [vendor.city, vendor.country].filter(Boolean).join(", ");

	const memberSince =
		vendor.claimed_at || vendor.created_at
			? new Date(vendor.claimed_at || vendor.created_at).toLocaleDateString(
					"en-SG",
					{ month: "short", year: "numeric" },
				)
			: null;

	return (
		<main className="min-h-screen bg-[#f8fafc]">
			{/* Hero */}
			<section className="py-14 px-6 bg-[#0f172a] text-white">
				<div className="max-w-[1100px] mx-auto">
					<Link
						href="/vendors"
						className="text-[#94a3b8] hover:text-white mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						← Back to directory
					</Link>

					<div className="flex flex-col md:flex-row md:items-start gap-6">
						{/* Avatar */}
						<div className="w-20 h-20 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-2xl font-black text-[#10b981] flex-shrink-0">
							{initials}
						</div>

						{/* Name + badges */}
						<div className="flex-1 min-w-0">
							<div className="flex flex-wrap items-center gap-2 mb-2">
								{vendor.verified && (
									<span className="inline-flex items-center gap-1 bg-[#10b981] text-white text-xs font-bold px-3 py-1 rounded-full">
										✓ Verified
									</span>
								)}
								{vendor.claimed && !vendor.verified && (
									<span className="inline-flex items-center gap-1 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full">
										● Claimed
									</span>
								)}
								{vendor.industry && (
									<span className="bg-white/10 text-white/70 text-xs font-medium px-3 py-1 rounded-full">
										{vendor.industry}
									</span>
								)}
							</div>

							<h1 className="text-3xl lg:text-5xl font-black mb-3 leading-tight">
								{vendor.company_name}
							</h1>

							{/* Quick facts row */}
							<div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#94a3b8]">
								{location && (
									<span className="flex items-center gap-1">📍 {location}</span>
								)}
								{vendor.uen && (
									<span className="flex items-center gap-1">
										🏢 UEN:{" "}
										<span className="font-mono text-white/80">
											{vendor.uen}
										</span>
									</span>
								)}
								{vendor.domain && (
									<span className="flex items-center gap-1">
										🌐 {vendor.domain}
									</span>
								)}
								{memberSince && (
									<span className="flex items-center gap-1">
										🗓 Member since {memberSince}
									</span>
								)}
							</div>
						</div>

						{/* Trust score */}
						{vendor.trust_score != null && (
							<div className="flex-shrink-0 text-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
								<div
									className={`text-5xl font-black ${vendor.trust_score >= 80 ? "text-[#10b981]" : vendor.trust_score >= 50 ? "text-yellow-400" : "text-red-400"}`}
								>
									{vendor.trust_score}
								</div>
								<div className="text-xs text-[#94a3b8] mt-1">Trust Score</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Body */}
			<section className="py-12 px-6">
				<div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* ── Left / Main ── */}
					<div className="lg:col-span-2 space-y-6">
						{/* About */}
						{vendor.short_description && (
							<div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
								<h2 className="text-lg font-bold text-[#0f172a] mb-3">About</h2>
								<p className="text-[#64748b] leading-relaxed">
									{vendor.short_description}
								</p>
							</div>
						)}


						{/* Procurement Intelligence */}
						{(vendor.scores || vendor.status) && (
							<div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
								<div className="flex items-center gap-2 mb-6">
									<h2 className="text-lg font-bold text-[#0f172a]">Procurement Intelligence</h2>
									{vendor.verified && (
										<span className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-2.5 py-0.5 rounded-full">
											✓ Verified Data
										</span>
									)}
								</div>

								{vendor.scores && (
									<div className="mb-6">
										<p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Trust Scores</p>
										<div className="space-y-3">
											{[
												{ label: "Overall Trust Score", val: vendor.scores.total_score },
												{ label: "Compliance", val: vendor.scores.compliance_score },
												{ label: "Visibility", val: vendor.scores.visibility_score },
												{ label: "Engagement", val: vendor.scores.engagement_score },
												{ label: "Recency", val: vendor.scores.recency_score },
												{ label: "Procurement Interest", val: vendor.scores.procurement_interest_score },
											].map(({ label, val }) => (
												<div key={label} className="grid grid-cols-[160px_1fr] items-center gap-3">
													<span className="text-xs text-[#64748b]">{label}</span>
													{scoreBar(val)}
												</div>
											))}
										</div>
									</div>
								)}

								{vendor.status && (
									<div>
										<p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Procurement Status</p>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Verification Depth</div>
												{depthBadge(vendor.status.verification_depth)}
											</div>
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Risk Signal</div>
												{riskBadge(vendor.status.risk_signal)}
											</div>
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Procurement Readiness</div>
												{readinessBadge(vendor.status.procurement_readiness)}
											</div>
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Monitoring Activity</div>
												<span className="text-xs font-semibold text-[#0f172a] uppercase">{vendor.status.monitoring_activity}</span>
											</div>
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Evidence Count</div>
												<span className="text-sm font-bold text-[#0f172a]">{vendor.status.evidence_count}</span>
											</div>
											<div>
												<div className="text-xs text-[#94a3b8] mb-1">Notarization Depth</div>
												<span className="text-sm font-bold text-[#0f172a]">{vendor.status.notarization_depth}/5</span>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Why Procurement Should Act — shown only for unclaimed vendors */}
						{!vendor.claimed && (
							<div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl">
								<div className="flex items-start gap-3 mb-4">
									<span className="text-2xl">⚠️</span>
									<div>
										<h2 className="text-lg font-bold text-[#0f172a]">No verified data for this vendor</h2>
										<p className="text-sm text-[#64748b] mt-1">
											This profile is unclaimed — there are no trust scores, compliance records, or risk signals on file.
										</p>
									</div>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
									{[
										{ icon: "📋", label: "No compliance records", sub: "PDPA, ISO, and regulatory status unknown" },
										{ icon: "🔍", label: "Risk unassessed", sub: "No active monitoring or anomaly detection" },
										{ icon: "📦", label: "Procurement unready", sub: "Cannot be rated READY for sourcing decisions" },
									].map(({ icon, label, sub }) => (
										<div key={label} className="bg-white border border-amber-100 rounded-xl p-4">
											<div className="text-xl mb-1">{icon}</div>
											<div className="text-xs font-bold text-[#0f172a] mb-0.5">{label}</div>
											<div className="text-xs text-[#64748b]">{sub}</div>
										</div>
									))}
								</div>
								<p className="text-xs text-[#94a3b8] mb-3">
									Run a Vendor Proof to generate a public trust record for this company, or prompt them to claim their profile.
								</p>
								<div className="flex flex-wrap gap-3">
									<Link
										href={`/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || "")}`}
										className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-xl text-sm transition-colors"
									>
										🔍 Run Vendor Proof
									</Link>
									<Link
										href="/auth/register"
										className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0f172a] text-[#0f172a] font-bold rounded-xl text-sm hover:bg-[#0f172a] hover:text-white transition-colors"
									>
										Claim this profile →
									</Link>
								</div>
							</div>
						)}

						{/* Why Procurement Should Act — claimed but not yet verified */}
						{vendor.claimed && !vendor.verified && (
							<div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl">
								<div className="flex items-start gap-3 mb-4">
									<span className="text-2xl">🏢</span>
									<div>
										<h2 className="text-lg font-bold text-[#0f172a]">Profile claimed — verification pending</h2>
										<p className="text-sm text-[#64748b] mt-1">
											This vendor has registered with Booppa but hasn&apos;t completed a full Vendor Proof. Scores will be limited until verification is complete.
										</p>
									</div>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
									{[
										{ icon: "📋", label: "Compliance unverified", sub: "Regulatory documents not yet checked against live registries" },
										{ icon: "🔒", label: "Trust score provisional", sub: "Score reflects limited data — full check unlocks full score" },
									].map(({ icon, label, sub }) => (
										<div key={label} className="bg-white border border-blue-100 rounded-xl p-4">
											<div className="text-xl mb-1">{icon}</div>
											<div className="text-xs font-bold text-[#0f172a] mb-0.5">{label}</div>
											<div className="text-xs text-[#64748b]">{sub}</div>
										</div>
									))}
								</div>
								<Link
									href={`/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || "")}`}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl text-sm transition-colors"
								>
									🔍 Complete Vendor Proof
								</Link>
							</div>
						)}

						{/* Company details */}
						<div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
							<h2 className="text-lg font-bold text-[#0f172a] mb-5">
								Company Details
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
								{vendor.uen && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											UEN
										</div>
										<div className="font-mono font-semibold text-[#0f172a]">
											{vendor.uen}
										</div>
									</div>
								)}
								{vendor.industry && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											Industry
										</div>
										<div className="font-semibold text-[#0f172a]">
											{vendor.industry}
										</div>
									</div>
								)}
								{location && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											Location
										</div>
										<div className="font-semibold text-[#0f172a]">
											{location}
										</div>
									</div>
								)}
								{vendor.domain && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											Domain
										</div>
										<div className="font-semibold text-[#0f172a]">
											{vendor.domain}
										</div>
									</div>
								)}
								{vendor.website && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											Website
										</div>
										<a
											href={
												vendor.website.startsWith("http")
													? vendor.website
													: `https://${vendor.website}`
											}
											target="_blank"
											rel="noopener noreferrer"
											className="font-semibold text-[#10b981] hover:underline break-all"
										>
											{vendor.website}
										</a>
									</div>
								)}
								{vendor.scan_status && vendor.scan_status !== "NONE" && (
									<div>
										<div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">
											Scan Status
										</div>
										<div
											className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-0.5 rounded-full ${
												vendor.scan_status === "COMPLETE"
													? "bg-[#10b981]/10 text-[#10b981]"
													: vendor.scan_status === "SCANNING"
														? "bg-blue-50 text-blue-600"
														: "bg-[#f1f5f9] text-[#64748b]"
											}`}
										>
											{vendor.scan_status === "COMPLETE"
												? "✓"
												: vendor.scan_status === "SCANNING"
													? "⟳"
													: "–"}{" "}
											{vendor.scan_status}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* External links */}
						{(vendor.linkedin_url || vendor.crunchbase_url) && (
							<div className="bg-white p-8 rounded-2xl border border-[#e2e8f0]">
								<h2 className="text-lg font-bold text-[#0f172a] mb-5">Links</h2>
								<div className="flex flex-wrap gap-3">
									{vendor.linkedin_url && (
										<a
											href={vendor.linkedin_url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e2e8f0] rounded-xl text-sm font-medium text-[#64748b] hover:border-[#0077b5] hover:text-[#0077b5] transition-colors"
										>
											<svg
												className="w-4 h-4"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
											</svg>
											LinkedIn
										</a>
									)}
									{vendor.crunchbase_url && (
										<a
											href={vendor.crunchbase_url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#e2e8f0] rounded-xl text-sm font-medium text-[#64748b] hover:border-[#0f172a] hover:text-[#0f172a] transition-colors"
										>
											<span className="font-bold text-xs">CB</span>
											Crunchbase
										</a>
									)}
								</div>
							</div>
						)}
					</div>

					{/* ── Right / Sidebar ── */}
					<div className="space-y-5">
						{/* Verification status card */}
						<div
							className={`p-6 rounded-2xl border-2 ${vendor.verified ? "bg-[#10b981]/5 border-[#10b981]/30" : vendor.claimed ? "bg-[#f8fafc] border-[#e2e8f0]" : "bg-amber-50 border-amber-200"}`}
						>
							{vendor.verified ? (
								<>
									<div className="flex items-center gap-2 mb-2">
										<span className="text-2xl">✅</span>
										<h3 className="font-bold text-[#0f172a]">
											Verified Vendor
										</h3>
									</div>
									<p className="text-sm text-[#64748b] mb-1">
										This company has passed Booppa&apos;s Vendor Proof check.
									</p>
									{vendor.verified_at && (
										<p className="text-xs text-[#94a3b8]">
											Verified{" "}
											{new Date(vendor.verified_at).toLocaleDateString(
												"en-SG",
												{ month: "long", year: "numeric" },
											)}
										</p>
									)}
								</>
							) : vendor.claimed ? (
								<>
									<div className="flex items-center gap-2 mb-2">
										<span className="text-xl">🏢</span>
										<h3 className="font-bold text-[#0f172a]">
											Profile Claimed
										</h3>
									</div>
									<p className="text-sm text-[#64748b] mb-4">
										This company has registered but hasn&apos;t completed Vendor
										Proof yet.
									</p>
									<Link
										href={`/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || "")}`}
										className="block w-full text-center py-2.5 px-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl text-sm transition-colors"
									>
										Get Vendor Proof →
									</Link>
								</>
							) : (
								<>
									<div className="flex items-center gap-2 mb-2">
										<span className="text-xl">❓</span>
										<h3 className="font-bold text-[#0f172a]">
											Is this your company?
										</h3>
									</div>
									<p className="text-sm text-[#64748b] mb-4">
										Claim this profile to manage your trust score and respond to
										vendor proofs.
									</p>
									<Link
										href="/auth/register"
										className="block w-full text-center py-2.5 px-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-xl text-sm transition-colors"
									>
										Claim Profile →
									</Link>
								</>
							)}
						</div>

						{/* Quick actions */}
						<div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
							<h3 className="font-bold text-[#0f172a] mb-4">Quick Actions</h3>
							<div className="space-y-3">
								<Link
									href={`/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || "")}`}
									className="flex items-center gap-3 w-full py-3 px-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl text-sm transition-colors"
								>
									<span>🔍</span> Run Vendor Proof
								</Link>
								<Link
									href={`/check-status?q=${encodeURIComponent(vendor.company_name)}`}
									className="flex items-center gap-3 w-full py-3 px-4 border border-[#e2e8f0] text-[#64748b] font-medium rounded-xl text-sm hover:border-[#10b981] hover:text-[#10b981] transition-colors"
								>
									<span>✓</span> Check Trust Status
								</Link>
								{vendor.website && (
									<a
										href={
											vendor.website.startsWith("http")
												? vendor.website
												: `https://${vendor.website}`
										}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 w-full py-3 px-4 border border-[#e2e8f0] text-[#64748b] font-medium rounded-xl text-sm hover:border-[#0f172a] hover:text-[#0f172a] transition-colors"
									>
										<span>↗</span> Visit Website
									</a>
								)}
							</div>
						</div>

						{/* Share */}
						<div className="bg-white p-6 rounded-2xl border border-[#e2e8f0]">
							<h3 className="font-bold text-[#0f172a] mb-2 text-sm">
								Share this profile
							</h3>
							<p className="text-xs text-[#94a3b8] font-mono break-all select-all">
								https://www.booppa.io/vendors/{vendor.slug}
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

function IndustryPage({ industry }: { industry: any }) {
	return (
		<main className="min-h-screen bg-[#f8fafc]">
			<section className="py-20 px-6 bg-[#0f172a] text-white">
				<div className="max-w-[1200px] mx-auto text-center">
					<Link
						href="/vendors"
						className="text-[#94a3b8] hover:text-white mb-4 inline-block transition-colors"
					>
						← Back to directory
					</Link>
					<h1 className="text-3xl lg:text-5xl font-bold mb-4">
						{industry.industry} Vendors
					</h1>
					<p className="text-xl text-[#94a3b8] max-w-[600px] mx-auto">
						{industry.description ||
							`${industry.vendor_count} verified ${industry.industry} vendors in Singapore`}
					</p>
					{industry.avg_trust_score && (
						<div className="mt-6 inline-block px-4 py-2 bg-white/10 rounded-full">
							Average Trust Score:{" "}
							<span className="font-bold text-[#10b981]">
								{Math.round(industry.avg_trust_score)}/100
							</span>
						</div>
					)}
				</div>
			</section>

			<section className="py-12 px-6">
				<div className="max-w-[1200px] mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{(industry.vendors || []).map((vendor: any) => (
							<Link
								key={vendor.id}
								href={`/vendors/${vendor.slug || vendor.seo_slug}`}
								className="bg-white p-6 rounded-2xl border border-[#e2e8f0] hover:border-[#10b981] hover:translate-y-[-3px] hover:shadow-lg transition-all group"
							>
								<div className="flex items-start justify-between mb-3">
									<h3 className="text-lg font-bold text-[#0f172a] group-hover:text-[#10b981] transition-colors line-clamp-1">
										{vendor.company_name}
									</h3>
									{vendor.trust_score !== null &&
										vendor.trust_score !== undefined && (
											<span
												className={`
                      text-sm font-bold px-2 py-1 rounded-lg
                      ${
												vendor.trust_score >= 80
													? "bg-[#10b981]/10 text-[#10b981]"
													: vendor.trust_score >= 50
														? "bg-yellow-100 text-yellow-700"
														: "bg-red-100 text-red-600"
											}
                    `}
											>
												{vendor.trust_score}/100
											</span>
										)}
								</div>
								{vendor.short_description && (
									<p className="text-sm text-[#64748b] line-clamp-2">
										{vendor.short_description}
									</p>
								)}
							</Link>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
