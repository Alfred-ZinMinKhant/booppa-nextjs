import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Procurement Intelligence — Booppa",
  description:
    "Free vendor verification, comparison, and AGO-auditable evaluation tools for Singapore government procurement officers.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Booppa Government Procurement Programme",
    description:
      "Verify Singapore vendors on the blockchain. Compare procurement readiness. Export AGO-auditable shortlists. Free for .gov.sg users.",
    url: "https://booppa.io/government",
    siteName: "Booppa",
    locale: "en_SG",
    type: "website",
  },
};

export { default } from "@/components/government/GovernmentLandingPage";
