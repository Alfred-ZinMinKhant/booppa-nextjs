/**
 * Pricing — Single Source of Truth for the frontend.
 * Prices here must match app/services/pricing.py on the backend.
 */

export interface Product {
  id: string
  name: string
  description: string
  price: number        // SGD, monthly price for subscriptions
  priceAnnual?: number // SGD annual total (subscriptions only)
  currency: string
  type: 'one-time' | 'bundle' | 'subscription'
  features: string[]
  badge?: string       // Optional label e.g. "Most Popular"
}

// ── One-time products ──────────────────────────────────────────────────────────

export const ONE_TIME_PRODUCTS: Record<string, Product> = {
  vendor_proof: {
    id: 'vendor_proof',
    name: 'Vendor Proof',
    description: 'Verified badge on public profile + procurement trust foundation',
    price: 149,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'Verified badge on public profile',
      'Visible in verified-only buyer searches',
      'complianceScore baseline (30/100)',
      'Embeddable trust badge',
      'CAL engine activated at Level 1',
      'Reachable by Strategy 6 shortlist alerts',
    ],
  },
  pdpa_quick_scan: {
    id: 'pdpa_quick_scan',
    name: 'PDPA Snapshot',
    description: '8-dimension PDPA compliance assessment and blockchain-anchored report',
    price: 79,
    currency: 'SGD',
    type: 'one-time',
    features: [
      '8-dimension PDPA evaluation',
      'Risk severity report',
      'Legislation references',
      'Blockchain timestamp',
      'Downloadable PDF',
      '+8 to +25 pts to complianceScore',
    ],
  },
  compliance_notarization_1: {
    id: 'compliance_notarization_1',
    name: 'Notarization (1 doc)',
    description: 'Single-document blockchain notarization',
    price: 69,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'SHA-256 cryptographic hash',
      'Blockchain timestamp anchor',
      'QR verification link',
      'Progression toward DEEP/CERTIFIED',
      'Polygonscan URL',
    ],
  },
  compliance_notarization_10: {
    id: 'compliance_notarization_10',
    name: 'Notarization (10 docs)',
    description: '10-document notarization pack',
    price: 390,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'Everything in single doc',
      'SGD 39/doc (44% off single)',
      'Batch delivery',
    ],
  },
  compliance_notarization_50: {
    id: 'compliance_notarization_50',
    name: 'Notarization (50 docs)',
    description: '50-document notarization pack',
    price: 1750,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'Everything in single doc',
      'SGD 35/doc (49% off single)',
      'Priority processing',
    ],
  },
  rfp_express: {
    id: 'rfp_express',
    name: 'RFP Express',
    description: 'AI-generated tender readiness kit — delivered in minutes',
    price: 249,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'Tender Readiness Score (0–100)',
      'Structured evidence checklist PDF',
      'Strategy 6 fires — sector shortlist alert',
      'Blockchain-anchored',
      'AutoActivation counter +1',
    ],
  },
  rfp_complete: {
    id: 'rfp_complete',
    name: 'RFP Complete',
    description: 'Full procurement dossier for high-value bids',
    price: 599,
    currency: 'SGD',
    type: 'one-time',
    features: [
      'Full procurement dossier',
      'Enterprise-tier visibility',
      'Multi-sector matching',
      'COMPLETE evidence package tier',
      'AutoActivation counter +1',
    ],
  },
}

// ── Bundle products ────────────────────────────────────────────────────────────

