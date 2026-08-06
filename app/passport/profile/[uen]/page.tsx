import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, FileCheck, ArrowRight, Building2, MapPin, Hash, ExternalLink } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_BASE ||
  "https://api.booppa.io";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_BASE || "https://www.booppa.io";

type HistoryItem = {
  audit_hash: string;
  status: string;
  tier?: string | null;
  created_at?: string | null;
};

type PassportProfileData = {
  uen: string;
  company_name: string;
  legal_name?: string | null;
  registered_address?: string | null;
  latest_tier?: string | null;
  latest_audit_hash?: string | null;
  history?: HistoryItem[];
};

async function fetchPassportProfile(uen: string): Promise<PassportProfileData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/passport/profile/${uen}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "N/A"
    : d.toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TrustPassportProfilePage({
  params,
}: {
  params: { uen: string };
}) {
  const profile = await fetchPassportProfile(params.uen);
  if (!profile) {
    notFound();
  }

  const tier = profile.latest_tier || "L1";
  const tierConfig: Record<string, { label: string; badge: string; bg: string; desc: string }> = {
    L1: {
      label: "L1 — Automated Verification",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      bg: "from-blue-900/40 via-slate-900 to-slate-950",
      desc: "Identity and ACRA registration verified automatically by Booppa.",
    },
    L2: {
      label: "L2 — Notarised Compliance",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      bg: "from-emerald-950/50 via-slate-900 to-slate-950",
      desc: "Deep Scan PDPA 11-dimension compliance + on-chain Polygon notarization.",
    },
    L3: {
      label: "L3 — Compliance Monitoring",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      bg: "from-purple-950/50 via-slate-900 to-slate-950",
      desc: "Continuous monthly rescan + automated blockchain re-anchoring + complete audit history.",
    },
  };

  const currentTier = tierConfig[tier] || tierConfig.L1;
  const historyList = profile.history || [];

  return (
    <main className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Header Banner */}
      <div className={`border-b border-slate-800 bg-gradient-to-b ${currentTier.bg} px-6 py-14 sm:px-12`}>
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Booppa Trust Passport
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${currentTier.badge}`}>
              {currentTier.label}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {profile.company_name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-slate-500" />
              UEN: <strong className="text-slate-200">{profile.uen}</strong>
            </span>
            {profile.legal_name && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-500" />
                Legal Name: <span className="text-slate-200">{profile.legal_name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left / Main Details */}
          <div className="space-y-6 md:col-span-2">
            {/* Status Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Trust Standing & Level
              </h2>
              <p className="mt-2 text-base text-slate-200">{currentTier.desc}</p>

              {profile.registered_address && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <span className="font-semibold text-slate-400">Registered Address</span>
                    <p className="mt-0.5 font-mono text-slate-200">{profile.registered_address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Verification History */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Verification History & Audit Records
              </h2>

              {historyList.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No previous notarized reports found.</p>
              ) : (
                <div className="mt-4 divide-y divide-slate-800">
                  {historyList.map((item, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                          <FileCheck className="h-4 w-4 text-emerald-400" />
                          <span>{item.audit_hash.slice(0, 16)}...</span>
                        </div>
                        <p className="text-xs text-slate-500">Issued: {fmtDate(item.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                          {item.tier || "L1"}
                        </span>
                        <Link
                          href={`/verify/${item.audit_hash}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                        >
                          Verify Proof <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar / Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white">Procurement Verification</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Are you a buyer evaluating this vendor? Request full compliance evidence or invite this vendor to upgrade their passport.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href={`/login?from=/passport/profile/${profile.uen}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Request Full Dossier <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  View Passport Tiers
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 text-xs text-slate-500">
              <p className="font-semibold text-slate-400">Disclaimer</p>
              <p className="mt-1 leading-relaxed">
                Verification confirms document existence and identity matching on Polygon blockchain at the recorded timestamp. It does not constitute legal or financial approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
