export interface VendorState {
  name: string;
  uen: string | null;
  plan: string;
  trustScore: number;
  verificationDepth: string;
  pdpaLastScan: string | null;
  pdpaReportUrl: string | null;
  pdpaReportId: string | null;
  notarizationCount: number;
  rfpCount: number;
  lastTenderCheck: string | null;
  sectorPercentile: number;
  sector: string;
  openTenders: number;
  govViews7d: number;
  enterpriseViews7d: number;
  competitorElevated: boolean;
  elevatedPeers: number;
  daysToRenewal: number | null;
  activeSubscriptions: string[];
  subscriptions: string[];
}

export interface Alert {
  id: string;
  priority: "critical" | "high" | "opportunity" | "medium" | "low";
  productId: string;
  headline: string;
  detail: string;
  cta: string;
  ctaHref: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  href: string;
  icon: string;
  color: string;
  colorBg: string;
  colorBorder: string;
}

export const PRODUCTS: Record<string, Product> = {
  vendor_proof: {
    id: "vendor_proof",
    name: "Vendor Proof",
    price: "S$149",
    priceNote: "one-time",
    href: "/vendor-proof",
    icon: "\u{1F6E1}",
    color: "#10b981",
    colorBg: "rgba(16,185,129,0.08)",
    colorBorder: "rgba(16,185,129,0.2)",
  },
  notarization: {
    id: "notarization",
    name: "Document Notarization",
    price: "S$69",
    priceNote: "per document",
    href: "/notarization",
    icon: "\u{26D3}",
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.2)",
  },
  rfp_express: {
    id: "rfp_express",
    name: "RFP Express",
    price: "S$249",
    priceNote: "one-time",
    href: "/rfp-acceleration",
    icon: "\u{1F4CB}",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.2)",
  },
  pdpa_scan: {
    id: "pdpa_scan",
    name: "PDPA Snapshot",
    price: "S$79",
    priceNote: "one-time",
    href: "/pdpa",
    icon: "\u{1F50D}",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.08)",
    colorBorder: "rgba(59,130,246,0.2)",
  },
  tender_check: {
    id: "tender_check",
    name: "Tender Win Probability",
    price: "Free",
    priceNote: "with account",
    href: "/tender-check",
    icon: "\u{1F4CA}",
    color: "#06b6d4",
    colorBg: "rgba(6,182,212,0.08)",
    colorBorder: "rgba(6,182,212,0.2)",
  },
  pdpa_monitor: {
    id: "pdpa_monitor",
    name: "PDPA Monitor",
    price: "S$49",
    priceNote: "/month",
    href: "/pricing",
    icon: "\u{1F4E1}",
    color: "#ec4899",
    colorBg: "rgba(236,72,153,0.08)",
    colorBorder: "rgba(236,72,153,0.2)",
  },
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  opportunity: 2,
  medium: 3,
  low: 4,
};

export function generateAlerts(vendor: VendorState): Alert[] {
  const alerts: Alert[] = [];

  // 1. No Vendor Proof
  if (vendor.verificationDepth === "BASIC" || vendor.verificationDepth === "UNVERIFIED") {
    alerts.push({
      id: "vendor_proof_missing",
      priority: "critical",
      productId: "vendor_proof",
      headline: "You are invisible to buyers filtering for verified vendors",
      detail: `${vendor.elevatedPeers} competitors in ${vendor.sector} are already verified. Procurement managers filter by verified-only \u2014 you don\u2019t appear in those results.`,
      cta: "Get Verified \u2014 S$149",
      ctaHref: "/vendor-proof",
    });
  }

  // 2. No PDPA Scan
  if (!vendor.pdpaLastScan) {
    alerts.push({
      id: "pdpa_missing",
      priority: "high",
      productId: "pdpa_scan",
      headline: "No PDPA compliance record on file",
      detail: "Government tenders and MNC procurement require PDPA compliance evidence. Without a scan, your RFP responses are incomplete by default.",
      cta: "Run PDPA Snapshot \u2014 S$79",
      ctaHref: "/pdpa",
    });
  }

  // 3. Open tenders in sector
  if (vendor.openTenders > 0) {
    alerts.push({
      id: "open_tenders",
      priority: "opportunity",
      productId: "tender_check",
      headline: `${vendor.openTenders} GeBIZ tenders open in your sector right now`,
      detail: "Check your win probability before the closing date. Free with your account \u2014 takes 30 seconds.",
      cta: "Check Win Probability",
      ctaHref: "/tender-check",
    });
  }

  // 4. No RFP Kit
  if (vendor.rfpCount === 0 && vendor.openTenders > 3) {
    alerts.push({
      id: "rfp_missing",
      priority: "high",
      productId: "rfp_express",
      headline: "No RFP evidence package \u2014 you can\u2019t respond competitively",
      detail: "GeBIZ agencies expect a structured compliance response. Without an RFP kit, your submissions are scored lower than vendors who have one.",
      cta: "Get RFP Express \u2014 S$249",
      ctaHref: "/rfp-acceleration",
    });
  }

  // 5. No notarization
  if (vendor.notarizationCount === 0 && vendor.verificationDepth !== "UNVERIFIED") {
    alerts.push({
      id: "notarization_missing",
      priority: "medium",
      productId: "notarization",
      headline: "Notarize a key document to reach STANDARD tier",
      detail: "Adding one blockchain-notarized document moves you from BASIC to STANDARD verification \u2014 unlocking priority placement in verified searches.",
      cta: "Notarize a Document \u2014 S$69",
      ctaHref: "/notarization",
    });
  }

  // 6. Competitor elevated
  if (vendor.competitorElevated && vendor.verificationDepth === "BASIC") {
    alerts.push({
      id: "competitor_elevated",
      priority: "medium",
      productId: "notarization",
      headline: `${vendor.elevatedPeers} peers in your sector are now ELEVATED`,
      detail: `Your sector percentile is ${vendor.sectorPercentile}th. ELEVATED vendors appear above you in every buyer search. Gap closes with one notarization.`,
      cta: "Notarize Now \u2014 S$69",
      ctaHref: "/notarization",
    });
  }

  // 7. No PDPA Monitor subscription
  if (vendor.pdpaLastScan && !vendor.subscriptions.includes("pdpa_monitor")) {
    alerts.push({
      id: "pdpa_monitor_upsell",
      priority: "low",
      productId: "pdpa_monitor",
      headline: "Your PDPA scan will expire \u2014 keep it current automatically",
      detail: "Buyers check scan dates. A scan older than 6 months raises flags. PDPA Monitor re-scans quarterly so your report is always fresh.",
      cta: "Subscribe \u2014 S$49/month",
      ctaHref: "/pricing",
    });
  }

  return alerts.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4));
}
