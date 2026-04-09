'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Pages where the sticky CTA is hidden (already have a prominent claim/register CTA)
const HIDDEN_ON = ['/auth/register', '/auth/login', '/vendor/dashboard', '/vendor/profile', '/vendor/evidence', '/admin'];

export default function StickyClaimCTA() {
  const pathname = usePathname();

  if (HIDDEN_ON.some(p => pathname?.startsWith(p))) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/auth/register"
        className="flex items-center gap-2 px-5 py-3 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        Claim your Profile
      </Link>
    </div>
  );
}
