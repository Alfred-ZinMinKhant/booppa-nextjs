import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    // Minimal server-side tracking: log to server console for later analysis
    console.log('[TRACK]', JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[TRACK] error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

