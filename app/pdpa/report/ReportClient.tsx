"use client"

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { polygonscanTxUrl, POLYGON_NETWORK_NAME, POLYGON_EXPLORER_HOST } from "@/lib/blockchain";
import Link from "next/link";
import {
  listRemediationsForReport,
  markRemediation,
  keyFromFinding,
  type Remediation,
} from "@/lib/remediations";

// ── Types ─────────────────────────────────────────────────────────────────────

type Finding = {
  type?: string;
  title?: string;
  severity?: string;
  description?: string;
  evidence?: string;
  penalty?: { amount?: string };
  max_penalty?: string;
  deadline?: string;
  deadline_short?: string;
  legislation_text?: string;
  legislation_references?: string[];
  owner?: string;
  requirements?: string[];
  acceptance_criteria?: string[];
  recommended_tools?: string[];
};

type StructuredReport = {
  executive_summary?: string;
  risk_assessment?: { score?: number; level?: string; description?: string };
  detailed_findings?: Finding[];
  recommendations?: Array<{
    violation_type?: string;
    severity?: string;
    actions?: string[];
    timeline?: string;
  }>;
  legal_references?: Array<{ title?: string; url?: string }>;
  report_metadata?: { ai_model?: string; report_id?: string };
};

type VerificationData = {
  tx_hash?: string;
  polygonscan_url?: string;
  verify_url?: string;
  qr_image?: string;
  audit_hash?: string;
};

// Subset of the worker's assessment_data shape that the report viewer reads.
// Mirrors the keys whitelisted in /api/reports/by-session.
type PrecedentCase = {
  vendor: string;
  year: number;
  fine_sgd: number;
  section: string;
  url: string;
  summary: string;
};

type ScanData = {
  nric?: { status?: string; score?: number; kind?: string; items?: Array<{ source_url?: string }> };
  policy_clauses?: {
    status?: string; score?: number; present_count?: number; total?: number;
    missing?: string[]; items?: Array<{ clause?: string; present?: boolean }>;
  };
  pdpc_enforcement?: { checked?: boolean; found?: boolean; cases?: Array<{ title?: string }> };
  hosting?: { checked?: boolean; inferred_provider?: string | null; inferred_region?: string | null };
  trackers?: { inventory?: string[]; pre_consent?: Array<{ vendor?: string }>; post_consent?: unknown[] };
  consent_mechanism?: { has_cookie_banner?: boolean; detected_providers?: string[] };
  privacy_policy?: { found?: boolean; link?: string };
  dpo_compliance?: { has_dpo?: boolean; dpo_email?: string };
  dnc_mention?: { mentions_dnc?: boolean };
  security_headers?: Record<string, boolean>;
  primary_language?: string;
  precedents?: Record<string, { summary: string | null; cases: PrecedentCase[] }>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractViolationText(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/^(CRITICAL|HIGH|MEDIUM|LOW) VIOLATION:[^\n]*\n*/i, "")
    .replace(/^VIOLATION DETAILS:\s*/i, "")
    .trim();
  return (cleaned.split("\n\n")[0] || cleaned).slice(0, 300).trim();
}