export const BUNDLE_PRODUCTS: Record<string, Product> = {
  vendor_trust_pack: {
    id: 'vendor_trust_pack',
    name: 'Vendor Trust Pack',
    description: 'Complete trust foundation — Vendor Proof + PDPA + 2 Notarizations',
    price: 249,
    currency: 'SGD',
    type: 'bundle',
    badge: '32% off',
    features: [
      'Vendor Proof (SGD 149)',
      'PDPA Snapshot (SGD 79)',
      '2 Notarizations (SGD 138)',
      'Total standalone value: SGD 366',
      'Save SGD 117',
    ],
  },
  rfp_accelerator: {
    id: 'rfp_accelerator',
    name: 'RFP Accelerator',
    description: 'Trust Pack + RFP Express — for vendors with an active tender',
    price: 449,
    currency: 'SGD',
    type: 'bundle',
    badge: 'Most Popular',
    features: [
      'Everything in Vendor Trust Pack',
      'RFP Express (SGD 249)',
      'Total standalone value: SGD 615',
      'Save SGD 166 (27%)',
    ],
  },
  enterprise_bid_kit: {
    id: 'enterprise_bid_kit',
    name: 'Enterprise Bid Kit',
    description: 'Full kit for contracts of SGD 100,000+',
    price: 899,
    currency: 'SGD',
    type: 'bundle',
    badge: '31% off',
    features: [
      'Vendor Trust Pack (SGD 366)',
      'RFP Complete (SGD 599)',
      '5 extra Notarizations (SGD 345)',
      'Total standalone value: SGD 1,310',
      'Save SGD 411 (31%)',
    ],
  },
}

// ── Subscription products ──────────────────────────────────────────────────────

