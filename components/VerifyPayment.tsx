'use client'

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

const BRIEF_REQUIRED_PRODUCTS = new Set([
  'rfp_complete',
  'rfp_express',
  'rfp_accelerator',
  'enterprise_bid_kit',
  'compliance_evidence_pack',
]);

function loadingCopyFor(pt: string | undefined): { headline: string; detail: string } {
  if (!pt) {
    return {
      headline: 'Securing your purchase',
      detail: 'Verifying your payment with Stripe…',
    };
  }
  if (pt === 'rfp_complete' || pt === 'rfp_express') {
    return {
      headline: 'Securing your RFP purchase',
      detail: 'Once verified, you’ll be asked to submit a short RFP brief so we can build your kit.',
    };
  }
  if (pt === 'compliance_evidence_pack') {
    return {
      headline: 'Securing your Compliance Evidence Pack',
      detail: 'Once verified, you’ll be asked to submit your RFP brief. PDPA Quick Scan runs in parallel; both feed your regulator-ready Cover Sheet.',
    };
  }
  if (pt === 'rfp_accelerator' || pt === 'enterprise_bid_kit') {
    return {
      headline: 'Securing your bundle',
      detail: 'Once verified, you’ll submit a short RFP brief, then notarize the included documents.',
    };
  }
  if (pt?.startsWith('compliance_notarization')) {
    return {
      headline: 'Securing your notarization purchase',
      detail: 'Verifying your payment — your certificate and blockchain proof will be ready next.',
    };
  }
  if (pt === 'pdpa_quick_scan' || pt === 'pdpa_snapshot') {
    return {
      headline: 'Securing your PDPA Snapshot',
      detail: 'Verifying your payment — your compliance report will be ready next.',
    };
  }
  if (pt === 'vendor_proof') {
    return {
      headline: 'Securing your Vendor Proof',
      detail: 'Verifying your payment — your verification certificate is being issued.',
    };
  }
  return {
    headline: 'Activating your subscription',
    detail: 'Verifying your payment with Stripe…',
  };
}

