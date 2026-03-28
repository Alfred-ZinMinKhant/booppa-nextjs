import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', '', { path: '/admin', maxAge: 0 });
  response.cookies.set('admin_refresh_token', '', { path: '/admin', maxAge: 0 });
  return response;
}
