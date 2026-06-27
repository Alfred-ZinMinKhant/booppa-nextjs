import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Entitlement gate for the whole CSP operational app. CSP is a paid pack on its
// own axis (not the vendor_plan cookie), so middleware can't see it — we ask the
// backend. A 402 means the org isn't an active subscriber → send them to buy.
// Anything else (200 / 404 / 403) is handled deeper: the (shell) layout routes
// to onboarding when there's no profile yet, and the onboarding page lives
// outside (shell) so it stays reachable pre-profile.
export default async function CspAppLayout({ children }: { children: React.ReactNode }) {
  const res = await fetchWithAuth("/api/v1/csp/profile");
  if (res.status === 402) redirect("/csp#pricing");
  return <>{children}</>;
}
