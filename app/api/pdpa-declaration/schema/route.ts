import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

// Public schema — no auth required.
export async function GET() {
  const res = await fetch(`${config.apiUrl}/api/v1/pdpa-declaration/schema`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
