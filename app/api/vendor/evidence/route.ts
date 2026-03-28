import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET() {
  const res = await fetchWithAuth('/notarize/my-uploads')
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: res.status })
  }
  return NextResponse.json(await res.json())
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res = await fetchWithAuth('/notarize/upload', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
