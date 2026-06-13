'use client';

import { useEffect, useState, Suspense } from 'react';
import { POLYGON_NETWORK_NAME, polygonscanTxUrl } from '@/lib/blockchain';
import {
  CheckCircle, Loader2, AlertTriangle, Download, ExternalLink,
  Shield, Copy, Check, FileText, ArrowUpRight, Mail, ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30;

type VerificationSource =
  | 'intake'
  | 'website'
  | 'intake+website'
  | 'intake+external'
  | 'acra'
  | 'ssl'
  | 'gebiz'
  | 'pdpc'
  | 'external'
  | 'ai_drafted';

interface Verification {
  source: VerificationSource;
  evidence: string[];
}

interface QAItem {
  question: string;
  answer: string;
  // Backward-compat: 'fact' when source ≠ ai_drafted, 'generated' otherwise.
  confidence: 'fact' | 'generated';
  // New: structured source + evidence list, lets the UI pick the right badge.
  verification?: Verification;
}

// Badge config per source — label, colour palette. Centralised so the PDF
// builder can mirror it exactly. `ai_drafted` is the only "review me" state.
const SOURCE_BADGE: Record<VerificationSource, { label: string; cls: string }> = {
  'intake':           { label: 'From your intake',              cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  'website':          { label: 'Verified on your website',      cls: 'bg-teal-500/10 text-teal-300 border-teal-500/25' },
  'intake+website':   { label: 'Intake + website verified',     cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  'intake+external':  { label: 'Intake + public records',       cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  'acra':             { label: 'ACRA verified',                 cls: 'bg-sky-500/10 text-sky-300 border-sky-500/25' },
  'ssl':              { label: 'SSL Labs verified',             cls: 'bg-sky-500/10 text-sky-300 border-sky-500/25' },
  'gebiz':            { label: 'GeBIZ supplier verified',       cls: 'bg-sky-500/10 text-sky-300 border-sky-500/25' },
  'pdpc':             { label: 'PDPC register checked',         cls: 'bg-sky-500/10 text-sky-300 border-sky-500/25' },
  'external':         { label: 'External evidence verified',    cls: 'bg-sky-500/10 text-sky-300 border-sky-500/25' },
  'ai_drafted':       { label: 'AI draft — review',             cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
};

interface RFPResult {
  download_url: string;
  docx_url?: string;
  product_type: string;
  company_name: string;
  vendor_url?: string;
  qa_answers?: QAItem[];
  tx_hash?: string;
  polygonscan_url?: string;
  generated_at?: string;
  expires_at?: string;
  data_sources?: Record<string, any>;
  discrepancies?: string[];
  warnings?: string[];
  answer_source?: 'ai_grounded' | 'template';
  error?: boolean;
  detail?: string;
}

// ── Shared primitives ──────────────────────────────────────────────────────

/** Unified card shell — one border/radius/bg system across the whole page. */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}>
      {children}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/10 transition"
      title="Copy answer"
    >
      {copied
        ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
        : <><Copy className="w-3.5 h-3.5" /> Copy</>}
    </button>
  );
}

function Pill({ children, variant = 'green' }: { children: React.ReactNode; variant?: 'green' | 'blue' | 'amber' | 'muted' }) {
  const cls = {
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    blue:  'bg-sky-500/10 text-sky-300 border-sky-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    muted: 'bg-white/5 text-slate-300 border-white/10',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

/** Centred status screen used by verifying / generating / error. */
function StatusScreen({
  tone, icon, title, body, children,
}: {
  tone: 'sky' | 'amber';
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const ring = tone === 'sky' ? 'bg-sky-500/10' : 'bg-amber-500/10';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${ring}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">{body}</p>
      </div>
      {children}
    </div>
  );
}

function RFPResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // `verifying` = waiting for /verify before we know if a brief is owed.
  // `generating` = brief already in, polling for the kit. Splitting these
  // two stops the page from showing "Generating Your RFP Kit" before we
  // actually know a brief isn't outstanding.
  const [status, setStatus] = useState<'verifying' | 'brief_required' | 'generating' | 'ready' | 'error'>('verifying');
  const [result, setResult] = useState<RFPResult | null>(null);
  const [pendingIntakeId, setPendingIntakeId] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let cancelled = false;
    let polls = 0;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';

    // Check the buyer's brief status. The backend tells us three things:
    //   • requires_brief — product needs a brief at all
    //   • brief_satisfied — positive proof the brief is taken care of (kit
    //     in cache, rfp_description in checkout metadata, or intake submitted)
    //   • pending_rfp_intake_id — outstanding brief row, ready to be filled
    // We only show "Generating…" when brief_satisfied is true. Otherwise we
    // surface the brief CTA — the backend lazily creates a PendingRfpIntake
    // row if one is missing, so pending_rfp_intake_id should be populated by
    // the time we render that view.
    async function checkBrief(): Promise<{
      pendingId: string | null;
      productType: string | null;
      requiresBrief: boolean;
      briefSatisfied: boolean;
    }> {
      try {
        const res = await fetch(`${apiBase}/api/stripe/checkout/verify?session_id=${sessionId}`);
        if (!res.ok) return { pendingId: null, productType: null, requiresBrief: false, briefSatisfied: false };
        const data = await res.json();
        return {
          pendingId: data.pending_rfp_intake_id || null,
          productType: data.product_type || null,
          requiresBrief: !!data.requires_brief,
          briefSatisfied: !!data.brief_satisfied,
        };
      } catch {
        return { pendingId: null, productType: null, requiresBrief: false, briefSatisfied: false };
      }
    }

    async function poll() {
      try {
        const res = await fetch(`${apiBase}/api/stripe/rfp/result?session_id=${sessionId}`);
        if (res.status === 200) {
          const data = await res.json();
          if (cancelled) return;
          if (data.error) { setStatus('error'); return; }
          if (data.download_url) { setResult(data); setStatus('ready'); return; }
        }
      } catch { /* keep polling */ }
      if (cancelled) return;
      polls++;
      if (polls >= MAX_POLLS) { setStatus('error'); return; }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    (async () => {
      let last = await checkBrief();
      if (cancelled) return;
      if (last.productType) setProductType(last.productType);

      // Retry the verify endpoint a few times to absorb the Stripe webhook
      // race. We need either a pending intake (→ brief CTA) or positive proof
      // the brief is in motion (→ generating). Anything else, we keep waiting.
      const retries = [1000, 2000, 3000];
      let attempt = 0;
      while (
        !cancelled
        && !last.pendingId
        && last.requiresBrief
        && !last.briefSatisfied
        && attempt < retries.length
      ) {
        await new Promise(r => setTimeout(r, retries[attempt]));
        if (cancelled) return;
        last = await checkBrief();
        if (cancelled) return;
        if (last.productType && !productType) setProductType(last.productType);
        attempt++;
      }

      if (cancelled) return;
      if (last.pendingId) {
        setPendingIntakeId(last.pendingId);
        setStatus('brief_required');
        return;
      }
      // No outstanding brief AND no proof generation is in flight — refuse to
      // claim we're generating. Show the error/help view; the user can contact
      // support if they think this is wrong.
      if (last.requiresBrief && !last.briefSatisfied) {
        setStatus('error');
        return;
      }
      setStatus('generating');
      poll();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const isExpress    = result?.product_type === 'rfp_express';
  const productLabel = isExpress ? 'RFP Kit Express' : 'RFP Kit Complete';
  const totalCount   = result?.qa_answers?.length ?? 0;
  // Verified = answer is backed by intake / website / external evidence
  // (anything that isn't 'ai_drafted'). Fall back to confidence for backward
  // compatibility with kits generated before the verification field shipped.
  const verifiedCount = result?.qa_answers?.filter(q => {
    const src = q.verification?.source;
    if (src) return src !== 'ai_drafted';
    return q.confidence === 'fact';
  }).length ?? 0;

  return (
    <main className="min-h-screen bg-[#0a0f1e] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Verifying purchase ─────────────────────────────────────────── */}
        {status === 'verifying' && (
          <StatusScreen
            tone="sky"
            icon={<Loader2 className="w-10 h-10 text-sky-400 animate-spin" />}
            title="Confirming your purchase"
            body="One moment while we check your order and your next steps."
          />
        )}

        {/* ── Generating (post-brief polling) ────────────────────────────── */}
        {status === 'generating' && (
          <StatusScreen
            tone="sky"
            icon={<Loader2 className="w-10 h-10 text-sky-400 animate-spin" />}
            title="Generating your RFP kit"
            body="Our AI is reading your website and drafting your GeBIZ procurement answers. Usually under a minute."
          >
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-500/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </StatusScreen>
        )}

        {/* ── Brief required ─────────────────────────────────────────────── */}
        {status === 'brief_required' && pendingIntakeId && (
          <div className="space-y-4">
            <Card className="p-5 flex items-start gap-3 border-emerald-500/25 bg-emerald-500/[0.07]">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Payment received — thanks for your purchase</p>
                <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">
                  One more step before we can build your {productType === 'rfp_express' ? 'RFP Express Kit' : 'RFP Complete Kit'}.
                </p>
              </div>
            </Card>

            {/* Brief CTA — mirrors the email so users have clear next steps without leaving the page */}
            <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-500/[0.12] to-transparent p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-sky-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Tell us about your RFP</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Takes about 2 minutes · Kit generated as soon as you submit</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Share a few details about the procurement and we&apos;ll generate your
                {productType === 'rfp_express' ? ' RFP Express Kit' : ' RFP Complete Kit'} immediately.
                Your kit can&apos;t be generated without it.
              </p>
              <Link
                href={`/rfp-intake/${pendingIntakeId}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition text-sm"
              >
                Complete your RFP brief <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Card className="px-4 py-3 flex items-start gap-3">
              <Mail className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                We&apos;ve also emailed you this link — you can close this page and finish the brief later from your inbox.
              </p>
            </Card>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {status === 'error' && (
          <StatusScreen
            tone="amber"
            icon={<AlertTriangle className="w-10 h-10 text-amber-400" />}
            title="Taking longer than expected"
            body="Your RFP kit is still being processed. You'll receive a download link by email once it's ready."
          >
            <Link
              href="/support"
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white transition"
            >
              Contact support <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </StatusScreen>
        )}

        {/* ── Ready ──────────────────────────────────────────────────────── */}
        {status === 'ready' && result && (
          <div className="space-y-4">

            {/* Hero header — product status, company, and the primary actions */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.10] via-white/[0.03] to-transparent p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="min-w-0">
                  <Pill variant="green"><CheckCircle className="w-3 h-3" /> {productLabel} ready</Pill>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">{result.company_name}</h1>
                  {result.vendor_url && (
                    <p className="text-slate-400 text-sm mt-1 truncate">{result.vendor_url}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={result.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition text-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                  {result.docx_url && (
                    <a
                      href={result.docx_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/15 text-slate-200 hover:text-white hover:border-white/30 font-semibold rounded-xl transition text-sm"
                    >
                      <FileText className="w-4 h-4" /> Editable DOCX
                    </a>
                  )}
                </div>
              </div>

              {/* Verification chips */}
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10">
                {verifiedCount > 0 && (
                  <Pill variant="green">{verifiedCount}/{totalCount} answers verified</Pill>
                )}
                {result.tx_hash && (
                  <Pill variant="blue">
                    <Shield className="w-3 h-3" /> Blockchain anchored
                    {result.polygonscan_url && (
                      <a href={result.polygonscan_url} target="_blank" rel="noreferrer" className="ml-0.5 hover:opacity-70">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </Pill>
                )}
                {result.data_sources?.acra_verified && <Pill variant="green">ACRA verified</Pill>}
                {result.data_sources?.gebiz_supplier && <Pill variant="green">GeBIZ registered</Pill>}
                {result.data_sources?.ssl_grade && <Pill variant="green">SSL: {result.data_sources.ssl_grade}</Pill>}
                {result.data_sources?.vt_checked && !result.data_sources?.vt_flagged && <Pill variant="green">Domain clean</Pill>}
                {result.data_sources?.pdpc_flagged && (
                  <Pill variant="amber"><AlertTriangle className="w-3 h-3" /> PDPC flag</Pill>
                )}
              </div>
            </div>

            {/* Verify-before-submitting banner — mirrors the PDF scope notice.
                Buyers who copy from this page never see the PDF disclaimer, so
                the warning has to live here too. */}
            <Card className="border-amber-500/30 bg-amber-500/[0.08] p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-300">Verify every answer before you submit</p>
                  <p className="text-xs text-amber-200/80 mt-1.5 leading-relaxed">
                    AI-generated answers may name certifications (ISO 27001, SOC&nbsp;2),
                    encryption standards (AES-256, TLS&nbsp;1.3), uptime SLAs, cloud
                    providers, or timeframes that don&apos;t reflect your actual practice.
                    Submitting unverified specifics to GeBIZ or any other procurement portal
                    is your responsibility under Singapore&apos;s Government Procurement Act.
                  </p>
                  <p className="text-xs text-amber-200/80 mt-2 leading-relaxed">
                    This kit covers the <strong>PDPA &amp; security compliance section</strong> of
                    your bid only. You must still add proposal, pricing, delivery timeline,
                    team, and tender-specific requirements separately.
                  </p>
                  {result.discrepancies && result.discrepancies.length > 0 && (
                    <p className="text-xs text-amber-100 mt-2 font-semibold">
                      {result.discrepancies.length} discrepanc{result.discrepancies.length === 1 ? 'y' : 'ies'} flagged below — review and correct before submission.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Upgrade banner */}
            {isExpress && (
              <Card className="border-emerald-500/25 bg-emerald-500/[0.06] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Upgrade to RFP Complete</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Full procurement dossier with ACRA validation, deeper Q&amp;A answers, and an editable DOCX.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';
                    const res = await fetch(`${apiBase}/api/v1/stripe/checkout`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ productType: 'rfp_complete', vendor_url: result.vendor_url, company_name: result.company_name }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (data.url) window.location.href = data.url;
                  }}
                  className="shrink-0 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition"
                >
                  Upgrade — S$599 →
                </button>
              </Card>
            )}

            {/* Template-fallback warning */}
            {result.answer_source === 'template' && (
              <Card className="border-amber-500/25 bg-amber-500/[0.06] p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">Standard template used</p>
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    AI generation was temporarily unavailable. These answers use standard templates.
                    Please review and customise them before submission.
                  </p>
                </div>
              </Card>
            )}

            {/* Discrepancies */}
            {result.discrepancies && result.discrepancies.length > 0 && (
              <Card className="border-orange-500/25 bg-orange-500/[0.06] p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-300 mb-1.5">Action required: discrepancies found</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-orange-400/80 leading-relaxed">
                    {result.discrepancies.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </Card>
            )}

            {/* Blockchain Evidence */}
            {result.tx_hash && (
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">Blockchain evidence record</h3>
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium">
                    {POLYGON_NETWORK_NAME}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Your RFP evidence certificate has been cryptographically anchored on the Polygon blockchain —
                  an immutable, tamper-proof timestamp that buyer teams can independently verify without contacting Booppa.
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-32 shrink-0">Transaction hash</span>
                    <a
                      href={result.polygonscan_url || polygonscanTxUrl(result.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sky-400 hover:text-sky-300 transition flex items-center gap-1 break-all"
                    >
                      {result.tx_hash.substring(0, 18)}…{result.tx_hash.substring(result.tx_hash.length - 8)}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-32 shrink-0">Verify on-chain</span>
                    <a
                      href={result.polygonscan_url || polygonscanTxUrl(result.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 transition"
                    >
                      View on Polygonscan →
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-4 border-t border-white/10 pt-3">
                  Anchored on {POLYGON_NETWORK_NAME} (public &amp; immutable) for cost efficiency.
                </p>
              </Card>
            )}

            {/* Q&A — draft answers */}
            {result.qa_answers && result.qa_answers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 pt-2">
                  <ClipboardCheck className="w-4 h-4 text-slate-300" />
                  <h2 className="text-sm font-semibold text-slate-100">Draft answers</h2>
                  <span className="text-xs text-amber-400/80">review and edit each answer before pasting into your RFP form</span>
                </div>
                {result.qa_answers.map((item, i) => {
                  const source: VerificationSource =
                    item.verification?.source ?? (item.confidence === 'fact' ? 'intake' : 'ai_drafted');
                  const badge = SOURCE_BADGE[source];
                  const evidenceList = item.verification?.evidence ?? [];
                  const isAi = source === 'ai_drafted';
                  return (
                    <Card key={i} className={`p-4 ${isAi ? 'border-amber-500/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300 flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-sky-300 leading-snug">{item.question}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <CopyButton text={item.answer} />
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{item.answer}</p>
                          {evidenceList.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                              <span className="text-slate-400 font-medium">Evidence: </span>
                              {evidenceList.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Scope of Assessment */}
            <Card className="px-4 py-3 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Scope of assessment: </span>
              This compliance pack is based on information provided by the company&apos;s authorised representative
              and automated website assessment conducted by Booppa on the date indicated. The UEN field and all
              evidence sections are included in the PDF certificate.
            </Card>

            <p className="text-slate-600 text-xs text-center pb-4">
              PDF valid for 7 days · Fact-backed answers use information you provided · AI-generated answers are based on your website and best practices
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RFPResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-sky-400 animate-spin" />
      </main>
    }>
      <RFPResultContent />
    </Suspense>
  );
}
