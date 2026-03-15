import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Booppa',
  description: 'Rules and guidelines for using the Booppa platform.',
}

export default function AcceptableUsePage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Acceptable Use Policy</h1>
          <p className="text-xl text-[#94a3b8]">Last updated: March 2026</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] space-y-6 text-[#64748b]">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Overview</h2>
              <p>
                This Acceptable Use Policy governs your use of Booppa&apos;s services, including our
                vendor verification platform, APIs, and related tools. By using our services,
                you agree to comply with this policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Permitted Uses</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Conducting legitimate vendor trust verification</li>
                <li>Generating compliance reports for procurement purposes</li>
                <li>Using our API within documented rate limits</li>
                <li>Embedding verification badges on your website</li>
                <li>Sharing verification results with authorized parties</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Prohibited Uses</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Automated scraping or bulk data extraction without authorization</li>
                <li>Submitting false or misleading information for verification</li>
                <li>Attempting to manipulate trust scores or rankings</li>
                <li>Using the platform to harass, defame, or harm other users or vendors</li>
                <li>Circumventing security measures or access controls</li>
                <li>Reselling or redistributing Booppa reports without authorization</li>
                <li>Using the service in violation of applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">API Usage</h2>
              <p>
                API access is subject to rate limits. Exceeding these limits or using the API
                in a manner that degrades service for other users may result in temporary or
                permanent suspension of access.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Enforcement</h2>
              <p>
                Violations of this policy may result in warnings, temporary suspension, or permanent
                termination of your account. We reserve the right to take appropriate action at our
                discretion to enforce this policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Contact</h2>
              <p>
                To report a violation or for questions, contact{' '}
                <a href="mailto:support@booppa.com" className="text-[#10b981] hover:underline">
                  support@booppa.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
