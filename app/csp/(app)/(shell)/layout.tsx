import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";
import CspNav from "@/components/csp/CspNav";

export const dynamic = "force-dynamic";

// Profile gate + nav shell for the operational pages (dashboard, clients, etc.).
// These all require a CspProfile; until one exists the backend returns 404, so we
// send the buyer to onboarding (ToS + profile). Onboarding itself is NOT under
// this group, so there's no redirect loop. The 402 entitlement check already ran
// in the parent (app) layout.
export default async function CspShellLayout({ children }: { children: React.ReactNode }) {
  const res = await fetchWithAuth("/api/v1/csp/profile");
  if (res.status === 402) redirect("/csp#pricing");
  if (res.status === 404) redirect("/csp/onboarding");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <CspNav />
      <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
