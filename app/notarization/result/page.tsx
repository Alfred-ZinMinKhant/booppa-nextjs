'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/config';

/* ── Types ── */
interface Pipeline {
  payment_confirmed: boolean;
  blockchain_anchored: boolean;
  pdf_generated: boolean;
  certificate_ready: boolean;
}

interface Verification {
  verify_url: string;
  polygonscan_url: string | null;
  qr_image: string | null;
  proof_header: string;
  schema_version: string;
  anchored: boolean;
  anchored_at: string | null;
}

interface CertificateData {
  status: string;
  report_id: string;
  file_name: string | null;
  file_hash: string | null;
  file_size: number | null;
  company_name: string | null;
  audit_hash: string | null;
  tx_hash: string | null;
  plan: string | null;
  contact_email: string | null;
  created_at: string | null;
  completed_at: string | null;
  pdf_url: string | null;
  pipeline: Pipeline;
  verification: Verification | null;
}

/* ── Helpers ── */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Singapore',
  });
}

const PLAN_LABELS: Record<string, string> = {
  compliance_notarization_1: 'Single Document',
  compliance_notarization_10: '10 Documents (Batch)',
  compliance_notarization_50: '50 Documents (Batch)',
};

/* ── Pipeline step definitions ── */
const STEPS = [
  { key: 'payment_confirmed' as const, label: 'Payment Confirmed', icon: '💳', desc: 'Stripe payment processed successfully.' },
  { key: 'blockchain_anchored' as const, label: 'Anchored on Polygon', icon: '⛓️', desc: 'SHA-256 hash written to Polygon blockchain.' },
  { key: 'pdf_generated' as const, label: 'Certificate Generated', icon: '📄', desc: 'PDF certificate with QR code created.' },
  { key: 'certificate_ready' as const, label: 'Ready & Emailed', icon: '📧', desc: 'Certificate emailed to you.' },
];

