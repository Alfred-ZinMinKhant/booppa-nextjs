import Link from "next/link";
import { notFound } from "next/navigation";
import { polygonscanTxUrl } from "@/lib/blockchain";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_BASE ||
  "https://api.booppa.io";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_BASE || "https://www.booppa.io";

type AcraInfo = {
  verified?: boolean;
  entity_type?: string | null;
  registration_date?: string | null;
  entity_status?: string | null;
  entity_live?: boolean | null;
};

type VendorProof = {
  compliance_score?: number | null;
  procurement_readiness?: string | null;
  verification_level?: string | null;
  acra?: AcraInfo;
  validity?: { expires_at?: string | null; expired?: boolean | null };
};

type VerifyData = {
  report_id: string;
  framework: string;
  company_name?: string | null;
  status?: string | null;
  tx_hash?: string | null;
  anchored?: boolean;
  format?: string;
  schema_version?: string;
  disclaimer?: string;
  vendor_proof?: VendorProof;
};

async function fetchVerification(hash: string): Promise<VerifyData | null> {
  const res = await fetch(`${API_BASE}/api/v1/verify/${hash}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-SG", { day: "2-digit", month: "long", year: "numeric" });
}

type VerifyPageProps = { params: { hash: string } };

export default async function VerifyPage({ params }: VerifyPageProps) {
  const data = await fetchVerification(params.hash);
  if (!data) {
    notFound();
  }

  const vp = data.vendor_proof;
  const anchoredLabel = data.anchored ? "Confirmed" : "Pending";

  // ── Vendor Proof certificate view ─────────────────────────────────────────
  if (vp) {
    const company = data.company_name || "This vendor";
    const expiresOn = fmtDate(vp.validity?.expires_at);
    const expired = vp.validity?.expired === true;
    const acra = vp.acra || {};
    const entityStatus = (acra.entity_status || "").trim();
    const entityNotLive =
      entityStatus !== "" && acra.entity_live === false;
    const score = vp.compliance_score;
    const verifyUrl = `${SITE_BASE}/verify/${params.hash}`;
    const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      verifyUrl,
    )}`;

    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Status banner */}
          <div
            className={`px-8 py-5 ${
              expired ? "bg-red-600" : "bg-slate-900"
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-white/70">
              Booppa Vendor Proof
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              {company} — {expired ? "Certificate Expired" : "Verified by Booppa"}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {expired
                ? `This certificate expired${expiresOn ? ` on ${expiresOn}` : ""}.`
                : expiresOn
                  ? `Certificate valid until ${expiresOn}.`
                  : "Identity verified on Booppa."}
            </p>
          </div>

          <div className="p-8">
            {/* Procurement-language summary */}
            <p className="text-sm text-slate-700">
              This vendor has completed Booppa identity and PDPA compliance
              verification
              {typeof score === "number"
                ? `, with a current compliance score of ${score}/100`
                : ""}
              .{" "}
              {vp.procurement_readiness
                ? `Procurement readiness: ${vp.procurement_readiness}.`
                : ""}
            </p>

            {entityNotLive ? (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                <strong>ACRA entity status: {entityStatus}.</strong> Verify the
                entity is active before relying on this certificate.
              </div>
            ) : null}

            {/* Entity / ACRA */}
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Entity verification
            </h2>
            <dl className="mt-3 grid gap-3 text-sm text-slate-700">
              <Row label="Legal entity" value={company} />
              <Row
                label="ACRA registry"
                value={acra.verified ? "Matched" : "No registry match on file"}
              />
              {acra.entity_type ? (
                <Row label="Entity type" value={acra.entity_type} />
              ) : null}
              {acra.registration_date ? (
                <Row label="Registration date" value={acra.registration_date} />
              ) : null}
              {entityStatus ? (
                <Row label="Entity status" value={entityStatus} />
              ) : null}
            </dl>

            {/* Compliance standing */}
            <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Compliance standing
            </h2>
            <dl className="mt-3 grid gap-3 text-sm text-slate-700">
              <Row
                label="Compliance score"
                value={typeof score === "number" ? `${score}/100` : "Not assessed"}
              />
              {vp.procurement_readiness ? (
                <Row label="Procurement readiness" value={vp.procurement_readiness} />
              ) : null}
              <Row
                label="Verification level"
                value={vp.verification_level || "BASIC"}
              />
              <Row
                label="Certificate validity"
                value={
                  expired
                    ? `Expired${expiresOn ? ` ${expiresOn}` : ""}`
                    : expiresOn
                      ? `Active until ${expiresOn}`
                      : "Active"
                }
              />
            </dl>

            {/* Blockchain anchor */}
            {data.tx_hash ? (
              <Link
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
                href={polygonscanTxUrl(data.tx_hash)}
                target="_blank"
                rel="noreferrer"
              >
                View blockchain anchor on Polygonscan
              </Link>
            ) : null}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={linkedInShare}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Share this certificate
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Request full compliance dossier
              </Link>
            </div>

            <div className="mt-8 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              {data.disclaimer}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Generic document verification view (notarization / cover sheet) ───────
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Booppa Verification
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Proof Status: {anchoredLabel}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Read-only verification record for hash {params.hash}.
        </p>

        <dl className="mt-6 grid gap-4 text-sm text-slate-700">
          <Row label="Report ID" value={data.report_id} />
          <Row label="Framework" value={data.framework} />
          <Row label="Transaction Hash" value={data.tx_hash || "Pending"} />
          <Row
            label="Schema"
            value={`${data.format} v${data.schema_version}`}
          />
        </dl>

        {data.tx_hash ? (
          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
            href={polygonscanTxUrl(data.tx_hash)}
            target="_blank"
            rel="noreferrer"
          >
            View on Polygonscan
          </Link>
        ) : null}

        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          {data.disclaimer}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-medium">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
