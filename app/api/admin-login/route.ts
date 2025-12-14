import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return NextResponse.json({ detail: "Missing credentials" }, { status: 400 });
  }

  // Replace with your backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  const res = await fetch(`${backendUrl}/api/v1/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${encodeURIComponent(username as string)}&password=${encodeURIComponent(password as string)}`,
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json(data);
}