/* ── Component ── */
function NotarizationResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const reportIdParam = searchParams.get('report_id');

  const [reportId, setReportId] = useState<string | null>(reportIdParam);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 45; // ~3 minutes at 4s intervals
  const apiBase = config.apiUrl;

  /* Step 1: resolve report_id from Stripe session if we only have session_id */
  useEffect(() => {
    if (reportId) return;
    if (!sessionId) {
      setError('Missing session information. Please check your email for the certificate link.');
      setPolling(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/stripe/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.report_id) {
          setReportId(data.report_id);
        } else {
          // Try by-session endpoint
          const res2 = await fetch(`${apiBase}/api/v1/reports/by-session?session_id=${encodeURIComponent(sessionId)}`);
          const data2 = await res2.json();
          if (data2.report_id) {
            setReportId(data2.report_id);
          } else {
            setError('Could not locate your notarization. Please contact support.');
            setPolling(false);
          }
        }
      } catch {
        setError('Network error while verifying payment. Please refresh the page.');
        setPolling(false);
      }
    })();
  }, [sessionId, reportId, apiBase]);

  /* Step 2: poll certificate endpoint */
  const fetchCertificate = useCallback(async () => {
    if (!reportId) return;
    try {
      const sessionParam = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
      const res = await fetch(`${apiBase}/api/v1/notarize/certificate/${reportId}${sessionParam}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Notarization not found.');
          setPolling(false);
        }
        return;
      }
      const data: CertificateData = await res.json();
      setCert(data);
      if (data.pipeline.certificate_ready) {
        setPolling(false);
        return;
      }
      setPollCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_POLLS) {
          setPolling(false);
          setError('Processing is taking longer than expected. Your certificate will be emailed once ready — you can close this page.');
        }
        return next;
      });
    } catch {
      // Silently retry on network errors
    }
  }, [reportId, apiBase]);

  useEffect(() => {
    if (!reportId || !polling) return;
    fetchCertificate();
    const interval = setInterval(fetchCertificate, 4000);
    return () => clearInterval(interval);
  }, [reportId, polling, fetchCertificate]);

  /* ── Render ── */
  return (
    <main className="bg-gradient-to-b from-[#f0fdf4] via-white to-[#f8fafc] min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#0f172a] mb-2">Notarization Certificate</h1>
          <p className="text-[#64748b]">
            {polling ? 'Your document is being processed…' : cert?.pipeline.certificate_ready ? 'Your notarization is complete.' : 'Processing status'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">{error}</div>
        )}

        {/* ── Pipeline Progress ── */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2e8f0] mb-8">
          <h2 className="text-lg font-bold text-[#0f172a] mb-6">Processing Pipeline</h2>
          <ol className="relative border-l-2 border-[#e2e8f0] ml-3 space-y-6">
            {STEPS.map((s) => {
              const done = cert?.pipeline[s.key] ?? false;
              const isActive = !done && polling;
              return (
                <li key={s.key} className="ml-8 relative">
                  <span
                    className={`absolute -left-[calc(2rem+5px)] flex items-center justify-center w-7 h-7 rounded-full text-sm ring-4 ring-white ${
                      done ? 'bg-[#10b981] text-white' : isActive ? 'bg-amber-400 text-white animate-pulse' : 'bg-[#e2e8f0] text-[#94a3b8]'
                    }`}
                  >
                    {done ? '✓' : s.icon}
                  </span>
                  <p className={`text-sm font-semibold ${done ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>{s.label}</p>
                  <p className="text-xs text-[#64748b]">{s.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Certificate Card (shown once complete) ── */}
        {cert?.pipeline.certificate_ready && (
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#10b981] overflow-hidden mb-8">

            {/* Green header bar */}
            <div className="bg-gradient-to-r from-[#10b981] to-[#059669] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80">Booppa Blockchain Notarization</p>
                  <h2 className="text-2xl font-black mt-1">{cert.verification?.proof_header ?? 'BOOPPA-PROOF-SG'}</h2>
                </div>
                <div className="text-right text-xs opacity-80">
                  <p>Schema {cert.verification?.schema_version ?? '1.0'}</p>
                  {cert.completed_at && <p>{formatDate(cert.completed_at)}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">

              {/* Document Info */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Document</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#94a3b8]">File Name</p>
                    <p className="text-[#0f172a] font-medium break-all">{cert.file_name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">File Size</p>
                    <p className="text-[#0f172a] font-medium">{cert.file_size ? formatBytes(cert.file_size) : '—'}</p>
                  </div>
                  {cert.company_name && cert.company_name !== 'Notarization' && (
                    <div>
                      <p className="text-xs text-[#94a3b8]">Company</p>
                      <p className="text-[#0f172a] font-medium">{cert.company_name}</p>
                    </div>
                  )}
                  {cert.plan && (
                    <div>
                      <p className="text-xs text-[#94a3b8]">Package</p>
                      <p className="text-[#0f172a] font-medium">{PLAN_LABELS[cert.plan] ?? cert.plan}</p>
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-[#e2e8f0]" />

              {/* Cryptographic Hashes */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Cryptographic Proof</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#94a3b8] mb-1">SHA-256 File Hash</p>
                    <p className="font-mono text-sm text-[#10b981] break-all bg-[#f0fdf4] p-3 rounded-lg border border-dashed border-[#bbf7d0]">
                      {cert.file_hash}
                    </p>
                  </div>
                  {cert.audit_hash && cert.audit_hash !== cert.file_hash && (
                    <div>
                      <p className="text-xs text-[#94a3b8] mb-1">Evidence Hash (anchored on-chain)</p>
                      <p className="font-mono text-sm text-[#6366f1] break-all bg-[#eef2ff] p-3 rounded-lg border border-dashed border-[#c7d2fe]">
                        {cert.audit_hash}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-[#e2e8f0]" />

              {/* Blockchain Details */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Blockchain Record</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#94a3b8] mb-1">Polygon Transaction Hash</p>
                    <a
                      href={cert.verification?.polygonscan_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-[#2563eb] hover:underline break-all"
                    >
                      {cert.tx_hash}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`inline-flex w-3 h-3 rounded-full ${cert.verification?.anchored ? 'bg-[#10b981]' : 'bg-amber-400'}`} />
                    <span className="text-[#0f172a] font-medium">
                      {cert.verification?.anchored ? 'Confirmed on-chain' : 'Awaiting confirmation'}
                    </span>
                    {cert.verification?.anchored_at && (
                      <span className="text-[#94a3b8] text-xs">({formatDate(cert.verification.anchored_at)})</span>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-[#e2e8f0]" />

              {/* Timestamps */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Timestamps (SGT)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cert.created_at && (
                    <div>
                      <p className="text-xs text-[#94a3b8]">Submitted</p>
                      <p className="text-[#0f172a] font-medium">{formatDate(cert.created_at)}</p>
                    </div>
                  )}
                  {cert.completed_at && (
                    <div>
                      <p className="text-xs text-[#94a3b8]">Completed</p>
                      <p className="text-[#0f172a] font-medium">{formatDate(cert.completed_at)}</p>
                    </div>
                  )}
                </div>
              </section>

              <hr className="border-[#e2e8f0]" />

              {/* QR Code & Verification */}
              {cert.verification && (
                <section className="flex flex-col sm:flex-row items-center gap-6">
                  {cert.verification.qr_image && (
                    <div className="flex-shrink-0 bg-white p-3 rounded-xl border border-[#e2e8f0] shadow-sm">
                      <img
                        src={`data:image/png;base64,${cert.verification.qr_image}`}
                        alt="Verification QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-[#94a3b8] mb-1">Verification URL</p>
                    <a
                      href={cert.verification.verify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#2563eb] hover:underline break-all"
                    >
                      {cert.verification.verify_url}
                    </a>
                    <p className="text-xs text-[#64748b] mt-2">
                      Scan the QR code or visit the URL to independently verify this document&apos;s notarization on the blockchain.
                    </p>
                  </div>
                </section>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {cert.pdf_url && (
                  <a
                    href={cert.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-6 py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-colors shadow-lg"
                  >
                    ⬇ Download PDF Certificate
                  </a>
                )}
                {cert.verification?.polygonscan_url && (
                  <a
                    href={cert.verification.polygonscan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-6 py-3 border-2 border-[#6366f1] text-[#6366f1] font-bold rounded-xl hover:bg-[#eef2ff] transition-colors"
                  >
                    🔗 View on Polygonscan
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sent-to email note */}
        {cert?.pipeline.certificate_ready && cert.contact_email && (
          <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0] text-center text-sm text-[#065f46] mb-8">
            A copy of this certificate has been emailed to <strong>{cert.contact_email}</strong>.
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link href="/notarization" className="text-[#10b981] font-bold hover:underline">
            ← Notarize Another Document
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function NotarizationResultPage() {
  return (
    <Suspense fallback={
      <main className="bg-gradient-to-b from-[#f0fdf4] via-white to-[#f8fafc] min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-black text-[#0f172a] mb-4">Notarization Certificate</h1>
          <p className="text-[#64748b]">Loading…</p>
        </div>
      </main>
    }>
      <NotarizationResultContent />
    </Suspense>
  );
}
