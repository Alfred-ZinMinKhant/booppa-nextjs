import Link from 'next/link';
import { Check, Shield, FileText, Users, Zap } from 'lucide-react';

export const metadata = {
  title: 'PDPA Compliance Singapore | BOOPPA – Automated Data Protection Solution',
  description: 'Complete PDPA compliance for Singapore. Basic: SGD 299/month. Pro: SGD 799/month. Blockchain audit trails, automated consent management.',
};

export default function PDPAPage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            PDPA Compliance Suite
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Automated PDPA compliance with blockchain-verified audit trails. Trusted by 2,800+ Singapore companies.
          </p>
        </div>

        {/* Quick Scan Section */}
        <div id="quick-scan" className="mb-20">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 border border-green-500/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Start with PDPA Quick Scan</h2>
              <p className="text-gray-300 text-lg">
                Get a 12-page compliance gap analysis for your website. <span className="text-green-400 font-bold">38% of customers upgrade to full PDPA Suite within 30 days.</span>
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-green-400 mb-4">SGD 69</div>
              <p className="text-gray-400 mb-6">One-time payment • No subscription</p>
              <Link
                href="/api/stripe/checkout?product=pdpa_quick_scan"
                className="inline-flex items-center justify-center rounded-lg bg-green-500 px-8 py-3 text-lg font-semibold text-white hover:bg-green-600 transition"
              >
                Get Quick Scan Report
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">PDPA Compliance Plans</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">PDPA Basic</h3>
                <p className="text-gray-400">SMEs, Startups, E-commerce</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-blue-400 mb-2">SGD 299<span className="text-2xl">/mo</span></div>
                <p className="text-gray-500">Billed monthly • Cancel anytime</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '500 data-subject requests/month',
                  'Automated consent logs on Polygon',
                  'PDPA dashboard + audit exports',
                  'Template policy + cookie banner',
                  'Email support',
                  'Basic compliance reporting'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/api/stripe/checkout?product=pdpa_basic"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Start Basic Plan
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border-2 border-blue-500/30">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">PDPA Pro</h3>
                <p className="text-gray-400">Regulated Entities, 10+ Employees</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-purple-400 mb-2">SGD 799<span className="text-2xl">/mo</span></div>
                <p className="text-gray-500">Billed monthly • Cancel anytime</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Basic +',
                  'Unlimited data requests',
                  'Automated data mapping',
                  'HR/CRM integration (Workday, Salesforce)',
                  'DPO as a service (4h response)',
                  'Priority audit-ready reports',
                  'SLA 99.5% uptime'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/api/stripe/checkout?product=pdpa_pro"
                className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Start Pro Plan
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">PDPA Enterprise</h3>
                <p className="text-gray-400">Banks, MNCs, Government Organizations</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-black text-white mb-2">Custom Pricing</div>
                <p className="text-gray-500">Annual contracts • Dedicated support</p>
              </div>

              <div className="text-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 px-8 py-3 font-semibold transition"
                >
                  Contact Sales for Enterprise Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
