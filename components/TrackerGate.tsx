"use client"

import { useEffect } from "react";

export default function TrackerGate() {
  useEffect(() => {
    // initialize global consent state
    try {
      const stored = localStorage.getItem("booppa_consent");
      if (stored) {
        const parsed = JSON.parse(stored);
        // set simple global for any script to check
        (window as any).__booppa_consent_status = parsed.consent_status || null;
      } else {
        (window as any).__booppa_consent_status = null;
      }
    } catch (e) {
      (window as any).__booppa_consent_status = null;
    }

    function onConsent(e: any) {
      try {
        const status = e?.detail?.consent_status || null;
        (window as any).__booppa_consent_status = status;
      } catch (ignored) {}
    }

    window.addEventListener("consent:changed", onConsent as EventListener);
    return () => window.removeEventListener("consent:changed", onConsent as EventListener);
  }, []);

  return null;
}
