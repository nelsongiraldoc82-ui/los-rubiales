import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('TURSO_DATABASE_URL:', tursoUrl ? tursoUrl.substring(0, 30) + '...' : 'NO ENCONTRADO')
  console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'presente (' + tursoToken.length + ' chars)' : 'NO ENCONTRADO')

  if (tursoUrl && tursoToken) {
    console.log('Creando cliente Turso...')
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }
  
  console.log('Usando SQLite local')
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
