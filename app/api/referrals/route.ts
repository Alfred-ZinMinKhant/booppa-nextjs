import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/auth';

// GET /api/referrals?user_id=... — list my referrals
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  const res = await fetchWithAuth(`/referrals/my/${userId}`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

// POST /api/referrals — create referral code
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetchWithAuth('/referrals/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
