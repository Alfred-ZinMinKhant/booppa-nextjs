import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${config.apiUrl}/api/v1/rankings/leaderboard/all${params ? `?${params}` : ''}`);
  const data = await res.json().catch(() => ({ entries: [] }));
  return NextResponse.json(data, { status: res.status });
}
