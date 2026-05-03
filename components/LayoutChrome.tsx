"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import GebizTicker from "./GebizTicker";
import Footer from "./Footer";
import StickyClaimCTA from "./StickyClaimCTA";

// Routes that render as standalone pages — no global nav/footer/ticker
const STANDALONE = ["/government", "/admin"];

export default function LayoutChrome() {
	const pathname = usePathname();
	if (STANDALONE.some((r) => pathname?.startsWith(r))) return null;
	return (
		<>
			<Navigation />
			<GebizTicker />
			<StickyClaimCTA />
		</>
	);
}
