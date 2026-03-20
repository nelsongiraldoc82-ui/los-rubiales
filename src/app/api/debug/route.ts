import { NextResponse } from 'next/server'

// API para verificar la configuración
export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  const dbUrl = process.env.DATABASE_URL
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    config: {
      DATABASE_URL: dbUrl ? '✅ configurado' : '❌ NO configurado',
      TURSO_DATABASE_URL: tursoUrl ? `✅ ${tursoUrl.substring(0, 30)}...` : '❌ NO configurado',
      TURSO_AUTH_TOKEN: tursoToken ? `✅ ${tursoToken.substring(0, 10)}...` : '❌ NO configurado',
    },
    ready: !!(tursoUrl && tursoToken),
    instructions: !tursoUrl || !tursoToken 
      ? 'Configura TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en las variables de entorno de Netlify'
      : 'Todo configurado correctamente'
  })
}
