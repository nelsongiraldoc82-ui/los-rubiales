import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-session'
import { MAX_DOCUMENT_PHOTO_LENGTH } from '@/lib/registration-limits'

const getTursoConfig = () => {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  return { url, token }
}

const executeSql = async (sql: string, args: (string | null)[] = []) => {
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
      requests: [{ type: 'execute', stmt: { sql, args: args.map(value => value === null ? { type: 'null' } : { type: 'text', value }) } }, { type: 'close' }]
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Turso error: ${res.status} - ${text}`)
  }

  const result = await res.json()
  if (result.results?.[0]?.type !== 'ok') throw new Error('Turso statement failed')
  return result
}

// Extraer valor de celda Turso
const val = (cell: any): string => {
  if (cell == null) return ''
  if (typeof cell === 'object' && 'value' in cell) return cell.value || ''
  return String(cell)
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const { url, token } = getTursoConfig()
    if (!url || !token) return NextResponse.json({ error: 'Error al cargar los registros' }, { status: 500 })

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

    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } })

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Error al cargar los registros' }, { status: 500 })
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

    console.log('POST request received:', { apartmentId, guestsCount: guests?.length })

    if (typeof apartmentId !== 'string' || !apartmentId || !Array.isArray(guests) || !guests.length ||
        (checkInDate != null && typeof checkInDate !== 'string') ||
        (checkOutDate != null && typeof checkOutDate !== 'string')) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    for (const guest of guests) {
      if (!guest || typeof guest !== 'object') {
        return NextResponse.json({ error: 'Huésped inválido' }, { status: 400 })
      }
      const photo = guest.documentPhoto
      if (photo == null || photo === '') continue
      if (typeof photo !== 'string') {
        return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 })
      }
      if (photo.length > MAX_DOCUMENT_PHOTO_LENGTH) {
        return NextResponse.json({ error: 'La foto es demasiado grande' }, { status: 413 })
      }
      if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo)) {
        return NextResponse.json({ error: 'Formato de foto inválido' }, { status: 400 })
      }
    }

    // IDs únicos
    const ts = Date.now()
    const regId = `reg_${ts}`

    // Insertar registro sin firma (la firma puede ser muy grande)
    const checkIn = checkInDate || new Date().toISOString()
    const checkOut = checkOutDate || null

    // Guardar firma en una variable separada para insertar después
    const signatureToSave = signature || ''

    await executeSql(`
      INSERT INTO GuestRegistration (id, apartmentId, checkInDate, checkOutDate, status, signature)
      VALUES (?, ?, ?, ?, 'active', '')
    `, [regId, apartmentId, checkIn, checkOut])

    // Actualizar firma por separado si existe (usando HTTP separado para evitar límites)
    if (signatureToSave) {
      try {
        // Acortar firma si es muy larga (máximo 30KB para evitar problemas)
        const shortSignature = signatureToSave.substring(0, 30000)
        const escapedSig = shortSignature.replace(/'/g, "''")
        await executeSql(`UPDATE GuestRegistration SET signature = '${escapedSig}' WHERE id = '${regId}'`)
      } catch (sigErr) {
        console.error('Error saving signature:', sigErr)
        // Continuar aunque la firma falle
      }
    }

    // Insertar cada huésped
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i]
      const guestId = `guest_${ts}_${i}`
      
      await executeSql(`
        INSERT INTO Guest (id, registrationId, firstName, lastName, documentType, documentNumber, nationality, email, phone, isMainGuest, documentPhoto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${g.isMainGuest ? 1 : 0}, ?)
      `, [
        guestId, regId, g.firstName || '', g.lastName || '', g.documentType || 'DNI',
        g.documentNumber || '', g.nationality || null, g.email || null, g.phone || null, g.documentPhoto || null
      ])

    }

    console.log('Registration saved successfully:', regId)
    return NextResponse.json({ success: true, id: regId })

  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
