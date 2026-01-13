import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { refresh_token } = await req.json();
  if (!refresh_token) {
    return NextResponse.json({ detail: "Missing refresh token" }, { status: 400 });
  }
  // Replace with your backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json(data);
}

