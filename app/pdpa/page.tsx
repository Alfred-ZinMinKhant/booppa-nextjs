import Link from 'next/link';
import { Check, Shield } from 'lucide-react';

export const metadata = {
  title: 'PDPA Compliance Singapore | BOOPPA – Automated Data Protection Solution',
  description: 'Complete PDPA compliance for Singapore. FREE basic scan, PRO scan S$69, or ENTERPRISE monitoring S$299/month. Blockchain audit trails included.',
  metadataBase: new URL('https://www.booppa.io'),
};

export default function PDPAPage() {
  return (
    <main className="pt-16 pb-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            PDPA Compliance Made Simple
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Automated PDPA compliance with blockchain-verified audit trails. Choose the plan that fits your needs.
          </p>
        </div>

        {/* Free Scan Callout */}
        <div id="free-scan" className="mb-12">
          <div className="bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded-2xl p-8 border border-teal-700 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Try It Free First</h2>
            <p className="text-gray-300 text-lg mb-6">
              Get a quick compliance snapshot in seconds. No credit card required.
            </p>
            <Link
              href="/qr-scan"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 font-semibold hover:from-teal-600 hover:to-emerald-600 transition"
            >
              Start Free Scan →
            </Link>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Choose Your Plan</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* FREE */}
            <div className="bg-gray-900/30 rounded-2xl p-8 border-2 border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">FREE</h3>
                <p className="text-gray-400">Basic Web Scan</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-white mb-2">S$0</div>
                <p className="text-gray-500">Limited to once/month</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Basic website scan',
                  'Light AI analysis',
                  'Email summary',
                  'No PDF report',
                  'No blockchain proof'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/qr-scan"
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Get Free Scan
              </Link>
            </div>

            {/* PRO - Most Popular */}
            <div className="bg-teal-900/20 rounded-2xl p-8 border-2 border-teal-700 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-teal-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-500/20 rounded-lg mb-4">
                  <Shield className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                <p className="text-gray-400">Per Scan</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-white mb-2">S$69</div>
                <p className="text-gray-500">One-time payment</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Full DeepSeek AI analysis',
                  'Comprehensive PDF report',
                  'Blockchain notarization',
                  'QR verification code',
                  'Court-admissible proof',
                  'Permanent blockchain record'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`${(process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000')}/api/stripe/checkout?product=pdpa_quick_scan`}
                className="block w-full text-center bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Buy Pro Scan
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-purple-900/20 rounded-2xl p-8 border-2 border-purple-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">ENTERPRISE</h3>
                <p className="text-gray-400">Continuous Monitoring</p>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-white mb-2">S$299<span className="text-2xl">/mo</span></div>
                <p className="text-gray-500">Billed monthly</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Continuous vendor monitoring',
                  'Enterprise dashboard',
                  'Multi-vendor tracking',
                  'Automated workflows',
                  'Priority support',
                  'Custom integrations'
                ].map((feature) => (
                  <li key={feature} className="flex items-start text-gray-300">
                    <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`${(process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000')}/api/stripe/checkout?product=pdpa_basic`}
                className="block w-full text-center bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose BOOPPA
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/20 rounded-full mb-4">
                <Shield className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Blockchain Verified</h3>
              <p className="text-gray-400">
                All PRO scans are notarized on Polygon blockchain for immutable proof
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">20-Second Results</h3>
              <p className="text-gray-400">
                Get instant compliance insights without waiting hours or days
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                📄
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Court-Admissible</h3>
              <p className="text-gray-400">
                PRO reports include cryptographic proof acceptable in legal proceedings
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start with a Free Scan
            </h3>
            <p className="text-gray-400 mb-6">
              Not sure which plan is right for you? Try our free scan first to see what PDPA compliance looks like for your website.
            </p>
            <Link
              href="/qr-scan"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 font-semibold hover:from-teal-600 hover:to-emerald-600 transition"
            >
              Get Started Free →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
