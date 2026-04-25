import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "";

// Simple server-side rate limit: IP → timestamps
const _registrationAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS  = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX        = 3;               // max 3 attempts per window

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits  = (_registrationAttempts.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  hits.push(now);
  _registrationAttempts.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { detail: "Too many registration attempts. Please wait 15 minutes and try again." },
      { status: 429 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let email: string;
  try {
    const body = await req.json();
    email = (body?.email ?? "").toString().trim().toLowerCase();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  // ── Validate email ─────────────────────────────────────────────────────────
  if (!email) {
    return NextResponse.json({ detail: "Email address is required." }, { status: 422 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ detail: "Invalid email address format." }, { status: 422 });
  }

  if (!email.endsWith(".gov.sg")) {
    return NextResponse.json(
      { detail: "Access is restricted to Singapore government email addresses (.gov.sg)." },
      { status: 403 }
    );
  }

  // ── Call backend ───────────────────────────────────────────────────────────
  try {
    const backendRes = await fetch(`${API}/api/v1/government/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { detail: data?.detail ?? `Registration failed (${backendRes.status}).` },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[gov/register] Backend error:", err);
    return NextResponse.json(
      { detail: "Service temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }
}
