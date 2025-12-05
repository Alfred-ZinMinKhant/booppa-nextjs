'use client'

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPayment({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment status...');

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successfully verified! Your service has been activated.');
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
    content = (
      <>
        <CheckCircle className={`${iconClass} text-booppa-green`} />
        <h2 className="text-2xl font-semibold text-white">Payment Confirmed!</h2>
        <p className="text-gray-400 mt-2">{message}</p>
        <Link href="/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
          Go to Dashboard
        </Link>
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
