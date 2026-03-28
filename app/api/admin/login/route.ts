import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const formBody = new URLSearchParams({ username: email, password });
    const res = await fetch(`${config.apiUrl}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Login failed' },
        { status: res.status }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ ok: true });

    response.cookies.set('admin_token', data.access_token, {
      httpOnly: true,
      path: '/admin',
      secure: isProduction,
      maxAge: config.tokenMaxAge,
      sameSite: 'lax',
    });

    if (data.refresh_token) {
      response.cookies.set('admin_refresh_token', data.refresh_token, {
        httpOnly: true,
        path: '/admin',
        secure: isProduction,
        maxAge: config.refreshTokenMaxAge,
        sameSite: 'lax',
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