export const SUBSCRIPTION_PRODUCTS: Record<string, Product> = {
  vendor_active_monthly: {
    id: 'vendor_active_monthly',
    name: 'Vendor Active',
    description: 'Monthly profile health checks + competitive alerts',
    price: 39,
    priceAnnual: 390,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Monthly complianceScore health check',
      'Competitor alert when sector peer improves',
      'Shortlist priority in Strategy 1 & 6',
      'Monthly metrics report',
    ],
  },
  vendor_active_annual: {
    id: 'vendor_active_annual',
    name: 'Vendor Active (Annual)',
    description: 'Annual Vendor Active — 2 months free',
    price: 390,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 32.50/mo effective (save SGD 78)',
    ],
  },
  vendor_pro_monthly: {
    id: 'vendor_pro_monthly',
    name: 'Vendor Pro',
    description: 'Compliance visibility and tender intelligence for growing vendors',
    price: 99,
    priceAnnual: 1099,
    currency: 'SGD',
    type: 'subscription',
    badge: 'New',
    features: [
      'Everything in Vendor Active',
      'Quarterly PDPA Snapshot with drift comparison',
      '1 notarization included per month (SGD 69 value)',
      'Tender analytics dashboard (sector trends + forecast)',
      'Competitor awareness — anonymised lookup signals',
      'Priority email support',
    ],
  },
  vendor_pro_annual: {
    id: 'vendor_pro_annual',
    name: 'Vendor Pro (Annual)',
    description: 'Annual Vendor Pro — 2 months free vs monthly',
    price: 1099,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 91.58/mo effective (save SGD 89)',
    ],
  },
  pdpa_monitor_monthly: {
    id: 'pdpa_monitor_monthly',
    name: 'PDPA Monitor',
    description: 'Quarterly automatic re-scans + monthly regulatory alerts',
    price: 49,
    priceAnnual: 490,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Quarterly automatic PDPA re-scan (SGD 79 value)',
      'Monthly PDPC regulatory alert',
      'Running complianceScore chart',
      'Always-current PDF for buyers',
    ],
  },
  pdpa_monitor_annual: {
    id: 'pdpa_monitor_annual',
    name: 'PDPA Monitor (Annual)',
    description: 'Annual PDPA Monitor — 2 months free',
    price: 490,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 40.83/mo effective (save SGD 98)',
    ],
  },
  enterprise_monthly: {
    id: 'enterprise_monthly',
    name: 'Enterprise',
    description: 'Full enterprise compliance suite',
    price: 499,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'All Vendor Active features',
      'All PDPA Monitor features',
      'Dedicated account manager',
      'Custom reporting',
    ],
  },

  // ── Buyer subscriptions (institutional vendor evaluation) ────────────────────
  buyer_starter_monthly: {
    id: 'buyer_starter_monthly',
    name: 'Buyer Starter',
    description: 'Entry-level vendor evaluation for individuals, SMEs, and agencies without IT spend',
    price: 99,
    priceAnnual: 990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      '10 vendor compliance scans / month',
      'Vendor lookup + verified-evidence access',
      'Basic risk signals & complianceScore view',
      'Single user, exportable PDF reports',
    ],
  },
  buyer_starter_annual: {
    id: 'buyer_starter_annual',
    name: 'Buyer Starter (Annual)',
    description: 'Annual Buyer Starter — 2 months free',
    price: 990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 82.50/mo effective (save SGD 198)',
    ],
  },
  buyer_pro_monthly: {
    id: 'buyer_pro_monthly',
    name: 'Buyer Pro',
    description: 'For active buyer teams running ongoing vendor due diligence',
    price: 399,
    priceAnnual: 3990,
    currency: 'SGD',
    type: 'subscription',
    badge: 'Most Popular',
    features: [
      '50 vendor compliance scans / month',
      'Vendor comparison engine',
      'Automated risk scoring & compliance drift tracking',
      'Team collaboration — up to 5 seats',
      'Priority email support',
    ],
  },
  buyer_pro_annual: {
    id: 'buyer_pro_annual',
    name: 'Buyer Pro (Annual)',
    description: 'Annual Buyer Pro — 2 months free',
    price: 3990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 332.50/mo effective (save SGD 798)',
    ],
  },
  buyer_enterprise_monthly: {
    id: 'buyer_enterprise_monthly',
    name: 'Buyer Enterprise',
    description: 'Institutional vendor evaluation with audit-ready evidence',
    price: 999,
    priceAnnual: 9990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      '250 vendor compliance scans / month + unlimited re-runs',
      'On-chain verification logs for every scan',
      'Custom evaluation frameworks',
      'Audit-ready exports + SSO',
      'Priority compliance support',
    ],
  },
  buyer_enterprise_annual: {
    id: 'buyer_enterprise_annual',
    name: 'Buyer Enterprise (Annual)',
    description: 'Annual Buyer Enterprise — 2 months free',
    price: 9990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 832.50/mo effective (save SGD 1,998)',
    ],
  },
  notana_document_monthly: {
    id: 'notana_document_monthly',
    name: 'Notana Document',
    description: 'Notarisation add-on for buyers who need certified vendor documents',
    price: 199,
    currency: 'SGD',
    type: 'subscription',
    badge: 'Add-On',
    features: [
      '10 buyer-initiated notarisations / month',
      'On-chain timestamped evidence (Polygon Amoy)',
      'Attach to any Buyer plan',
      'Independent hash verification report',
    ],
  },
  enterprise_pro_monthly: {
    id: 'enterprise_pro_monthly',
    name: 'Enterprise Pro',
    description: 'Enterprise Pro with priority support',
    price: 1499,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in Enterprise',
      'SLA-backed support',
      'Custom integrations',
      'Quarterly strategy review',
    ],
  },
  tender_intelligence_monthly: {
    id: 'tender_intelligence_monthly',
    name: 'Tender Intelligence',
    description: 'Sector trends, award history, AI bid timing, supplier benchmarking',
    price: 149,
    priceAnnual: 1499,
    currency: 'SGD',
    type: 'subscription',
    badge: 'New',
    features: [
      'Monthly sector trend reports (win-rate by agency × sector × contract size)',
      'Historical award lookup (winners, prices, dates)',
      'AI-driven bid / watch / pass timing per live tender',
      'Per-supplier benchmarking dashboard',
      'Monthly email digest with PDF report',
    ],
  },
  tender_intelligence_annual: {
    id: 'tender_intelligence_annual',
    name: 'Tender Intelligence (Annual)',
    description: 'Annual Tender Intelligence — 2 months free vs monthly',
    price: 1499,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 124.92/mo effective (save SGD 289)',
    ],
  },
}

// ── Combined export ────────────────────────────────────────────────────────────

export const ALL_PRODUCTS: Record<string, Product> = {
  ...ONE_TIME_PRODUCTS,
  ...BUNDLE_PRODUCTS,
  ...SUBSCRIPTION_PRODUCTS,
}

export function getProduct(id: string): Product | undefined {
  return ALL_PRODUCTS[id]
}

export function formatPrice(price: number, currency = 'SGD'): string {
  return `S$${price.toLocaleString()}`
}
