import { NextResponse } from 'next/server'

const getTursoConfig = () => {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  return { url, token }
}

const executeSql = async (sql: string) => {
  const { url, token } = getTursoConfig()
  if (!url || !token) throw new Error('No config')

  const httpUrl = url.replace('libsql://', 'https://')
  
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }]
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Turso error: ${res.status} - ${text}`)
  }

  return res.json()
}

// Extraer valor de celda Turso
const val = (cell: any): string => {
  if (cell == null) return ''
  if (typeof cell === 'object' && 'value' in cell) return cell.value || ''
  return String(cell)
}

// Escapar SQL
const esc = (s: string): string => {
  if (!s) return ''
  return s.replace(/'/g, "''")
}

export async function GET() {
  try {
    const { url, token } = getTursoConfig()
    if (!url || !token) return NextResponse.json([])

    // Obtener registros
    const regData = await executeSql(`
      SELECT r.id, r.apartmentId, r.checkInDate, r.checkOutDate, r.status, r.signature, r.notes,
             a.id, a.name
      FROM GuestRegistration r
      LEFT JOIN Apartment a ON r.apartmentId = a.id
      ORDER BY r.checkInDate DESC
    `)

    const regRows = regData.results?.[0]?.response?.result?.rows || []

    // Obtener huéspedes
    const guestData = await executeSql(`
      SELECT registrationId, firstName, lastName, documentType, documentNumber, 
             documentPhoto, nationality, email, phone, isMainGuest
      FROM Guest
    `)

    const guestRows = guestData.results?.[0]?.response?.result?.rows || []

    // Procesar registros
    const result = regRows.map((row: any[]) => {
      const regId = val(row[0])
      
      // Buscar huéspedes de este registro
      const guests = guestRows
        .filter((g: any[]) => val(g[0]) === regId)
        .map((g: any[]) => ({
          firstName: val(g[1]),
          lastName: val(g[2]),
          documentType: val(g[3]) || 'DNI',
          documentNumber: val(g[4]),
          documentPhoto: val(g[5]),
          nationality: val(g[6]),
          email: val(g[7]),
          phone: val(g[8]),
          isMainGuest: val(g[9]) === '1'
        }))

      return {
        id: regId,
        apartmentId: val(row[1]),
        checkInDate: val(row[2]),
        checkOutDate: val(row[3]) || null,
        status: val(row[4]) || 'active',
        signature: val(row[5]),
        notes: val(row[6]),
        apartment: {
          id: val(row[7]) || val(row[1]),
          name: val(row[8]) || 'Apartamento'
        },
        guests
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const { url, token } = getTursoConfig()
    if (!url || !token) {
      return NextResponse.json({ error: 'No configurado' }, { status: 500 })
    }

    const body = await request.json()
    const { apartmentId, guests, checkInDate, checkOutDate, signature } = body

    if (!apartmentId || !guests?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // IDs únicos
    const ts = Date.now()
    const regId = `reg_${ts}`

    // Insertar registro (sin firma por ahora para evitar SQL muy largo)
    const checkIn = checkInDate || new Date().toISOString()
    const checkOut = checkOutDate ? `'${checkOutDate}'` : 'NULL'
    
    // Acortar firma si es muy larga
    const shortSignature = signature ? signature.substring(0, 50000) : ''

    await executeSql(`
      INSERT INTO GuestRegistration (id, apartmentId, checkInDate, checkOutDate, status, signature)
      VALUES ('${regId}', '${apartmentId}', '${checkIn}', ${checkOut}, 'active', '${esc(shortSignature)}')
    `)

    // Insertar cada huésped
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i]
      const guestId = `guest_${ts}_${i}`
      
      const firstName = esc(g.firstName || '')
      const lastName = esc(g.lastName || '')
      const docType = esc(g.documentType || 'DNI')
      const docNum = esc(g.documentNumber || '')
      const isMain = g.isMainGuest ? 1 : 0
      
      // Acortar foto si es muy larga
      const photo = g.documentPhoto ? g.documentPhoto.substring(0, 100000) : ''
      const nat = esc(g.nationality || '')
      const em = esc(g.email || '')
      const ph = esc(g.phone || '')

      const sql = `INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, documentPhoto, nationality, email, phone, isMainGuest) VALUES ('${guestId}', '${regId}', '${firstName}', '${lastName}', '${docType}', '${docNum}', ${photo ? `'${photo}'` : 'NULL'}, ${nat ? `'${nat}'` : 'NULL'}, ${em ? `'${em}'` : 'NULL'}, ${ph ? `'${ph}'` : 'NULL'}, ${isMain})`

      try {
        await executeSql(sql)
      } catch (e) {
        console.error('Error inserting guest:', e)
      }
    }

    return NextResponse.json({ success: true, id: regId })

  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
