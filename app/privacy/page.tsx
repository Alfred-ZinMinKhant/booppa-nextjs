import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | BOOPPA',
  description: 'Privacy Policy for Booppa Smart Care LLC — Singapore PDPA · EU/UK GDPR · CCPA. Effective March 1, 2026.',
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#10b981] font-medium">v17 Hardened · Effective Date: March 1, 2026</p>
          <p className="text-xs text-white/40 mt-1">Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
          <p className="text-xs text-white/40 mt-1">Multi-Jurisdiction: Singapore PDPA · EU/UK GDPR · CCPA</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 space-y-0">

            <Section title="1. Data Controller and DPO">
              <p>Booppa Smart Care LLC acts as the data controller for personal data processed through the Booppa platform.</p>
              <p><strong className="text-[#0f172a]">DPO:</strong> <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a></p>
              <p><strong className="text-[#0f172a]">Legal inquiries:</strong> <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
              <p className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">
                <strong>For EU/UK users:</strong> Booppa Smart Care LLC is the data controller under GDPR Article 4(7). Where required under Article 27 GDPR, Booppa shall designate an EU-based representative prior to commencing systematic processing of EU residents' personal data.
              </p>
            </Section>

            <Section title="2. Data We Collect">
              <p><strong className="text-[#0f172a]">Account and Identity Data:</strong> Name, email address, company name, job title, UEN and Singapore business registration details. Payment information is processed and tokenized by Stripe — Booppa does not store card details.</p>
              <p><strong className="text-[#0f172a]">Verification and Compliance Data:</strong> Business documents uploaded for notarization or verification; website content scanned for PDPA compliance; compliance scores, risk assessments, SHA-256 hash values, and generated reports.</p>
              <p><strong className="text-[#0f172a]">Usage and Platform Data:</strong> Log data (IP addresses, browser type, pages visited, timestamps, session identifiers); platform activity (searches, vendor profiles viewed, products purchased).</p>
              <p><strong className="text-[#0f172a]">Procurement Activity Data:</strong> RFP titles and sector information; GeBIZ tender numbers entered for win probability analysis. Vendor identities are never shared with buyers.</p>
            </Section>

            <Section title="3. Legal Basis for Processing">
              <p><strong className="text-[#0f172a]">Singapore (PDPA 2012):</strong> Processing is limited to: (a) contractual necessity to deliver purchased services; (b) legal compliance obligations; and (c) narrowly defined legitimate interests including platform security, fraud prevention, and core analytics. Consent is obtained where required.</p>
              <p><strong className="text-[#0f172a]">EU/UK (GDPR / UK GDPR):</strong> Legal bases are limited to:</p>
              <ul className="space-y-1 mt-1">
                <Li>Article 6(1)(b) — Performance of a contract: to deliver services you have purchased</Li>
                <Li>Article 6(1)(c) — Legal obligation: to comply with applicable laws</Li>
                <Li>Article 6(1)(f) — Legitimate interests: platform security, fraud prevention, and core analytics only</Li>
                <Li>Article 6(1)(a) — Consent: for marketing communications and non-essential cookies</Li>
              </ul>
              <p><strong className="text-[#0f172a]">United States (CCPA):</strong> We process data of California and other US residents in accordance with applicable state privacy laws. Booppa does not sell personal information as defined under the CCPA.</p>
            </Section>

            <Section title="4. Controller vs. Processor — Data Processing Agreement">
              <p>Booppa acts as <strong className="text-[#0f172a]">data controller</strong> for all processing activities in connection with platform operations, user accounts, and service delivery. Booppa acts as <strong className="text-[#0f172a]">data processor</strong> where processing personal data on behalf of Enterprise and Enterprise Pro subscribers in connection with their specific procurement workflows.</p>
              <p><strong className="text-[#0f172a]">Data Processing Agreement (DPA):</strong> Booppa makes a standard DPA available for Enterprise and Enterprise Pro subscribers who process personal data subject to GDPR, UK GDPR, or Singapore PDPA. Request by emailing <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a> with subject line "DPA Request." Booppa will provide the DPA within 5 business days.</p>
            </Section>

            <Section title="5. How We Use Your Data">
              <p>We use personal data to: deliver products and services you have purchased; process payments and send transaction confirmations; generate compliance reports, certificates, and procurement documentation; calculate vendor trust scores and probability estimates; send operational notifications; improve platform security and functionality; and comply with legal obligations.</p>
              <p>Marketing communications are sent only where you have opted in or where permitted by applicable law.</p>
            </Section>

            <Section title="6. Data Sharing — Sub-Processors">
              <p>We do not sell your personal data to third parties. Sub-processors handling data on our behalf under contractual data processing agreements:</p>
              <ul className="space-y-1 mt-2">
                <Li><strong className="text-[#0f172a]">Stripe, Inc.</strong> — payment processing (PCI-DSS Level 1 compliant)</Li>
                <Li><strong className="text-[#0f172a]">Resend</strong> — transactional email delivery</Li>
                <Li><strong className="text-[#0f172a]">AWS and/or Cloudflare</strong> — cloud infrastructure, data hosting, and storage</Li>
                <Li><strong className="text-[#0f172a]">Sentry</strong> — anonymized error monitoring</Li>
              </ul>
              <p className="mt-2">Booppa accesses publicly available Singapore government procurement data (GeBIZ) via data.gov.sg APIs and the ACRA BizFile+ registry. No user personal data is transmitted to these sources.</p>
            </Section>

            <Section title="7. Derived Data Disclaimer">
              <p>Analytics, scores, rankings, and other outputs derived from personal data are not guaranteed to be accurate, complete, or current; may be based on incomplete or imperfect datasets; do not constitute verified personal data under any regulatory framework; and are subject to model limitations and statistical uncertainty.</p>
            </Section>

            <Section title="8. International Data Transfers">
              <p>Booppa Smart Care LLC is a US company headquartered in Delaware. Data may be transferred to and stored in the United States and other countries where our service providers operate.</p>
              <p>For transfers of EU/UK personal data to countries without an adequacy decision, we rely on European Commission Standard Contractual Clauses (SCCs) or the UK International Data Transfer Addendum (IDTA). Copies of applicable transfer mechanisms are available upon request at <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a>.</p>
              <p>For Singapore users, international transfers comply with Part VI of the PDPA, including the requirement to ensure overseas recipients provide a standard of protection at least comparable to the PDPA.</p>
            </Section>

            <Section title="9. Data Retention">
              <ul className="space-y-1">
                <Li>Account data: duration of account plus <strong className="text-[#0f172a]">7 years</strong> after closure (US tax and legal compliance)</Li>
                <Li>Transaction records: <strong className="text-[#0f172a]">7 years</strong> (US tax law and Singapore corporate records requirements)</Li>
                <Li>Compliance reports and certificates: <strong className="text-[#0f172a]">5 years</strong> from generation</Li>
                <Li>Notarization records and hashes: <strong className="text-[#0f172a]">indefinitely</strong> (integrity of the immutable ledger)</Li>
                <Li>Server logs: <strong className="text-[#0f172a]">90 days</strong></Li>
                <Li>Marketing consent records: until withdrawal of consent plus <strong className="text-[#0f172a]">3 years</strong></Li>
              </ul>
              <p className="mt-2">Data is securely deleted or anonymized upon expiry of the applicable retention period.</p>
            </Section>

            <Section title="10. Your Rights — Singapore (PDPA)">
              <p>Under the PDPA you have the right to access personal data we hold about you; correct inaccurate data; withdraw consent for processing based on consent; and request data portability. Contact <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a>. We will respond within 30 days.</p>
            </Section>

            <Section title="11. Your Rights — EU/UK (GDPR / UK GDPR)">
              <p>EU and UK residents have rights including:</p>
              <ul className="space-y-1 mt-2">
                <Li>Right of access (Article 15)</Li>
                <Li>Right to rectification (Article 16)</Li>
                <Li>Right to erasure (Article 17)</Li>
                <Li>Right to restriction of processing (Article 18)</Li>
                <Li>Right to data portability (Article 20)</Li>
                <Li>Right to object to processing based on legitimate interests (Article 21)</Li>
                <Li>Right to withdraw consent at any time</Li>
              </ul>
              <p className="mt-2">Contact <a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a>. EU users may also lodge a complaint with their national supervisory authority. UK users may contact the ICO at <a href="https://ico.org.uk" className="underline text-[#10b981]" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or 0303 123 1113.</p>
            </Section>

            <Section title="12. Your Rights — California (CCPA)">
              <p>California residents have the right to know what personal information is collected and how it is used; the right to delete personal information; and the right to opt out of the sale of personal information. Booppa does not sell personal information. Contact <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a> with subject line "CCPA Request."</p>
            </Section>

            <Section title="13. Data Security">
              <p>We implement: TLS 1.2+ encryption in transit; encryption at rest for stored data; JWT-based authentication with secure token rotation; Stripe-managed payment processing; role-based access controls; and regular security monitoring.</p>
              <p>In the event of a data breach, we will notify affected Users and relevant supervisory authorities in accordance with applicable law (72-hour notification under GDPR; 3-day notification under Singapore PDPA as amended).</p>
            </Section>

            <Section title="14. Children's Privacy">
              <p>The Booppa platform is intended for business users and is not directed at individuals under 18. We do not knowingly collect personal data from minors. Contact <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a> if you believe we have inadvertently collected such data.</p>
            </Section>

            <Section title="15. Changes to This Policy">
              <p>We will notify registered Users by email and by platform notice at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.</p>
            </Section>

            <div className="pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8] space-y-1">
              <p><a href="mailto:evidence@booppa.io" className="underline text-[#10b981]">evidence@booppa.io</a> · <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
              <p>Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
              <p>Also see: <Link href="/terms" className="underline text-[#10b981]">Terms of Service</Link> · <Link href="/dpo" className="underline text-[#10b981]">DPO Contact</Link> · <Link href="/cookies" className="underline text-[#10b981]">Cookie Policy</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
