import Link from 'next/link';
import { Check, Shield, Globe, Server, Zap, Users } from 'lucide-react';

export const metadata = {
  title: 'Compliance Suite | BOOPPA – Enterprise Regulatory Compliance',
  description: 'Complete compliance automation for MAS, PDPA, and enterprise regulations. Standard: SGD 1,299/month. Pro: SGD 1,999/month.',
  metadataBase: new URL('https://www.booppa.io'),
};

export default function CompliancePage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Compliance Suite
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete regulatory compliance automation for MAS, PDPA, and enterprise requirements.
          </p>
        </div>

        {/* Pricing */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Compliance Suite Plans</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Standard Suite</h3>
                <p className="text-gray-400">Growing Enterprises</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-purple-400 mb-2">SGD 1,299<span className="text-2xl">/mo</span></div>
                <p className="text-gray-500">Billed monthly • Cancel anytime</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Everything in PDPA Pro +',
                  'MAS compliance automation',
                  'Supply chain evidence tracking',
                  'Real-time compliance dashboard',
                  '5,000 blockchain notarizations/month',
                  'Advanced audit trail generation',
                  'Priority email support'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/api/stripe/checkout?product=compliance_standard"
                className="block w-full text-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Start Standard Suite
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border-2 border-purple-500/30">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-lg mb-4">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro Suite</h3>
                <p className="text-gray-400">Enterprise & Regulated Industries</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-pink-400 mb-2">SGD 1,999<span className="text-2xl">/mo</span></div>
                <p className="text-gray-500">Billed monthly • Cancel anytime</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Standard +',
                  'Unlimited blockchain notarizations',
                  'Custom compliance workflows',
                  'Multi-region deployment',
                  'Dedicated account manager',
                  '24/7 priority support',
                  'Custom API integrations',
                  'Quarterly compliance reviews'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/api/stripe/checkout?product=compliance_pro"
                className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Start Pro Suite
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise Suite</h3>
                <p className="text-gray-400">Global Organizations, Financial Institutions</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-black text-white mb-2">Custom Pricing</div>
                <p className="text-gray-500">Annual contracts • On-premise options • Custom SLAs</p>
              </div>

              <div className="text-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-3 font-semibold transition"
                >
                  Contact Sales for Enterprise
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
