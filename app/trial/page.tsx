"use client";

import React, { useState, Suspense } from "react";
import {
	AlertCircle,
	CheckCircle2,
	Building,
	Shield,
	ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { config } from "@/lib/config";

function TrialContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		email: "",
		company: "",
		uen: "",
		industry: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [accountExists, setAccountExists] = useState(false);
	const [authed, setAuthed] = useState(false);

	React.useEffect(() => {
		fetch('/api/auth/me').then(r => { if (r.ok) setAuthed(true) }).catch(() => {})
	}, []);

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setError("");
		setAccountExists(false);
		try {
			const referralCode = searchParams.get("ref") || searchParams.get("referral_code") || undefined;
			const body: Record<string, string> = {
				email: formData.email,
				full_name: formData.company,
				company: formData.company,
				uen: formData.uen,
				// auto-generate a temp password on the backend
				password: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + "!",
			};
			if (referralCode) body.referral_code = referralCode;

			const response = await fetch(`${config.apiUrl}/api/v1/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await response.json().catch(() => ({}));

			if (response.status === 409) {
				setAccountExists(true);
				setError("An account already exists with this email. Please sign in.");
				return;
			}
			if (!response.ok) {
				setError(data.error || data.detail || "Registration failed. Please try again.");
				return;
			}

			// Track TRIAL_START funnel event
			try {
				const sessionId = sessionStorage.getItem("booppa_sid") || "";
				await fetch(`${config.apiUrl}/api/v1/funnel/track`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ session_id: sessionId, stage: "TRIAL_START" }),
					keepalive: true,
				});
			} catch { /* non-blocking */ }

			setStep(3);
		} catch (e) {
			console.error(e);
			setError("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-neutral-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full mx-auto space-y-8">
				<div className="text-center">
					<h2 className="text-3xl font-bold tracking-tight text-white mb-2">
						Secure Your Vendor Score
					</h2>
					<p className="text-neutral-400">
						Join the decentralized compliance network for enterprises.
					</p>
				</div>

				<div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm">
					<div className="p-6">
						{step === 1 && (
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-neutral-300 mb-2">
										Work Email
									</label>
									<input
										placeholder="you@company.com"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										type="email"
										className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									/>
								</div>
								<button
									className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
									onClick={() => setStep(2)}
									disabled={!formData.email}
								>
									Continue <ArrowRight className="ml-2 h-4 w-4" />
								</button>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-neutral-300 mb-2">
										Company Name
									</label>
									<input
										placeholder="e.g. Acme Corp"
										value={formData.company}
										onChange={(e) =>
											setFormData({ ...formData, company: e.target.value })
										}
										className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-neutral-300 mb-2">
										Company UEN / Registration No.
									</label>
									<input
										placeholder="Optional for international"
										value={formData.uen}
										onChange={(e) =>
											setFormData({ ...formData, uen: e.target.value })
										}
										className="flex h-10 w-full rounded-md border px-3 py-2 text-sm md:text-sm bg-neutral-900 border-neutral-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									/>
								</div>
								<div className="flex space-x-3">
									<button
										className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border h-10 px-4 py-2 w-1/3 bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800"
										onClick={() => setStep(1)}
									>
										Back
									</button>
									<button
										className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-2/3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
										onClick={handleSubmit}
										disabled={isSubmitting || !formData.company}
									>
										{isSubmitting ? "Processing..." : "Start Trial"}
									</button>
								</div>
								{error && (
									<div className="flex items-center gap-2 mt-3 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
										<AlertCircle className="h-4 w-4 flex-shrink-0" />
										<span>{error}</span>
										{accountExists && (
											<a href={authed ? "/vendor/dashboard" : "/login"} className="ml-1 underline font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap">
												{authed ? "Go to Dashboard →" : "Sign in →"}
											</a>
										)}
									</div>
								)}
							</div>
						)}

						{step === 3 && (
							<div className="text-center space-y-6 py-4">
								<div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
									<CheckCircle2 className="h-8 w-8 text-blue-500" />
								</div>
								<div>
									<h3 className="text-xl font-medium text-white mb-2">
										Account Created
									</h3>
									<p className="text-sm text-neutral-400">
										We've emailed your temporary password. You can now access
										your dashboard.
									</p>
								</div>
								<button
									className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
									onClick={() => router.push("/vendor/dashboard")}
								>
									Go to Dashboard
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Feature Context */}
				<div className="grid grid-cols-2 gap-4 mt-8">
					<div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
						<Shield className="h-5 w-5 text-blue-400 mb-2" />
						<h4 className="text-sm font-medium text-white mb-1">
							Blockchain Anchored
						</h4>
						<p className="text-xs text-neutral-400">
							Proofs are mathematically verifiable by procurement.
						</p>
					</div>
					<div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
						<Building className="h-5 w-5 text-emerald-400 mb-2" />
						<h4 className="text-sm font-medium text-white mb-1">
							Enterprise Visibility
						</h4>
						<p className="text-xs text-neutral-400">
							Get discovered by organizations running vendor assessments.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function VendorTrial() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-neutral-900" />}>
			<TrialContent />
		</Suspense>
	);
}
