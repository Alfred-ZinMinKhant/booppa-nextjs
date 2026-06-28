"use client";

import {
	Menu,
	X,
	ChevronDown,
	LayoutDashboard,
	ShieldCheck,
	FileText,
	Search,
	LogOut,
	User,
	Lock,
	Network,
	FileCheck,
} from "lucide-react";
import { config } from "@/lib/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const vendorLinks = [
	{ name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
	{ name: "My Profile", href: "/profile", icon: User },
	{ name: "Compliance Locker", href: "/vendor/compliance-locker", icon: Lock },
	{ name: "Vendor Proof", href: "/vendor-proof", icon: ShieldCheck },
	{ name: "Notarization", href: "/notarization", icon: FileText },
	{ name: "PDPA Scan", href: "/pdpa", icon: ShieldCheck },
	{ name: "Tender Check", href: "/tender-check", icon: Search },
];

const procurementLinks = [
	{ name: "Dashboard", href: "/procurement/dashboard", icon: LayoutDashboard },
	{ name: "My Profile", href: "/profile", icon: User },
	{ name: "Supply Chain Risk", href: "/supply-chain", icon: Network },
	{ name: "Compliance Locker", href: "/vendor/compliance-locker", icon: Lock },
	{ name: "Verify Vendor", href: "/verify", icon: ShieldCheck },
	{ name: "Browse Vendors", href: "/vendors", icon: Search },
	{ name: "Compare Vendors", href: "/compare", icon: FileText },
];

// Protected route prefixes — unauthenticated users must be redirected to /login
const PROTECTED = ["/vendor", "/procurement"];

