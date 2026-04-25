import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Procurement Dashboard — Booppa Government",
  description: "Vendor intelligence dashboard for Singapore government procurement officers.",
  robots: { index: false, follow: false },
};

export { default } from "@/components/government/BuyerDashboard";
