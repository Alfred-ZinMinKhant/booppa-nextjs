import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('token', '', { path: '/', maxAge: 0 })
  response.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
  response.cookies.set('vendor_plan', '', { path: '/', maxAge: 0 })
  return response
}
