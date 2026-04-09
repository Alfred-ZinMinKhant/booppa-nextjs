import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  const res = await fetch(`${config.apiUrl}/api/v1/marketplace/industries`);
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}
