import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import TrackerGate from "@/components/TrackerGate";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: "BOOPPA – Blockchain Compliance Evidence | Singapore PDPA & MAS",
  description: "Enterprise blockchain compliance for Singapore. PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ companies.",
  keywords: "PDPA Singapore, MAS compliance, blockchain evidence, compliance notarization, Singapore compliance",
  openGraph: {
    title: "BOOPPA – Enterprise Blockchain Compliance Platform",
    description: "PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ Singapore companies.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: '/favicon_io/favicon.ico',
    shortcut: '/favicon_io/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${dmSans.variable} ${spaceMono.variable}`}>
      <body className="antialiased bg-white text-[#1e293b]">
        <Navigation />
        {children}
        <Footer />
        <TrackerGate />
        <CookieBanner />
      </body>
    </html>
  );
}
