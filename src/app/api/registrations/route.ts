import { NextResponse } from 'next/server'

async function queryTurso(sql: string) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    throw new Error('Variables de entorno no configuradas')
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  const response = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + tursoToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }]
    })
  })

  if (!response.ok) {
    throw new Error('Error en Turso: ' + response.status)
  }

  return response.json()
}

export async function GET() {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    const tursoToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json([])
    }

    const regResult = await queryTurso(`
      SELECT r.id, r.apartmentId, r.checkInDate, r.checkOutDate, r.status, r.signature, r.notes,
             a.id as apt_id, a.name as apt_name
      FROM GuestRegistration r
      LEFT JOIN Apartment a ON r.apartmentId = a.id
      ORDER BY r.checkInDate DESC
    `)

    const registrations = regResult.results?.[0]?.response?.result?.rows || []

    const guestsResult = await queryTurso(`
      SELECT id, registrationId, firstName, lastName, documentType, documentNumber, 
             documentPhoto, nationality, email, phone, isMainGuest
      FROM Guest
    `)

    const allGuests = guestsResult.results?.[0]?.response?.result?.rows || []

    const result = registrations.map((row: any[]) => ({
      id: row[0],
      apartmentId: row[1],
      checkInDate: row[2],
      checkOutDate: row[3],
      status: row[4],
      signature: row[5],
      notes: row[6],
      apartment: {
        id: row[7] || row[1],
        name: row[8] || 'Sin apartamento'
      },
      guests: allGuests
        .filter((g: any[]) => g[1] === row[0])
        .map((g: any[]) => ({
          firstName: g[2],
          lastName: g[3],
          documentType: g[4],
          documentNumber: g[5],
          documentPhoto: g[6],
          nationality: g[7],
          email: g[8],
          phone: g[9],
          isMainGuest: g[10] === 1
        }))
    }))

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error loading registrations:', error)
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
    const checkIn = body.checkInDate || new Date().toISOString()
    const checkOut = body.checkOutDate || null
    const signature = (body.signature || '').replace(/'/g, "''")

    const sql = `INSERT INTO GuestRegistration (id, apartmentId, checkInDate, checkOutDate, status, signature) VALUES ('${regId}', '${body.apartmentId}', '${checkIn}', ${checkOut ? `'${checkOut}'` : 'NULL'}, 'active', '${signature}')`

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

    for (const guest of body.guests || []) {
      const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
      const firstName = (guest.firstName || '').replace(/'/g, "''")
      const lastName = (guest.lastName || '').replace(/'/g, "''")
      const docNum = (guest.documentNumber || '').replace(/'/g, "''")
      const docPhoto = guest.documentPhoto ? `'${(guest.documentPhoto || '').replace(/'/g, "''")}'` : 'NULL'
      const nationality = guest.nationality ? `'${(guest.nationality || '').replace(/'/g, "''")}'` : 'NULL'
      const email = guest.email ? `'${(guest.email || '').replace(/'/g, "''")}'` : 'NULL'
      const phone = guest.phone ? `'${(guest.phone || '').replace(/'/g, "''")}'` : 'NULL'

      const guestSql = `INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, documentPhoto, nationality, email, phone, isMainGuest) VALUES ('${guestId}', '${regId}', '${firstName}', '${lastName}', '${guest.documentType || 'DNI'}', '${docNum}', ${docPhoto}, ${nationality}, ${email}, ${phone}, ${guest.isMainGuest ? 1 : 0})`

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
