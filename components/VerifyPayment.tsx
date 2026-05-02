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
          // Refresh vendor_plan cookie so middleware reflects the new plan immediately
          fetch('/api/auth/me').catch(() => {});
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
    const isEnterprise = productType === 'enterprise_monthly' || productType === 'enterprise_pro_monthly';
    const isCompliance = productType === 'compliance_standard' || productType === 'compliance_pro';
    const isBundle = productType === 'vendor_trust_pack' || productType === 'rfp_accelerator' || productType === 'enterprise_bid_kit' || productType === 'compliance_evidence_pack';
    const isComplianceEvidencePack = productType === 'compliance_evidence_pack';
    const isVendorProof = productType === 'vendor_proof';
    const isNotarization = productType?.startsWith('compliance_notarization') || productType?.startsWith('supply_chain');
    // pdpa_quick_scan / pdpa_snapshot → report page; pdpa_monitor_* → subscription, go to dashboard
    const isPdpa = productType === 'pdpa_quick_scan' || productType === 'pdpa_snapshot';
    const isPdpaMonitor = productType === 'pdpa_monitor_monthly' || productType === 'pdpa_monitor_annual';
    // vendor_active_* → subscription, go to dashboard
    const isVendorActive = productType === 'vendor_active_monthly' || productType === 'vendor_active_annual';
    const isSubscription = isPdpaMonitor || isVendorActive;
    const isRfp = productType?.startsWith('rfp_');

    content = (
      <>
        <CheckCircle className={`${iconClass} text-booppa-green`} />
        <h2 className="text-2xl font-semibold text-white">Thank You for Using Our Service!</h2>
        <p className="text-gray-400 mt-2">{message}</p>

        {/* Email notification banner */}
        <div className="mt-5 w-full bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-400">Please check your email</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isNotarization
                ? 'Your notarization certificate and blockchain proof will be delivered to your email shortly.'
                : isPdpa
                  ? 'Your PDPA compliance report will be sent to your email shortly.'
                  : isPdpaMonitor
                    ? 'Your PDPA Monitor subscription is active. Quarterly re-scans and monthly regulatory alerts are now enabled. A confirmation has been sent to your email.'
                    : isVendorActive
                      ? 'Your Vendor Active subscription is active. Monthly health checks, competitor alerts, and shortlist priority are now enabled. A confirmation has been sent to your email.'
                      : isRfp
                        ? 'Your RFP evidence package will be delivered to your email shortly.'
                        : isVendorProof
                          ? 'Your Vendor Proof certificate will be sent to your email within a few minutes.'
                          : isBundle
                            ? (productType === 'compliance_evidence_pack'
                                ? 'Your Compliance Evidence Pack is activated — Vendor Proof and PDPA Quick Scan are running now. Click below to upload your 3 compliance documents; once anchored, your 9-section regulator-ready Cover Sheet PDF will be emailed automatically.'
                                : productType === 'enterprise_bid_kit'
                                  ? 'Your Enterprise Bid Kit is activated — Vendor Proof, PDPA Quick Scan, and RFP Complete are running now. Click below to notarize your 7 included bundle documents.'
                                  : productType === 'rfp_accelerator'
                                    ? 'Your RFP Accelerator is activated — Vendor Proof, PDPA Quick Scan, and RFP Express are running now. Click below to notarize your 2 included bundle documents.'
                                    : 'Your Vendor Trust Pack is activated — Vendor Proof and PDPA Quick Scan are running now. Click below to notarize your 2 included bundle documents.')
                            : isEnterprise || isCompliance
                              ? 'Your Enterprise workspace has been activated. Details have been sent to your email.'
                              : 'A confirmation and your deliverables will be sent to your email shortly.'}
            </p>
          </div>
        </div>

        {isPdpa ? (
          <Link href={`/pdpa/report?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            View PDPA Report
          </Link>
        ) : isNotarization ? (
          <Link href={`/notarization/result?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            View Certificate
          </Link>
        ) : isRfp ? (
          <Link href={`/rfp-acceleration/result?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            View RFP Kit
          </Link>
        ) : isBundle ? (
          <Link
            href={`/bundle/notarize?bundle=${productType}${sessionId ? `&session_id=${sessionId}` : ''}`}
            className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition"
          >
            {isComplianceEvidencePack ? 'Upload Your 3 Compliance Documents →' :
              productType === 'enterprise_bid_kit' ? 'Notarize Your 7 Bundle Documents →' :
              'Notarize Your 2 Bundle Documents →'}
          </Link>
        ) : isEnterprise || isCompliance ? (
          <Link href="/procurement/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            Go to Procurement Dashboard
          </Link>
        ) : (
          <Link href="/vendor/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            {isSubscription ? 'View Subscription Dashboard →' : 'Go to Dashboard'}
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
