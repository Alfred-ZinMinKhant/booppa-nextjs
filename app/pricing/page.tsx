import Link from 'next/link';
import { Check, Shield, Truck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing | BOOPPA – Blockchain Compliance & Traceability',
  description: 'Transparent pricing for PDPA, Compliance, and Supply Chain blockchain solutions. One-time and subscription packages for every business size.'
};

const pdpaPlans = [
  {
    name: 'Quick Scan',
    price: 'SGD 69',
    subtitle: 'One-time payment',
    features: [
      '12-page compliance gap report',
      'No subscription required',
      'Upgrade to full suite anytime',
    ],
    link: '/api/stripe/checkout?product=pdpa_quick_scan',
    button: 'Get Quick Scan',
    color: 'green',
  },
  {
    name: 'PDPA Basic',
    price: 'SGD 299/mo',
    subtitle: 'SMEs, Startups, E-commerce',
    features: [
      '500 data-subject requests/month',
      'Automated consent logs on Polygon',
      'PDPA dashboard + audit exports',
      'Template policy + cookie banner',
      'Email support',
      'Basic compliance reporting',
    ],
    link: '/api/stripe/checkout?product=pdpa_basic',
    button: 'Start Basic',
    color: 'blue',
  },
  {
    name: 'PDPA Pro',
    price: 'SGD 799/mo',
    subtitle: 'Enterprises, Regulated',
    features: [
      'Unlimited data-subject requests',
      'Advanced reporting & analytics',
      'Custom integrations',
      'Priority support',
      'Full compliance automation',
    ],
    link: '/api/stripe/checkout?product=pdpa_pro',
    button: 'Start Pro',
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
      'Supply chain evidence tracking',
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
    link: '/api/stripe/checkout?product=supply_chain_1',
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
    link: '/api/stripe/checkout?product=supply_chain_10',
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
    link: '/api/stripe/checkout?product=supply_chain_50',
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
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-12 text-center">Pricing</h1>
        {/* PDPA Pricing */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">PDPA Compliance</h2>
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Supply Chain Notarization</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {supplyChainPlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
