import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'rubiales-admin'
export const SESSION_SECONDS = 8 * 60 * 60

export function readAdminKey() {
  const key = process.env.ADMIN_ACCESS_KEY?.trim()
  return key && /^[a-f0-9]{64}$/.test(key) ? key : null
}

function sign(value: string, key: string) {
  return createHmac('sha256', key).update(value).digest('hex')
}

export function matchesAdminKey(candidate: unknown, key: string) {
  return typeof candidate === 'string' && /^[a-f0-9]{64}$/.test(candidate)
    && timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(key, 'hex'))
}

export function createAdminSession(key: string) {
  const payload = `${Math.floor(Date.now() / 1000) + SESSION_SECONDS}.${randomBytes(16).toString('hex')}`
  return `${payload}.${sign(payload, key)}`
}

export function requireAdmin(request: NextRequest) {
  const key = readAdminKey()
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const parts = token?.match(/^(\d{1,12})\.([a-f0-9]{32})\.([a-f0-9]{64})$/)

  if (key && parts && Number(parts[1]) > Math.floor(Date.now() / 1000)) {
    const expected = sign(`${parts[1]}.${parts[2]}`, key)
    if (timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts[3], 'hex'))) return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, {
    status: 401,
    headers: { 'Cache-Control': 'no-store' }
  })
}
