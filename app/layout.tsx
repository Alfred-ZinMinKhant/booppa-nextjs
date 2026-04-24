import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import LayoutChrome from "@/components/LayoutChrome";
import ConditionalFooter from "@/components/ConditionalFooter";
import CookieBanner from "@/components/CookieBanner";
import CookieSettingsTrigger from "@/components/CookieSettingsTrigger";
import TrackerGate from "@/components/TrackerGate";
import FunnelTracker from "@/components/FunnelTracker";

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-dm-sans",
});

const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-space-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://www.booppa.io"),
	title: "BOOPPA – Blockchain Compliance Evidence | Singapore PDPA & MAS",
	description:
		"Enterprise blockchain compliance for Singapore. PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ companies.",
	keywords:
		"PDPA Singapore, MAS compliance, blockchain evidence, compliance notarization, Singapore compliance",
	openGraph: {
		title: "BOOPPA – Enterprise Blockchain Compliance Platform",
		description:
			"PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ Singapore companies.",
		images: ["/og-image.png"],
	},
	icons: {
		icon: "/favicon_io/favicon.ico",
		shortcut: "/favicon_io/favicon.ico",
	},
	other: {
		"booppa-compliance-verification": "pdpa-compliant-v1",
		"cookie-consent": "booppa-cookie-banner pdpa-compliant",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`scroll-smooth ${dmSans.variable} ${spaceMono.variable}`}
		>
			<body className="antialiased bg-white text-[#1e293b]">
				<LayoutChrome />
				{children}
				<ConditionalFooter />
				<TrackerGate />
				<CookieBanner />
				<CookieSettingsTrigger />
				<FunnelTracker />
			</body>
		</html>
	);
}
