
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security & Compliance Overview | BOOPPA',
  description: 'Overview of Booppa’s security controls, regulatory alignment, and blockchain evidence approach for enterprise and regulated customers.',
  robots: 'noindex, nofollow',
};

export default function SecurityCompliancePage() {
  return (
    <main className="pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-8">
          Security & Compliance Overview
        </h1>
        
        <p className="text-xl text-gray-300 text-center mb-12">
          Booppa Intelligence provides a compliance automation and evidence management platform designed to support organizations operating in regulated, data-protection–sensitive, and audit-intensive environments.
        </p>
        
        <p className="text-lg text-gray-400 text-center mb-16">
          This page outlines Booppa’s security posture, regulatory alignment, and technical approach for enterprise customers, procurement teams, and compliance reviewers.
        </p>

        {/* Information Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Information Security</h2>
          <p className="text-gray-300 mb-6">
            Booppa implements organizational, technical, and procedural controls designed to protect customer data and system integrity.
          </p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Role-based access control (RBAC)</li>
            <li>Multi-factor authentication for privileged access</li>
            <li>Centralized logging and monitoring</li>
            <li>Secure configuration and vulnerability management</li>
            <li>Incident response and escalation procedures</li>
            <li>Regular backup and recovery processes</li>
          </ul>
        </section>

        {/* Cloud Infrastructure */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Cloud Infrastructure & Hosting</h2>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>SaaS platform hosted on Amazon Web Services (AWS), Singapore Region</li>
            <li>Infrastructure designed for availability, scalability, and resilience</li>
            <li>Logical segregation of customer environments</li>
            <li>Data residency in Singapore, unless otherwise agreed</li>
          </ul>
        </section>

        {/* MTCS Alignment */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Cloud Security Framework Alignment</h2>
          <p className="text-gray-300 mb-4">
            Booppa’s cloud security controls are aligned with the Singapore Multi-Tier Cloud Security (MTCS) Level 1 baseline, based on internal self-assessment against applicable control domains.
          </p>
          <p className="text-gray-300 mb-4">This alignment includes:</p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Access control and identity management</li>
            <li>Asset and configuration management</li>
            <li>Logging, monitoring, and incident handling</li>
            <li>Backup, recovery, and operational security practices</li>
          </ul>
          <p className="text-gray-300 font-semibold mt-6">MTCS alignment does not constitute certification.</p>
        </section>

        {/* PDPA Alignment */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Data Protection & PDPA Alignment</h2>
          <p className="text-gray-300 mb-4">
            Booppa is designed to support organizations in meeting their obligations under Singapore’s Personal Data Protection Act (PDPA).
          </p>
          <p className="text-gray-300 mb-4">Data protection measures include:</p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Data classification and access restrictions</li>
            <li>Encryption in transit and at rest</li>
            <li>Defined data retention and deletion processes</li>
            <li>Separation of personal data storage from blockchain verification layers</li>
          </ul>
        </section>

        {/* Blockchain & Personal Data */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Blockchain & Personal Data</h2>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>No personal data is stored on-chain</li>
            <li>Blockchain is used exclusively for cryptographic hashes and integrity proofs</li>
            <li>Personal data remains fully manageable off-chain, supporting data protection and erasure requirements</li>
          </ul>
          <p className="text-gray-300 mt-6">
            This architectural approach is consistent with PDPC guidance discussing the use of off-chain storage combined with on-chain cryptographic verification.
          </p>
        </section>

        {/* Blockchain Evidence */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Blockchain Evidence & Audit Integrity</h2>
          <p className="text-gray-300 mb-4">
            Booppa provides blockchain-verified audit trails designed to support:
          </p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Integrity verification</li>
            <li>Tamper detection</li>
            <li>Traceability of records</li>
            <li>Chain-of-custody documentation</li>
          </ul>
          <p className="text-gray-300 mt-6 mb-4">
            Each notarization event can be supported by a structured Evidence Pack, which may include:
          </p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Original data or document</li>
            <li>Associated metadata</li>
            <li>Cryptographic hash</li>
            <li>Blockchain transaction reference</li>
            <li>Timestamp and verification artifacts</li>
            <li>System and access logs</li>
          </ul>
        </section>

        {/* Court Admissibility */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Court Admissibility Considerations</h2>
          <p className="text-gray-300 mb-6">
            Publicly available legal commentary and regulatory guidance in Singapore indicate that electronic and blockchain-based records may be accepted as evidence where authenticity, integrity, and provenance can be demonstrated.
          </p>
          <p className="text-gray-300 mb-6">
            Legal commentary published by the Singapore Law Gazette has discussed that blockchain records may constitute original documents where their immutability and provenance are properly established.
          </p>
          <p className="text-gray-300 mb-6">
            Recent Singapore High Court decisions involving crypto and digital assets demonstrate judicial familiarity with blockchain-based systems, provided that the underlying technical mechanisms are clearly explained.
          </p>
          <p className="text-gray-300">
            Booppa Intelligence is designed to generate court-admissible evidence, subject to judicial acceptance, and provides technical documentation to support evidentiary use.
          </p>
        </section>

        {/* Regulatory Positioning */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Regulatory Positioning</h2>
          <p className="text-gray-300 mb-4">Booppa Intelligence:</p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>Is not a regulator</li>
            <li>Is not a certification authority</li>
            <li>Does not provide legal or regulatory advice</li>
          </ul>
          <p className="text-gray-300 mt-6">
            The platform supports internal compliance and audit processes. Customers remain responsible for their own legal and regulatory compliance obligations.
          </p>
        </section>

        {/* Certifications & Roadmap */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Certifications & Roadmap</h2>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>MTCS Level 1 — Aligned (self-assessed)</li>
            <li>PDPA — Architectural alignment with applicable requirements</li>
          </ul>
          <p className="text-gray-300 mt-4">Roadmap includes:</p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300">
            <li>MTCS Level 1 certification</li>
            <li>ISO/IEC 27001</li>
          </ul>
        </section>

        {/* Disclosure */}
        <section className="mb-16 bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Disclosure</h2>
          <p className="text-gray-300 font-semibold mb-4">
            Designed to support compliance processes. Not a regulatory certification.
          </p>
          <p className="text-gray-300">
            Booppa Intelligence is not endorsed, approved, or certified by the Monetary Authority of Singapore (MAS) or the Personal Data Protection Commission (PDPC).
          </p>
        </section>

        {/* Availability of Documentation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Availability of Documentation</h2>
          <p className="text-gray-300">
            Additional security, compliance, and technical documentation is available upon request, including:
          </p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300 mt-4">
            <li>Detailed architecture diagrams</li>
            <li>Evidence Pack examples</li>
            <li>RFP and due diligence responses</li>
          </ul>
        </section>

                {/* AI and Automated Processing */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">AI and Automated Processing</h2>
          <p className="text-gray-300 mb-4">
            Booppa leverages AI for enhanced report narratives and compliance insights, while ensuring full PDPA alignment:
          </p>
          <ul className="list-disc pl-8 space-y-2 text-gray-300 mb-4">
            <li>No personal data is used for AI training or processing.</li>
            <li>AI outputs are deterministic and auditable, with human oversight.</li>
            <li>Rule-based automation combined with selective AI for explanatory summaries.</li>
          </ul>
          <p className="text-gray-300">
            This approach follows PDPC Advisory Guidelines on Use of Personal Data in AI Recommendation and Decision Systems (2024-2025), minimizing risks while delivering smarter evidence.
          </p>
        </section>

        <p className="text-sm text-gray-500 italic text-center">
          Technical Note: This page is provided for enterprise, legal, and compliance review purposes only and is not intended as marketing material.
        </p>
      </div>
    </main>
  );
}
