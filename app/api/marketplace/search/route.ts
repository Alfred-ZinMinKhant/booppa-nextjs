import { NextRequest, NextResponse } from 'next/server';
import { config, endpoints } from '@/lib/config';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${config.apiUrl}/api/v1${endpoints.marketplace.search}${params ? `?${params}` : ''}`);
  const data = await res.json().catch(() => ({ vendors: [], total: 0 }));
  return NextResponse.json(data, { status: res.status });
}
