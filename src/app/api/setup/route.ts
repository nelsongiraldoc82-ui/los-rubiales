import { NextResponse } from 'next/server'

async function tursoQuery(sql: string) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  const httpUrl = tursoUrl!.replace('libsql://', 'https://')

  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        type: 'execute',
        stmt: { sql }
      }, { type: 'close' }]
    })
  })

  const data = await response.json()
  return data.results?.[0]?.response?.result
}

export async function GET() {
  try {
    // Crear tabla Apartment
    await tursoQuery(`CREATE TABLE IF NOT EXISTS Apartment (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      description TEXT,
      capacity INTEGER DEFAULT 6,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    // Crear tabla GuestRegistration
    await tursoQuery(`CREATE TABLE IF NOT EXISTS GuestRegistration (
      id TEXT PRIMARY KEY,
      apartmentId TEXT NOT NULL,
      checkInDate TEXT DEFAULT CURRENT_TIMESTAMP,
      checkOutDate TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      signature TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    // Crear tabla Guest
    await tursoQuery(`CREATE TABLE IF NOT EXISTS Guest (
      id TEXT PRIMARY KEY,
      registrationId TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      documentType TEXT DEFAULT 'DNI',
      documentNumber TEXT NOT NULL,
      documentPhoto TEXT,
      nationality TEXT,
      dateOfBirth TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postalCode TEXT,
      isMainGuest INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    // Verificar si ya hay apartamentos
    const countResult = await tursoQuery('SELECT COUNT(*) as count FROM Apartment')
    const count = parseInt(countResult?.rows?.[0]?.[0]?.value || '0')

    if (count > 0) {
      const apartmentsResult = await tursoQuery('SELECT * FROM Apartment')
      const apartments = apartmentsResult?.rows?.map((row: any[]) => {
        const obj: any = {}
        apartmentsResult.cols?.forEach((col: any, i: number) => {
          obj[col.name] = row[i]?.value
        })
        return obj
      }) || []
      
      return NextResponse.json({
        success: true,
        message: 'Los apartamentos ya existen',
        apartments
      })
    }

    // Crear los 3 apartamentos
    const ts = Date.now()
    await tursoQuery(`INSERT INTO Apartment (id, name, description, capacity) VALUES ('apt1_${ts}', 'Apartamento 1', 'Apartamento rural Los Rubiales', 6)`)
    await tursoQuery(`INSERT INTO Apartment (id, name, description, capacity) VALUES ('apt2_${ts}', 'Apartamento 2', 'Apartamento rural Los Rubiales', 6)`)
    await tursoQuery(`INSERT INTO Apartment (id, name, description, capacity) VALUES ('apt3_${ts}', 'Apartamento 3', 'Apartamento rural Los Rubiales', 6)`)

    const apartmentsResult = await tursoQuery('SELECT * FROM Apartment')
    const apartments = apartmentsResult?.rows?.map((row: any[]) => {
      const obj: any = {}
      apartmentsResult.cols?.forEach((col: any, i: number) => {
        obj[col.name] = row[i]?.value
      })
      return obj
    }) || []

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      apartments
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Error al inicializar',
      details: String(error)
    }, { status: 500 })
  }
}
