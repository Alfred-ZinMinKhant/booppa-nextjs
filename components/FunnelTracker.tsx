"use client";

import { useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { config, endpoints } from "@/lib/config";

/**
 * FunnelTracker — invisibly tracks page views through the conversion funnel.
 * Place in layout.tsx to auto-track all page navigations.
 */

const STAGE_MAP: Record<string, string> = {
	"/": "VISIT",
	"/vendors": "BROWSE",
	"/compare": "COMPARE",
	"/pricing": "PRICING_VIEW",
	"/trial": "TRIAL_START",
	"/enterprise": "ENTERPRISE_VIEW",
	"/book-demo": "DEMO_REQUEST",
};

function getSessionId(): string {
	if (typeof window === "undefined") return "";
	let sid = sessionStorage.getItem("booppa_sid");
	if (!sid) {
		sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		sessionStorage.setItem("booppa_sid", sid);
	}
	return sid;
}

function FunnelTrackerInner() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const trackEvent = useCallback(
		async (stage: string) => {
			try {
				const sessionId = getSessionId();
				await fetch(`${config.apiUrl}/api/v1${endpoints.funnel.track}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						session_id: sessionId,
						stage,
						source: document.referrer || "direct",
						utm_source: searchParams.get("utm_source") || undefined,
						utm_medium: searchParams.get("utm_medium") || undefined,
						utm_campaign: searchParams.get("utm_campaign") || undefined,
					}),
					keepalive: true,
				});
			} catch {
				// non-blocking
			}
		},
		[searchParams],
	);

	useEffect(() => {
		const stage = STAGE_MAP[pathname];
		if (stage) {
			trackEvent(stage);
		}
	}, [pathname, trackEvent]);

	return null;
}

export default function FunnelTracker() {
	return (
		<Suspense fallback={null}>
			<FunnelTrackerInner />
		</Suspense>
	);
}
