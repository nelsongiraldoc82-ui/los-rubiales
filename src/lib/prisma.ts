import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Leer variables de entorno
  let tursoUrl = process.env.TURSO_DATABASE_URL
  let tursoToken = process.env.TURSO_AUTH_TOKEN
  
  // Si las variables no están disponibles, intentar leer de process.env directamente
  if (!tursoUrl) {
    tursoUrl = process.env['TURSO_DATABASE_URL'] || ''
  }
  if (!tursoToken) {
    tursoToken = process.env['TURSO_AUTH_TOKEN'] || ''
  }

  // Log para debugging
  console.log('TURSO_DATABASE_URL:', tursoUrl ? tursoUrl.substring(0, 30) + '...' : 'NO ENCONTRADO')
  console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'presente (' + tursoToken.length + ' chars)' : 'NO ENCONTRADO')

  // Si hay configuración de Turso, usar libsql
  if (tursoUrl && tursoToken) {
    console.log('Creando cliente Turso...')
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }
  
  // Fallback a SQLite local
  console.log('Usando SQLite local')
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
