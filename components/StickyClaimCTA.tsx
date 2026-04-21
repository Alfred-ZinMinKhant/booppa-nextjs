'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function StickyClaimCTA() {
  const [hasClaimedProfile, setHasClaimedProfile] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.has_claimed_profile) {
          setHasClaimedProfile(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Link
        href="/pdpa/free-scan"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        PDPA Light Check <span className="text-xs font-normal opacity-80">(free)</span>
      </Link>
      <Link
        href="/tender-check"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        Check Tender Win Probability <span className="text-xs font-normal opacity-80">(free)</span>
      </Link>
      {!hasClaimedProfile && (
        <Link
          href="/auth/register"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Claim your Profile <span className="text-xs font-normal opacity-80">(free)</span>
        </Link>
      )}
    </div>
  );
}