export default function VerifyPayment({ sessionId, product: productProp }: { sessionId: string; product?: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment status...');
  const [productType, setProductType] = useState<string | undefined>(productProp);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingRfpIntakeId, setPendingRfpIntakeId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyOnce(): Promise<{ verified: boolean; pendingId: string | null; productType?: string }> {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io';
      const response = await fetch(`${apiBase}/api/stripe/checkout/verify?session_id=${sessionId}`);
      const data = await response.json();
      if (!(response.ok && data.success)) {
        return { verified: false, pendingId: null };
      }
      return {
        verified: true,
        pendingId: data.pending_rfp_intake_id || null,
        productType: data.product_type || undefined,
      };
    }

    async function run() {
      try {
        // First attempt — almost always succeeds; webhook may still be in flight.
        let attempt = await verifyOnce();
        if (cancelled) return;
        if (!attempt.verified) {
          setStatus('error');
          setMessage('Payment verification failed. Please check your email for confirmation or contact support.');
          return;
        }

        const resolvedPt = attempt.productType || productProp;
        if (attempt.productType) setProductType(attempt.productType);
        setStatus('success');
        setMessage('Payment successfully verified! Your service has been activated.');

        if (attempt.pendingId) {
          setPendingRfpIntakeId(attempt.pendingId);
        } else if (resolvedPt && BRIEF_REQUIRED_PRODUCTS.has(resolvedPt)) {
          // Webhook may not have created the PendingRfpIntake row yet — poll a
          // few times so the user lands on the correct "Complete your brief" CTA
          // instead of a misleading "delivered to your email" message.
          const delays = [1000, 2000, 3000, 5000];
          for (const ms of delays) {
            await new Promise(r => setTimeout(r, ms));
            if (cancelled) return;
            const retry = await verifyOnce();
            if (cancelled) return;
            if (retry.pendingId) {
              setPendingRfpIntakeId(retry.pendingId);
              break;
            }
          }
        }

        // Capture user role for routing (suites are sold to both vendors + procurement).
        try {
          const me = await fetch('/api/auth/me').then(r => r.ok ? r.json() : null);
          if (!cancelled && me?.role) setUserRole(String(me.role).toUpperCase());
        } catch { /* non-fatal */ }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage('A network error occurred during verification. Please contact support.');
        }
      }
    }

    if (sessionId) {
      run();
    } else {
      setStatus('error');
      setMessage('No payment session ID found. Please start a new transaction.');
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const iconClass = "w-16 h-16 mb-4";
  let content;

  if (status === 'loading') {
    const copy = loadingCopyFor(productType);
    const willNeedBrief = !!productType && BRIEF_REQUIRED_PRODUCTS.has(productType);
    content = (
      <>
        <Loader2 className={`${iconClass} text-booppa-blue animate-spin`} />
        <h2 className="text-2xl font-semibold text-white">{copy.headline}</h2>
        <p className="text-gray-400 mt-2">{copy.detail}</p>
        {willNeedBrief && (
          <div className="mt-5 w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">One more step after payment</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Once verified, we’ll ask you to complete a short RFP brief — your kit can’t be generated without it. You’ll also receive an email with the same link.
              </p>
            </div>
          </div>
        )}
      </>
    );
  } else if (status === 'success') {
    // Retired enterprise_monthly / enterprise_pro_monthly are no longer sold —
    // existing subscribers go through Stripe portal, not this success page.
    const isEnterprise = productType === 'standard_suite_monthly' || productType === 'pro_suite_monthly';
    const isCompliance = productType === 'compliance_evidence_monthly'
      || productType === 'buyer_starter_monthly' || productType === 'buyer_starter_annual'
      || productType === 'buyer_pro_monthly' || productType === 'buyer_pro_annual'
      || productType === 'buyer_enterprise_monthly' || productType === 'buyer_enterprise_annual';
    const isBundle = productType === 'vendor_trust_pack' || productType === 'rfp_accelerator' || productType === 'enterprise_bid_kit' || productType === 'compliance_evidence_pack';
    const isComplianceEvidencePack = productType === 'compliance_evidence_pack';
    const isVendorProof = productType === 'vendor_proof';
    const isNotarization = productType?.startsWith('compliance_notarization');
    // pdpa_quick_scan / pdpa_snapshot → report page; pdpa_monitor_* → /vendor/subscription
    const isPdpa = productType === 'pdpa_quick_scan' || productType === 'pdpa_snapshot';
    const isPdpaMonitor = productType === 'pdpa_monitor_monthly' || productType === 'pdpa_monitor_annual';
    // vendor_active_* → /vendor/subscription (plan + billing live there, not on /vendor/dashboard)
    const isVendorActive = productType === 'vendor_active_monthly' || productType === 'vendor_active_annual';
    const isTenderIntelligence = productType === 'tender_intelligence_monthly' || productType === 'tender_intelligence_annual';
    const isVendorPro = productType === 'vendor_pro_monthly' || productType === 'vendor_pro_annual';
    const isSubscription = isPdpaMonitor || isVendorActive || isTenderIntelligence || isVendorPro;
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
                    ? 'Your PDPA Monitor subscription is active. Monthly re-scans and monthly regulatory alerts are now enabled. A confirmation has been sent to your email.'
                    : isVendorActive
                      ? 'Your Vendor Active subscription is active. Monthly health checks, competitor alerts, and shortlist priority are now enabled. A confirmation has been sent to your email.'
                      : isTenderIntelligence
                        ? 'Your Tender Intelligence subscription is active. Sector trends, historical award lookup, bid timing, and supplier benchmarking are now unlocked. Your first monthly digest will arrive on the 1st of next month.'
                      : isVendorPro
                        ? 'Your Vendor Pro subscription is active. Quarterly PDPA scans, 1 notarization/month, tender analytics, and competitor awareness signals are now enabled. A confirmation has been sent to your email.'
                      : isRfp
                        ? (pendingRfpIntakeId
                            ? 'Tell us about your RFP and we will generate the kit immediately.'
                            : 'Your RFP evidence package will be delivered to your email shortly.')
                        : isVendorProof
                          ? 'Your Vendor Proof certificate will be sent to your email within a few minutes.'
                          : isBundle
                            ? (productType === 'compliance_evidence_pack'
                                ? (pendingRfpIntakeId
                                    ? 'Your Compliance Evidence Pack is activated — PDPA Quick Scan is running now. Tell us about your RFP and we will generate your Complete Kit, which feeds into your regulator-ready Cover Sheet.'
                                    : 'Your Compliance Evidence Pack is activated — PDPA Quick Scan and RFP Complete Kit are running now. Once both finish, your 9-section regulator-ready Cover Sheet PDF will be emailed to you.')
                                : productType === 'enterprise_bid_kit'
                                  ? (pendingRfpIntakeId
                                      ? 'Your Enterprise Bid Kit is activated — Vendor Proof and PDPA Quick Scan are running now. Tell us about your RFP to generate the Complete Kit, then notarize your 7 included documents.'
                                      : 'Your Enterprise Bid Kit is activated — Vendor Proof, PDPA Quick Scan, and RFP Complete are running now. Click below to notarize your 7 included bundle documents.')
                                  : productType === 'rfp_accelerator'
                                    ? (pendingRfpIntakeId
                                        ? 'Your RFP Accelerator is activated — Vendor Proof and PDPA Quick Scan are running now. Tell us about your RFP to generate the Express Kit, then notarize your 2 included documents.'
                                        : 'Your RFP Accelerator is activated — Vendor Proof, PDPA Quick Scan, and RFP Express are running now. Click below to notarize your 2 included bundle documents.')
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
          pendingRfpIntakeId ? (
            <Link href={`/rfp-intake/${pendingRfpIntakeId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
              Complete Your RFP Brief →
            </Link>
          ) : (
            <Link href={`/rfp-acceleration/result?session_id=${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
              View RFP Kit
            </Link>
          )
        ) : isBundle ? (
          pendingRfpIntakeId ? (
            <Link
              href={`/rfp-intake/${pendingRfpIntakeId}`}
              className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition"
            >
              Complete Your RFP Brief →
            </Link>
          ) : (
            <Link
              href={isComplianceEvidencePack
                ? '/compliance/cover-sheet'
                : `/bundle/notarize?bundle=${productType}${sessionId ? `&session_id=${sessionId}` : ''}`}
              className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition"
            >
              {isComplianceEvidencePack ? 'Open Compliance Cover Sheet →' :
                productType === 'enterprise_bid_kit' ? 'Notarize Your 7 Bundle Documents →' :
                'Notarize Your 2 Bundle Documents →'}
            </Link>
          )
        ) : isTenderIntelligence ? (
          <Link href="/vendor/tender-intelligence" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            Open Tender Intelligence Dashboard →
          </Link>
        ) : isVendorPro ? (
          <Link href="/vendor/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
            Open Vendor Pro Dashboard →
          </Link>
        ) : isEnterprise || isCompliance ? (
          // Route by role, not by product. Suites are sold to BOTH vendors and procurement.
          // Buy-side-only SKUs (evaluate/verify) are gated to procurement at checkout, so
          // anyone landing here on those is procurement by construction.
          userRole === 'PROCUREMENT' || userRole === 'GOV_BUYER'
            ? <Link href="/procurement/dashboard" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
                Go to Procurement Dashboard
              </Link>
            : <Link href="/vendor/subscription" className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition">
                Open My Subscription →
              </Link>
        ) : (
          // Subscriptions land on /vendor/subscription where the plan, billing,
          // and feature matrix live — the dashboard only shows a compact chip.
          // Everything else still goes to the dashboard's overview.
          <Link
            href={isSubscription ? "/vendor/subscription" : "/vendor/dashboard"}
            className="mt-6 inline-block px-6 py-3 bg-booppa-green text-white font-semibold rounded-lg hover:bg-booppa-green/80 transition"
          >
            {isSubscription ? 'Manage My Subscription →' : 'Go to Dashboard'}
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
