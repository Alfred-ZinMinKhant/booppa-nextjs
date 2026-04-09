import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | BOOPPA',
  description: 'Standards governing acceptable use of the Booppa platform and all services. Effective March 1, 2026.',
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

export default function AcceptableUsePage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Acceptable Use Policy</h1>
          <p className="text-sm text-[#10b981] font-medium">Effective Date: March 1, 2026</p>
          <p className="text-xs text-white/40 mt-1">Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8">

            <Section title="1. Purpose">
              <p>This Acceptable Use Policy governs conduct on the Booppa platform and applies to all Users. Violations may result in immediate account suspension or termination without refund.</p>
            </Section>

            <Section title="2. Prohibited Conduct — Fraudulent and Deceptive Activity">
              <ul className="space-y-1">
                <Li>Submitting false, misleading, or forged documents for verification or notarization</Li>
                <Li>Misrepresenting business credentials, certifications, compliance status, or ownership</Li>
                <Li>Creating multiple accounts to circumvent restrictions or manipulate platform scores</Li>
                <Li>Impersonating another company, individual, or Booppa</Li>
              </ul>
            </Section>

            <Section title="3. Prohibited Conduct — Platform Integrity">
              <ul className="space-y-1">
                <Li>Accessing, scraping, or harvesting data without authorization</Li>
                <Li>Interfering with or disrupting the platform's technical infrastructure</Li>
                <Li>Attempting to reverse-engineer, decompile, or extract source code</Li>
                <Li>Using automated bots, crawlers, or scripts without explicit written permission</Li>
                <Li>Attempting to manipulate or artificially inflate verification scores or procurement rankings</Li>
              </ul>
            </Section>

            <Section title="4. Prohibited Conduct — Misuse of Booppa Products">
              <ul className="space-y-1">
                <Li>Using verification badges, certificates, or reports in a context that creates a false or misleading impression</Li>
                <Li>Sharing or reselling Booppa-generated reports as your own independent product or certification</Li>
                <Li>Representing win probability estimates as guaranteed forecasts or professional advice to third parties</Li>
              </ul>
            </Section>

            <Section title="5. Legal Compliance">
              <ul className="space-y-1">
                <Li>Using the Service in violation of any applicable local, national, or international law</Li>
                <Li>Uploading content that infringes third-party intellectual property rights</Li>
                <Li>Processing personal data of third parties through the platform without an appropriate legal basis</Li>
              </ul>
            </Section>

            <Section title="6. Vendor Responsibilities">
              <p>Vendors must maintain the accuracy of their profile information and notify Booppa promptly if any verified information changes materially. Knowingly allowing a profile to contain inaccurate verified credentials constitutes material breach of the Terms of Service.</p>
            </Section>

            <Section title="7. Reporting Violations">
              <p>Report suspected violations to <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a>. Booppa will investigate all reports and take appropriate action.</p>
            </Section>

            <Section title="8. Enforcement">
              <p>Booppa reserves the right to investigate suspected violations and take action including: removal of content; account suspension or termination; referral to law enforcement; and pursuit of legal remedies. Booppa's failure to act on any violation does not constitute a waiver of its right to act on subsequent violations.</p>
            </Section>

            <div className="pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8] space-y-1">
              <p>Contact: <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
              <p>Also see: <Link href="/terms" className="underline text-[#10b981]">Terms of Service</Link> · <Link href="/privacy" className="underline text-[#10b981]">Privacy Policy</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
