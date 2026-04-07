import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Verificar variables
  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({
      error: 'Variables de entorno faltantes',
      TURSO_DATABASE_URL: tursoUrl || 'NO CONFIGURADO',
      TURSO_AUTH_TOKEN: tursoToken ? 'configurado' : 'NO CONFIGURADO',
    }, { status: 500 })
  }

  try {
    // Crear cliente directamente sin Prisma
    const db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })

    // Ejecutar consulta simple
    const result = await db.execute('SELECT 1 as test')

    return NextResponse.json({
      success: true,
      message: 'Conexión a Turso exitosa',
      result: result.rows,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Error conectando a Turso',
      details: String(error),
    }, { status: 500 })
  }
}
