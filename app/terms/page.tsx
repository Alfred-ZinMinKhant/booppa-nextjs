import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | BOOPPA',
  description: 'Terms of Service for Booppa Smart Care LLC — v17 Hardened. Effective March 1, 2026.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="text-[#94a3b8] space-y-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="ml-4 list-disc">{children}</li>;
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-3">Legal</p>
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-[#10b981] mb-2 font-medium">v17 Hardened · Effective Date: March 1, 2026</p>
        <p className="text-xs text-[#64748b] mb-10">
          Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA ·{' '}
          <a href="mailto:legal@booppa.io" className="underline">legal@booppa.io</a>
        </p>

        <div className="bg-[#1e293b] border border-amber-500/30 rounded-xl p-5 mb-10 text-sm text-amber-200">
          <strong>Important — Please Read Carefully.</strong> These Terms constitute a legally binding agreement. By accessing or using any Booppa service you agree to be bound by these Terms. If you do not agree, do not use the Service.
        </div>

        <Section title="1. Parties and Acceptance">
          <p>These Terms of Service ("Terms") govern your access to and use of the Booppa platform, website, API, and all related products and services (collectively, the "Service") operated by Booppa Smart Care LLC, a limited liability company organized under the laws of the State of Delaware, USA ("Booppa," "we," "us," or "our").</p>
          <p>By creating an account, accessing the Service, or clicking "I agree," you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If accepting on behalf of a company, you warrant you have authority to bind that entity. Users must be at least 18 years of age.</p>
        </Section>

        <Section title="2. Description of Services">
          <p>Booppa operates a B2B procurement trust marketplace providing:</p>
          <ul className="space-y-1 mt-2">
            {[
              'Vendor verification and trust scoring ("Vendor Proof" and "Vendor Active")',
              'PDPA compliance assessment and monitoring ("PDPA Snapshot" and "PDPA Monitor")',
              'Document notarization and integrity certification ("Notarization")',
              'RFP readiness documentation and tender preparation ("RFP Express" and "RFP Complete")',
              'Procurement analytics and vendor discovery ("Enterprise" and "Enterprise Pro")',
              'Indicative likelihood signal analysis ("Tender Win Probability Calculator" — non-predictive experimental metric)',
              'Bundled product offerings ("Vendor Trust Pack," "RFP Accelerator," "Enterprise Bid Kit")',
            ].map((s, i) => <Li key={i}>{s}</Li>)}
          </ul>
          <p className="mt-3">Booppa facilitates connections between vendors and procurement buyers but is not a party to any procurement transaction. Booppa does not guarantee that any User will win any tender, contract, or procurement opportunity.</p>
        </Section>

        <Section title="3. Account Registration">
          <p>You agree to provide accurate, current, and complete information; maintain and promptly update your account information; keep your password confidential; notify Booppa immediately at <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a> of any unauthorized use; and accept responsibility for all activities under your account.</p>
        </Section>

        <Section title="4. Vendor Obligations">
          <p>Vendors represent and warrant that all submitted information is accurate and complete; they have the legal right to submit all documents; their business operations comply with all applicable laws; and they will not misuse verification badges or reports in a misleading or fraudulent manner.</p>
          <p>A Booppa verification badge does not constitute a legal endorsement, guarantee of compliance, or warranty of fitness for any particular procurement requirement.</p>
        </Section>

        <Section title="5. Payment Terms">
          <p>All prices are displayed in Singapore Dollars (SGD) unless otherwise specified. Payment is processed through Stripe, Inc.</p>
          <p><strong className="text-white">One-Time Purchases:</strong> Fees for Vendor Proof, PDPA Snapshot, Notarization, RFP Express, RFP Complete, and all Bundles are charged at time of purchase and are non-refundable once the product has been delivered or fulfillment has commenced.</p>
          <p><strong className="text-white">Subscriptions:</strong> Vendor Active, PDPA Monitor, Enterprise, Enterprise Pro are billed in advance monthly or annually. Subscriptions renew automatically unless cancelled before renewal. Annual subscriptions may be cancelled within 14 days for a pro-rated refund. Monthly subscriptions cancel at end of current billing period.</p>
          <p><strong className="text-white">Disputed Charges:</strong> Contact <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a> within 30 days. Chargebacks without first contacting Booppa may result in account suspension.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>All content, technology, algorithms, software, trademarks, logos, and materials on the Booppa platform are owned by or licensed to Booppa Smart Care LLC. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works from any part of the Service.</p>
          <p>You retain ownership of content you submit. By submitting content, you grant Booppa a worldwide, royalty-free license to use, process, display, and analyze that content solely for the purpose of delivering the Service.</p>
        </Section>

        <Section title="7. Service Characterization and Non-Reliance">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4 text-xs font-mono uppercase tracking-wide text-amber-200">
            BY USING THE SERVICE, USER EXPRESSLY ACKNOWLEDGES AND AGREES TO THE FOLLOWING TERMS, WHICH ARE MATERIAL INDUCEMENTS FOR BOOPPA TO PROVIDE ACCESS TO THE SERVICE.
          </div>
          <p className="mt-3">All outputs including vendor scores, rankings, compliance assessments, risk scores, indicative likelihood signals, probability estimates, analytics, reports, and generated documents are generated through automated processes, data aggregation, and heuristic or statistical models.</p>
          <p>User expressly acknowledges and agrees that:</p>
          <ul className="space-y-2 mt-2">
            <Li>(a) All outputs are informational, indicative, experimental, and non-deterministic in nature;</Li>
            <Li>(b) Such outputs do not constitute legal advice, compliance advice, financial advice, procurement advice, vendor endorsement, certification results, or predictions of any outcome;</Li>
            <Li>(c) User does not rely, and expressly agrees that it has not relied, on any output of the Service in making any legal, financial, commercial, or procurement decision;</Li>
            <Li>(d) User assumes full and sole responsibility for all decisions, actions, and outcomes arising from its use of the Service.</Li>
          </ul>
        </Section>

        <Section title="8. No Advisory or Fiduciary Relationship">
          <p>Booppa is not a consultant, advisor, broker, agent, fiduciary, or intermediary in any transaction between Users. No relationship of trust, confidence, or reliance is created by use of the Service. Nothing in the Service creates a fiduciary relationship, professional advisory relationship, duty of care beyond platform access, or any agency relationship.</p>
        </Section>

        <Section title="9. Independent Decision-Making">
          <p>All decisions made in connection with procurement, vendor selection, compliance, or any commercial activity are made independently and on the basis of User's own assessment. Under no circumstances shall Booppa be liable for decisions taken or not taken by User based on use of the Service, including decisions to submit bids, award contracts, or modify compliance posture.</p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4 text-xs font-mono uppercase tracking-wide text-amber-200">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BOOPPA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, RELIABILITY, COMPLETENESS, OR UNINTERRUPTED OPERATION.
          </div>
        </Section>

        <Section title="11. Limitation of Liability">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4 text-xs font-mono uppercase tracking-wide text-amber-200 mb-3">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BOOPPA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF TENDERS OR CONTRACTS, REGULATORY PENALTIES, OR REPUTATIONAL DAMAGE.
          </div>
          <p><strong className="text-white">Non-Reliance Damages Exclusion:</strong> User expressly waives any claim based on reliance on the Service, including claims of negligent misrepresentation, promissory estoppel, or any similar theory.</p>
          <p><strong className="text-white">Liability Cap:</strong> Booppa's total cumulative liability shall not exceed the greater of: (i) the total fees paid by User in the 12 months immediately preceding the claim; or (ii) <strong className="text-white">USD $100</strong>.</p>
          <p>User acknowledges that these limitations constitute an essential element of the basis of the bargain. The Service is provided exclusively to business users (B2B). To the extent any limitation is challenged under Singapore's Unfair Contract Terms Act (Cap. 396) or equivalent legislation, the parties agree it is fair and reasonable.</p>
        </Section>

        <Section title="12. Indemnification">
          <p>You agree to defend, indemnify, and hold harmless Booppa Smart Care LLC and its members, officers, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party right; or (d) any content you submit to the platform.</p>
        </Section>

        <Section title="13. Dispute Resolution">
          <p><strong className="text-white">Binding Arbitration:</strong> Any dispute that cannot be resolved through good-faith negotiation within 30 days shall be resolved by final, binding arbitration administered by JAMS (or AAA at Booppa's election). The seat of arbitration shall be San Francisco, California, or Wilmington, Delaware, at Booppa's election.</p>
          <p><strong className="text-white">Class Action Waiver:</strong> YOU AND BOOPPA AGREE THAT EACH MAY BRING CLAIMS ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS PROCEEDING.</p>
          <p><strong className="text-white">Governing Law:</strong> These Terms are governed by the laws of the State of <strong className="text-white">Delaware, USA</strong>, without regard to conflict of law provisions. Compliance with Singapore's PDPA 2012 (as amended) is maintained independently.</p>
          <p>Either party may seek emergency injunctive relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration.</p>
        </Section>

        <Section title="14. No Guarantee">
          <p>Booppa does not guarantee, and explicitly disclaims any guarantee of: procurement success or tender award; regulatory compliance under any applicable law; vendor performance or reliability; or accuracy, completeness, or fitness of any report or output. All outcomes are the sole responsibility of the User.</p>
        </Section>

        <Section title="17. Electronic Acceptance and Clickwrap Acknowledgment">
          <p>For all paid products and services, Booppa requires explicit electronic acceptance of these Terms at the point of purchase. Users must affirmatively check all three of the following before completing any transaction:</p>
          <ul className="space-y-2 mt-2 bg-[#1e293b] rounded-lg p-4">
            <li className="flex gap-2 text-xs"><span className="text-[#10b981]">☑</span> "I have read and agree to Booppa's Terms of Service, Privacy Policy, and Disclaimer."</li>
            <li className="flex gap-2 text-xs"><span className="text-[#10b981]">☑</span> "I acknowledge that I do not rely, and have not relied, on any Booppa output — including scores, rankings, probability estimates, or reports — for any legal, financial, procurement, or regulatory decision."</li>
            <li className="flex gap-2 text-xs"><span className="text-[#10b981]">☑</span> "I understand that Booppa is an information tool and not a legal, compliance, or procurement advisor."</li>
          </ul>
          <p className="mt-3">Records of electronic acceptance, including timestamp and IP address, are retained by Booppa and constitute evidence of agreement. Available on request at <a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a>.</p>
        </Section>

        <Section title="18. Modifications and Termination">
          <p>Booppa reserves the right to modify these Terms at any time, with notice to registered Users by email or platform notice at least 14 days before changes take effect. Continued use constitutes acceptance.</p>
          <p>Booppa may terminate or suspend your account immediately for any breach of these Terms. Sections 7, 8, 9, 10, 11, 12, 13, and 14 survive termination.</p>
        </Section>

        <Section title="19. General Provisions">
          <ul className="space-y-2">
            <Li><strong className="text-white">Entire Agreement:</strong> These Terms, together with the Privacy Policy, Cookie Policy, Acceptable Use Policy, and Disclaimer, constitute the entire agreement.</Li>
            <Li><strong className="text-white">Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full force.</Li>
            <Li><strong className="text-white">Assignment:</strong> You may not assign your rights without Booppa's prior written consent. Booppa may assign these Terms freely.</Li>
            <Li><strong className="text-white">Force Majeure:</strong> Booppa is not liable for delays resulting from acts beyond its reasonable control.</Li>
          </ul>
        </Section>

        <div className="mt-10 pt-6 border-t border-[#1e293b] text-xs text-[#475569] space-y-1">
          <p>Booppa Smart Care LLC · 1209 Orange Street, Wilmington, Delaware 19801, USA</p>
          <p><a href="mailto:legal@booppa.io" className="underline text-[#10b981]">legal@booppa.io</a></p>
          <p>Also see: <Link href="/privacy" className="underline text-[#10b981]">Privacy Policy</Link> · <Link href="/disclaimer" className="underline text-[#10b981]">Disclaimer</Link> · <Link href="/acceptable-use" className="underline text-[#10b981]">Acceptable Use</Link> · <Link href="/cookies" className="underline text-[#10b981]">Cookie Policy</Link></p>
        </div>
      </div>
    </main>
  );
}
