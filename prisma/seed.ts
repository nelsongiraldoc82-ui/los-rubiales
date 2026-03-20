import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear los 3 apartamentos de Los Rubiales
  const apartments = [
    {
      name: 'Apartamento 1',
      description: 'Acogedor apartamento rural con vistas a la sierra',
      capacity: 6,
    },
    {
      name: 'Apartamento 2',
      description: 'Amplio apartamento con terraza privada',
      capacity: 6,
    },
    {
      name: 'Apartamento 3',
      description: 'Apartamento familiar con jardín',
      capacity: 6,
    },
  ]

  for (const apartment of apartments) {
    await prisma.apartment.upsert({
      where: { name: apartment.name },
      update: apartment,
      create: apartment,
    })
  }

  console.log('Seed completado: 3 apartamentos creados/actualizados')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
