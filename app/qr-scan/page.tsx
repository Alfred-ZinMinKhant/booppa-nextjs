'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, FileSearch, ArrowRight, AlertCircle } from 'lucide-react';
import { config } from '@/lib/config';

interface VendorData {
  company_name: string;
  trust_score: number | null;
  industry: string | null;
  country: string | null;
  claimed: boolean;
  uen: string | null;
  tier: string | null;
  website: string | null;
  seo_slug: string | null;
  short_description: string | null;
}

function scoreColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function QRScanContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('v');

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${config.apiUrl}/api/v1/vendors/${slug}`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => setVendor(data))
      .catch(() => setError('Vendor profile not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  // No slug — generic entry point
  if (!slug) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="h-14 w-14 text-violet-400 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-3">BOOPPA Vendor Trust</h1>
        <p className="text-neutral-400 max-w-sm mb-8">
          Scan a vendor badge QR code to instantly view their verified compliance score
          and trust profile.
        </p>
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
        >
          Browse Vendor Directory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-white text-lg font-semibold mb-2">Profile not found</p>
        <p className="text-neutral-400 text-sm mb-6">
          This vendor badge may be outdated. Ask the vendor for their current profile link.
        </p>
        <Link href="/vendors" className="text-violet-400 hover:underline text-sm">
          Search vendor directory →
        </Link>
      </div>
    );
  }

  const proofUrl = `/vendor-proof?company=${encodeURIComponent(vendor.company_name)}&website=${encodeURIComponent(vendor.website || '')}`;
  const profileUrl = `/vendors/${vendor.seo_slug || slug}`;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">

        {/* Trust badge card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            BOOPPA Verified
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{vendor.company_name}</h1>
            {vendor.industry && (
              <p className="text-sm text-neutral-400 mt-1">{vendor.industry}</p>
            )}
          </div>

          {vendor.trust_score !== null && vendor.trust_score !== undefined ? (
            <div>
              <div
                className="text-6xl font-black"
                style={{ color: scoreColor(vendor.trust_score) }}
              >
                {vendor.trust_score}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Trust Score / 100</p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Score not yet computed</p>
          )}

          <div className="flex flex-wrap justify-center gap-3 text-xs text-neutral-400">
            {vendor.uen && <span>UEN: {vendor.uen}</span>}
            {vendor.country && <span>{vendor.country}</span>}
            {vendor.tier && (
              <span className="uppercase font-semibold text-violet-400">{vendor.tier}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {vendor.short_description && (
          <p className="text-sm text-neutral-400 text-center px-2">
            {vendor.short_description}
          </p>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href={proofUrl}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            <FileSearch className="h-4 w-4" />
            Run Vendor Proof Check
          </Link>
          <Link
            href={profileUrl}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition text-sm"
          >
            View Full Profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-center text-xs text-neutral-600">
          Powered by{' '}
          <Link href="/" className="text-neutral-500 hover:text-neutral-400">
            BOOPPA
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function QRScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QRScanContent />
    </Suspense>
  );
}
