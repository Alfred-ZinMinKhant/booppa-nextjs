/**
 * Canonical SKU list mirroring booppa_backend/tests/fixtures/product_catalog.py
 * and booppa_backend/app/api/stripe_checkout.py:MODE_MAP.
 *
 * If MODE_MAP changes, this list must change too — backend test
 * test_create_session.py will fail if a backend SKU is missing here, but it's
 * still worth keeping the FE catalog in sync to avoid unused-button bugs.
 */
export type ProductFamily = 'one_time' | 'bundle' | 'subscription'
export type StripeMode = 'payment' | 'subscription'

export interface SkuCase {
  productType: string
  mode: StripeMode
  family: ProductFamily
  /** UI surface where the buy button lives (used by per-SKU click tests) */
  buyButtonPath: string
  /** Whether the bundle modal flow (extra inputs) needs to be filled first */
  needsBundleModal?: boolean
  /** Optional RFP description for products that defer when blank */
  rfpDescription?: string
}

export const ONE_TIME: SkuCase[] = [
  { productType: 'pdpa_quick_scan', mode: 'payment', family: 'one_time', buyButtonPath: '/pricing' },
  { productType: 'vendor_proof', mode: 'payment', family: 'one_time', buyButtonPath: '/vendor-proof' },
  { productType: 'rfp_express', mode: 'payment', family: 'one_time', buyButtonPath: '/pricing', rfpDescription: 'Cloud migration for SG retail' },
  { productType: 'rfp_complete', mode: 'payment', family: 'one_time', buyButtonPath: '/pricing', rfpDescription: 'Enterprise CRM revamp' },
  { productType: 'compliance_notarization_1', mode: 'payment', family: 'one_time', buyButtonPath: '/notarization' },
  { productType: 'compliance_notarization_10', mode: 'payment', family: 'one_time', buyButtonPath: '/notarization' },
  { productType: 'compliance_notarization_50', mode: 'payment', family: 'one_time', buyButtonPath: '/notarization' },
]

export const BUNDLES: SkuCase[] = [
  { productType: 'vendor_trust_pack', mode: 'payment', family: 'bundle', buyButtonPath: '/pricing', needsBundleModal: true },
  { productType: 'rfp_accelerator', mode: 'payment', family: 'bundle', buyButtonPath: '/pricing', needsBundleModal: true },
  { productType: 'enterprise_bid_kit', mode: 'payment', family: 'bundle', buyButtonPath: '/pricing', needsBundleModal: true },
  { productType: 'compliance_evidence_pack', mode: 'payment', family: 'bundle', buyButtonPath: '/pricing', needsBundleModal: true },
]

export const SUBSCRIPTIONS: SkuCase[] = [
  'vendor_active_monthly',
  'vendor_active_annual',
  'pdpa_monitor_monthly',
  'pdpa_monitor_annual',
  'enterprise_monthly',
  'enterprise_pro_monthly',
  'standard_suite_monthly',
  'pro_suite_monthly',
  // Legacy buyer keys — retained until backend MODE_MAP cleanup (see PR notes).
  'evaluate_suppliers_monthly',
  'verify_supplier_evidence_monthly',
  'compliance_evidence_monthly',
  // New buyer ladder (replaces legacy keys above) + Notana Document add-on.
  'buyer_starter_monthly',
  'buyer_starter_annual',
  'buyer_pro_monthly',
  'buyer_pro_annual',
  'buyer_enterprise_monthly',
  'buyer_enterprise_annual',
  'notana_document_monthly',
  'tender_intelligence_monthly',
  'tender_intelligence_annual',
  'vendor_pro_monthly',
  'vendor_pro_annual',
].map<SkuCase>((p) => ({
  productType: p,
  mode: 'subscription',
  family: 'subscription',
  buyButtonPath: '/pricing',
}))

export const ALL_SKUS: SkuCase[] = [...ONE_TIME, ...BUNDLES, ...SUBSCRIPTIONS]
