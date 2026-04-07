import { NextResponse } from 'next/server'

// Función auxiliar para extraer valor del formato Turso
function getValue(cell: any): any {
  if (cell && typeof cell === 'object' && 'value' in cell) {
    return cell.value
  }
  return cell
}

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
    const errorText = await response.text()
    throw new Error('Error en Turso: ' + response.status + ' - ' + errorText)
  }

  return response.json()
}

export async function GET() {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    const tursoToken = process.env.TURSO_AUTH_TOKEN

    if (!tursoUrl || !tursoToken) {
      console.error('Variables de entorno no configuradas')
      return NextResponse.json([], { status: 200 })
    }

    // Obtener registros con apartment
    const regResult = await queryTurso(`
      SELECT r.id, r.apartmentId, r.checkInDate, r.checkOutDate, r.status, r.signature, r.notes,
             a.id as apt_id, a.name as apt_name
      FROM GuestRegistration r
      LEFT JOIN Apartment a ON r.apartmentId = a.id
      ORDER BY r.checkInDate DESC
    `)

    const registrations = regResult.results?.[0]?.response?.result?.rows || []
    console.log('Registrations raw:', registrations.length)

    // Obtener todos los huéspedes
    const guestsResult = await queryTurso(`
      SELECT id, registrationId, firstName, lastName, documentType, documentNumber, 
             documentPhoto, nationality, email, phone, isMainGuest
      FROM Guest
    `)

    const allGuests = guestsResult.results?.[0]?.response?.result?.rows || []
    console.log('Guests raw:', allGuests.length)

    // Mapear registros - usando getValue para extraer valores del formato Turso
    const result = registrations.map((row: any[]) => {
      const regId = getValue(row[0])
      return {
        id: regId,
        apartmentId: getValue(row[1]),
        checkInDate: getValue(row[2]),
        checkOutDate: getValue(row[3]),
        status: getValue(row[4]),
        signature: getValue(row[5]),
        notes: getValue(row[6]),
        apartment: {
          id: getValue(row[7]) || getValue(row[1]),
          name: getValue(row[8]) || 'Sin apartamento'
        },
        guests: allGuests
          .filter((g: any[]) => getValue(g[1]) === regId)
          .map((g: any[]) => ({
            firstName: getValue(g[2]),
            lastName: getValue(g[3]),
            documentType: getValue(g[4]),
            documentNumber: getValue(g[5]),
            documentPhoto: getValue(g[6]),
            nationality: getValue(g[7]),
            email: getValue(g[8]),
            phone: getValue(g[9]),
            isMainGuest: getValue(g[10]) === 1 || getValue(g[10]) === true
          }))
      }
    })

    console.log('Registrations parsed:', result.length)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error loading registrations:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Variables de entorno no configuradas' }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')
  const body = await request.json()

  console.log('POST registration - apartmentId:', body.apartmentId, 'guests:', body.guests?.length)

  try {
    const regId = 'reg_' + Date.now()
    const checkIn = body.checkInDate || new Date().toISOString()
    const checkOut = body.checkOutDate || null
    const signature = (body.signature || '').replace(/'/g, "''")

    const sql = `INSERT INTO GuestRegistration (id, apartmentId, checkInDate, checkOutDate, status, signature) VALUES ('${regId}', '${body.apartmentId}', '${checkIn}', ${checkOut ? `'${checkOut}'` : 'NULL'}, 'active', '${signature}')`

    console.log('Inserting registration:', regId)
    
    const regResponse = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }]
      })
    })

    if (!regResponse.ok) {
      const errorText = await regResponse.text()
      console.error('Error inserting registration:', errorText)
      return NextResponse.json({ error: 'Error inserting registration: ' + errorText }, { status: 500 })
    }

    // Insertar huéspedes
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

      console.log('Inserting guest:', guestId)
      
      const guestResponse = await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{ type: 'execute', stmt: { sql: guestSql } }, { type: 'close' }]
        })
      })

      if (!guestResponse.ok) {
        console.error('Error inserting guest:', await guestResponse.text())
      }
    }

    console.log('Registration saved successfully:', regId)
    return NextResponse.json({ success: true, id: regId })

  } catch (e) {
    console.error('Error in POST registration:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
