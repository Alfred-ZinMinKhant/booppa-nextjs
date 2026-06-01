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
  notarization_addon_1: {
    id: 'notarization_addon_1',
    name: 'Extra Notarization',
    description: 'Top-up — 1 additional notarization when your plan allowance runs out',
    price: 29,
    currency: 'SGD',
    type: 'one-time',
    features: [
      '1 additional notarization credit',
      'Stacks on top of your monthly allowance',
      'On-chain timestamped evidence (Polygon)',
      'Never expires',
    ],
  },
  compliance_notarization_10: {
    id: 'compliance_notarization_10',
    name: 'Small Batch',
    description: '10 notarizations / month — SGD 39 each',
    price: 390,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in Single Document',
      '10 notarizations / month',
      'SGD 39/doc effective (43% off single)',
      'Batch upload (up to 10 files at once)',
      'Consolidated certificate',
      'API access for automation',
      '3-month evidence retention',
    ],
  },
  compliance_notarization_50: {
    id: 'compliance_notarization_50',
    name: 'Enterprise Batch',
    description: '50 notarizations / month — SGD 35 each',
    price: 1750,
    currency: 'SGD',
    type: 'subscription',
    badge: 'Best Value',
    features: [
      'Everything in Small Batch',
      '50 notarizations / month',
      'SGD 35/doc effective (49% off single)',
      'Priority processing (< 1 hour)',
      'Dashboard reporting',
      'Webhook notifications',
      '12-month evidence retention',
      'Dedicated support',
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
    price: 299,
    priceAnnual: 2990,
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
    price: 2990,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 249.17/mo effective (save SGD 598)',
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
    name: 'Buyer Essentials',
    description: 'The first step toward structured vendor due diligence — for SMEs, agencies, and individual procurement officers',
    price: 149,
    priceAnnual: 1520,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Quick Scan on 10 vendors/month (L1: ACRA + MAS watchlist + PDPA flag)',
      'Compliance overview dashboard with traffic-light status',
      'Automatic alerts when a scanned vendor enters critical status',
      'Vendor Network directory with advanced filters (sector, size, certifications)',
      'CSV export of scan results for internal tender spreadsheets',
      '1 user seat included',
      '1 notarization / month',
    ],
  },
  buyer_starter_annual: {
    id: 'buyer_starter_annual',
    name: 'Buyer Essentials (Annual)',
    description: 'Annual Buyer Essentials — save 15%',
    price: 1520,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 126.67/mo effective (save SGD 268)',
    ],
  },
  buyer_pro_monthly: {
    id: 'buyer_pro_monthly',
    name: 'Buyer Professional',
    description: 'Complete due diligence for structured procurement teams',
    price: 399,
    priceAnnual: 4070,
    currency: 'SGD',
    type: 'subscription',
    badge: 'Most Popular',
    features: [
      '50 Quick Scans + Deep Scan on 20 vendors/month (L2: 8-dimension PDPA + certifications + financial risk)',
      'Compliance drift tracking with automatic change alerts',
      'Advanced vendor comparison engine (side-by-side across Deep Scan parameters)',
      'Customisable risk-scoring weights per category',
      'Exportable Deep Scan PDF reports for shortlists and tender minutes',
      'Team collaboration — 3 seats with viewer / analyst / admin permissions',
      'Webhook integrations (email, Slack, Teams)',
      '5 notarizations / month',
    ],
  },
  buyer_pro_annual: {
    id: 'buyer_pro_annual',
    name: 'Buyer Professional (Annual)',
    description: 'Annual Buyer Professional — save 15%',
    price: 4070,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 339.17/mo effective (save SGD 718)',
    ],
  },
  buyer_enterprise_monthly: {
    id: 'buyer_enterprise_monthly',
    name: 'Buyer Enterprise',
    description: 'Audit-ready for enterprise supply chains and MAS-regulated procurement',
    price: 799,
    priceAnnual: 8150,
    currency: 'SGD',
    type: 'subscription',
    features: [
      '100 Quick Scans + 100 Deep Scans across your entire vendor panel',
      'Evidence Scan on 15 vendors/month (L3: blockchain evidence retrieval + complete dossier)',
      'Custom evaluation frameworks (MAS TRM for fintechs, MOH for healthcare, etc.)',
      'On-chain verification log — every scan blockchain-timestamped for immutable proof',
      'Priority compliance support — SLA response < 4 business hours',
      'Multi-subsidiary management for different BUs / legal entities',
      'White-label reports for board and regulator presentations',
      'Unlimited seats with role-based access control (RBAC)',
      'RESTful API + webhooks for ERP integration',
      '20 notarizations / month',
    ],
  },
  buyer_enterprise_annual: {
    id: 'buyer_enterprise_annual',
    name: 'Buyer Enterprise (Annual)',
    description: 'Annual Buyer Enterprise — save 15%',
    price: 8150,
    currency: 'SGD',
    type: 'subscription',
    features: [
      'Everything in monthly',
      'SGD 679.17/mo effective (save SGD 1,438)',
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
