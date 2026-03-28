'use client'

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPayment({ sessionId, product: productProp }: { sessionId: string; product?: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment status...');
  const [productType, setProductType] = useState<string | undefined>(productProp);

  useEffect(() => {
    async function verify() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';
        const response = await fetch(`${apiBase}/api/stripe/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successfully verified! Your service has been activated.');
          if (data.product_type) setProductType(data.product_type);
        } else {
          setStatus('error');
          setMessage('Payment verification failed. Please check your email for confirmation or contact support.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred during verification. Please contact support.');
      }
    }

    if (sessionId) {
      verify();
    } else {
      setStatus('error');
      setMessage('No payment session ID found. Please start a new transaction.');
    }
  }, [sessionId]);

  const iconClass = "w-16 h-16 mb-4";
  let content;

  if (status === 'loading') {
    content = (
      <>
        <Loader2 className={`${iconClass} text-booppa-blue animate-spin`} />
        <h2 className="text-2xl font-semibold text-white">Processing Payment</h2>
        <p className="text-gray-400 mt-2">{message}</p>
      </>
    );
  } else if (status === 'success') {
    const isPdpa = productType === 'pdpa_quick_scan';
    const isNotarization = productType?.startsWith('compliance_notarization');
    const isRfp = productType === 'rfp_express' || productType === 'rfp_complete';
    const isVendorProof = productType === 'vendor_proof';
    content = (
      <>
        <CheckCircle className={`${iconClass} text-booppa-green`} />
        <h2 className="text-2xl font-semibold text-white">Payment Confirmed!</h2>
        <p className="text-gray-400 mt-2">{message}</p>
        {isPdpa ? (
          <Link href={`/pdpa/report?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            View PDPA Report
          </Link>
        ) : isNotarization ? (
          <Link href={`/notarization/result?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            View Certificate
          </Link>
        ) : isRfp ? (
          <>
            <p className="text-gray-400 mt-4 text-sm text-center max-w-sm">
              Your RFP Kit is being generated and will be delivered to your email within a few minutes.
            </p>
            <Link href="/vendor/dashboard" className="mt-4 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
              Go to Dashboard
            </Link>
          </>
        ) : isVendorProof ? (
          <>
            <p className="text-gray-400 mt-4 text-sm text-center max-w-sm">
              Your Vendor Proof report is being generated. You will receive a blockchain-notarized PDF certificate by email within a few minutes.
            </p>
            <Link href="/vendor/dashboard" className="mt-4 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
              Go to Dashboard
            </Link>
          </>
        ) : (
          <Link href="/vendor/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            Go to Dashboard
          </Link>
        )}
      </>
    );
  } else {
    content = (
      <>
        <AlertTriangle className={`${iconClass} text-booppa-red`} />
        <h2 className="text-2xl font-semibold text-white">Verification Error</h2>
        <p className="text-gray-400 mt-2">{message}</p>
        <Link href="/support" className="mt-6 inline-block px-6 py-3 bg-booppa-red text-white font-semibold rounded-lg hover:bg-booppa-red/80 transition">
          Contact Support
        </Link>
      </>
    );
  }

  return (
    <div className="bg-gray-900/50 p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col items-center max-w-lg mx-auto">
      {content}
    </div>
  );
}
