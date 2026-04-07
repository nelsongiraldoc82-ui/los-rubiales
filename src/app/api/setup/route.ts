import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Variables no configuradas' }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  async function executeSql(sql: string) {
    const response = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql } },
          { type: 'close' }
        ]
      })
    })
    return response
  }

  try {
    // Crear tabla Apartment
    await executeSql(`
      CREATE TABLE IF NOT EXISTS Apartment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        capacity INTEGER DEFAULT 6
      )
    `)

    // Crear tabla GuestRegistration
    await executeSql(`
      CREATE TABLE IF NOT EXISTS GuestRegistration (
        id TEXT PRIMARY KEY,
        apartmentId TEXT NOT NULL,
        checkInDate TEXT NOT NULL,
        checkOutDate TEXT,
        status TEXT DEFAULT 'active',
        signature TEXT,
        notes TEXT
      )
    `)

    // Crear tabla Guest
    await executeSql(`
      CREATE TABLE IF NOT EXISTS Guest (
        id TEXT PRIMARY KEY,
        registrationId TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        documentType TEXT DEFAULT 'DNI',
        documentNumber TEXT NOT NULL,
        documentPhoto TEXT,
        nationality TEXT,
        email TEXT,
        phone TEXT,
        isMainGuest INTEGER DEFAULT 0
      )
    `)

    // Insertar apartamentos
    await executeSql(`INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_1', 'Apartamento 1', 'Apartamento para 6 personas', 6)`)
    await executeSql(`INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_2', 'Apartamento 2', 'Apartamento para 6 personas', 6)`)
    await executeSql(`INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_3', 'Apartamento 3', 'Apartamento para 6 personas', 6)`)

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos inicializada correctamente con 3 apartamentos' 
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Error: ' + String(error) 
    }, { status: 500 })
  }
}