export default function Navigation() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [userOpen, setUserOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [authed, setAuthed] = useState<boolean | null>(null);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [hasClaimedProfile, setHasClaimedProfile] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [showComplianceLink, setShowComplianceLink] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const userDropdownRef = useRef<HTMLDivElement>(null);

	// Scroll shadow
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Check auth state and fetch user info
	useEffect(() => {
		fetch("/api/auth/me")
			.then(async (r) => {
				if (r.ok) {
					const data = await r.json().catch(() => ({}));
					setAuthed(true);
					setUserEmail(data.email || null);
					setUserRole(data.role || "VENDOR");
					setHasClaimedProfile(!!data.has_claimed_profile);
					setIsVerified(!!data.is_verified);
				} else {
					setAuthed(false);
					setUserEmail(null);
					const onProtected = PROTECTED.some(
						(p) => pathname === p || pathname?.startsWith(p + "/"),
					);
					if (onProtected) router.push("/login");
				}
			})
			.catch(() => {
				setAuthed(false);
				setUserEmail(null);
			});
	}, [pathname, router]);

	// Poll session
	useEffect(() => {
		const checkSession = () => {
			fetch("/api/auth/me")
				.then((r) => {
					if (!r.ok) {
						setAuthed(false);
						setUserEmail(null);
						setUserRole(null);
					}
				})
				.catch(() => {});
		};
		const id = setInterval(checkSession, 5 * 60 * 1000);
		return () => clearInterval(id);
	}, []);

	// Close user dropdown on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(e.target as Node)
			) {
				setUserOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
		setAuthed(false);
		router.push("/login");
	};

	// Show "Compliance Cover Sheet" in dropdown only for users who own a Compliance
	// Evidence Pack (have an unused CE credit, a pending cover sheet, or already
	// uploaded a signed copy). Cheap to call — public endpoint keyed by email.
	useEffect(() => {
		if (!userEmail) {
			setShowComplianceLink(false);
			return;
		}
		fetch(`${config.apiUrl}/api/v1/compliance/cover-sheet/status?email=${encodeURIComponent(userEmail)}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (!data) return;
				setShowComplianceLink(
					!!(data.credits > 0 || data.pending_cover_sheet || data.signed_uploaded || data.cover_sheet?.ready),
				);
			})
			.catch(() => {});
	}, [userEmail]);

	const baseMenu = userRole === "PROCUREMENT" ? procurementLinks : vendorLinks;
	const menuLinks = showComplianceLink
		? [
				...baseMenu,
				{ name: "Compliance Cover Sheet", href: "/compliance/cover-sheet", icon: FileCheck },
		  ]
		: baseMenu;

	return (
		<>
			<header
				className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b border-white/10 ${scrolled ? "bg-[#0f172a]/95 shadow-md" : "bg-[#0f172a]"}`}
			>
				<nav className="mx-auto max-w-[1400px] px-6 py-4 lg:px-8">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2 flex-shrink-0">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/logo.png" alt="BOOPPA" className="h-8 w-auto" />
						</Link>

						{/* Desktop links */}
						<div className="hidden lg:flex items-center gap-x-8">
							<Link
								href="/"
								className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								Home
							</Link>

							<Link
								href="/solutions/vendors"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/solutions/vendors") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								For Vendors
							</Link>

							<Link
								href="/solutions/procurement"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/solutions/procurement") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								For Buyers
							</Link>

							<Link
								href="/solutions/enterprise"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/solutions/enterprise") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								For Enterprise
							</Link>

							<Link
								href="/csp"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/csp") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								For CSP
							</Link>

							<Link
								href="/opportunities"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/opportunities") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								Vendor Opportunities
							</Link>

							<Link
								href="/pricing"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/pricing") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								Pricing
							</Link>

							<Link
								href="/notarization"
								className={`text-sm font-medium transition-colors ${pathname?.startsWith("/notarization") ? "text-[#10b981]" : "text-white/80 hover:text-white"}`}
							>
								Notarization
							</Link>
						</div>

						{/* Desktop auth actions */}
						<div className="hidden lg:flex items-center gap-3">
							{authed === true ? (
								<div className="relative" ref={userDropdownRef}>
									<button
										type="button"
										onClick={() => setUserOpen((o) => !o)}
										className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
									>
										<div className="h-6 w-6 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
											<User className="h-3.5 w-3.5 text-[#10b981]" />
										</div>
										<span className="text-sm font-medium text-white/80 max-w-[140px] truncate">
											{userEmail ? userEmail.split("@")[0] : "My Account"}
										</span>
										<ChevronDown
											className={`h-3.5 w-3.5 text-white/50 transition-transform ${userOpen ? "rotate-180" : ""}`}
										/>
									</button>

									{userOpen && (
										<div className="absolute top-full right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
											<div className="px-4 py-3 border-b border-white/10">
												<p className="text-xs text-white/40">Signed in as</p>
												<p className="text-sm text-white font-medium truncate">
													{userEmail ||
														(userRole === "PROCUREMENT"
															? "Procurement"
															: "Vendor")}
												</p>
											</div>

											<div className="py-1">
												{menuLinks.map(({ name, href, icon: Icon }) => (
													<Link
														key={href}
														href={href}
														onClick={() => setUserOpen(false)}
														className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
															pathname?.startsWith(href)
																? "text-[#10b981] bg-[#10b981]/10"
																: "text-white/80 hover:bg-white/5 hover:text-white"
														}`}
													>
														<Icon className="h-4 w-4 flex-shrink-0 opacity-70" />
														{name}
													</Link>
												))}
											</div>

											<div className="border-t border-white/10 py-1">
												<button
													type="button"
													onClick={() => {
														setUserOpen(false);
														handleLogout();
													}}
													className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors"
												>
													<LogOut className="h-4 w-4 flex-shrink-0" />
													Sign Out
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<>
									<Link
										href="/login"
										className="text-sm font-medium text-white/80 hover:text-white transition-colors"
									>
										Sign In
									</Link>
									{!hasClaimedProfile && (
										<Link
											href="/auth/register"
											className="px-4 py-2 bg-[#10b981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors"
										>
											Claim your Profile
										</Link>
									)}
								</>
							)}
						</div>

						{/* Mobile hamburger */}
						<button
							type="button"
							className="lg:hidden -m-2.5 p-2.5 text-gray-400"
							onClick={() => setMobileOpen((o) => !o)}
						>
							<span className="sr-only">
								{mobileOpen ? "Close menu" : "Open menu"}
							</span>
							{mobileOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</nav>
			</header>

			{/* Mobile drawer */}
			{mobileOpen && (
				<>
					<button
						type="button"
						aria-label="Close menu"
						className="fixed inset-0 z-[996] bg-black/80 cursor-default"
						onClick={() => setMobileOpen(false)}
					/>
					<div className="fixed inset-0 z-[997] flex flex-col bg-[#0f172a] px-6 py-6 overflow-y-auto">
						<div className="flex items-center justify-between mb-8">
							<Link href="/" onClick={() => setMobileOpen(false)}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src="/logo.png" alt="BOOPPA" className="h-8 w-auto" />
							</Link>
							<button
								type="button"
								className="-m-2.5 p-2.5 text-gray-400"
								onClick={() => setMobileOpen(false)}
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						<div className="space-y-1">
							<MobileLink
								href="/"
								label="Home"
								active={pathname === "/"}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/solutions/vendors"
								label="For Vendors"
								active={pathname?.startsWith("/solutions/vendors")}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/solutions/procurement"
								label="For Buyers"
								active={pathname?.startsWith("/solutions/procurement")}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/solutions/enterprise"
								label="For Enterprise"
								active={pathname?.startsWith("/solutions/enterprise")}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/csp"
								label="For CSP"
								active={pathname?.startsWith("/csp")}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/opportunities"
								label="Vendor Opportunities"
								active={pathname?.startsWith("/opportunities")}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/pricing"
								label="Pricing"
								active={pathname === "/pricing"}
								close={() => setMobileOpen(false)}
							/>
							<MobileLink
								href="/notarization"
								label="Notarization"
								active={pathname?.startsWith("/notarization")}
								close={() => setMobileOpen(false)}
							/>

							<div className="pt-6 border-t border-white/10 space-y-1">
								{authed === true ? (
									<>
										<div className="px-3 py-2 mb-1">
											<p className="text-xs text-white/40">Signed in as</p>
											<p className="text-sm text-white font-medium truncate">
												{userEmail ||
													(userRole === "PROCUREMENT"
															? "Procurement"
															: "Vendor")}
											</p>
										</div>
										{menuLinks.map(({ name, href }) => (
											<MobileLink
												key={href}
												href={href}
												label={name}
												active={pathname?.startsWith(href)}
												close={() => setMobileOpen(false)}
											/>
										))}
										<button
											type="button"
											onClick={() => {
												setMobileOpen(false);
												handleLogout();
											}}
											className="-mx-3 block w-full text-left rounded-lg px-3 py-3 text-base font-semibold text-white/50 hover:bg-white/5 transition-colors"
										>
											Sign Out
										</button>
									</>
								) : (
									<>
										<MobileLink
											href="/login"
											label="Sign In"
											active={pathname === "/login"}
											close={() => setMobileOpen(false)}
										/>
										{!hasClaimedProfile && (
											<MobileLink
												href="/auth/register"
												label="Claim your Profile"
												active={false}
												close={() => setMobileOpen(false)}
												highlight
											/>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}

function MobileLink({
	href,
	label,
	active,
	close,
	highlight,
}: {
	href: string;
	label: string;
	active?: boolean | null;
	close: () => void;
	highlight?: boolean;
}) {
	return (
		<Link
			href={href}
			onClick={close}
			className={`-mx-3 block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
				highlight
					? "text-[#10b981] bg-[#10b981]/10"
					: active
						? "text-[#10b981] bg-white/5"
						: "text-white hover:bg-white/5"
			}`}
		>
			{label}
		</Link>
	);
}
