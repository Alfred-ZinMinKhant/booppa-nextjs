"use client"

import { useEffect, useState } from "react";
import Link from "next/link";

type ConsentRecord = {
  timestamp: string;
  consent_status: string;
  policy_version: string;
};

const PRIVACY_VERSION = process.env.NEXT_PUBLIC_PRIVACY_VERSION || "2025-12-22";

function sendConsent(record: ConsentRecord) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return fetch(`${base}/api/v1/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("booppa_consent");
      if (!stored) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  async function acceptAll() {
    const record = {
      timestamp: new Date().toISOString(),
      consent_status: "Full Consent",
      policy_version: PRIVACY_VERSION,
    };
    try {
      await sendConsent(record);
    } catch (e) {
      // ignore network errors for now
    }
    try { localStorage.setItem("booppa_consent", JSON.stringify(record)); } catch {}
    setVisible(false);
    // notify other scripts to load optional trackers
    window.dispatchEvent(new CustomEvent("consent:changed", { detail: record }));
  }

  async function rejectOptional() {
    const record = {
      timestamp: new Date().toISOString(),
      consent_status: "Necessary Only",
      policy_version: PRIVACY_VERSION,
    };
    try {
      await sendConsent(record);
    } catch (e) {}
    try { localStorage.setItem("booppa_consent", JSON.stringify(record)); } catch {}
    setVisible(false);
    window.dispatchEvent(new CustomEvent("consent:changed", { detail: record }));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999]">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur rounded-lg border border-gray-700 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 text-sm text-gray-200">
          <p>
            Booppa uses cookies to improve your experience and process payments securely via Stripe and HitPay. In compliance with Singapore’s PDPA, we require your consent to load optional trackers. You can manage your preferences or read our <Link href="/privacy" className="underline">Privacy Policy</Link> for more details.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={acceptAll} className="rounded-md bg-green-500 hover:bg-green-600 text-white px-4 py-2">Accept All</button>
          <button onClick={rejectOptional} className="rounded-md bg-gray-700 hover:bg-gray-600 text-white px-4 py-2">Reject Optional</button>
          <Link href="/pdpa#cookie-settings" className="rounded-md bg-transparent border border-gray-600 text-gray-200 px-4 py-2">Settings</Link>
        </div>
      </div>
    </div>
  );
}
