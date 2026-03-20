import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  // Log para depuración (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    console.log('TURSO_DATABASE_URL:', tursoUrl ? 'configurado' : 'NO configurado')
    console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'configurado' : 'NO configurado')
  }

  // Si hay configuración de Turso, usar libsql
  if (tursoUrl && tursoToken) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter })
    } catch (error) {
      console.error('Error creando cliente Turso:', error)
      throw error
    }
  }
  
  // Desarrollo local con SQLite
  console.log('Usando SQLite local (sin Turso)')
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
