import Link from 'next/link';
import { Check, Shield, Truck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing | BOOPPA – Blockchain Compliance & Traceability',
  description: 'Transparent pricing for PDPA, Compliance, and Compliance Notarization blockchain solutions. One-time and subscription packages for every business size.'
};

const pdpaPlans = [
  {
    name: 'PDPA Pre-Audit Snapshot',
    price: 'SGD 69',
    subtitle: 'One-time PDPA Website Assessment',
    features: [
      'Point-in-time technical assessment of your website against PDPA obligations',
      '12-page compliance gap report identifying risks and missing controls',
      'Timestamped snapshot suitable for internal records',
      'No subscription required',
      'Can be upgraded to full compliance coverage at any time',
    ],
    link: '/api/stripe/checkout?product=pdpa_quick_scan',
    button: 'Get PDPA Snapshot',
    color: 'green',
  },
  {
    name: 'PDPA Operational Compliance – Basic',
    price: 'SGD 299 / month',
    subtitle: 'Ongoing PDPA Coverage for SMEs & Digital Businesses',
    features: [
      'Continuous handling of data-subject requests within PDPA timelines',
      'Automated consent and activity records for audit purposes',
      'Compliance dashboard with exportable audit reports',
      'Standard privacy policy and cookie consent templates',
      'Email support for compliance operations',
      'Periodic compliance reporting for internal review',
    ],
    link: '/api/stripe/checkout?product=pdpa_basic',
    button: 'Start PDPA Basic',
    color: 'blue',
  },
  {
    name: 'PDPA Operational Compliance – Pro',
    price: 'SGD 799 / month',
    subtitle: 'Advanced PDPA Coverage for Regulated & Growing Organizations',
    features: [
      'Unlimited data-subject request handling',
      'Advanced compliance reporting and analytics',
      'Custom integrations with internal systems',
      'Priority support',
      'Automated compliance workflows aligned with PDPA requirements',
    ],
    link: '/api/stripe/checkout?product=pdpa_pro',
    button: 'Start PDPA Pro',
    color: 'purple',
  },
];

const compliancePlans = [
  {
    name: 'Standard Suite',
    price: 'SGD 1,299/mo',
    subtitle: 'Growing Enterprises',
    features: [
      'Everything in PDPA Pro +',
      'MAS compliance automation',
      'Compliance notarization evidence tracking',
      'Real-time compliance dashboard',
      '5,000 blockchain notarizations/month',
      'Advanced audit trail generation',
      'Priority email support',
    ],
    link: '/api/stripe/checkout?product=compliance_standard',
    button: 'Start Standard Suite',
    color: 'purple',
  },
  {
    name: 'Pro Suite',
    price: 'SGD 1,999/mo',
    subtitle: 'Enterprise & Regulated',
    features: [
      'Everything in Standard +',
      'Custom API integrations',
      'Unlimited blockchain notarizations',
      'Dedicated compliance manager',
      '24/7 support',
    ],
    link: '/api/stripe/checkout?product=compliance_pro',
    button: 'Start Pro Suite',
    color: 'pink',
  },
];

const supplyChainPlans = [
  {
    name: 'Single Document',
    price: 'SGD 69',
    subtitle: 'One-time notarization',
    features: [
      '1 Document notarization',
      'Polygon Blockchain evidence',
      'Court-admissible audit trail',
      'QR code link generation',
    ],
    link: '/api/stripe/checkout?product=compliance_notarization_1',
    button: 'Buy Now',
    color: 'green',
  },
  {
    name: 'Small Batch',
    price: 'SGD 390',
    subtitle: '10 documents',
    features: [
      '10 Document notarizations',
      'Bulk upload capability',
      'API access included',
      '3 months data retention',
    ],
    link: '/api/stripe/checkout?product=compliance_notarization_10',
    button: 'Buy Now',
    color: 'blue',
  },
  {
    name: 'Enterprise Batch',
    price: 'SGD 1,750',
    subtitle: '50 documents',
    features: [
      '50 Document notarizations',
      'Priority processing',
      'Dedicated support channel',
      'Customized reporting dashboard',
      '12 months data retention',
    ],
    link: '/api/stripe/checkout?product=compliance_notarization_50',
    button: 'Buy Now',
    color: 'purple',
  },
];

type PlanCardProps = {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  link: string;
  button: string;
  color: string;
};

function PlanCard({ name, price, subtitle, features, link, button, color }: PlanCardProps) {
  return (
    <div className={`bg-gray-900/50 rounded-2xl p-8 border border-gray-800 flex flex-col hover:shadow-2xl hover:shadow-${color}-900 transition-all`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <div className="text-center mb-8">
        <div className={`text-5xl font-black text-${color}-400 mb-2`}>{price}</div>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-start text-gray-300">
            <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={link}
        className={`block w-full text-center bg-${color}-700 hover:bg-${color}-600 text-white font-semibold py-3 px-6 rounded-lg transition mt-auto`}
      >
        {button}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">Audit-Ready Compliance Pricing</h1>
          <p className="text-lg text-gray-300 mb-4">Choose the level of evidence your organization needs. Compliance is not a checklist. It’s the ability to prove what was compliant, when, and how.</p>
          <p className="text-gray-400 mb-6">BOOPPA provides verifiable compliance evidence for PDPA, MAS, and operational requirements — from one-time pre-audit snapshots to full enterprise audit coverage.</p>
          <div className="mt-6">
            <Link href="/api/stripe/checkout?product=pdpa_quick_scan" className="inline-flex items-center justify-center rounded-lg bg-green-400 px-6 py-3 text-lg font-semibold text-black hover:bg-green-300 transition">Start with a PDPA Snapshot – SGD 69</Link>
            <div className="text-sm text-gray-400 mt-2">No subscription • Upgrade anytime</div>
          </div>
          <p className="text-gray-400 mt-6">Every BOOPPA plan produces evidence you can retain, export, and defend.</p>
        </div>
        {/* PDPA Pricing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">BOOPPA Pricing
            <div className="text-sm font-normal text-gray-400 mt-2">Audit-Ready Compliance. Verifiable Evidence. Reduced Risk.</div>
          </h2>
          <p className="text-center text-gray-400 max-w-3xl mx-auto mb-8">Compliance is not about statements. It is about what you can prove — and when. BOOPPA provides automated compliance evidence, designed to help organizations demonstrate PDPA, MAS, and operational compliance with defensible, time-stamped audit trails.</p>
          <h3 className="text-2xl text-white font-semibold text-center mb-6">PDPA Pre-Audit Snapshot & Operational Plans</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pdpaPlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>
        {/* Compliance Suite Pricing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Compliance Suite</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {compliancePlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>
        {/* Supply Chain Pricing */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Supply Chain Evidence Notarization</h2>
          <p className="text-center text-gray-400 mb-6">Court-admissible compliance records for documents & vendors. Independent from PDPA subscriptions.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {supplyChainPlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Final Compliance Message</h3>
            <p className="text-gray-300">BOOPPA does not sell compliance promises. BOOPPA delivers audit-ready evidence. If regulators, partners, banks, or insurers ask “Can you prove this?” — you will have a documented answer.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
