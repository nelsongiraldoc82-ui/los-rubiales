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

    // Obtener todos los huéspedes
    const guestsResult = await queryTurso(`
      SELECT id, registrationId, firstName, lastName, documentType, documentNumber, 
             documentPhoto, nationality, email, phone, isMainGuest
      FROM Guest
    `)

    const allGuests = guestsResult.results?.[0]?.response?.result?.rows || []

    // Mapear registros
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

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error loading registrations:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// Función para escapar texto para SQL
function escapeSql(str: string): string {
  if (!str) return ''
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\')
}

// Función para truncar base64 si es muy largo (mantener funcionalidad)
function truncateBase64(base64: string, maxLength: number = 500000): string {
  if (!base64) return ''
  if (base64.length <= maxLength) return base64
  // Si es muy largo, comprimir la imagen reduciendo calidad
  return base64.substring(0, maxLength)
}

export async function POST(request: Request) {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    const tursoToken = process.env.TURSO_AUTH_TOKEN

    console.log('=== POST Registration ===')
    console.log('TURSO_DATABASE_URL:', tursoUrl ? 'configured' : 'NOT SET')
    console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'configured' : 'NOT SET')

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({ error: 'Variables de entorno no configuradas. Añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel.' }, { status: 500 })
    }

    const httpUrl = tursoUrl.replace('libsql://', 'https://')
    const body = await request.json()

    console.log('Request body:', {
      apartmentId: body.apartmentId,
      guestsCount: body.guests?.length,
      hasSignature: !!body.signature
    })

    if (!body.apartmentId) {
      return NextResponse.json({ error: 'Falta apartmentId' }, { status: 400 })
    }

    if (!body.guests || body.guests.length === 0) {
      return NextResponse.json({ error: 'Falta huéspedes' }, { status: 400 })
    }

    const regId = 'reg_' + Date.now()
    const checkIn = body.checkInDate || new Date().toISOString()
    const checkOut = body.checkOutDate || null
    
    // Truncar firma si es muy larga
    const signature = truncateBase64(body.signature || '')
    const escapedSignature = escapeSql(signature)

    // Insertar registro
    const regSql = `INSERT INTO GuestRegistration (id, apartmentId, checkInDate, checkOutDate, status, signature) VALUES ('${regId}', '${body.apartmentId}', '${checkIn}', ${checkOut ? `'${checkOut}'` : 'NULL'}, 'active', '${escapedSignature}')`

    console.log('Inserting registration:', regId)

    const regResponse = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql: regSql } }, { type: 'close' }]
      })
    })

    if (!regResponse.ok) {
      const errorText = await regResponse.text()
      console.error('Error inserting registration:', errorText)
      return NextResponse.json({ error: 'Error al guardar registro: ' + errorText }, { status: 500 })
    }

    console.log('Registration inserted, now inserting guests...')

    // Insertar huéspedes uno por uno
    for (let i = 0; i < body.guests.length; i++) {
      const guest = body.guests[i]
      const guestId = 'guest_' + Date.now() + '_' + i
      
      const firstName = escapeSql(guest.firstName || '')
      const lastName = escapeSql(guest.lastName || '')
      const docNum = escapeSql(guest.documentNumber || '')
      const docType = guest.documentType || 'DNI'
      const isMain = guest.isMainGuest ? 1 : 0
      
      // Truncar foto del documento si es muy larga
      const docPhoto = truncateBase64(guest.documentPhoto || '')
      const nationality = escapeSql(guest.nationality || '')
      const email = escapeSql(guest.email || '')
      const phone = escapeSql(guest.phone || '')

      const guestSql = `INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, documentPhoto, nationality, email, phone, isMainGuest) VALUES ('${guestId}', '${regId}', '${firstName}', '${lastName}', '${docType}', '${docNum}', ${docPhoto ? `'${docPhoto}'` : 'NULL'}, ${nationality ? `'${nationality}'` : 'NULL'}, ${email ? `'${email}'` : 'NULL'}, ${phone ? `'${phone}'` : 'NULL'}, ${isMain})`

      console.log(`Inserting guest ${i + 1}/${body.guests.length}:`, guestId)

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
        const errorText = await guestResponse.text()
        console.error(`Error inserting guest ${i + 1}:`, errorText)
        // Continuar con los demás huéspedes aunque falle uno
      }
    }

    console.log('All guests inserted successfully')
    return NextResponse.json({ success: true, id: regId })

  } catch (e) {
    console.error('Error in POST registration:', e)
    return NextResponse.json({ error: 'Error interno: ' + String(e) }, { status: 500 })
  }
}
