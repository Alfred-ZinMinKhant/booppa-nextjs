"use client"

"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickScanButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/pdpa/quick-scan')}
      className="inline-flex items-center justify-center rounded-lg bg-green-500 px-8 py-3 text-lg font-semibold text-white hover:bg-green-600 transition"
      disabled={loading}
    >
      {loading ? "Starting..." : "Get Quick Scan Report"}
    </button>
  );
}