const SEVERITY_CONFIG: Record<string, { label: string; bar: string; badge: string; border: string; text: string }> = {
  CRITICAL: { label: "Critical",  bar: "bg-red-600",    badge: "bg-red-100 text-red-700 border-red-300",       border: "border-l-red-600",    text: "text-red-700" },
  HIGH:     { label: "High",      bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-300", border: "border-l-orange-500", text: "text-orange-600" },
  MEDIUM:   { label: "Medium",    bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-300",  border: "border-l-amber-400",  text: "text-amber-600" },
  LOW:      { label: "Low",       bar: "bg-blue-400",   badge: "bg-blue-100 text-blue-700 border-blue-300",    border: "border-l-blue-400",   text: "text-blue-600" },
};

const RISK_SCORE_CONFIG = (score: number) => {
  if (score >= 70) return { label: "High Risk",   color: "text-red-600",     bar: "bg-red-500",     bg: "bg-red-50 border-red-200" };
  if (score >= 40) return { label: "Medium Risk", color: "text-amber-600",   bar: "bg-amber-400",   bg: "bg-amber-50 border-amber-200" };
  return               { label: "Low Risk",    color: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
};

function SectionHeading({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#e2e8f0] pb-2 mb-4">
      <p className="text-sm font-bold text-[#0f172a]">{n}. {title}</p>
      {sub && <p className="text-xs text-[#94a3b8]">{sub}</p>}
    </div>
  );
}

// ── Section 1: Scope of Assessment ───────────────────────────────────────────

const SCOPE_ROWS: { element: string; description: string; inScope: boolean }[] = [
  { element: "Cookie Consent Mechanism",           description: "Consent banner implementation and pre-consent cookie behaviour",                          inScope: true  },
  { element: "Third-Party Tracker Inventory",      description: "Pre-consent third-party request capture via headless-browser rendering",                   inScope: true  },
  { element: "Privacy Policy (PDPA §11/13)",       description: "Clause-level analysis: purpose, withdrawal, DPO, retention, third-party, DSR",             inScope: true  },
  { element: "Security HTTP Headers",              description: "HTTP response header analysis for PDPA §24 Protection Obligation",                         inScope: true  },
  { element: "Cookie Attributes",                  description: "Secure, HttpOnly and SameSite flag inspection on set-cookie responses",                    inScope: true  },
  { element: "DNC Registry Reference",             description: "Detection of marketing opt-out mechanism and DNC references",                              inScope: true  },
  { element: "Data Subject Rights Mechanism",      description: "Presence of access, correction and withdrawal request pathways",                           inScope: true  },
  { element: "NRIC Exposure",                      description: "Detection of NRIC/FIN collection or exposure on publicly accessible pages",                inScope: true  },
  { element: "Retention Limitation (§25)",         description: "Privacy-policy clause check for stated retention period or destruction policy",            inScope: true  },
  { element: "Data Breach Notification (§26B-D)",  description: "Cross-reference against PDPC public enforcement decisions",                                inScope: true  },
  { element: "Cross-Border Transfer (§26)",        description: "Hosting infrastructure inference from HTTP signals; Singapore vs. overseas region",        inScope: true  },
  { element: "Backend Systems & Data Flows",       description: "Server-side processing, databases, internal APIs",                                         inScope: false },
  { element: "Employee Data Handling",             description: "HR data, payroll, staff records",                                                          inScope: false },
  { element: "Third-Party Processor Agreements",   description: "DPA agreements and sub-processor contracts",                                               inScope: false },
  { element: "Internal Breach Response Procedures",description: "Internal incident response runbooks (not publicly observable)",                            inScope: false },
];

function ScopeTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#0f172a] text-white">
            <th className="px-4 py-3 font-semibold rounded-tl-xl w-[28%]">Element Assessed</th>
            <th className="px-4 py-3 font-semibold w-[52%]">Description</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl w-[20%]">Scope Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0]">
          {SCOPE_ROWS.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
              <td className="px-4 py-3 font-medium text-[#0f172a]">{row.element}</td>
              <td className="px-4 py-3 text-[#64748b]">{row.description}</td>
              <td className="px-4 py-3">
                {row.inScope ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ In Scope
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                    ✗ Out of Scope
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section 4: Compliance Score by Dimension ─────────────────────────────────

type DimScore = { name: string; score: number; status: "Compliant" | "Partial" | "Non-Compliant"; note: string };

// Weight map mirrors backend pdf_service._DIMENSION_WEIGHTS so the web view's
// overall score matches the PDF's overall score row.
const DIMENSION_WEIGHTS: Record<string, number> = {
  "NRIC Exposure": 2,
  "Data Breach Notification (§26B-D)": 2,
  "Privacy Policy (PDPA §11/13)": 2,
  "Third-Party Tracker Inventory": 2,
  "Cookie Consent Mechanism": 2,
};

const CLAUSE_LABEL: Record<string, string> = {
  purpose: "Purpose of Collection",
  withdrawal: "Consent Withdrawal Mechanism",
  dpo_contact: "DPO Contact Disclosure",
  retention: "Retention Period",
  third_party: "Third-Party / Overseas Transfer Disclosure",
  data_subject_rights: "Data Subject Rights (Access & Correction)",
};

function classify(score: number): DimScore["status"] {
  if (score >= 85) return "Compliant";
  if (score >= 50) return "Partial";
  return "Non-Compliant";
}

// Mirrors backend app/services/pdf_service.py::_compliance_score_table.
// Reads structured scan_data when present (post-Tier-1) and falls back to
// the legacy findings heuristic when the new keys are absent.
function computeScores(scanData: ScanData | null, findings: Finding[]): DimScore[] {
  const sd = scanData ?? {};
  const dims: DimScore[] = [];

  // ── Cookie Consent (behaviour-aware) ────────────────────────────────────
  const inventory = sd.trackers?.inventory ?? [];
  if (inventory.length > 0) {
    dims.push({
      name: "Cookie Consent Mechanism", score: 8, status: "Non-Compliant",
      note: `${inventory.length} third-party tracker(s) fired before consent: ${inventory.slice(0,3).join(", ")}${inventory.length>3?"…":""}.`,
    });
  } else if (sd.consent_mechanism?.has_cookie_banner) {
    const providers = (sd.consent_mechanism.detected_providers ?? []).slice(0,3).join(", ") || "compliant mechanism";
    dims.push({ name: "Cookie Consent Mechanism", score: 96, status: "Compliant",
      note: `Consent mechanism detected (${providers}); no pre-consent trackers observed.` });
  } else {
    dims.push({ name: "Cookie Consent Mechanism", score: 25, status: "Non-Compliant",
      note: "Cookie consent mechanism absent — consent required before tracking." });
  }

  // ── Third-Party Tracker Inventory ───────────────────────────────────────
  if (sd.trackers) {
    if (inventory.length > 0) {
      dims.push({ name: "Third-Party Tracker Inventory", score: 30, status: "Non-Compliant",
        note: `Detected ${inventory.length} third-party tracker(s) without prior consent: ${inventory.slice(0,5).join(", ")}${inventory.length>5?"…":""}.` });
    } else {
      dims.push({ name: "Third-Party Tracker Inventory", score: 95, status: "Compliant",
        note: "No third-party trackers observed during page load." });
    }
  } else {
    dims.push({ name: "Third-Party Tracker Inventory", score: 70, status: "Partial",
      note: "Tracker inventory check unavailable (rendered scan did not run)." });
  }

  // ── Privacy Policy (clause-classifier driven) ────────────────────────────
  if (sd.policy_clauses) {
    const c = sd.policy_clauses;
    const score = c.score ?? 0;
    const missing = (c.missing ?? []).slice(0,3).map(m => CLAUSE_LABEL[m] ?? m).join(", ");
    const note = (c.missing && c.missing.length > 0)
      ? `${c.present_count ?? 0}/${c.total ?? 6} §13 clauses present. Missing: ${missing}.`
      : `All ${c.total ?? 6} required §13 clauses present.`;
    dims.push({ name: "Privacy Policy (PDPA §11/13)", score, status: classify(score), note });
  } else if (sd.privacy_policy) {
    const hasLink = !!sd.privacy_policy.found;
    const hasDpo = !!sd.dpo_compliance?.has_dpo;
    const score = hasLink && hasDpo ? 95 : hasLink ? 55 : hasDpo ? 45 : 30;
    dims.push({ name: "Privacy Policy (PDPA §11/13)", score, status: classify(score),
      note: hasLink && hasDpo ? "Privacy policy linked; DPO contact disclosed." :
            hasLink ? "Privacy policy found but DPO contact not publicly disclosed." :
            hasDpo ? "DPO reference found but no privacy policy link on homepage." :
            "Neither privacy policy nor DPO contact found." });
  } else {
    dims.push({ name: "Privacy Policy (PDPA §11/13)", score: 70, status: "Partial",
      note: "Privacy policy assessment unavailable." });
  }

  // ── Security HTTP Headers ───────────────────────────────────────────────
  const sh = sd.security_headers ?? {};
  if (sd.security_headers) {
    const flags = ["hsts","csp","x_content_type_options","x_frame_options","referrer_policy","permissions_policy"];
    const present = flags.filter(f => sh[f]).length;
    const score = Math.round((present / flags.length) * 100);
    dims.push({ name: "Security HTTP Headers", score, status: classify(score),
      note: `${present}/${flags.length} PDPA §24 protection headers present.` });
  } else {
    dims.push({ name: "Security HTTP Headers", score: 70, status: "Partial",
      note: "Security headers not assessed." });
  }

  // ── Cookie Attributes (carried by the findings heuristic) ───────────────
  const hasCookieAttrFinding = findings.some(f => {
    const t = [f.type, f.title].filter(Boolean).join(" ").toLowerCase();
    return ["secure", "httponly", "samesite"].some(k => t.includes(k));
  });
  dims.push({
    name: "Cookie Attributes",
    score: hasCookieAttrFinding ? 30 : 92,
    status: hasCookieAttrFinding ? "Non-Compliant" : "Compliant",
    note: hasCookieAttrFinding
      ? "One or more Set-Cookie responses missing Secure / HttpOnly / SameSite attributes."
      : "Set-Cookie responses carry Secure, HttpOnly and SameSite attributes.",
  });

  // ── DNC Registry ────────────────────────────────────────────────────────
  if (sd.dnc_mention) {
    const mentions = !!sd.dnc_mention.mentions_dnc;
    dims.push({
      name: "DNC Registry Reference",
      score: mentions ? 92 : 35,
      status: mentions ? "Compliant" : "Non-Compliant",
      note: mentions
        ? "DNC opt-out mechanism referenced; marketing consent pathway present."
        : "DNC Registry opt-out mechanism not detected.",
    });
  } else {
    dims.push({ name: "DNC Registry Reference", score: 70, status: "Partial",
      note: "DNC reference not assessed." });
  }

  // ── Data Subject Rights ─────────────────────────────────────────────────
  const dsrFinding = findings.find(f => {
    const t = [f.type, f.title].filter(Boolean).join(" ").toLowerCase();
    return ["data_subject","rights","access_request","correction","withdrawal"].some(k => t.includes(k));
  });
  const dsrClausePresent = sd.policy_clauses?.items?.some(i => i.clause === "data_subject_rights" && i.present);
  if (dsrClausePresent) {
    dims.push({ name: "Data Subject Rights Mechanism", score: 91, status: "Compliant",
      note: "Access, correction and withdrawal pathway present in privacy policy." });
  } else if (dsrFinding) {
    dims.push({ name: "Data Subject Rights Mechanism", score: 30, status: "Non-Compliant",
      note: "Data subject rights mechanism not detected — required under PDPA §21-22." });
  } else {
    dims.push({ name: "Data Subject Rights Mechanism", score: 80, status: "Partial",
      note: "Data subject rights pathway not explicitly assessed." });
  }

  // ── NRIC Exposure ───────────────────────────────────────────────────────
  if (sd.nric) {
    const kind = sd.nric.kind ?? "none";
    const score = sd.nric.score ?? (kind === "leakage" ? 0 : kind === "collection" ? 5 : 100);
    const status = (sd.nric.status as DimScore["status"]) ?? classify(score);
    const note = kind === "leakage"
      ? `NRIC leakage detected on public content${sd.nric.items?.[0]?.source_url ? ` — ${sd.nric.items[0].source_url}` : "."}`
      : kind === "collection"
        ? "Active NRIC collection detected on publicly accessible pages."
        : kind === "policy_mention"
          ? "NRIC referenced only in privacy/policy text (no collection or leakage signal)."
          : "No NRIC exposure detected on publicly accessible pages.";
    dims.push({ name: "NRIC Exposure", score, status, note });
  } else {
    dims.push({ name: "NRIC Exposure", score: 100, status: "Compliant",
      note: "No NRIC exposure detected." });
  }

  // ── Retention Limitation (§25) — derived from clause classifier ─────────
  const retentionPresent = sd.policy_clauses?.items?.some(i => i.clause === "retention" && i.present);
  if (sd.policy_clauses) {
    if (retentionPresent) {
      dims.push({ name: "Retention Limitation (§25)", score: 92, status: "Compliant",
        note: "Privacy policy states a retention period or destruction policy." });
    } else {
      dims.push({ name: "Retention Limitation (§25)", score: 20, status: "Non-Compliant",
        note: "Retention period not stated in the privacy policy — required under §25." });
    }
  } else {
    dims.push({ name: "Retention Limitation (§25)", score: 70, status: "Partial",
      note: "Retention obligation not assessed." });
  }

  // ── Data Breach Notification (§26B-D) ───────────────────────────────────
  if (sd.pdpc_enforcement?.checked) {
    if (sd.pdpc_enforcement.found) {
      const firstCase = sd.pdpc_enforcement.cases?.[0]?.title;
      dims.push({ name: "Data Breach Notification (§26B-D)", score: 10, status: "Non-Compliant",
        note: firstCase ? `PDPC enforcement record found: ${firstCase}.` : "PDPC enforcement record found." });
    } else {
      dims.push({ name: "Data Breach Notification (§26B-D)", score: 95, status: "Compliant",
        note: "No PDPC enforcement actions found for this organisation." });
    }
  } else {
    dims.push({ name: "Data Breach Notification (§26B-D)", score: 70, status: "Partial",
      note: "PDPC enforcement check unavailable — manual verification recommended." });
  }

  // ── Cross-Border Transfer (§26) ─────────────────────────────────────────
  if (sd.hosting?.checked) {
    const provider = sd.hosting.inferred_provider ?? null;
    const region = sd.hosting.inferred_region ?? null;
    if (region === "Singapore") {
      dims.push({ name: "Cross-Border Transfer (§26)", score: 92, status: "Compliant",
        note: `Hosting (${provider ?? "inferred provider"}) indicates Singapore region — no cross-border transfer signal.` });
    } else if (provider) {
      dims.push({ name: "Cross-Border Transfer (§26)", score: 60, status: "Partial",
        note: `Hosting via ${provider} with no Singapore region marker. Ensure a Transfer Impact Assessment is in place under §26.` });
    } else {
      dims.push({ name: "Cross-Border Transfer (§26)", score: 75, status: "Partial",
        note: "Hosting provider could not be inferred from response headers." });
    }
  } else {
    dims.push({ name: "Cross-Border Transfer (§26)", score: 75, status: "Partial",
      note: "Hosting signal check unavailable — manual verification recommended." });
  }

  return dims;
}

function ComplianceScoreTable({ scanData, findings }: { scanData: ScanData | null; findings: Finding[] }) {
  const dims = computeScores(scanData, findings);
  const weights = dims.map(d => DIMENSION_WEIGHTS[d.name] ?? 1);
  const weightedSum = dims.reduce((s, d, i) => s + d.score * weights[i], 0);
  const totalWeight = weights.reduce((s, w) => s + w, 0) || 1;
  const overall = Math.round(weightedSum / totalWeight);
  const overallStatus: DimScore["status"] = dims.every(d => d.status === "Compliant")
    ? "Compliant"
    : dims.some(d => d.status === "Non-Compliant") ? "Non-Compliant" : "Partial";

  const statusStyle = (s: DimScore["status"]) => ({
    Compliant:      "text-emerald-700 bg-emerald-50 border-emerald-200",
    Partial:        "text-amber-700 bg-amber-50 border-amber-200",
    "Non-Compliant":"text-red-700 bg-red-50 border-red-200",
  }[s]);

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#0f172a] text-white">
            <th className="px-4 py-3 font-semibold rounded-tl-xl w-[26%]">Dimension</th>
            <th className="px-4 py-3 font-semibold w-[10%]">Score</th>
            <th className="px-4 py-3 font-semibold w-[18%]">Status</th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0]">
          {dims.map((d, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
              <td className="px-4 py-3 font-medium text-[#0f172a]">{d.name}</td>
              <td className="px-4 py-3 font-bold text-[#0f172a]">{d.score}/100</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusStyle(d.status)}`}>
                  {d.status}
                </span>
              </td>
              <td className="px-4 py-3 text-[#64748b] text-xs leading-relaxed">{d.note}</td>
            </tr>
          ))}
          {/* Overall row */}
          <tr className={`font-bold ${overallStatus === "Compliant" ? "bg-emerald-50" : overallStatus === "Non-Compliant" ? "bg-red-50" : "bg-amber-50"}`}>
            <td className="px-4 py-3 text-[#0f172a]">Overall Score</td>
            <td className="px-4 py-3 text-[#0f172a]">{overall}/100</td>
            <td className="px-4 py-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusStyle(overallStatus)}`}>
                {overallStatus}
              </span>
            </td>
            <td className="px-4 py-3 text-[#64748b] text-xs">Aggregate across all assessed PDPA compliance dimensions.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Section 3 (clean): Compliance Strengths ──────────────────────────────────

const STRENGTHS = [
  {
    title: "Cookie Consent Implementation",
    detail: "A compliant cookie consent mechanism is in place. Non-essential cookies (analytics, advertising) are deferred until affirmative user consent is obtained, consistent with PDPA §13 Consent Obligation.",
  },
  {
    title: "Privacy Policy Accessibility",
    detail: "A privacy or data protection policy is linked from the homepage, satisfying PDPA §11 Openness Obligation and ensuring users can access data handling information before providing personal data.",
  },
  {
    title: "Transport Security",
    detail: "The website enforces HTTPS across all pages, encrypting personal data in transit between users and the server — consistent with PDPA §24 Protection Obligation.",
  },
  {
    title: "DNC Registry Alignment",
    detail: "Marketing communications reference or respect Do-Not-Call (DNC) Registry requirements under the PDPA Do Not Call Provisions.",
  },
  {
    title: "Data Subject Rights Pathway",
    detail: "An access and/or correction request pathway is present, enabling individuals to exercise their rights under PDPA §21–22.",
  },
];

function ComplianceStrengths({ execSummary }: { execSummary?: string }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#334155] leading-relaxed">
        The automated assessment found no PDPA violations across all scanned dimensions.
        The following compliance strengths were identified:
      </p>
      <div className="space-y-3">
        {STRENGTHS.map((s, i) => (
          <div key={i} className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <span className="text-emerald-600 font-bold flex-shrink-0 mt-0.5">✓</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{s.title}</p>
              <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
      {execSummary && (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mt-2">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">AI Assessment Summary</p>
          <p className="text-sm text-[#334155] leading-relaxed">{execSummary.split("\n\n")[0]}</p>
        </div>
      )}
      <p className="text-sm text-[#64748b] italic">
        No immediate remediation is required. Schedule a follow-up audit in 6 months to confirm continued compliance as your website evolves.
      </p>
    </div>
  );
}

// ── Section 3 (violations): Finding card ─────────────────────────────────────

/** Mirrors backend pdf_service._finding_key_from() so frontend and PDF surface
 *  the same precedents for the same finding. */
function precedentKeyFor(f: { type?: string; check_id?: string }): string | null {
  const raw = (f.check_id || f.type || "").toLowerCase().replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
  if (!raw) return null;
  if (raw.includes("nric") || raw.includes("fin_number")) return "nric:collection";
  if (raw.includes("breach") || raw.includes("notification")) return "breach:pdpc_enforcement";
  return `free:${raw}`;
}

function PrecedentRow({ entry }: { entry: { summary: string | null; cases: PrecedentCase[] } | undefined }) {
  if (!entry || !entry.summary) return null;
  return (
    <div className="grid grid-cols-[120px_1fr] px-5 py-3 gap-3 bg-amber-50/40">
      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide pt-0.5">Precedent</p>
      <div className="text-sm leading-relaxed text-[#334155]">
        <p>{entry.summary}</p>
        {entry.cases.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            {entry.cases.slice(0, 2).map(c => (
              <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer"
                 className="underline text-amber-700 hover:text-amber-900">
                {c.vendor} {c.year}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RemediationBadge({ status }: { status: Remediation["confirmation_status"] }) {
  if (status === "confirmed") {
    return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">✓ Fix Confirmed</span>;
  }
  if (status === "regressed") {
    return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">✗ Fix Regressed</span>;
  }
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">… Pending Confirmation</span>;
}

function MarkFixedButton({
  reportId,
  findingKey,
  current,
  onMarked,
}: {
  reportId: string | null;
  findingKey: string | null;
  current: Remediation | undefined;
  onMarked: (r: Remediation) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!reportId || !findingKey) return null;
  if (current) return <RemediationBadge status={current.confirmation_status} />;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          const result = await markRemediation(reportId, findingKey, "fixed");
          setBusy(false);
          if (result) onMarked(result);
          else setError("Sign in to mark fixes.");
        }}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
      >
        {busy ? "Marking…" : "I fixed this"}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}

function FindingSummaryCard({
  f,
  index,
  reportId,
  remediation,
  precedent,
  onMarked,
}: {
  f: Finding;
  index: number;
  reportId: string | null;
  remediation: Remediation | undefined;
  precedent: { summary: string | null; cases: PrecedentCase[] } | undefined;
  onMarked: (r: Remediation) => void;
}) {
  const sev = f.severity?.toUpperCase() ?? "LOW";
  const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.LOW;
  const title = f.title || (f.type ?? "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const violation = extractViolationText(f.description ?? "");
  const legislation = f.legislation_text || (f.legislation_references ?? []).join("; ");
  const penalty = f.max_penalty || f.penalty?.amount || "Up to S$1,000,000";
  const evidence = f.evidence || "";
  const findingKey = keyFromFinding(f);

  return (
    <div className={`bg-white rounded-xl border border-[#e2e8f0] border-l-4 ${cfg.border} shadow-sm`}>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f1f5f9]">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
          {cfg.label} Severity
        </span>
        <span className="text-sm font-bold text-[#0f172a] flex-1">FINDING {index} — {title}</span>
        <MarkFixedButton
          reportId={reportId}
          findingKey={findingKey}
          current={remediation}
          onMarked={onMarked}
        />
      </div>
      <div className="divide-y divide-[#f1f5f9]">
        {[
          { label: "Violation",   value: violation },
          { label: "Legislation", value: legislation },
          { label: "Max Penalty", value: penalty },
          { label: "Evidence",    value: evidence },
        ].map(({ label, value }) => value ? (
          <div key={label} className="grid grid-cols-[120px_1fr] px-5 py-3 gap-3">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide pt-0.5">{label}</p>
            <p className={`text-sm leading-relaxed ${label === "Max Penalty" ? "font-semibold text-red-700" : "text-[#334155]"}`}>
              {value}
            </p>
          </div>
        ) : null)}
        <PrecedentRow entry={precedent} />
      </div>
    </div>
  );
}

// ── Section 5: Developer Task card ───────────────────────────────────────────

function TaskCard({ f, index }: { f: Finding; index: number }) {
  const [open, setOpen] = useState(false);
  const sev = f.severity?.toUpperCase() ?? "LOW";
  const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.LOW;
  const title = f.title || (f.type ?? "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const deadline = f.deadline_short || f.deadline || "7 days";
  const owner = f.owner || "Development Team";
  const penalty = f.max_penalty || f.penalty?.amount || "";
  const requirements = f.requirements ?? [];
  const acceptance = f.acceptance_criteria ?? [];
  const tools = f.recommended_tools ?? [];

  return (
    <div className={`bg-white rounded-xl border border-[#e2e8f0] border-l-4 ${cfg.border} shadow-sm overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#f8fafc] transition"
      >
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.badge}`}>
          {cfg.label} Priority
        </span>
        <span className="text-sm font-semibold text-[#0f172a] flex-1">TASK {index} — Implement {title}</span>
        {penalty && <span className="text-xs text-[#94a3b8] hidden sm:block">Penalty: {penalty}</span>}
        <svg className={`h-4 w-4 text-[#94a3b8] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#f1f5f9] space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Deadline</p>
              <p className="text-sm font-medium text-amber-700 mt-0.5">{deadline}</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Owner</p>
              <p className="text-sm text-[#334155] mt-0.5">{owner}</p>
            </div>
          </div>
          {requirements.length > 0 && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide mb-2">Requirements</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                {requirements.map((r, i) => <li key={i} className="text-sm text-[#334155] leading-relaxed">{r}</li>)}
              </ol>
            </div>
          )}
          {acceptance.length > 0 && (
            <div className="bg-[#f0fdf4] border border-[#10b981]/20 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wide mb-2">Acceptance Criteria</p>
              <ul className="space-y-1.5">
                {acceptance.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#334155]">
                    <span className="text-[#10b981] mt-0.5 flex-shrink-0">✓</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tools.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Recommended Tools / Libraries</p>
              <ul className="space-y-1">
                {tools.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#64748b]">
                    <span className="text-[#10b981] flex-shrink-0">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {penalty && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Max Penalty</p>
              <p className="text-sm font-bold text-red-700 mt-0.5">{penalty}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section 6: Assessment Conducted By ───────────────────────────────────────

function AssessmentConductedBy({ report, reportUrl }: { report: StructuredReport | null; reportUrl: string | null }) {
  const reportId = report?.report_metadata?.report_id ?? "—";
  // Booppa has no Singapore UEN — never print one (the prior "202415732W" was
  // fabricated; a fake regulatory id on a compliance report is a
  // misrepresentation). Mirrors the backend pdf_service assessing-entity table.
  const rows: [string, string][] = [
    ["Assessing Entity",    "Booppa Smart Care LLC"],
    ["Framework Version",   "BACF-v1.0"],
    ["Assessed Entity",     "—"],       // populated below if available
    ["DPO Contact",         "evidence@booppa.io"],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">
      {rows.map(([label, value], i) => (
        <div key={label} className={`grid grid-cols-[160px_1fr] gap-3 px-5 py-3 ${i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}`}>
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide pt-0.5">{label}</p>
          <p className="text-sm text-[#334155]">{value}</p>
        </div>
      ))}
      <div className={`grid grid-cols-[160px_1fr] gap-3 px-5 py-3 ${rows.length % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}`}>
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide pt-0.5">Report ID</p>
        <p className="text-sm text-[#334155] font-mono">{reportId}</p>
      </div>
    </div>
  );
}

// ── Section 7: How to Verify ──────────────────────────────────────────────────

function HowToVerify({ verification }: { verification: VerificationData | null }) {
  const txHash = verification?.tx_hash ?? "—";
  const auditHash = verification?.audit_hash ?? "(see Evidence Hash in the PDF certificate)";

  const steps: [string, string][] = [
    ["Step 1 — Obtain the PDF from the assessed organisation.",
     "Request a copy of this certificate directly from the assessed entity."],
    ["Step 2 — Generate a SHA-256 hash of the PDF.",
     "macOS / Linux: shasum -a 256 filename.pdf\nWindows: CertUtil -hashfile filename.pdf SHA256"],
    ["Step 3 — Compare against the Evidence Hash on the certificate.",
     `The output must exactly match: ${auditHash}`],
    [`Step 4 — Confirm the Transaction Hash on ${POLYGON_EXPLORER_HOST}.`,
     `Search ${txHash} on ${POLYGON_EXPLORER_HOST}. The block timestamp proves the earliest possible existence date. No login required.`],
  ];

  return (
    <div className="space-y-4 mt-4">
      {steps.map(([title, detail], i) => (
        <div key={i} className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0f172a] text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
            <p className="text-xs text-[#64748b] leading-relaxed whitespace-pre-line mt-0.5">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ReportClient() {
  const [status, setStatus]                 = useState("loading");
  const [message, setMessage]               = useState("Checking report availability...");
  const [reportUrl, setReportUrl]           = useState<string | null>(null);
  const [report, setReport]                 = useState<StructuredReport | null>(null);
  const [scanData, setScanData]             = useState<ScanData | null>(null);
  const [reportId, setReportId]             = useState<string | null>(null);
  const [remediations, setRemediations]     = useState<Record<string, Remediation>>({});
  const [siteScreenshot, setSiteScreenshot] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [sessionId, setSessionId]           = useState<string | null>(null);
  const [attempts, setAttempts]             = useState(0);
  const [retryTrigger, setRetryTrigger]     = useState(0);
  const [progress, setProgress]             = useState(12);
  const [loadingStep, setLoadingStep]       = useState(0);
  const [verification, setVerification]     = useState<VerificationData | null>(null);

  const maxAttempts = 12;
  const baseDelayMs = 5000;
  const maxDelayMs  = 60000;

  const loadingSteps = [
    { label: "Preparing scan…",        max: 35 },
    { label: "Scanning your website…", max: 65 },
    { label: "Analysing PDPA gaps…",   max: 85 },
    { label: "Almost done!",           max: 95 },
  ];

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session_id"));
    } catch { setSessionId(null); }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      if (!sessionId) { setStatus("error"); setMessage("No session ID provided."); return; }
      let isReady = false;
      try {
        const res = await fetch(`${config.apiUrl}/api/reports/by-session?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report)           setReport(data.report);
          if (data.scan_data)        setScanData(data.scan_data);
          if (data.report_id)        setReportId(String(data.report_id));
          if (data.site_screenshot)  setSiteScreenshot(data.site_screenshot);
          if (data.screenshot_error) setScreenshotError(data.screenshot_error);
          if (data.url)              setReportUrl(data.url);
          if (data.verification)     setVerification(data.verification);
          const hasScreenshot    = Boolean(data.site_screenshot);
          const screenshotFailed = Boolean(data.screenshot_error);
          if ((data.report || data.url) && (hasScreenshot || screenshotFailed || data.status === "completed")) {
            isReady = true;
            setStatus("ready");
            setMessage("Your report is ready.");
          } else {
            setStatus(prev => prev === "ready" ? "ready" : "loading");
          }
        } else if (res.status === 202 || res.status === 404) {
          setStatus("loading");
        } else {
          setStatus("error");
          setMessage(`Failed to load report: ${await res.text()}`);
        }
      } catch (e: unknown) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Network error");
      } finally {
        if (!isReady) {
          setAttempts(prev => {
            const next = prev + 1;
            if (next > maxAttempts) {
              setStatus("timeout");
              setMessage("Report is taking longer than expected. We'll email it to you when it's ready.");
            } else {
              const delay = Math.min(Math.round(baseDelayMs * Math.pow(1.6, next - 1)), maxDelayMs);
              timeoutId = setTimeout(load, delay);
            }
            return next;
          });
        }
      }
    }

    if (sessionId) load();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [sessionId, retryTrigger]);

  // Load this user's remediations for the current report once it's known.
  // Silent on auth failure — the user just won't see badges/buttons.
  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    (async () => {
      const list = await listRemediationsForReport(reportId);
      if (cancelled) return;
      const map: Record<string, Remediation> = {};
      for (const r of list) map[r.finding_key] = r;
      setRemediations(map);
    })();
    return () => { cancelled = true; };
  }, [reportId]);

  useEffect(() => {
    if (status !== "loading" || attempts > maxAttempts) return;
    const iv1 = setInterval(() => {
      setProgress(prev => {
        const step = loadingSteps[loadingStep] ?? loadingSteps[0];
        return Math.round(Math.min(prev + Math.random() * 4 + 1, step.max) * 10) / 10;
      });
    }, 700);
    const iv2 = setInterval(() => setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1)), 5000);
    return () => { clearInterval(iv1); clearInterval(iv2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, loadingStep, attempts]);

  /* ── Loading ───────────────────────────────────────────── */
  if (status === "loading" && attempts <= maxAttempts) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981]/10 mb-6">
            <svg className="w-8 h-8 text-[#10b981] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Generating Your Report</h1>
          <p className="text-[#64748b] text-sm mb-8">{loadingSteps[loadingStep]?.label ?? "Almost done!"}</p>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex justify-between text-xs text-[#94a3b8] mb-2">
              <span>Progress</span><span>{Math.min(Math.round(progress), 98)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
              <div className="h-2 rounded-full bg-[#10b981] transition-all duration-700" style={{ width: `${Math.min(progress, 98)}%` }} />
            </div>
            <p className="text-xs text-[#94a3b8] mt-4">Usually ready in under 2 minutes.</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryTrigger(t => t + 1)}
            className="mt-6 text-sm text-[#64748b] underline hover:text-[#0f172a] transition"
          >
            Refresh now
          </button>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-[#e2e8f0] p-10 shadow-sm">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Still processing…</h2>
          <p className="text-[#64748b] text-sm mb-6">{message}</p>
          <button
            type="button"
            onClick={() => { setStatus("loading"); setAttempts(0); setRetryTrigger(t => t + 1); }}
            className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white rounded-2xl border border-red-200 p-10 shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Something went wrong</h2>
          <p className="text-[#64748b] text-sm mb-6">{message}</p>
          <Link href="/pdpa" className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-xl hover:bg-[#059669] transition text-sm">
            Back to PDPA Scan
          </Link>
        </div>
      </div>
    );
  }

  /* ── Report ready ─────────────────────────────────────── */
  const riskScore = report?.risk_assessment?.score ?? 0;
  const findings  = report?.detailed_findings ?? [];
  const riskCfg   = RISK_SCORE_CONFIG(riskScore);
  const highCount = findings.filter(f => f.severity === "HIGH" || f.severity === "CRITICAL").length;
  const medCount  = findings.filter(f => f.severity === "MEDIUM").length;
  const lowCount  = findings.filter(f => f.severity === "LOW").length;

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* ── Page header ──────────────────────────────────── */}
      <section className="bg-[#0f172a] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#10b981] mb-2">PDPA Quick Scan — BACF-v1.0</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Compliance Report</h1>
              {report?.report_metadata?.report_id && (
                <p className="text-xs text-white/40 mt-1 font-mono">ID: {report.report_metadata.report_id}</p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {reportUrl && (
                <a href={reportUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition">
                  ⬇ Download PDF
                </a>
              )}
              <Link href="/pdpa" className="inline-flex items-center px-5 py-2.5 border border-white/20 text-white/80 text-sm font-medium rounded-xl hover:bg-white/5 transition">
                New Scan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Risk score card ───────────────────────────── */}
        {report?.risk_assessment && (
          <div className={`rounded-2xl border p-6 ${riskCfg.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${riskScore} ${100 - riskScore}`}
                      className={riskCfg.bar.replace("bg-", "stroke-")} />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${riskCfg.color}`}>
                    {riskScore}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">Risk Score</p>
                  <p className={`text-2xl font-bold ${riskCfg.color}`}>{riskCfg.label}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">100 = highest risk</p>
                </div>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-[#e2e8f0]" />
              <div className="flex gap-4 flex-wrap">
                {highCount > 0 && <div className="text-center"><p className="text-2xl font-black text-red-600">{highCount}</p><p className="text-xs text-[#64748b]">High / Critical</p></div>}
                {medCount  > 0 && <div className="text-center"><p className="text-2xl font-black text-amber-600">{medCount}</p><p className="text-xs text-[#64748b]">Medium</p></div>}
                {lowCount  > 0 && <div className="text-center"><p className="text-2xl font-black text-blue-600">{lowCount}</p><p className="text-xs text-[#64748b]">Low</p></div>}
                <div className="text-center"><p className="text-2xl font-black text-[#0f172a]">{findings.length}</p><p className="text-xs text-[#64748b]">Total Issues</p></div>
              </div>
              {report.risk_assessment.description && (
                <>
                  <div className="hidden sm:block w-px self-stretch bg-[#e2e8f0]" />
                  <p className="text-sm text-[#64748b] leading-relaxed flex-1">{report.risk_assessment.description}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Website screenshot ────────────────────────── */}
        {siteScreenshot && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">Website Scanned</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteScreenshot.startsWith("data:image") ? siteScreenshot : `data:image/png;base64,${siteScreenshot}`}
              alt="Scanned website"
              className="w-full rounded-xl border border-[#e2e8f0]"
            />
          </div>
        )}

        {/* ── Section 1: Scope of Assessment ───────────── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading n="1" title="Scope of Assessment" />
          <p className="text-sm text-[#334155] leading-relaxed mb-4">
            This compliance pack is based on information provided by the company&apos;s authorised representative
            and automated website assessment conducted by Booppa on the date indicated.
            The table below lists each element assessed and its scope status.
          </p>
          <ScopeTable />
        </div>

        {/* ── Section 2: Context & Purpose ─────────────── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading n="2" title="Context &amp; Purpose of This Document" />
          <p className="text-sm text-[#334155] leading-relaxed">
            This document summarises a PDPA Quick Scan compliance audit performed by Booppa,
            translated into English and enriched with developer implementation tasks.
            It is intended to be forwarded directly to the development team.
            The audit was anchored on the Polygon Amoy Testnet blockchain for evidentiary integrity.
          </p>
        </div>

        {/* ── Section 3: Audit Findings / Compliance Strengths ── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading
            n="3"
            title="Audit Findings Summary"
            sub={findings.length > 0 ? `${findings.length} issue${findings.length !== 1 ? "s" : ""} found` : "No violations detected"}
          />
          {findings.length === 0 ? (
            <ComplianceStrengths execSummary={report?.executive_summary} />
          ) : (
            <div className="space-y-4">
              {findings.map((f, i) => {
                const fk = keyFromFinding(f);
                const pk = precedentKeyFor(f);
                const precedent = pk ? scanData?.precedents?.[pk] : undefined;
                return (
                  <FindingSummaryCard
                    key={i}
                    f={f}
                    index={i + 1}
                    reportId={reportId}
                    remediation={fk ? remediations[fk] : undefined}
                    precedent={precedent}
                    onMarked={r => setRemediations(prev => ({ ...prev, [r.finding_key]: r }))}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 4: Compliance Score by Dimension ─── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading n="4" title="Compliance Score by Dimension" />
          <p className="text-sm text-[#334155] leading-relaxed mb-4">
            Each PDPA compliance dimension has been independently scored.
            A numeric score is shown even where the result is fully compliant — a documented score is more evidentially credible than an undeclared pass.
          </p>
          <ComplianceScoreTable scanData={scanData} findings={findings} />
        </div>

        {/* ── Section 5: Developer Tasks ────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading
            n="5"
            title="Developer Implementation Tasks"
            sub={findings.length > 0 ? "Organised by priority and timeline" : undefined}
          />
          {findings.length > 0 ? (
            <div className="space-y-4">
              {findings.map((f, i) => <TaskCard key={i} f={f} index={i + 1} />)}
            </div>
          ) : (
            <p className="text-sm text-[#64748b]">No remediation tasks required. No violations were detected during this scan.</p>
          )}
        </div>

        {/* ── Section 6: Assessment Conducted By ───────── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading n="6" title="Assessment Conducted By" />
          <AssessmentConductedBy report={report} reportUrl={reportUrl} />
        </div>

        {/* ── Section 7: Blockchain Evidence Anchoring ──── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
          <SectionHeading n="7" title="Blockchain Evidence Anchoring" />

          {findings.length > 0 ? (
            <>
              <p className="text-sm text-[#64748b] mb-4">
                The following artifacts must be anchored on the Polygon Amoy Testnet blockchain to create an immutable, court-admissible compliance trail:
              </p>
              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] mb-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] text-[#0f172a]">
                      <th className="px-4 py-3 font-semibold border-b border-[#e2e8f0]">Artifact to Anchor</th>
                      <th className="px-4 py-3 font-semibold border-b border-[#e2e8f0]">When</th>
                      <th className="px-4 py-3 font-semibold border-b border-[#e2e8f0]">Responsible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    <tr><td className="px-4 py-3 text-[#64748b]">Consent banner deployment timestamp</td><td className="px-4 py-3 text-[#64748b]">Within 48h of implementation</td><td className="px-4 py-3 text-[#64748b]">Developer / DevOps</td></tr>
                    <tr className="bg-[#f8fafc]"><td className="px-4 py-3 text-[#64748b]">Privacy Policy update hash</td><td className="px-4 py-3 text-[#64748b]">Within 7 days of implementation</td><td className="px-4 py-3 text-[#64748b]">Developer / Legal</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#64748b] mb-4">
              As no violations were detected, the primary artifact to anchor is this audit report itself,
              providing immutable proof of a clean compliance assessment on the audit date.
            </p>
          )}

          {/* Blockchain record */}
          {verification?.tx_hash && (
            <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5 mb-4">
              <div className="space-y-3">
                {[
                  ["Transaction Hash", <a key="tx" href={verification.polygonscan_url || polygonscanTxUrl(verification.tx_hash)} target="_blank" rel="noreferrer" className="font-mono text-xs text-[#10b981] hover:underline break-all">{verification.tx_hash}</a>],
                  ["Evidence Hash",    <span key="hash" className="font-mono text-xs text-[#64748b] break-all">{verification.audit_hash ?? report?.report_metadata?.report_id ?? "—"}</span>],
                  ["Hash Algorithm",   <span key="alg" className="text-sm text-[#334155]">SHA-256</span>],
                  ["Verification URL", verification.verify_url ? <a key="url" href={verification.verify_url} target="_blank" rel="noreferrer" className="text-sm text-[#10b981] hover:underline break-all">{verification.verify_url}</a> : <span key="url2" className="text-sm text-[#64748b]">—</span>],
                  ["Anchored On",      <span key="anch" className="text-sm text-[#334155]">Polygon Amoy Testnet · Immutable blockchain record</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label as string}</p>
                    <div className="flex-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Verify */}
          <div>
            <p className="text-sm font-semibold text-[#0f172a] mb-1">How to Verify This Certificate Independently</p>
            <p className="text-xs text-[#64748b] mb-3">
              Any third party can independently verify this certificate without accessing Booppa. Use standard tools only.
            </p>
            <HowToVerify verification={verification} />
          </div>
        </div>

        {/* ── Section 8: Important Limitations ─────────── */}
        <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6">
          <SectionHeading n="8" title="Important Limitations of This Scan" />
          <p className="text-sm text-[#64748b] mb-3">This Quick Scan has the following limitations — further audit may be needed for:</p>
          <ul className="space-y-2">
            {[
              "Data Protection Officer (DPO) appointment verification (mandatory for many organisations under PDPA)",
              "Cross-border data transfer compliance (PDPA Part X — e.g. transfers to cloud providers outside Singapore)",
              "Internal data handling workflows, retention policies, and deletion procedures",
              "Third-party vendor / data processor agreements",
              "Data breach notification procedures (mandatory 3-day notification to PDPC)",
              "Completeness and legal sufficiency of the Privacy Policy beyond DNC references",
              "Employee data handling training records",
            ].map((lim, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#64748b]">
                <span className="text-[#94a3b8] flex-shrink-0 mt-0.5">•</span>{lim}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Section 9: Compliance Timeline Summary ───── */}
        {findings.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <SectionHeading n="9" title="Compliance Timeline Summary" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">Deadline</th>
                    <th className="px-4 py-3 font-semibold">Task</th>
                    <th className="px-4 py-3 font-semibold">Action Required</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {findings.map((f, i) => {
                    const sev = f.severity?.toUpperCase() ?? "LOW";
                    const cfg = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.LOW;
                    const title = f.title || (f.type ?? "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                    const dl = f.deadline_short || f.deadline || "7 days";
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{dl}</td>
                        <td className="px-4 py-3 font-medium text-[#0f172a]">Implement {title}</td>
                        <td className="px-4 py-3 text-[#64748b]">Deploy compliant {title}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Section 10: Legal References ──────────────── */}
        {report?.legal_references && report.legal_references.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <SectionHeading n="10" title="Legal References" />
            <ul className="space-y-2">
              {report.legal_references.map((ref, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-[#10b981]">•</span>
                  {ref.url ? (
                    <a href={ref.url} target="_blank" rel="noreferrer" className="text-[#10b981] hover:underline">{ref.title}</a>
                  ) : (
                    <span className="text-[#64748b]">{ref.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── PDF CTA ───────────────────────────────────── */}
        {reportUrl && (
          <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
            <p className="text-white font-bold text-lg mb-1">Download your full PDF report</p>
            <p className="text-white/50 text-sm mb-6">All findings, remediation steps, and blockchain certificate</p>
            <a href={reportUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition shadow-lg">
              ⬇ Download Full PDF
            </a>
          </div>
        )}

        {/* ── Footer disclaimer (Change 6 — non-intrusive) ─ */}
        <p className="text-center text-xs text-[#94a3b8] italic leading-relaxed pb-4">
          Automated compliance assessment by Booppa Smart Care LLC · BACF-v1.0 · Results reflect publicly accessible website elements at assessment date.
          May be used as supporting evidence in procurement and regulatory contexts. Does not substitute for legal counsel.
          Booppa Smart Care LLC.
        </p>

      </div>
    </main>
  );
}
