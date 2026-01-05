import Link from 'next/link';
import { Check, Truck, Globe, FileText, BarChart3, Lock } from 'lucide-react';
import Marquee from '@/components/Marquee';

export const metadata = {
  title: 'Compliance Notarization | BOOPPA – Audit-Ready Evidence',
  description: 'Audit-ready, blockchain-anchored evidence for compliance and legal defense. One-time notarization packages available.',
};

const pricingTiers = [
  {
    productType: 'compliance_notarization_1',
    name: 'Single Notarization',
    price: 'SGD 69',
    subtitle: 'One-Time Compliance Evidence',
    features: [
      '1 document notarization',
      'Blockchain-anchored evidence record',
      'Time-stamped audit trail',
      'Verifiable QR reference',
      'Court-admissible integrity proof',
    ],
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    priceColor: 'text-green-400',
  },
  {
    productType: 'compliance_notarization_10',
    name: 'Batch Notarization',
    price: 'SGD 390',
    subtitle: 'Small-Scale Evidence Sets',
    features: [
      '10 document notarizations',
      'Bulk upload capability',
      'Blockchain evidence for each document',
      'API access included',
      '3 months secure data retention',
    ],
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    priceColor: 'text-blue-400',
  },
  {
    productType: 'compliance_notarization_50',
    name: 'Enterprise Notarization',
    price: 'SGD 1,750',
    subtitle: 'High-Volume & Regulated Operations',
    features: [
      '50 document notarizations',
      'Priority processing',
      'Customized compliance reporting dashboard',
      'Dedicated support channel',
      '12 months secure data retention',
    ],
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    priceColor: 'text-purple-400',
  },
];

export default function ComplianceNotarizationPage() {
  const marqueeItems = [
    'Policies', 'Contracts', 'Audit Reports', 'DPAs', 'Supplier Records', 'Incident Reports', 'Delivery Proofs'
  ];

  return (
    <main className="pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">COMPLIANCE NOTARIZATION</h1>
          <p className="text-xl text-gray-300 mb-6">Audit-Ready Evidence for Regulatory and Legal Defense</p>
          <p className="text-gray-400 max-w-3xl mx-auto">Transform compliance documents into verifiable, time-stamped evidence. In regulated environments, documentation alone is not sufficient. What matters is the ability to prove integrity, timing, and origin of compliance records.</p>
          <p className="text-gray-400 max-w-3xl mx-auto mt-4">BOOPPA Compliance Notarization provides immutable, court-defensible evidence for policies, contracts, audits, and supply-chain documentation — secured through cryptographic hashing and blockchain anchoring.</p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">What is Compliance Notarization?</h2>
          <p className="text-gray-400 mb-4">Compliance Notarization converts a document into a verifiable evidence record by:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Generating a cryptographic hash of the document</li>
            <li>Anchoring the hash on a public blockchain (Polygon)</li>
            <li>Producing a time-stamped audit record</li>
            <li>Issuing a verifiable evidence certificate with QR reference</li>
          </ul>
          <p className="text-gray-400 mt-3">At no point is the document content altered or exposed. The result is a tamper-proof proof of existence and integrity, suitable for audits, disputes, and regulatory reviews.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">When is Notarization Required?</h2>
          <p className="text-gray-400 mb-4">Compliance Notarization is commonly used for:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>PDPA and MAS audit documentation</li>
            <li>Internal compliance reports</li>
            <li>Data-processing agreements (DPAs)</li>
            <li>Supplier and vendor compliance records</li>
            <li>Due-diligence and procurement evidence</li>
            <li>Incident reports and remediation proofs</li>
          </ul>
          <p className="text-gray-400 mt-3">It is particularly relevant for organizations operating in Singapore’s regulated and cross-border data environment.</p>
        </section>

        <section id="pricing" className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Notarization Plans</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.productType} className={`${tier.bgColor} p-6 rounded-xl border ${tier.borderColor} flex flex-col` }>
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-black mb-2">{tier.price}</div>
                <p className="text-gray-400 mb-4">{tier.subtitle}</p>
                <ul className="text-gray-300 mb-6 space-y-2">
                  {tier.features.map((f) => <li key={f} className="flex items-start"><Check className="w-5 h-5 text-green-400 mr-3 mt-0.5" />{f}</li>)}
                </ul>
                <Link href={`/api/stripe/checkout?product=${tier.productType}`} className="mt-auto inline-flex items-center justify-center rounded-lg bg-booppa-green px-4 py-2 text-black font-semibold">Buy Now</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Evidence Integrity & Legal Defensibility</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Cryptographic hash verification</li>
            <li>Blockchain timestamp anchoring</li>
            <li>Immutable audit trail</li>
            <li>Independent verification capability</li>
            <li>Exportable evidence files</li>
          </ul>
          <p className="text-gray-400 mt-3">Evidence can be validated independently without BOOPPA access.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Regulatory & Legal Positioning</h2>
          <p className="text-gray-400 mb-3">BOOPPA Notarization is designed to support:</p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>PDPA accountability obligations</li>
            <li>MAS audit readiness</li>
            <li>Internal governance requirements</li>
            <li>Legal dispute preparedness</li>
          </ul>
          <p className="text-gray-400 mt-3">It does not replace legal advice, but strengthens your ability to demonstrate compliance actions and timelines.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Why BOOPPA Notarization</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Built for compliance officers, legal teams, and auditors</li>
            <li>No vendor lock-in for verification</li>
            <li>Evidence remains valid independently of BOOPPA</li>
            <li>Clear pricing, no subscriptions required</li>
          </ul>
          <div className="mt-6">
            <p className="text-gray-400">Need higher volumes or integration? For custom notarization volumes, automated workflows, or API integrations, please <Link href="/demo" className="text-booppa-green">contact us</Link>.</p>
          </div>
        </section>

      </div>
    </main>
  );
}

