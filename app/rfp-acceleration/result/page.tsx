'use client';

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Loader2, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30; // 2 minutes

function RFPResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);

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
            setDownloadUrl(data.download_url);
            setCompanyName(data.company_name || null);
            setProductType(data.product_type || null);
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

  const productLabel =
    productType === 'rfp_complete' ? 'RFP Kit Complete' : 'RFP Kit Express';

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900/50 p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col items-center max-w-lg w-full mx-auto text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mb-4 text-booppa-blue animate-spin" />
            <h2 className="text-2xl font-semibold text-white">Generating Your RFP Kit</h2>
            <p className="text-gray-400 mt-2">
              We&apos;re building your blockchain-verified evidence package. This usually takes under a minute.
            </p>
          </>
        )}

        {status === 'ready' && downloadUrl && (
          <>
            <CheckCircle className="w-16 h-16 mb-4 text-booppa-green" />
            <h2 className="text-2xl font-semibold text-white">Your {productLabel} is Ready</h2>
            {companyName && (
              <p className="text-gray-400 mt-1 text-sm">Generated for <strong className="text-white">{companyName}</strong></p>
            )}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition"
            >
              <Download className="w-4 h-4" />
              Download Evidence Package (PDF)
            </a>
            <p className="text-gray-500 mt-4 text-xs">
              This link is valid for 7 days. Keep it safe.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
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
          </>
        )}
      </div>
    </main>
  );
}

export default function RFPResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-booppa-blue animate-spin" />
      </main>
    }>
      <RFPResultContent />
    </Suspense>
  );
}
