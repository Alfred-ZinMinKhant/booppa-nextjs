/**
 * Pricing — Single Source of Truth (matches backend app/services/pricing.py)
 */

export interface Product {
  id: string
  name: string
  description: string
  price: number       // SGD
  currency: string
  features: string[]
}

export const PRODUCTS: Record<string, Product> = {
  'vendor-proof': {
    id: 'vendor-proof',
    name: 'Vendor Proof',
    description: 'Comprehensive vendor trust verification with blockchain notarization',
    price: 149,
    currency: 'SGD',
    features: [
      'AI-powered security scan',
      'Trust score calculation',
      'Blockchain-notarized report',
      'Downloadable PDF certificate',
      'QR verification badge',
    ],
  },
  'pdpa-snapshot': {
    id: 'pdpa-snapshot',
    name: 'PDPA Snapshot',
    description: 'Singapore PDPA compliance assessment and documentation',
    price: 79,
    currency: 'SGD',
    features: [
      'PDPA compliance check',
      'Data protection assessment',
      'Gap analysis report',
      'Remediation recommendations',
    ],
  },
  'notarization': {
    id: 'notarization',
    name: 'Notarization',
    description: 'Blockchain evidence notarization for compliance records',
    price: 69,
    currency: 'SGD',
    features: [
      'Immutable blockchain record',
      'Timestamped evidence package',
      'Verification portal link',
      'Legal-grade proof',
    ],
  },
  'rfp-express': {
    id: 'rfp-express',
    name: 'RFP Express',
    description: 'AI-accelerated RFP response generation',
    price: 249,
    currency: 'SGD',
    features: [
      'AI-generated RFP responses',
      'Compliance mapping',
      'Export to PDF/Word',
      '3 RFP credits',
    ],
  },
  'rfp-complete': {
    id: 'rfp-complete',
    name: 'RFP Complete',
    description: 'Full RFP lifecycle management with AI assistance',
    price: 599,
    currency: 'SGD',
    features: [
      'Everything in Express',
      'Unlimited RFP credits',
      'Vendor comparison matrix',
      'Procurement workflow',
      'Priority support',
    ],
  },
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS[id]
}

export function formatPrice(price: number, currency = 'SGD'): string {
  return `S$${price}`
}
