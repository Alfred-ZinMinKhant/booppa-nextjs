"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Shield,
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
	LayoutDashboard,
} from "lucide-react";

const LINKS: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
	{ href: "/vendor/dashboard",     label: "Dashboard",          Icon: LayoutDashboard },
	{ href: "/vendor/profile",       label: "Profile",            Icon: UserCircle2 },
	{ href: "/vendor/subscription",  label: "Subscription",       Icon: Layers },
	{ href: "/vendor/evidence",      label: "Evidence",           Icon: Archive },
	{ href: "/vendor/compliance-locker", label: "Compliance Locker", Icon: LockKeyhole },
	{ href: "/vendor/remediations",  label: "Remediations",       Icon: ListChecks },
	{ href: "/vendor/achievements",  label: "Achievements",       Icon: Award },
	{ href: "/vendor/api-keys",      label: "API Keys",           Icon: Key },
	{ href: "/vendor/webhooks",      label: "Webhooks",           Icon: Webhook },
	{ href: "/vendor/sso",           label: "SSO",                Icon: Shield },
	{ href: "/vendor/subsidiaries",  label: "Subsidiaries",       Icon: Building2 },
	{ href: "/vendor/trm",           label: "MAS TRM",            Icon: FileText },
	{ href: "/vendor/referrals",     label: "Referrals",          Icon: UserPlus },
];

export default function VendorPageNav() {
	const pathname = usePathname();
	return (
		<nav
			aria-label="Vendor pages"
			className="sticky top-0 z-30 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/60"
		>
			<div className="max-w-7xl mx-auto px-6 py-2.5 relative">
				<div className="pointer-events-none absolute left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-neutral-950 to-transparent z-10" />
				<div className="pointer-events-none absolute right-6 top-0 bottom-0 w-6 bg-gradient-to-l from-neutral-950 to-transparent z-10" />
				<div
					className="flex gap-1.5 overflow-x-auto whitespace-nowrap"
					style={{
						scrollbarWidth: "none",
						msOverflowStyle: "none",
					}}
				>
					<style jsx>{`
						div::-webkit-scrollbar { display: none; }
					`}</style>
					{LINKS.map(({ href, label, Icon }) => {
						const active = pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));
						return (
							<Link
								key={href}
								href={href}
								aria-current={active ? "page" : undefined}
								className={`shrink-0 rounded-md transition px-2.5 py-1.5 flex items-center gap-1.5 text-[12px] font-medium ${
									active
										? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
										: "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
								}`}
							>
								<Icon className={`h-3.5 w-3.5 ${active ? "text-emerald-400" : "text-neutral-500"}`} />
								<span>{label}</span>
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
