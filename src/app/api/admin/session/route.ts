import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SESSION_SECONDS, createAdminSession, matchesAdminKey, readAdminKey } from '@/lib/admin-session'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api'
}

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  const key = readAdminKey()
  if (!key) return NextResponse.json({ error: 'Admin unavailable' }, { status: 503, headers })

  const body = await request.json().catch(() => null)
  if (!matchesAdminKey(body?.key, key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  const response = NextResponse.json({ success: true }, { headers })
  response.cookies.set(ADMIN_COOKIE, createAdminSession(key), { ...cookieOptions, maxAge: SESSION_SECONDS })
  return response
}

export function DELETE() {
  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  response.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 })
  return response
}
