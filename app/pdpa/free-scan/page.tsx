"use client";

import { COMPANY_NAME_SINGAPORE } from "@/lib/company";
import { useState, useEffect } from "react";
import Link from "next/link";
import { config } from "@/lib/config";
import { normalizeUrl } from "@/lib/url";

interface Finding {
	check_id: string;
	title: string;
	severity: string;
	category: string;
	description: string;
	legislation: string;
	action: string;
}

interface LockedFinding {
	severity: string;
	category: string;
	title: string;
}

interface ScanResult {
	website_url: string;
	score: number;
	risk_level: string;
	total_findings: number;
	free_finding: Finding | null;
	locked_findings: LockedFinding[];
	unlock_cta: { product_type: string; price: string; description: string };
}


const severityColor: Record<string, string> = {
	CRITICAL: "bg-red-600",
	HIGH: "bg-orange-500",
	MEDIUM: "bg-yellow-500",
	LOW: "bg-blue-400",
};

const severityBorder: Record<string, string> = {
	CRITICAL: "border-red-200 bg-red-50",
	HIGH: "border-orange-200 bg-orange-50",
	MEDIUM: "border-yellow-200 bg-yellow-50",
	LOW: "border-blue-200 bg-blue-50",
};

export default function PDPAFreeScan() {
	const [step, setStep] = useState<"form" | "loading" | "gate" | "results">(
		"form",
	);
	const [result, setResult] = useState<ScanResult | null>(null);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		website: "",
		email: "",
		company: "",
	});
	const [unlocking, setUnlocking] = useState(false);
	const [authed, setAuthed] = useState<boolean | null>(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => setAuthed(r.ok))
			.catch(() => setAuthed(false));
	}, []);

	const handleScan = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setStep("loading");

		const url = normalizeUrl(formData.website);
		if (!url) {
			setError("Please enter a website URL");
			setStep("form");
			return;
		}

		try {
			const res = await fetch(`${config.apiUrl}/api/v1/pdpa/free-scan`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					website_url: url,
					email: formData.email || null,
					company_name: formData.company || null,
				}),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || "Scan failed");
			}

			const data: ScanResult = await res.json();
			setResult(data);
			setStep(authed ? "results" : "gate");
		} catch (err: any) {
			setError(err.message || "Something went wrong");
			setStep("form");
		}
	};

	const handleUnlock = async () => {
		setUnlocking(true);
		try {
			const website = normalizeUrl(formData.website);
			const email = formData.email || "";
			const company = formData.company || "Quick Scan";

			// Create report
			const reportRes = await fetch(`${config.apiUrl}/api/reports/public`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					framework: "pdpa_quick_scan",
					company_name: company,
					website,
					assessment_data: { contact_email: email },
					contact_email: email,
				}),
			});
			if (!reportRes.ok) throw new Error("Failed to create report");
			const { report_id } = await reportRes.json();

			// Stripe checkout
			const checkoutRes = await fetch(`${config.apiUrl}/api/stripe/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productType: "pdpa_quick_scan",
					reportId: report_id,
					customerEmail: email,
				}),
			});
			if (!checkoutRes.ok) throw new Error("Failed to start checkout");
			const { url } = await checkoutRes.json();
			window.location.href = url;
		} catch {
			setUnlocking(false);
			setError("Could not start checkout. Please try again.");
		}
	};

	// Score gauge arc
	const renderGauge = (score: number, riskLevel: string) => {
		const color = score >= 60 ? "#dc2626" : score >= 30 ? "#f59e0b" : "#10b981";
		const angle = (score / 100) * 180;
		const rad = (angle * Math.PI) / 180;
		const x = 50 + 40 * Math.cos(Math.PI - rad);
		const y = 50 - 40 * Math.sin(Math.PI - rad);
		const largeArc = angle > 180 ? 1 : 0;

		return (
			<div className="flex flex-col items-center">
				<svg viewBox="0 0 100 60" className="w-48 h-auto">
					<path
						d="M 10 50 A 40 40 0 0 1 90 50"
						fill="none"
						stroke="#e2e8f0"
						strokeWidth="8"
						strokeLinecap="round"
					/>
					<path
						d={`M 10 50 A 40 40 0 ${largeArc} 1 ${x} ${y}`}
						fill="none"
						stroke={color}
						strokeWidth="8"
						strokeLinecap="round"
					/>
					<text
						x="50"
						y="45"
						textAnchor="middle"
						className="text-2xl font-black"
						fill={color}
					>
						{score}
					</text>
				</svg>
				<span className="text-lg font-bold mt-1" style={{ color }}>
					{riskLevel}
				</span>
			</div>
		);
	};

	return (
		<main className="bg-white min-h-screen">
			<section className="py-24 px-6">
				<div className="max-w-[800px] mx-auto">
					<div className="text-center mb-12">
						<p className="text-sm font-bold uppercase tracking-widest text-[#10b981] mb-3">
							Free Tool
						</p>
						<h1 className="text-4xl lg:text-5xl font-black mb-4 text-[#0f172a]">
							PDPA Quick Check
						</h1>
						<p className="text-lg text-[#64748b] max-w-xl mx-auto">
							Instant security header scan for PDPA compliance indicators. No
							payment required.
						</p>
					</div>

					{/* Form */}
					{step === "form" && (
						<>
							<div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl border border-[#e2e8f0]">
								<form onSubmit={handleScan} className="space-y-5">
									<div>
										<label
											className="block text-sm font-bold text-[#1e293b] mb-2"
											htmlFor="website"
										>
											Website URL *
										</label>
										<input
											type="text"
											id="website"
											value={formData.website}
											onChange={(e) =>
												setFormData((d) => ({ ...d, website: e.target.value }))
											}
											className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
											placeholder="yourcompany.sg"
											required
										/>
									</div>
									<div>
										<label
											className="block text-sm font-bold text-[#1e293b] mb-2"
											htmlFor="email"
										>
											Email (optional)
										</label>
										<input
											type="email"
											id="email"
											value={formData.email}
											onChange={(e) =>
												setFormData((d) => ({ ...d, email: e.target.value }))
											}
											className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
											placeholder="you@company.sg"
										/>
									</div>
									<div>
										<label
											className="block text-sm font-bold text-[#1e293b] mb-2"
											htmlFor="company"
										>
											Company Name (optional)
										</label>
										<input
											type="text"
											id="company"
											value={formData.company}
											onChange={(e) =>
												setFormData((d) => ({ ...d, company: e.target.value }))
											}
											className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none"
											placeholder={COMPANY_NAME_SINGAPORE}
										/>
									</div>
									{error && <p className="text-red-600 text-sm">{error}</p>}
									<button
										type="submit"
										className="btn btn-primary w-full py-4 text-lg font-black shadow-lg"
									>
										Run Free Scan
									</button>
									<p className="text-center text-[#94a3b8] text-xs">
										Checks HTTPS, security headers, cookie consent, and privacy
										policy presence
									</p>
								</form>
							</div>

							{/* What we check */}
							<div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6">
									<div className="w-10 h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center mb-4">
										<svg
											className="w-5 h-5 text-[#10b981]"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
											/>
										</svg>
									</div>
									<h3 className="text-base font-bold text-[#0f172a] mb-2">
										HTTPS & Security Headers
									</h3>
									<p className="text-sm text-[#64748b]">
										We check if your site uses HTTPS, has proper security
										headers (CSP, HSTS, X-Frame-Options), and protects against
										common web vulnerabilities.
									</p>
								</div>
								<div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6">
									<div className="w-10 h-10 bg-[#6366f1]/10 rounded-lg flex items-center justify-center mb-4">
										<svg
											className="w-5 h-5 text-[#6366f1]"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</div>
									<h3 className="text-base font-bold text-[#0f172a] mb-2">
										Cookie Consent & Privacy
									</h3>
									<p className="text-sm text-[#64748b]">
										We verify the presence of cookie consent banners, privacy
										policies, and data protection notices as required under
										Singapore&apos;s PDPA.
									</p>
								</div>
								<div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6">
									<div className="w-10 h-10 bg-[#f59e0b]/10 rounded-lg flex items-center justify-center mb-4">
										<svg
											className="w-5 h-5 text-[#f59e0b]"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
									</div>
									<h3 className="text-base font-bold text-[#0f172a] mb-2">
										Risk Scoring
									</h3>
									<p className="text-sm text-[#64748b]">
										Get an instant risk score (0-100) based on your
										website&apos;s compliance posture. Higher scores indicate
										more issues that need attention.
									</p>
								</div>
								<div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6">
									<div className="w-10 h-10 bg-[#ef4444]/10 rounded-lg flex items-center justify-center mb-4">
										<svg
											className="w-5 h-5 text-[#ef4444]"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
									<h3 className="text-base font-bold text-[#0f172a] mb-2">
										Actionable Report
									</h3>
									<p className="text-sm text-[#64748b]">
										Receive a finding with specific legislation references and
										recommended actions. Upgrade to unlock the full automated
										report with all findings.
									</p>
								</div>
							</div>

							{/* Why PDPA matters */}
							<div className="mt-16 text-center">
								<h2 className="text-2xl font-bold text-[#0f172a] mb-4">
									Why PDPA Compliance Matters
								</h2>
								<p className="text-[#64748b] max-w-2xl mx-auto mb-8">
									Singapore&apos;s Personal Data Protection Act (PDPA) applies
									to all organisations that collect, use, or disclose personal
									data. Non-compliance can result in fines up to S$1 million per
									breach.
								</p>
								<div className="flex flex-wrap justify-center gap-8 text-center">
									<div>
										<p className="text-3xl font-black text-[#0f172a]">S$1M</p>
										<p className="text-sm text-[#64748b]">
											Maximum fine per breach
										</p>
									</div>
									<div>
										<p className="text-3xl font-black text-[#0f172a]">32</p>
										<p className="text-sm text-[#64748b]">
											PDPC enforcement actions in 2024
										</p>
									</div>
									<div>
										<p className="text-3xl font-black text-[#0f172a]">100%</p>
										<p className="text-sm text-[#64748b]">
											Required for GeBIZ tenders
										</p>
									</div>
								</div>
							</div>

							{/* Trust indicators */}
							<div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#94a3b8]">
								<span className="flex items-center gap-1.5">
									<svg
										className="w-4 h-4 text-[#10b981]"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Free scan — create a profile to view results
								</span>
								<span className="flex items-center gap-1.5">
									<svg
										className="w-4 h-4 text-[#10b981]"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Results in under 30 seconds
								</span>
								<span className="flex items-center gap-1.5">
									<svg
										className="w-4 h-4 text-[#10b981]"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Upgrade to full AI report with remediation steps
								</span>
							</div>
						</>
					)}

					{/* Loading */}
					{step === "loading" && (
						<div className="text-center py-20">
							<div className="inline-block w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-6" />
							<p className="text-lg text-[#64748b]">
								Scanning {formData.website}...
							</p>
							<p className="text-sm text-[#94a3b8] mt-2">
								Checking security headers and compliance indicators
							</p>
						</div>
					)}

					{/* Gate — claim profile to see results */}
					{step === "gate" && result && (
						<div className="relative">
							{/* Blurred preview */}
							<div
								className="filter blur-sm pointer-events-none select-none"
								aria-hidden="true"
							>
								<div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2e8f0] text-center">
									{renderGauge(result.score, result.risk_level)}
									<p className="text-sm text-[#64748b] mt-4">
										{result.total_findings} issue
										{result.total_findings !== 1 ? "s" : ""} found on{" "}
										<strong>{result.website_url}</strong>
									</p>
								</div>
							</div>

							{/* Overlay */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="bg-white p-8 rounded-3xl shadow-2xl border border-[#e2e8f0] text-center max-w-md mx-4">
									<div className="w-14 h-14 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
										<svg
											className="w-7 h-7 text-[#10b981]"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-bold text-[#0f172a] mb-2">
										Your scan is ready!
									</h3>
									<p className="text-sm text-[#64748b] mb-6">
										Create your free vendor profile to view your PDPA scan
										results and track your compliance over time.
									</p>
									<Link
										href="/auth/register"
										className="inline-block w-full px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition text-sm"
									>
										Claim your Profile — Free
									</Link>
									<Link
										href="/login"
										className="inline-block w-full mt-3 px-6 py-3 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] font-medium rounded-xl transition text-sm"
									>
										Already have an account? Sign in
									</Link>
								</div>
							</div>
						</div>
					)}

					{/* Results */}
					{step === "results" && result && (
						<div className="space-y-6">
							{/* Score card */}
							<div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2e8f0] text-center">
								{renderGauge(result.score, result.risk_level)}
								<p className="text-sm text-[#64748b] mt-4">
									{result.total_findings} issue
									{result.total_findings !== 1 ? "s" : ""} found on{" "}
									<strong>{result.website_url}</strong>
								</p>
								<div className="flex justify-center gap-3 mt-4">
									{["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
										const count =
											(result.free_finding?.severity === sev ? 1 : 0) +
											result.locked_findings.filter((f) => f.severity === sev)
												.length;
										if (!count) return null;
										return (
											<span
												key={sev}
												className={`px-3 py-1 rounded-full text-white text-xs font-bold ${severityColor[sev]}`}
											>
												{count} {sev}
											</span>
										);
									})}
								</div>
							</div>

							{/* Free finding */}
							{result.free_finding && (
								<div
									className={`p-6 rounded-2xl border-2 ${severityBorder[result.free_finding.severity]}`}
								>
									<div className="flex items-center gap-3 mb-3">
										<span
											className={`px-2 py-0.5 rounded text-white text-xs font-bold ${severityColor[result.free_finding.severity]}`}
										>
											{result.free_finding.severity}
										</span>
										<span className="text-xs text-[#94a3b8]">
											{result.free_finding.category}
										</span>
									</div>
									<h3 className="text-lg font-bold text-[#0f172a] mb-2">
										{result.free_finding.title}
									</h3>
									<p className="text-sm text-[#475569] mb-4">
										{result.free_finding.description}
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div className="bg-white/60 p-3 rounded-lg">
											<p className="font-semibold text-[#0f172a] text-xs mb-1">
												LEGISLATION
											</p>
											<p className="text-[#64748b]">
												{result.free_finding.legislation}
											</p>
										</div>
										<div className="bg-white/60 p-3 rounded-lg">
											<p className="font-semibold text-[#0f172a] text-xs mb-1">
												RECOMMENDED ACTION
											</p>
											<p className="text-[#64748b]">
												{result.free_finding.action}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Locked findings */}
							{result.locked_findings.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider">
										{result.locked_findings.length} More Finding
										{result.locked_findings.length > 1 ? "s" : ""} — Unlock Full
										Report
									</h3>
									{result.locked_findings.map((f, i) => (
										<div
											key={`${f.category}-${i}`}
											className="relative p-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden"
										>
											<div className="flex items-center gap-3">
												<span
													className={`px-2 py-0.5 rounded text-white text-xs font-bold ${severityColor[f.severity]}`}
												>
													{f.severity}
												</span>
												<span className="text-sm font-medium text-[#475569]">
													{f.title}
												</span>
											</div>
											<div className="mt-3 h-8 bg-gradient-to-b from-[#f8fafc]/0 to-[#f8fafc] relative">
												<div className="absolute inset-0 flex items-center justify-center">
													<span className="text-xs text-[#94a3b8] flex items-center gap-1">
														<svg
															className="w-3 h-3"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
																clipRule="evenodd"
															/>
														</svg>
														Details locked
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Unlock CTA */}
							<div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-3xl text-center">
								<h3 className="text-xl font-bold text-white mb-2">
									Unlock Full Automated Report
								</h3>
								<p className="text-[#94a3b8] text-sm mb-6 max-w-md mx-auto">
									Deep AI analysis across 8 PDPA obligations,
									blockchain-anchored evidence, PDF report, and remediation
									steps
								</p>
								<button
									onClick={handleUnlock}
									disabled={unlocking}
									className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-black rounded-xl text-lg transition disabled:opacity-50"
								>
									{unlocking
										? "Redirecting to checkout..."
										: `Unlock Full Report — ${result.unlock_cta.price}`}
								</button>
								<p className="text-[#64748b] text-xs mt-4">
									Secure payment via Stripe. Report delivered in ~15 minutes.
								</p>
							</div>

							{/* Scan again */}
							<div className="text-center">
								<button
									onClick={() => {
										setStep("form");
										setResult(null);
									}}
									className="text-[#10b981] text-sm font-medium hover:underline"
								>
									Scan a different website
								</button>
							</div>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
