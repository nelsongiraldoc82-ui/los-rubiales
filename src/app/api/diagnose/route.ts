import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      TURSO_DATABASE_URL: tursoUrl ? '✓ Configurado' : '✗ NO CONFIGURADO',
      TURSO_AUTH_TOKEN: tursoToken ? '✓ Configurado' : '✗ NO CONFIGURADO',
    }
  }

  if (!tursoUrl || !tursoToken) {
    diagnostics.error = 'Faltan variables de entorno'
    diagnostics.solution = 'Ve a Vercel → Settings → Environment Variables y añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN'
    return NextResponse.json(diagnostics, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')
  diagnostics.httpUrl = httpUrl

  try {
    // Verificar conexión y tablas
    const response = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table'" } },
          { type: 'close' }
        ]
      })
    })

    if (!response.ok) {
      diagnostics.error = 'Error conectando a Turso'
      diagnostics.status = response.status
      diagnostics.statusText = response.statusText
      return NextResponse.json(diagnostics, { status: 500 })
    }

    const data = await response.json()
    const tables = data.results?.[0]?.response?.result?.rows || []
    
    // Extraer nombres de tablas
    const tableNames = tables.map((row: any) => {
      const cell = row[0]
      return cell?.value || cell
    })
    
    diagnostics.tables = tableNames
    diagnostics.hasApartmentTable = tableNames.includes('Apartment')
    diagnostics.hasGuestRegistrationTable = tableNames.includes('GuestRegistration')
    diagnostics.hasGuestTable = tableNames.includes('Guest')

    // Contar apartamentos
    if (diagnostics.hasApartmentTable) {
      const aptResponse = await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            { type: 'execute', stmt: { sql: "SELECT COUNT(*) FROM Apartment" } },
            { type: 'close' }
          ]
        })
      })
      const aptData = await aptResponse.json()
      const count = aptData.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value || 0
      diagnostics.apartmentCount = count
    }

    // Contar registros
    if (diagnostics.hasGuestRegistrationTable) {
      const regResponse = await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            { type: 'execute', stmt: { sql: "SELECT COUNT(*) FROM GuestRegistration" } },
            { type: 'close' }
          ]
        })
      })
      const regData = await regResponse.json()
      const count = regData.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value || 0
      diagnostics.registrationCount = count
    }

    // Verificar si necesita inicialización
    if (!diagnostics.hasApartmentTable || diagnostics.apartmentCount === 0) {
      diagnostics.needsSetup = true
      diagnostics.solution = 'Visita /api/setup para inicializar la base de datos'
    } else {
      diagnostics.needsSetup = false
      diagnostics.status = 'OK - Base de datos lista'
    }

    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error) {
    diagnostics.error = 'Error de conexión'
    diagnostics.details = String(error)
    return NextResponse.json(diagnostics, { status: 500 })
  }
}
