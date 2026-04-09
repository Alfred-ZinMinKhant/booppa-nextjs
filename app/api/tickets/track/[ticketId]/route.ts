import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  req: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ detail: 'Missing tracking token' }, { status: 400 });
  }
  const res = await fetch(
    `${config.apiUrl}/api/tickets/track/${params.ticketId}?token=${encodeURIComponent(token)}`
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
