'use client';

import { useEffect, useState, Suspense } from 'react';
import { POLYGON_NETWORK_NAME } from '@/lib/blockchain';
import {
  CheckCircle, Loader2, AlertTriangle, Download, ExternalLink,
  Shield, Copy, Check, FileText, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30;

interface QAItem {
  question: string;
  answer: string;
  confidence: 'fact' | 'generated';
}

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
      title="Copy answer"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Badge({ children, variant = 'green' }: { children: React.ReactNode; variant?: 'green' | 'blue' | 'amber' | 'muted' }) {
  const cls = {
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    muted:  'bg-white/5 text-slate-400 border-white/10',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

function RFPResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = useState<RFPResult | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let polls = 0;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';

    async function poll() {
      try {
        const res = await fetch(`${apiBase}/api/stripe/rfp/result?session_id=${sessionId}`);
        if (res.status === 200) {
          const data = await res.json();
          if (data.error) { setStatus('error'); return; }
          if (data.download_url) { setResult(data); setStatus('ready'); return; }
        }
      } catch { /* keep polling */ }
      polls++;
      if (polls >= MAX_POLLS) { setStatus('error'); return; }
      setTimeout(poll, POLL_INTERVAL_MS);
    }
    poll();
  }, [sessionId]);

  const isExpress   = result?.product_type === 'rfp_express';
  const productLabel = isExpress ? 'RFP Kit Express' : 'RFP Kit Complete';
  const factCount    = result?.qa_answers?.filter(q => q.confidence === 'fact').length ?? 0;
  const totalCount   = result?.qa_answers?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#0a0f1e] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Generating Your RFP Kit</h2>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
                Our AI is reading your website and drafting your GeBIZ procurement answers.
                Usually under a minute.
              </p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-sky-500/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Taking Longer Than Expected</h2>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
                Your RFP Kit is still being processed. You will receive a download link
                by email once it&apos;s ready.
              </p>
            </div>
            <Link
              href="/support"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:border-white/20 hover:text-white transition"
            >
              Contact Support <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ── Ready ────────────────────────────────────────────────────────── */}
        {status === 'ready' && result && (
          <div className="space-y-5">

            {/* Upgrade banner */}
            {isExpress && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
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
                  className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-lg transition"
                >
                  Upgrade — S$599 →
                </button>
              </div>
            )}

            {/* Header card */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-medium text-sm">{productLabel} Ready</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">{result.company_name}</h1>
                  {result.vendor_url && (
                    <p className="text-slate-400 text-sm mt-1">{result.vendor_url}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={result.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition text-sm"
                  >
                    <Download className="w-4 h-4" /> PDF Certificate
                  </a>
                  {result.docx_url && (
                    <a
                      href={result.docx_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-semibold rounded-lg transition text-sm"
                    >
                      <FileText className="w-4 h-4" /> Editable DOCX
                    </a>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8">
                {factCount > 0 && (
                  <Badge variant="green">{factCount}/{totalCount} answers fact-backed</Badge>
                )}
                {result.tx_hash && (
                  <Badge variant="blue">
                    <Shield className="w-3 h-3" /> Blockchain anchored
                    {result.polygonscan_url && (
                      <a href={result.polygonscan_url} target="_blank" rel="noreferrer" className="ml-0.5 hover:opacity-70">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </Badge>
                )}
                {result.data_sources?.acra_verified && <Badge variant="green">✓ ACRA Verified</Badge>}
                {result.data_sources?.gebiz_supplier && <Badge variant="green">✓ GeBIZ Registered</Badge>}
                {result.data_sources?.ssl_grade && <Badge variant="green">SSL: {result.data_sources.ssl_grade}</Badge>}
                {result.data_sources?.vt_checked && !result.data_sources?.vt_flagged && <Badge variant="green">✓ Domain Clean</Badge>}
                {result.data_sources?.pdpc_flagged && (
                  <Badge variant="amber"><AlertTriangle className="w-3 h-3" /> PDPC Flag</Badge>
                )}
              </div>
            </div>

            {/* Blockchain Evidence */}
            {result.tx_hash && (
              <div className="rounded-xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">⛓️</span>
                  <h3 className="text-sm font-semibold text-white">Blockchain Evidence Record</h3>
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium">
                    {POLYGON_NETWORK_NAME}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Your RFP evidence certificate has been cryptographically anchored on the Polygon blockchain.
                  This creates an immutable, tamper-proof timestamp that buyer teams can independently verify
                  — without needing to contact BOOPPA.
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-36 shrink-0">Transaction Hash:</span>
                    <a
                      href={result.polygonscan_url || `https://polygonscan.com/tx/${result.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sky-400 hover:text-sky-300 transition flex items-center gap-1 break-all"
                    >
                      {result.tx_hash.substring(0, 18)}…{result.tx_hash.substring(result.tx_hash.length - 8)}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 w-36 shrink-0">Verify on-chain:</span>
                    <a
                      href={result.polygonscan_url || `https://polygonscan.com/tx/${result.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 transition"
                    >
                      View on Polygonscan →
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-4 border-t border-white/8 pt-3">
                  Anchored on {POLYGON_NETWORK_NAME} (public &amp; immutable) for cost efficiency.
                </p>
              </div>
            )}

            {/* Warnings / Discrepancies */}
            {(result.answer_source === 'template' || (result.discrepancies && result.discrepancies.length > 0)) && (
              <div className="space-y-3">
                {result.answer_source === 'template' && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-300 mb-1">Standard template used</p>
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        AI generation was temporarily unavailable. These answers use standard templates.
                        Please review and customise them before submission.
                      </p>
                    </div>
                  </div>
                )}
                {result.discrepancies && result.discrepancies.length > 0 && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-300 mb-1">Action Required: Discrepancies Found</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-orange-400/80 leading-relaxed">
                        {result.discrepancies.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Q&A */}
            {result.qa_answers && result.qa_answers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold text-slate-200">AI-Generated Answers</h2>
                  <span className="text-xs text-slate-500">click copy to paste into your RFP form</span>
                </div>
                {result.qa_answers.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <p className="text-sm font-semibold text-sky-400 leading-snug">{item.question}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.confidence === 'fact' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium whitespace-nowrap">
                            fact-backed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-medium whitespace-nowrap">
                            AI-generated
                          </span>
                        )}
                        <CopyButton text={item.answer} />
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Scope of Assessment */}
            <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Scope of Assessment: </span>
              This compliance pack is based on information provided by the company&apos;s authorised representative
              and automated website assessment conducted by Booppa on the date indicated. UEN field and all evidence
              sections are included in the PDF certificate.
            </div>

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
