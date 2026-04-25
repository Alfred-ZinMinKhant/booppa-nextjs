import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "";

// Rate limiting: IP → timestamps
const _contactAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX       = 5;               // max 5 submissions per hour

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits = (_contactAttempts.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  _contactAttempts.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { detail: "Too many submissions. Please wait before trying again." },
      { status: 429 }
    );
  }

  let name: string, email: string, agency: string, message: string, source: string;
  try {
    const body = await req.json();
    name    = (body?.name    ?? "").toString().trim();
    email   = (body?.email   ?? "").toString().trim().toLowerCase();
    agency  = (body?.agency  ?? "").toString().trim();
    message = (body?.message ?? "").toString().trim();
    source  = (body?.source  ?? "website").toString().trim();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (!name)    return NextResponse.json({ detail: "Full name is required."    }, { status: 422 });
  if (!email)   return NextResponse.json({ detail: "Email address is required." }, { status: 422 });
  if (!message) return NextResponse.json({ detail: "Message is required."      }, { status: 422 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ detail: "Invalid email address format." }, { status: 422 });
  }

  // Forward to backend contact endpoint
  try {
    const backendRes = await fetch(`${API}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, agency, message, source, to: "support@booppa.io" }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { detail: data?.detail ?? `Submission failed (${backendRes.status}).` },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] Backend error:", err);
    return NextResponse.json(
      { detail: "Service temporarily unavailable. Please email us directly at support@booppa.io." },
      { status: 503 }
    );
  }
}
