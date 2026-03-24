import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json([])
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    const response = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT id FROM GuestRegistration LIMIT 1' } },
          { type: 'close' }
        ]
      })
    })

    return NextResponse.json([])

  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'No configurado' }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')
  const body = await request.json()

  try {
    const regId = 'reg_' + Date.now()
    const sql = `INSERT INTO GuestRegistration (id, apartmentId, checkInDate, status, signature) VALUES ('${regId}', '${body.apartmentId}', '${body.checkInDate || new Date().toISOString()}', 'active', '${body.signature || ''}')`

    await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }]
      })
    })

    // Insertar huéspedes
    for (const guest of body.guests || []) {
      const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
      const guestSql = `INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, isMainGuest) VALUES ('${guestId}', '${regId}', '${guest.firstName}', '${guest.lastName}', '${guest.documentType || 'DNI'}', '${guest.documentNumber}', ${guest.isMainGuest ? 1 : 0})`

      await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{ type: 'execute', stmt: { sql: guestSql } }, { type: 'close' }]
        })
      })
    }

    return NextResponse.json({ success: true, id: regId })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
