import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | BOOPPA',
  description: 'Privacy Policy and Data Protection Officer contact for Booppa',
};

export default function PrivacyPage() {
  return (
    <main className="pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-200">
        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>

        <p className="mb-6">Booppa Smart Care LLC ("Booppa", "we", "us" or "our") is committed to protecting the privacy of visitors to our website and users of our services. This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and your rights under Singapore’s Personal Data Protection Act 2012 (PDPA).</p>

        <h2 className="text-xl font-semibold text-white mt-6">Scope</h2>
        <p className="mb-4">This policy applies to personal data collected through our website, applications, services, or provided directly to us by customers, suppliers, job applicants and other business contacts.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Data Protection Officer (DPO)</h2>
        <p className="mb-4">If you have any questions, concerns or requests relating to your personal data (including access, correction or deletion requests), please contact our Data Protection Officer (DPO):</p>
        <p className="mb-6 font-medium"><a href="mailto:evidence@booppa.io" className="underline">evidence@booppa.io</a></p>

        <h2 className="text-xl font-semibold text-white mt-6">Personal Data We Collect</h2>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li>Contact information (name, email, phone)</li>
          <li>Company information (company name, role, industry)</li>
          <li>Transaction and billing details (when you purchase services)</li>
          <li>Technical data (IP address, browser, device and cookies)</li>
          <li>Usage data (pages visited, features used, timestamps)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">How We Use Personal Data</h2>
        <p className="mb-4">We process personal data for the following purposes:</p>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li>To provide and improve our services and customer support;</li>
          <li>To process payments and manage billing;</li>
          <li>To send service-related notifications and reports (including PDPA audit reports);</li>
          <li>To detect, prevent and investigate security incidents and fraud;</li>
          <li>To comply with legal obligations and regulatory requests;</li>
          <li>To maintain audit trails and consent logs to demonstrate lawful basis for processing under PDPA.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">Consent and Cookie Management</h2>
        <p className="mb-4">We obtain consent before loading optional trackers. Our cookie banner provides the options to <strong>Accept All</strong>, <strong>Reject Optional</strong>, or <strong>Settings</strong>. Non-essential third-party trackers (analytics, pixels, marketing) are blocked by default until you provide explicit consent. You may change your preferences at any time via the cookie banner.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Consent Records & Logging</h2>
        <p className="mb-4">We maintain a secure log of consent records that contains:</p>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li>Timestamp of consent</li>
          <li>Anonymized IP address</li>
          <li>Consent status (e.g., "Full Consent", "Necessary Only")</li>
          <li>Privacy Policy version accepted</li>
          <li>Optional metadata (e.g., user agent)</li>
        </ul>
        <p className="mb-4">These records are retained to demonstrate compliance with PDPA and to respond to any regulatory inquiries. Retention may vary by service tier: Essential tier logs are retained for 30 days, while Pro and Suite tiers retain consent and audit logs longer (including unlimited historical retention for Suite where contracted). If you wish to request access to your consent records, please contact the DPO at the email above.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Third-Party Trackers and Integrations</h2>
        <p className="mb-4">We only load third-party trackers (e.g., analytics, advertising, Hotjar, Facebook Pixel, Google Analytics) after obtaining explicit consent. Our front-end implements gating logic: any script that collects personal data or performs cross-site tracking is not executed until <em>Accept All</em> is selected. If you detect a tracker loading without consent, please report it to the DPO immediately.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Data Retention</h2>
        <p className="mb-4">We retain personal data only as long as necessary to fulfill the purposes outlined above, to comply with legal obligations, or to resolve disputes. Retention periods may vary depending on the product tier and contractual agreement:</p>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li>Essential tier: logs retained for 30 days.</li>
          <li>Pro and Suite tiers: extended or unlimited retention as specified in your contract.</li>
        </ul>
        <p className="mb-4">Where local law requires a longer retention period, we will retain data as necessary to comply with those obligations.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Disclosure of Personal Data</h2>
        <p className="mb-4">We do not sell or rent your personal data. We may disclose data to third-party service providers only to fulfill the purposes listed above, for example:</p>
        <ul className="list-disc list-inside mb-4 text-gray-300">
          <li><strong>Stripe</strong>: For secure payment processing.</li>
          <li><strong>Polygon Network</strong>: For public (but hashed/anonymized) on-chain verification.</li>
          <li><strong>Regulatory Authorities</strong>: When required by Singapore law.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">Your Rights</h2>
        <p className="mb-4">Under the PDPA you may request access to or correction of your personal data, withdraw consent, or request deletion where applicable. To exercise these rights, contact our DPO at <a href="mailto:evidence@booppa.io" className="underline">evidence@booppa.io</a>. We will respond to valid requests within a reasonable timeframe and in accordance with PDPA requirements.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Security</h2>
        <p className="mb-4">We implement appropriate technical and organizational measures to protect personal data against unauthorized access, disclosure, alteration or destruction. This includes encryption for data at rest and in transit, access controls, and regular security assessments.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Transfers Outside Singapore</h2>
        <p className="mb-4">Where we transfer personal data outside Singapore (for example to cloud providers or subprocessors), we will ensure appropriate safeguards are in place and that transfers comply with applicable data protection laws.</p>

        <h2 className="text-xl font-semibold text-white mt-6">Contact & Complaints</h2>
        <p className="mb-4">If you have any questions, complaints or wish to exercise your rights, please contact our DPO at:</p>
        <p className="mb-6 font-medium"><a href="mailto:evidence@booppa.io" className="underline">evidence@booppa.io</a></p>

        <p className="mt-8 text-sm text-gray-400">Last updated: December 2025 • Privacy Policy version: 2025-12-22</p>
      </div>
    </main>
  );
}
