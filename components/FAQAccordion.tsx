"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: 'What is BOOPPA?',
    a: `BOOPPA is a compliance intelligence platform designed to help organizations identify, document, and evidence compliance with Singapore’s Personal Data Protection Act (PDPA) and related regulatory frameworks. BOOPPA combines automated compliance analysis, AI-generated audit narratives, blockchain-based notarization, and verifiable evidence packs for audits and disputes. BOOPPA supports compliance processes but does not replace legal counsel or regulatory authorities.`,
  },
  {
    q: 'What happens when I run a Free / Instant PDPA Scan?',
    a: `The Free / Instant PDPA Scan provides a high-level compliance snapshot of your digital asset (for example, a website). Immediately after the scan you will see an overall Risk Indicator (Low / Medium / High), the number of trackers detected, whether trackers activate before user consent, data destination countries, and visual PDPA indicators. The scan is read-only, non-invasive, designed for awareness and lead qualification, and is not notarized nor a legal opinion.`,
  },
  {
    q: 'Does the Free Scan generate a formal compliance report?',
    a: 'No. The Free Scan provides a summary view only. It does not generate a formal audit report, blockchain notarization, court-ready evidence, or regulatory submissions. Formal documentation is generated only through paid services.',
  },
  {
    q: 'What is Scan1 and what does it do?',
    a: `Scan1 is BOOPPA’s automated technical compliance scanner. It crawls selected web pages or analyzes uploaded documents, detects trackers, cookies, forms, and consent mechanisms, identifies PDPA-relevant indicators, and produces structured, factual findings. Scan1 detects and reports compliance gaps but does not modify, block, or fix customer systems.`,
  },
  {
    q: 'Does Scan1 resolve compliance issues automatically?',
    a: 'No. Scan1 is a detection and assessment tool, not a remediation engine. BOOPPA identifies issues, documents risks, and generates evidence; actual remediation remains the responsibility of the organization or its service providers.',
  },
  {
    q: 'What happens after a paid PDPA scan or subscription is activated?',
    a: `When a paid product is activated, BOOPPA processes Scan1 findings, generates an AI-assisted audit narrative, produces a structured compliance report (PDF), creates cryptographic hashes (SHA‑256) of relevant evidence, anchors those hashes on the Polygon blockchain, and generates an Evidence Pack linking the original data, hashes, blockchain transaction IDs, and chain-of-custody metadata.`,
  },
  {
    q: 'What is included in an Evidence Pack?',
    a: 'An Evidence Pack typically includes original compliance data or scan results, hash values and timestamps, blockchain transaction references, an audit narrative and risk explanation, and verification instructions (QR or link-based). Evidence Packs are designed to be audit-ready and tamper-evident.',
  },
  {
    q: 'Is blockchain evidence legally admissible?',
    a: 'Blockchain provides immutability, integrity, and timestamping. Legal admissibility depends on jurisdiction, court discretion, and context. BOOPPA does not guarantee acceptance by courts or regulators; evidence is described as “designed for court use, subject to judicial acceptance.”',
  },
  {
    q: 'Does BOOPPA store or train AI models on personal data?',
    a: 'No. BOOPPA does not use customer personal data for AI training. The platform applies strict data minimization, processing only what is required for compliance documentation. AI is used solely to generate audit narratives and summaries from structured findings.',
  },
  {
    q: 'What is the difference between PDPA Quick Scan and PDPA subscriptions?',
    a: 'PDPA Quick Scan is a one-time compliance assessment with one-time notarized evidence. PDPA Subscriptions (Basic / Pro) provide continuous monitoring, automated consent logging, ongoing evidence generation, dashboards and exports, and operational compliance tooling.',
  },
  {
    q: 'What is Supply Chain / Notarization used for?',
    a: 'Supply Chain Notarization allows organizations to timestamp and notarize documents, preserve the integrity of contracts, logs, policies, or attestations, and create independent proof of existence and content at a specific time. Common uses include vendor documentation, compliance logs, contractual evidence, and dispute prevention or defense.',
  },
  {
    q: 'Is BOOPPA endorsed or certified by PDPC or MAS?',
    a: 'No. Regulatory authorities do not certify compliance tools. BOOPPA is designed to align with PDPA and MAS expectations and to support compliance and audit readiness, but it is not an official regulator or certifying body.',
  },
  {
    q: 'Who is BOOPPA intended for?',
    a: 'BOOPPA is suitable for SMEs and startups handling personal data, e-commerce and SaaS companies, logistics and supply chain operators, regulated and cross-border businesses, and organizations subject to audits or partner scrutiny.',
  },
  {
    q: 'What is BOOPPA’s role in a compliance strategy?',
    a: 'BOOPPA acts as a compliance intelligence layer, an evidence generation engine, and an audit-readiness infrastructure. It complements legal advisors, internal compliance teams, and external auditors.',
  },
  {
    q: 'What does BOOPPA not do?',
    a: 'BOOPPA does not provide legal advice, certify regulatory compliance, automatically remediate systems, or replace regulators or courts.',
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  function toggle(i: number) {
    setOpen((prev) => (prev === i ? null : i));
  }

  return (
    <div className="space-y-4">
      {FAQS.map((item, i) => (
        <div key={i} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
          <button
            onClick={() => toggle(i)}
            aria-expanded={open === i}
            className="w-full text-left flex items-center justify-between"
          >
            <span className="text-white font-semibold">{item.q}</span>
            <ChevronDown className={`w-5 h-5 text-gray-300 transform transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>

          {open === i && (
            <div className="mt-3 text-gray-300 prose prose-invert max-w-none">
              <p>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
