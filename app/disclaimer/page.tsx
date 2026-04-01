import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer | Booppa',
  description: 'Important disclaimers about Booppa\'s vendor trust verification services.',
}

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Disclaimer</h1>
          <p className="text-xl text-[#94a3b8]">Version: v17 Hardened &nbsp;·&nbsp; Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] space-y-6 text-[#64748b]">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">General Disclaimer</h2>
              <p>
                The information provided by Booppa (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on our platform is for
                general informational purposes only. All information is provided in good faith;
                however, we make no representation or warranty of any kind, express or implied,
                regarding the accuracy, adequacy, validity, reliability, availability, or completeness
                of any information on the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Not Legal Advice</h2>
              <p>
                Booppa&apos;s vendor trust reports, PDPA compliance assessments, and other outputs are
                automated analyses and do not constitute legal advice. They should not be used as
                a substitute for professional legal counsel. We recommend consulting with qualified
                legal professionals for specific compliance and regulatory matters.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Trust Scores</h2>
              <p>
                Trust scores are calculated using automated AI analysis and publicly available
                information. Scores reflect a point-in-time assessment and may change as new
                information becomes available. A high trust score does not guarantee vendor
                reliability, and a low score does not indicate fraud or misconduct.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Blockchain Notarization</h2>
              <p>
                Blockchain notarization confirms that specific data existed at a specific point in
                time. It does not verify the truthfulness or accuracy of the underlying data. The
                immutability guarantee applies to the hash recorded on-chain, not to interpretations
                of the data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Third-Party Data</h2>
              <p>
                Our platform may incorporate data from third-party sources including public
                registries, government databases, and vendor-submitted information. We are not
                responsible for the accuracy of third-party data and disclaim liability for
                decisions made based on such data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Limitation of Liability</h2>
              <p>
                Under no circumstance shall Booppa be liable for any loss or damage of any kind
                incurred as a result of the use of the platform or reliance on any information
                provided. Your use of the platform and reliance on any information is solely at
                your own risk.
              </p>
            </div>

            <div className="border-t border-[#e2e8f0] pt-6">
              <h2 className="text-xl font-bold text-[#0f172a] mb-2">Non-Reliance & Scope of Use (v17 Hardened)</h2>
              <p className="mb-3">
                By using any Booppa service, you expressly confirm that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  You do not rely, and have not relied, on any Booppa output — including scores,
                  rankings, probability estimates, or reports — for any legal, financial,
                  procurement, or regulatory decision.
                </li>
                <li>
                  Booppa is an information tool and not a legal, compliance, or procurement advisor.
                </li>
                <li>
                  No Booppa output constitutes professional advice of any kind, including legal,
                  financial, regulatory, or compliance advice.
                </li>
                <li>
                  You are solely responsible for all decisions made using or informed by Booppa
                  outputs, and for obtaining independent professional advice where required.
                </li>
              </ul>
              <p className="mt-3 text-sm font-medium text-[#0f172a]">
                This non-reliance clause is a material term of the Booppa Terms of Service (v17 Hardened)
                and your affirmative agreement to it is required to use the platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
