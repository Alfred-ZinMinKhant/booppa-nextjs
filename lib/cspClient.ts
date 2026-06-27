// Thin client-side wrapper around the CSP proxy (/api/csp/*). Keeps the operational
// pages terse and centralizes status handling. 402 → bounce to purchase; 403 →
// bounce to onboarding (ToS not accepted). Everything else is returned as-is.

export interface CspResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

async function parse(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function handleGate(status: number) {
  if (typeof window === "undefined") return;
  if (status === 402) window.location.href = "/csp#pricing";
  if (status === 403) window.location.href = "/csp/onboarding";
}

export async function cspGet<T = any>(path: string): Promise<CspResponse<T>> {
  const res = await fetch(`/api/csp/${path}`, { cache: "no-store" });
  if (res.status === 402 || res.status === 403) handleGate(res.status);
  return { ok: res.ok, status: res.status, data: await parse(res) };
}

export async function cspSend<T = any>(
  path: string,
  method: "POST" | "PATCH",
  body?: unknown,
): Promise<CspResponse<T>> {
  const res = await fetch(`/api/csp/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (res.status === 402 || res.status === 403) handleGate(res.status);
  return { ok: res.ok, status: res.status, data: await parse(res) };
}
