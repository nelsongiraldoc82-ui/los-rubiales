import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json([])
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    // Obtener registros
    const regResponse = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT id, apartmentId, checkInDate, checkOutDate, status, notes, signature FROM GuestRegistration ORDER BY checkInDate DESC' } },
          { type: 'close' }
        ]
      })
    })

    const regData = await regResponse.json()
    const regRows = regData.results?.[0]?.response?.result?.rows || []
    const regCols = regData.results?.[0]?.response?.result?.cols || []

    const registrations = []

    for (const row of regRows) {
      const reg: any = {
        id: row[0]?.value || '',
        apartmentId: row[1]?.value || '',
        checkInDate: row[2]?.value || '',
        checkOutDate: row[3]?.value || null,
        status: row[4]?.value || 'active',
        notes: row[5]?.value || null,
        signature: row[6]?.value || null,
        apartment: { id: row[1]?.value || '', name: 'Apartamento', description: '', capacity: 6 },
        guests: []
      }

      // Obtener huéspedes del registro
      const guestResponse = await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            { type: 'execute', stmt: { sql: `SELECT firstName, lastName, documentType, documentNumber, nationality, email, phone, isMainGuest FROM Guest WHERE registrationId = '${reg.id}'` } },
            { type: 'close' }
          ]
        })
      })

      const guestData = await guestResponse.json()
      const guestRows = guestData.results?.[0]?.response?.result?.rows || []

      reg.guests = guestRows.map((g: any) => ({
        firstName: g[0]?.value || '',
        lastName: g[1]?.value || '',
        documentType: g[2]?.value || 'DNI',
        documentNumber: g[3]?.value || '',
        nationality: g[4]?.value || null,
        email: g[5]?.value || null,
        phone: g[6]?.value || null,
        isMainGuest: g[7]?.value === '1' || g[7]?.value === 1
      }))

      registrations.push(reg)
    }

    return NextResponse.json(registrations)

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
    const checkIn = body.checkInDate || new Date().toISOString()
    const signature = (body.signature || '').replace(/'/g, "''")
    const aptId = body.apartmentId || ''

    const sql = `INSERT INTO GuestRegistration (id, apartmentId, checkInDate, status, signature) VALUES ('${regId}', '${aptId}', '${checkIn}', 'active', '${signature}')`

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
      const firstName = (guest.firstName || '').replace(/'/g, "''")
      const lastName = (guest.lastName || '').replace(/'/g, "''")
      const docNum = (guest.documentNumber || '').replace(/'/g, "''")
      const docType = guest.documentType || 'DNI'
      const main = guest.isMainGuest ? 1 : 0

      const guestSql = `INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, isMainGuest) VALUES ('${guestId}', '${regId}', '${firstName}', '${lastName}', '${docType}', '${docNum}', ${main})`

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
