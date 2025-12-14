
import Link from 'next/link';
import { Check, Truck, Globe, FileText, BarChart3, Lock } from 'lucide-react';
import Marquee from '@/components/Marquee';

export const metadata = {
  title: 'Supply Chain Traceability | BOOPPA – Blockchain Evidence for Logistics',
  description: 'Blockchain-verified evidence for supply chain traceability and compliance. One-time packages: 1, 10, or 50 document notarizations.',
};

const pricingTiers = [
  {
    productType: 'supply_chain_1',
    name: 'Single Document',
    price: 'SGD 69',
    subtitle: 'Quick one-time notarization',
    features: [
      '1 Document notarization',
      'Polygon Blockchain evidence',
      'Court-admissible audit trail',
      'QR code link generation',
    ],
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    priceColor: 'text-green-400',
  },
  {
    productType: 'supply_chain_10',
    name: 'Small Batch',
    price: 'SGD 390',
    subtitle: 'Best for small businesses',
    features: [
      '10 Document notarizations',
      'Polygon Blockchain evidence',
      'Bulk upload capability',
      'API access included',
      '3 months data retention',
    ],
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    priceColor: 'text-blue-400',
  },
  {
    productType: 'supply_chain_50',
    name: 'Enterprise Batch',
    price: 'SGD 1,750',
    subtitle: 'Ideal for ongoing operations',
    features: [
      '50 Document notarizations',
      'Priority processing',
      'Dedicated support channel',
      'Customized reporting dashboard',
      '12 months data retention',
    ],
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    priceColor: 'text-purple-400',
  },
];

export default function SupplyChainPage() {
  const marqueeItems = [
    'Shipping Documents', 'Certificates of Origin', 'Inspection Reports', 
    'Quality Assurance Logs', 'Customs Declarations', 'Proof of Delivery', 
    'ESG Evidence', 'Contract Signatures'
  ];

  return (
    <main className="pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <Truck className="w-12 h-12 text-booppa-green mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Supply Chain Traceability
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Create immutable, Polygon blockchain-verified records for your logistics, ESG, and regulatory filings. Designed to generate court-admissible evidence <span className="italic">(subject to judicial acceptance)</span>.
          </p>
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg bg-booppa-green px-8 py-3 text-lg font-semibold text-black hover:bg-booppa-green/80 transition shadow-lg"
            >
              Book Supply Chain Demo
            </Link>
          </div>
        </div>
        
        {/* Marquee Section */}
        <div className="mb-20">
          <h2 className="text-xl font-semibold text-center text-gray-400 mb-6">Documents We Notarize</h2>
          <Marquee items={marqueeItems} />
        </div>

        {/* Pricing */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">One-Time Document Notarization Packages</h2>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.productType}
                className={`${tier.bgColor} rounded-2xl p-8 border ${tier.borderColor} flex flex-col transition-all hover:shadow-2xl hover:shadow-gray-900`}>
                
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400">{tier.subtitle}</p>
                </div>
                
                <div className="text-center mb-8">
                  <div className={`text-5xl font-black ${tier.priceColor} mb-2`}>{tier.price}</div>
                  <p className="text-gray-500">One-Time Payment</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Links to the configured Stripe Checkout API */}
                <Link
                  href={`/api/stripe/checkout?product=${tier.productType}`}
                  className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition mt-auto"
                >
                  Buy Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Use Blockchain Traceability?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={Lock}
              title="Immutable Evidence"
              description="A blockchain timestamp proves a document existed at a specific time, preventing tampering and manipulation."
            />
            <BenefitCard 
              icon={BarChart3}
              title="Audit Readiness"
              description="Instantly generate comprehensive audit reports for regulatory bodies like MAS, PDPC, or international customs."
            />
            <BenefitCard 
              icon={Globe}
              title="Global Trust"
              description="Leverage the public, decentralized trust of the Polygon blockchain, recognized globally for data integrity."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// Reusable component for benefit cards
function BenefitCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
      <Icon className="w-8 h-8 text-booppa-blue mb-4" />
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
