import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | BOOPPA',
  description: 'Terms of Service for Booppa - includes PDPA and DPO contact information',
};

export default function TermsPage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-200">
        <h1 className="text-3xl font-bold text-white mb-4">Terms of Service</h1>

        <p className="mb-4">Welcome to Booppa.io. These Terms of Service ("Terms") govern your access to and use of Booppa Smart Care LLC's website, automated scanning tools, and DPO Dashboard (collectively, the "Services"). By using our Services you agree to these Terms. If you do not agree, do not use the Services.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Scope of Services</h2>
        <p className="mb-4">Booppa provides technical compliance tools and services to help organisations assess and improve PDPA compliance in Singapore.</p>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li><strong>PDPA Quick Scan</strong> — a one-time technical review and remediation (SGD 69.00).</li>
          <li><strong>Subscription Plans</strong> — ongoing monitoring, consent logging and support (Essential, Pro, Standard Suite, Pro Suite).</li>
          <li><strong>Blockchain Notarization</strong> — optional anchoring of audit artifacts on the Polygon PoS network for tamper-evident proof.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">Payments & Billing</h2>
        <p className="mb-4">All payments are processed via Stripe. Prices and currency (SGD) are displayed at checkout. Annual billing options may include promotional discounts; see the checkout terms for details.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Subscription Management</h2>
        <p className="mb-4">Monthly subscriptions automatically renew at the end of each billing cycle unless cancelled. Failure to pay may result in suspension of monitoring features and access to the DPO Dashboard.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Cancellation & Refunds</h2>
        <p className="mb-4">Because many of our services include immediate technical actions and blockchain notarizations, most purchases are final. Cancellation takes effect at the end of the current billing period. Refunds are handled per the checkout terms and subject to specific plan rules; annual upfront payments may be non-refundable as stated at purchase.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Data Protection & Privacy</h2>
        <p className="mb-4">Your use of the Services is also governed by our <Link href="/privacy" className="underline">Privacy Policy</Link>, which explains how we collect, use and protect personal data and how we maintain consent logs and audit trails.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Limitation of Liability</h2>
        <p className="mb-4">Booppa provides technical assessments and audit-ready evidence to support compliance efforts. However, the ultimate responsibility for legal compliance remains with the Client and its appointed DPO. To the maximum extent permitted by law, Booppa's aggregate liability shall be limited to the fees paid by the client to Booppa in the 12 months preceding the claim; we are not liable for indirect or consequential losses.</p>

        <h2 className="text-xl font-semibold text-white mt-6">PDPA & Enforcement</h2>
        <p className="mb-4">Clients acknowledge that non-compliance with PDPA may result in enforcement action by the PDPC, including financial penalties. Booppa does not assume liability for regulatory penalties imposed on clients for breaches or failures to act on recommendations.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Governing Law</h2>
        <p className="mb-4">These Terms are governed by the laws of Singapore. Disputes will be subject to the exclusive jurisdiction of the Singapore courts unless otherwise agreed in writing.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Contact</h2>
        <p className="mb-4">For questions about these Terms or to contact our Data Protection Officer, email:</p>
        <p className="mb-6 font-medium"><a href="mailto:evidence@booppa.io" className="underline">evidence@booppa.io</a></p>

        <p className="mt-8 text-sm text-gray-400">Last updated: December 2025</p>
      </div>
    </main>
  );
}
