'use client';

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Loader2, AlertTriangle, Download, ExternalLink, Shield, Copy, Check, FileText } from 'lucide-react';
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
      className="shrink-0 p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition"
      title="Copy answer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-booppa-green" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
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
          if (data.download_url) { setResult(data); setStatus('ready'); return; }
        }
      } catch { /* keep polling */ }
      polls++;
      if (polls >= MAX_POLLS) { setStatus('error'); return; }
      setTimeout(poll, POLL_INTERVAL_MS);
    }
    poll();
  }, [sessionId]);

  const productLabel = result?.product_type === 'rfp_complete' ? 'RFP Kit Complete' : 'RFP Kit Express';
  const factCount = result?.qa_answers?.filter(q => q.confidence === 'fact').length ?? 0;
  const totalCount = result?.qa_answers?.length ?? 0;

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="w-16 h-16 mb-4 text-booppa-blue animate-spin" />
            <h2 className="text-2xl font-semibold text-white">Generating Your RFP Kit</h2>
            <p className="text-gray-400 mt-2 max-w-sm">
              Our AI is reading your website and drafting your GeBIZ procurement answers. Usually under a minute.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <AlertTriangle className="w-16 h-16 mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-white">Taking Longer Than Expected</h2>
            <p className="text-gray-400 mt-2">
              Your RFP Kit is still being processed. You will receive a download link by email once it&apos;s ready.
            </p>
            <Link href="/support" className="mt-6 inline-block px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-400 transition">
              Contact Support
            </Link>
          </div>
        )}

        {status === 'ready' && result && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-booppa-green" />
                  <span className="text-booppa-green font-medium text-sm">{productLabel} Ready</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{result.company_name}</h1>
                {result.vendor_url && <p className="text-gray-400 text-sm mt-0.5">{result.vendor_url}</p>}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <a href={result.download_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition text-sm">
                  <Download className="w-4 h-4" /> PDF Certificate
                </a>
                {result.docx_url && (
                  <a href={result.docx_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-400 transition text-sm">
                    <FileText className="w-4 h-4" /> Editable DOCX
                  </a>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mb-5">
              {factCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-booppa-green/10 text-booppa-green border border-booppa-green/20">
                  {factCount}/{totalCount} answers fact-backed
                </span>
              )}
              {result.tx_hash && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-booppa-blue/10 text-booppa-blue border border-booppa-blue/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Blockchain anchored
                  {result.polygonscan_url && (
                    <a href={result.polygonscan_url} target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline flex items-center">
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </span>
              )}
            </div>

            {/* Q&A */}
            {result.qa_answers && result.qa_answers.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-gray-300">
                  AI-Generated Answers
                  <span className="ml-2 text-xs font-normal text-gray-500">click copy to paste into your RFP form</span>
                </h2>
                {result.qa_answers.map((item, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-booppa-blue leading-snug">{item.question}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.confidence === 'fact' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-booppa-green/10 text-booppa-green border border-booppa-green/20 whitespace-nowrap">
                            fact-backed
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700 whitespace-nowrap">
                            AI-generated
                          </span>
                        )}
                        <CopyButton text={item.answer} />
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-gray-600 text-xs mt-6 text-center">
              PDF valid for 7 days · Fact-backed answers use information you provided · AI-generated answers are based on your website and best practices
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function RFPResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-booppa-blue animate-spin" />
      </main>
    }>
      <RFPResultContent />
    </Suspense>
  );
}
