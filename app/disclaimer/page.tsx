import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | BOOPPA',
  description: 'Important limitations on Booppa products, reports, assessments, and platform outputs. v17 Hardened — effective March 1, 2026.',
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

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
          <p className="text-sm text-[#10b981] font-medium">v17 Hardened · Effective Date: March 1, 2026</p>
          <p className="text-xs text-white/40 mt-1">Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Non-Reliance Notice — Read Before Using Any Booppa Assessment</p>
            <p className="text-sm text-amber-900 font-medium leading-relaxed">
              ALL OUTPUTS ARE PROVIDED FOR INFORMATIONAL PURPOSES ONLY. USER MUST NOT AND DOES NOT RELY ON ANY BOOPPA OUTPUT FOR ANY LEGAL, FINANCIAL, PROCUREMENT, OR REGULATORY DECISION.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 space-y-0">

            <Section title="1. Non-Reliance">
              <p>User expressly acknowledges that it must not and does not rely on any of the following for any legal, financial, procurement, or regulatory decision:</p>
              <ul className="space-y-1 mt-2">
                {[
                  'Vendor scores, trust rankings, and visibility indicators',
                  'Compliance assessments, risk scores, and PDPA evaluations',
                  'Indicative likelihood signals and non-predictive experimental metrics (including any output labeled as "win probability," "probability," or "win likelihood")',
                  'Procurement analytics, shortlists, and sector reports',
                  'Notarization certificates and integrity records',
                ].map((s, i) => <Li key={i}>{s}</Li>)}
              </ul>
              <p className="mt-3">This non-reliance acknowledgment is a material term of User's access to the Service and constitutes a condition of Booppa's willingness to provide it.</p>
            </Section>

            <Section title="2. No Professional Status">
              <p>Booppa is not a law firm, compliance advisor, certified auditor, certification authority, regulatory body, procurement consultant, or financial advisor. No output of the Booppa platform shall be interpreted as professional advice of any kind. Users should seek qualified professional advice for all material legal, compliance, financial, and procurement decisions.</p>
            </Section>

            <Section title="3a. PDPA Snapshot and PDPA Monitor">
              <p>The PDPA Snapshot and PDPA Monitor services analyze publicly available website content and uploaded policy documents for indicators of alignment with Singapore's PDPA. These services:</p>
              <ul className="space-y-1 mt-2">
                <Li>Do not constitute formal regulatory compliance audits</Li>
                <Li>Do not ensure PDPA compliance and do not protect users from PDPC enforcement action</Li>
                <Li>May not reflect internal processes or practices not disclosed to Booppa</Li>
              </ul>
              <p className="mt-2">Users in regulated sectors must consult qualified data protection counsel for material compliance decisions.</p>
            </Section>

            <Section title="3b. Tender Win Probability — Indicative Likelihood Signal">
              <p>The Tender Win Probability Calculator generates an indicative, non-predictive, experimental metric based on historical GeBIZ procurement patterns and platform trust signals. This output:</p>
              <ul className="space-y-1 mt-2">
                <Li>Is a non-predictive estimate and shall not be construed as a statistical guarantee, actuarial prediction, or professional forecast of any kind</Li>
                <Li>Is not created by, endorsed by, or affiliated with any Singapore government agency including GeBIZ, MTI, or PDPC</Li>
                <Li>May differ materially from actual procurement outcomes due to factors outside Booppa's data model, including unpublished evaluation criteria, personal relationships, pricing, and policy decisions</Li>
                <Li>Shall not be used as the sole or primary basis for any commercial, financial, or procurement decision</Li>
                <Li>Is labelled as "probability" for convenience only; the term does not imply actuarial accuracy, statistical certification, or professional reliability</Li>
              </ul>
              <p className="mt-2 font-medium text-[#0f172a]">Booppa expressly disclaims any liability for losses, missed tenders, failed bids, or commercial harm arising from reliance on this metric.</p>
            </Section>

            <Section title="3c. Notarization">
              <p>Booppa's notarization service records a SHA-256 cryptographic hash of an uploaded document at a specific date and time, creating a verifiable technical integrity timestamp. This service:</p>
              <ul className="space-y-1 mt-2">
                <Li>Does not constitute legal notarization or authentication by a notary public, commissioner of oaths, or any recognized legal authority</Li>
                <Li>Does not verify the accuracy, legality, authorship, or authenticity of the underlying document content</Li>
                <Li>Shall not be used, cited, or presented as evidence of document authenticity or legal validity in any legal, regulatory, arbitral, or court proceeding without independent verification by a qualified legal authority</Li>
                <Li>Creates a technical record of file integrity at a point in time only — it does not attest to the truth of any statement contained in the document</Li>
              </ul>
            </Section>

            <Section title="3d. Vendor Rankings and Shortlists">
              <p>Vendor rankings, sector percentiles, shortlists, and procurement ordering on the Booppa platform reflect the platform's proprietary scoring algorithm. They are not endorsements or recommendations by any government or institutional buyer; may change as vendor data and scoring parameters are updated; and are subject to the platform's published ordering policy.</p>
            </Section>

            <Section title="3e. Vendor Verification">
              <p>A Booppa verification badge indicates that the vendor has submitted information to Booppa and paid the applicable fee. It does not constitute a guarantee, warranty, or endorsement of the vendor's business practices, compliance posture, financial standing, or suitability for any procurement requirement.</p>
            </Section>

            <Section title="4. Limitation of Use">
              <p>All Booppa outputs are subject to the following inherent limitations:</p>
              <ul className="space-y-1 mt-2">
                <Li>Outputs may be incomplete, inaccurate, outdated, or subject to model limitations</Li>
                <Li>Automated processing may produce results that differ from manual professional assessment</Li>
                <Li>Platform data may not reflect recent changes in vendor circumstances, regulatory requirements, or market conditions</Li>
                <Li>Statistical models are inherently probabilistic and do not reflect certainty of any kind</Li>
              </ul>
            </Section>

            <Section title="5. Liability Exclusion">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 text-xs font-mono uppercase tracking-wide text-[#475569]">
                BOOPPA SHALL NOT BE LIABLE FOR ANY LOSS, DAMAGE, OR HARM ARISING FROM: FINANCIAL LOSS OR LOST REVENUE; MISSED TENDERS, LOST CONTRACTS, OR FAILED PROCUREMENT BIDS; REGULATORY FINES, PENALTIES, OR ENFORCEMENT ACTIONS; BUSINESS DECISIONS BASED ON PLATFORM OUTPUTS; OR RELIANCE ON ANY ASSESSMENT, SCORE, INDICATIVE LIKELIHOOD SIGNAL, PROBABILITY ESTIMATE, OR REPORT — EVEN IF BOOPPA WAS OR SHOULD HAVE BEEN AWARE THAT SUCH RELIANCE WAS FORESEEABLE.
              </div>
              <p className="mt-3">These exclusions apply to the maximum extent permitted by applicable law. The Service is provided exclusively to business users (B2B). As between sophisticated commercial parties, these exclusions represent a fair and reasonable allocation of risk.</p>
            </Section>

            <Section title="6. No Warranty">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 text-xs font-mono uppercase tracking-wide text-[#475569]">
                ALL BOOPPA PRODUCTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. BOOPPA MAKES NO WARRANTY THAT ANY PRODUCT, REPORT, OR ASSESSMENT IS ACCURATE, COMPLETE, RELIABLE, OR SUITABLE FOR ANY PARTICULAR PURPOSE.
              </div>
            </Section>

            <div className="pt-4 border-t border-[#e2e8f0] text-xs text-[#94a3b8] space-y-1">
              <p>For questions about the scope and limitations of Booppa services: <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
              <p>Also see: <Link href="/terms" className="underline text-[#10b981]">Terms of Service</Link> · <Link href="/privacy" className="underline text-[#10b981]">Privacy Policy</Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
