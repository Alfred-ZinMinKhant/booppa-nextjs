import Link from "next/link";
import { notFound } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_BASE ||
  "http://localhost:8000";

async function fetchVerification(hash: string) {
  const res = await fetch(`${API_BASE}/api/v1/verify/${hash}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

type VerifyPageProps = {
  params: { hash: string };
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const data = await fetchVerification(params.hash);
  if (!data) {
    notFound();
  }

  const anchoredLabel = data.anchored ? "Confirmed" : "Pending";

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
          <div className="flex justify-between gap-4">
            <dt className="font-medium">Report ID</dt>
            <dd className="text-right text-slate-900">{data.report_id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium">Framework</dt>
            <dd className="text-right text-slate-900">{data.framework}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium">Transaction Hash</dt>
            <dd className="text-right text-slate-900">
              {data.tx_hash || "Pending"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium">Schema</dt>
            <dd className="text-right text-slate-900">
              {data.format} v{data.schema_version}
            </dd>
          </div>
        </dl>

        {data.tx_hash ? (
          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
            href={`https://polygonscan.com/tx/${data.tx_hash}`}
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
