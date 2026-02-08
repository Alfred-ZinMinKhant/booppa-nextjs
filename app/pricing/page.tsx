import Link from 'next/link';
import { Check, Shield, Truck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing | BOOPPA – Blockchain Compliance & Traceability',
  description: 'Simple, transparent pricing for PDPA compliance. Choose from Free basic scan, Pro blockchain notarization, or Enterprise continuous monitoring.'
};

const pricingTiers = [
  {
    name: 'FREE',
    price: 'S$0',
    subtitle: 'Basic Web Scan',
    features: [
      'Basic web scan analysis',
      'Light AI compliance summary',
      'Delivered via email',
      'No PDF report',
      'No blockchain notarization',
      'Limited to once per month per email',
    ],
    link: '/qr-scan',
    button: 'Get Free Scan',
    color: 'gray',
    bgColor: 'bg-gray-900/30',
    borderColor: 'border-gray-700',
  },
  {
    name: 'PRO',
    price: 'S$69',
    subtitle: 'Per Scan',
    features: [
      'Full DeepSeek AI analysis',
      'Comprehensive PDF compliance report',
      'Blockchain notarization on Polygon',
      'QR code for verification',
      'Court-admissible audit trail',
      'Permanent blockchain proof',
    ],
    link: `${(process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000')}/api/stripe/checkout?product=pdpa_quick_scan`,
    button: 'Buy Pro Scan',
    color: 'teal',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-700',
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: 'S$299',
    subtitle: 'Per Month',
    features: [
      'Continuous vendor monitoring',
      'Enterprise compliance dashboard',
      'Multi-vendor tracking & alerts',
      'Automated compliance workflows',
      'Priority support',
      'Custom integrations available',
    ],
    link: `${(process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000')}/api/stripe/checkout?product=pdpa_basic`,
    button: 'Contact Sales',
    color: 'purple',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-700',
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
  bgColor: string;
  borderColor: string;
  popular?: boolean;
};

function PlanCard({ name, price, subtitle, features, link, button, bgColor, borderColor, popular }: PlanCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-8 border-2 ${borderColor} flex flex-col hover:shadow-2xl transition-all relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-black px-4 py-1 rounded-full text-sm font-bold">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <div className="text-center mb-8">
        <div className="text-5xl font-black text-white mb-2">{price}</div>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-start text-gray-300">
            <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={link}
        className={`block w-full text-center ${
          popular 
            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600' 
            : 'bg-gray-700 hover:bg-gray-600'
        } text-white font-semibold py-3 px-6 rounded-lg transition mt-auto`}
      >
        {button}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="pt-16 pb-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            Choose the compliance solution that fits your needs
          </p>
          <p className="text-gray-400">
            From free basic scans to enterprise-grade continuous monitoring
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {pricingTiers.map((tier) => (
            <PlanCard key={tier.name} {...tier} />
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-2">
                What's included in the free scan?
              </h3>
              <p className="text-gray-400">
                The free tier includes a basic website scan with light AI analysis. You'll receive a compliance summary via email. Perfect for getting started, but limited to once per month per email address.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-2">
                Why choose Pro over Free?
              </h3>
              <p className="text-gray-400">
                Pro ($69) gives you a comprehensive PDF report with full DeepSeek AI analysis, plus blockchain notarization for court-admissible proof. It's a one-time payment with permanent blockchain evidence.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-2">
                When should I consider Enterprise?
              </h3>
              <p className="text-gray-400">
                Enterprise is ideal for organizations that need continuous compliance monitoring across multiple vendors, automated workflows, and a centralized dashboard. At $299/month, it includes priority support and custom integrations.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-2">
                What is blockchain notarization?
              </h3>
              <p className="text-gray-400">
                We record a cryptographic proof of your compliance report on the Polygon blockchain. This creates an immutable, timestamped record that can be independently verified and is court-admissible as evidence.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded-2xl p-8 border border-teal-700">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start with a Free Scan Today
            </h3>
            <p className="text-gray-300 mb-6">
              Get instant insights into your PDPA compliance status. No credit card required.
            </p>
            <Link 
              href="/qr-scan" 
              className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-600 transition"
            >
              Get Free Scan →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
