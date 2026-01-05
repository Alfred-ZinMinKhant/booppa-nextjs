import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import TrackerGate from "@/components/TrackerGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BOOPPA – Blockchain Compliance Evidence | Singapore PDPA & MAS",
  description: "Enterprise blockchain compliance for Singapore. PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ companies.",
  keywords: "PDPA Singapore, MAS compliance, blockchain evidence, compliance notarization, Singapore compliance",
  openGraph: {
    title: "BOOPPA – Enterprise Blockchain Compliance Platform",
    description: "PDPA Suite from SGD 299/month. Compliance Suite from SGD 1,299/month. Trusted by 2,800+ Singapore companies.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-black`}>
        <Navigation />
        {children}
        <Footer />
        <TrackerGate />
        <CookieBanner />
      </body>
    </html>
  );
}
