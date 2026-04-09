import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Protection Officer | BOOPPA',
  description: 'Contact Booppa\'s Data Protection Officer — Singapore PDPA · EU/UK GDPR · CCPA. Multi-jurisdiction rights and complaint pathways.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#0f172a] mb-3">{title}</h2>
      <div className="text-[#64748b] space-y-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="ml-4 list-disc">{children}</li>;
}

export default function DPOPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Data Protection Officer</h1>
          <p className="text-sm text-[#10b981] font-medium">Effective Date: March 1, 2026</p>
          <p className="text-xs text-white/40 mt-1">Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
          <p className="text-xs text-white/40 mt-1">Multi-Jurisdiction: Singapore PDPA · EU/UK GDPR · CCPA</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8">

            <Section title="1. DPO Contact Details">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 space-y-2">
                <p className="font-semibold text-[#0f172a]">Data Protection Officer — Booppa Smart Care LLC</p>
                <p><strong className="text-[#0f172a]">Email:</strong> <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a></p>
                <p><strong className="text-[#0f172a]">Legal inquiries:</strong> <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
                <p><strong className="text-[#0f172a]">Postal address:</strong> Booppa Smart Care LLC, 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
                <p className="text-xs text-[#94a3b8] pt-1">Please include your name, jurisdiction (Singapore / EU / UK / US), and the nature of your request in all correspondence.</p>
              </div>
            </Section>

            <Section title="2. EU Representative (Article 27 GDPR)">
              <p>Booppa Smart Care LLC is a US company. Where Booppa is required under Article 27 of the GDPR to designate an EU-based representative for systematic processing of EU residents&apos; personal data, Booppa will designate a representative prior to commencing such processing and update this page accordingly.</p>
              <p>Until such designation is made, EU residents may direct all GDPR inquiries to the DPO at <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a>.</p>
            </Section>

            <Section title="3. DPO Responsibilities">
              <ul className="space-y-1">
                <Li>Overseeing compliance with Singapore&apos;s PDPA 2012 (as amended), EU/UK GDPR, and applicable US state privacy laws</Li>
                <Li>Handling personal data access, correction, erasure, and portability requests</Li>
                <Li>Managing data protection queries, complaints, and investigations</Li>
                <Li>Coordinating data breach notification procedures</Li>
                <Li>Conducting and overseeing Data Protection Impact Assessments (DPIAs) where required</Li>
                <Li>Managing the Data Processing Agreement (DPA) process for Enterprise subscribers</Li>
              </ul>
            </Section>

            <Section title="4. How to Submit a Data Rights Request">
              <p>To exercise any data protection right, email <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a> with the subject line corresponding to your request type:</p>
              <ul className="space-y-1 mt-2">
                <Li><strong className="text-[#0f172a]">Data Access Request</strong> — subject: &quot;Data Access Request&quot;</Li>
                <Li><strong className="text-[#0f172a]">Data Correction / Rectification</strong> — subject: &quot;Data Correction Request&quot;</Li>
                <Li><strong className="text-[#0f172a]">Data Erasure / Right to be Forgotten</strong> — subject: &quot;Erasure Request&quot;</Li>
                <Li><strong className="text-[#0f172a]">Data Portability</strong> — subject: &quot;Data Portability Request&quot;</Li>
                <Li><strong className="text-[#0f172a]">Restriction of Processing</strong> — subject: &quot;Processing Restriction Request&quot;</Li>
                <Li><strong className="text-[#0f172a]">Object to Processing</strong> — subject: &quot;Objection to Processing&quot;</Li>
                <Li><strong className="text-[#0f172a]">Withdraw Marketing Consent</strong> — subject: &quot;Withdraw Marketing Consent&quot;</Li>
                <Li><strong className="text-[#0f172a]">CCPA Request</strong> — subject: &quot;CCPA Request&quot; (email <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a>)</Li>
              </ul>
            </Section>

            <Section title="5. Identity Verification">
              <p>To protect your personal data, Booppa must verify your identity before processing any data rights request. We will request confirmation of:</p>
              <ul className="space-y-1 mt-2">
                <Li>The email address associated with your Booppa account</Li>
                <Li>Your full name and company name as registered</Li>
                <Li>For erasure or portability requests: one additional identifier (e.g., last invoice number or account registration date)</Li>
              </ul>
              <p className="mt-2">We will not process requests where identity cannot be reasonably verified, and will notify you of any verification requirement within 5 business days of receiving your request.</p>
            </Section>

            <Section title="6. Response Timeframes by Jurisdiction">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#e2e8f0] rounded-lg overflow-hidden mt-2">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Jurisdiction</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Standard Response</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#0f172a] border-b border-[#e2e8f0]">Extension</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-2 px-3 font-medium text-[#0f172a]">Singapore (PDPA)</td>
                      <td className="py-2 px-3">30 calendar days</td>
                      <td className="py-2 px-3">30 additional days with notice</td>
                    </tr>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-2 px-3 font-medium text-[#0f172a]">EU/UK (GDPR / UK GDPR)</td>
                      <td className="py-2 px-3">1 month (30 days)</td>
                      <td className="py-2 px-3">Up to 3 months for complex requests with notice within 1 month</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-[#0f172a]">California (CCPA)</td>
                      <td className="py-2 px-3">45 calendar days</td>
                      <td className="py-2 px-3">45 additional days with notice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2">Timeframes begin upon receipt of a verifiable request. We will acknowledge all requests within 5 business days.</p>
            </Section>

            <Section title="7. Rights by Jurisdiction">
              <p><strong className="text-[#0f172a]">Singapore (PDPA 2012, as amended):</strong></p>
              <ul className="space-y-1 mt-1 mb-3">
                <Li>Right to access personal data held about you</Li>
                <Li>Right to correct inaccurate personal data</Li>
                <Li>Right to withdraw consent for processing based on consent</Li>
                <Li>Right to data portability (where technically feasible)</Li>
              </ul>
              <p><strong className="text-[#0f172a]">EU/UK (GDPR Article 15–22 / UK GDPR):</strong></p>
              <ul className="space-y-1 mt-1 mb-3">
                <Li>Right of access (Article 15) — obtain a copy of your personal data</Li>
                <Li>Right to rectification (Article 16) — correct inaccurate data</Li>
                <Li>Right to erasure / &quot;right to be forgotten&quot; (Article 17)</Li>
                <Li>Right to restriction of processing (Article 18)</Li>
                <Li>Right to data portability (Article 20) — receive data in machine-readable format</Li>
                <Li>Right to object to processing based on legitimate interests (Article 21)</Li>
                <Li>Right to withdraw consent at any time (Article 7(3)) without affecting prior lawful processing</Li>
                <Li>Right not to be subject to solely automated decision-making with significant effects (Article 22)</Li>
              </ul>
              <p><strong className="text-[#0f172a]">California (CCPA / CPRA):</strong></p>
              <ul className="space-y-1 mt-1">
                <Li>Right to know what personal information is collected, used, disclosed, or sold</Li>
                <Li>Right to delete personal information</Li>
                <Li>Right to correct inaccurate personal information</Li>
                <Li>Right to opt out of the sale or sharing of personal information</Li>
                <Li>Right to limit use and disclosure of sensitive personal information</Li>
                <Li>Right to non-discrimination for exercising CCPA rights</Li>
              </ul>
              <p className="mt-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">Booppa does not sell personal information as defined under the CCPA/CPRA.</p>
            </Section>

            <Section title="8. Complaint Pathways">
              <p>If you are not satisfied with Booppa&apos;s response to your data rights request, you have the right to lodge a complaint with the relevant supervisory authority:</p>

              <div className="space-y-4 mt-3">
                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <p className="font-semibold text-[#0f172a] text-xs uppercase tracking-wide mb-1">Singapore</p>
                  <p>Personal Data Protection Commission (PDPC)</p>
                  <p className="text-xs mt-1"><a href="https://www.pdpc.gov.sg" className="underline text-[#10b981]" target="_blank" rel="noopener noreferrer">pdpc.gov.sg</a> · complaints@pdpc.gov.sg · +65 6377 3131</p>
                </div>

                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <p className="font-semibold text-[#0f172a] text-xs uppercase tracking-wide mb-1">United Kingdom</p>
                  <p>Information Commissioner&apos;s Office (ICO)</p>
                  <p className="text-xs mt-1"><a href="https://ico.org.uk" className="underline text-[#10b981]" target="_blank" rel="noopener noreferrer">ico.org.uk</a> · casework@ico.org.uk · 0303 123 1113</p>
                </div>

                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <p className="font-semibold text-[#0f172a] text-xs uppercase tracking-wide mb-1">European Union</p>
                  <p>Contact your national data protection supervisory authority. A full list of EU supervisory authorities is available at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="underline text-[#10b981]" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a>.</p>
                </div>

                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <p className="font-semibold text-[#0f172a] text-xs uppercase tracking-wide mb-1">California (CCPA)</p>
                  <p>California Privacy Protection Agency (CPPA)</p>
                  <p className="text-xs mt-1"><a href="https://cppa.ca.gov" className="underline text-[#10b981]" target="_blank" rel="noopener noreferrer">cppa.ca.gov</a> · You may also contact the California Attorney General&apos;s Office.</p>
                </div>
              </div>
            </Section>

            <Section title="9. Data Processing Agreement (DPA)">
              <p>Enterprise and Enterprise Pro subscribers who process personal data subject to GDPR, UK GDPR, or Singapore PDPA on behalf of their own customers may request a Data Processing Agreement (DPA) from Booppa.</p>
              <p>To request a DPA, email <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a> with subject line <strong className="text-[#0f172a]">&quot;DPA Request&quot;</strong>. Booppa will provide the standard DPA within 5 business days.</p>
            </Section>

            <div className="pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8] space-y-1">
              <p>DPO: <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a> · Legal: <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
              <p>Also see: <Link href="/privacy" className="underline text-[#10b981]">Privacy Policy</Link> · <Link href="/cookies" className="underline text-[#10b981]">Cookie Policy</Link> · <Link href="/terms" className="underline text-[#10b981]">Terms of Service</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
