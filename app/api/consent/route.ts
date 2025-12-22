import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ detail: "Missing body" }, { status: 400 });
  }

  const res = await fetch(`${backendUrl}/api/v1/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((err) => null);

  if (!res) return NextResponse.json({ detail: "Upstream error" }, { status: 502 });

  const data = await res.text();
  return NextResponse.json({ ok: true, upstream: data }, { status: res.status });
}
