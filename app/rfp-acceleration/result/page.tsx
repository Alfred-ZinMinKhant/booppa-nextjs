'use client';

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Loader2, AlertTriangle, Download, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // 2 minutes

interface QAItem {
  question: string;
  answer: string;
}

interface RFPResult {
  download_url: string;
  product_type: string;
  company_name: string;
  vendor_url?: string;
  qa_answers?: QAItem[];
  tx_hash?: string;
  polygonscan_url?: string;
  generated_at?: string;
  expires_at?: string;
}

function RFPResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = useState<RFPResult | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let polls = 0;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';

    async function poll() {
      try {
        const res = await fetch(`${apiBase}/api/stripe/rfp/result?session_id=${sessionId}`);
        if (res.status === 200) {
          const data = await res.json();
          if (data.download_url) {
            setResult(data);
            setStatus('ready');
            return;
          }
        }
      } catch {
        // network hiccup — keep polling
      }

      polls++;
      if (polls >= MAX_POLLS) {
        setStatus('error');
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
  }, [sessionId]);

  const productLabel = result?.product_type === 'rfp_complete' ? 'RFP Kit Complete' : 'RFP Kit Express';

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="w-16 h-16 mb-4 text-booppa-blue animate-spin" />
            <h2 className="text-2xl font-semibold text-white">Generating Your RFP Kit</h2>
            <p className="text-gray-400 mt-2">
              Our AI is drafting your GeBIZ procurement answers. This usually takes under a minute.
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
            <Link
              href="/support"
              className="mt-6 inline-block px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-gray-400 transition"
            >
              Contact Support
            </Link>
          </div>
        )}

        {status === 'ready' && result && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-booppa-green" />
                  <span className="text-booppa-green font-medium text-sm">{productLabel} Ready</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{result.company_name}</h1>
                {result.vendor_url && (
                  <p className="text-gray-400 text-sm mt-0.5">{result.vendor_url}</p>
                )}
              </div>
              <a
                href={result.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition text-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>

            {/* Blockchain badge */}
            {result.tx_hash && (
              <div className="mb-6 flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm">
                <Shield className="w-4 h-4 text-booppa-blue shrink-0" />
                <div className="min-w-0">
                  <span className="text-gray-400">Blockchain anchored · </span>
                  <code className="text-gray-300 truncate">{result.tx_hash.slice(0, 20)}…</code>
                </div>
                {result.polygonscan_url && (
                  <a
                    href={result.polygonscan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto shrink-0 text-booppa-blue hover:underline flex items-center gap-1"
                  >
                    Polygonscan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Q&A section */}
            {result.qa_answers && result.qa_answers.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  AI-Generated Procurement Answers
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {result.qa_answers.length} question{result.qa_answers.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                {result.qa_answers.map((item, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <p className="text-sm font-semibold text-booppa-blue mb-2">{item.question}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer note */}
            <p className="text-gray-600 text-xs mt-6 text-center">
              PDF download link valid for 7 days · Report ID derived from session {sessionId?.slice(-8)}
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
