"use client";

import { Suspense, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

				// Persist UTM params in sessionStorage so they survive navigation
				const utmKeys = ["utm_source", "utm_medium", "utm_campaign"] as const;
				utmKeys.forEach((key) => {
					const val = searchParams.get(key);
					if (val) sessionStorage.setItem(`booppa_${key}`, val);
				});

				const utm_source =
					searchParams.get("utm_source") ||
					sessionStorage.getItem("booppa_utm_source") ||
					undefined;
				const utm_medium =
					searchParams.get("utm_medium") ||
					sessionStorage.getItem("booppa_utm_medium") ||
					undefined;
				const utm_campaign =
					searchParams.get("utm_campaign") ||
					sessionStorage.getItem("booppa_utm_campaign") ||
					undefined;

				await fetch('/api/funnel/track', {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						session_id: sessionId,
						stage,
						source: document.referrer || "direct",
						utm_source,
						utm_medium,
						utm_campaign,
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
