import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('=== Setup Database ===')
  console.log('TURSO_DATABASE_URL:', tursoUrl ? 'configured' : 'NOT SET')
  console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'configured' : 'NOT SET')

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ 
      error: 'Variables no configuradas',
      hint: 'Añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel'
    }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  async function executeSql(sql: string, description: string) {
    console.log('Executing:', description)
    try {
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
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error in ${description}:`, errorText)
        return { success: false, error: errorText }
      }
      
      console.log(`✓ ${description} OK`)
      return { success: true }
    } catch (e) {
      console.error(`Error in ${description}:`, e)
      return { success: false, error: String(e) }
    }
  }

  const results = []

  // Crear tabla Apartment
  results.push(await executeSql(`
    CREATE TABLE IF NOT EXISTS Apartment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      capacity INTEGER DEFAULT 6
    )
  `, 'Create Apartment table'))

  // Crear tabla GuestRegistration
  results.push(await executeSql(`
    CREATE TABLE IF NOT EXISTS GuestRegistration (
      id TEXT PRIMARY KEY,
      apartmentId TEXT NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT,
      status TEXT DEFAULT 'active',
      signature TEXT,
      notes TEXT
    )
  `, 'Create GuestRegistration table'))

  // Crear tabla Guest
  results.push(await executeSql(`
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
  `, 'Create Guest table'))

  // Insertar apartamentos (usando INSERT OR IGNORE para evitar duplicados)
  results.push(await executeSql(
    `INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_1', 'Apartamento 1', 'Apartamento para 6 personas', 6)`,
    'Insert Apartment 1'
  ))
  
  results.push(await executeSql(
    `INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_2', 'Apartamento 2', 'Apartamento para 6 personas', 6)`,
    'Insert Apartment 2'
  ))
  
  results.push(await executeSql(
    `INSERT OR IGNORE INTO Apartment (id, name, description, capacity) VALUES ('apt_3', 'Apartamento 3', 'Apartamento para 6 personas', 6)`,
    'Insert Apartment 3'
  ))

  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length

  return NextResponse.json({ 
    success: errorCount === 0,
    message: `Base de datos inicializada. ${successCount} operaciones exitosas, ${errorCount} errores.`,
    details: results
  })
}
