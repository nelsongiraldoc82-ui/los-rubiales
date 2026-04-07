import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Función para hashear contraseña usando Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// GET - Ver estado y crear usuarios/apartamentos
export async function GET() {
  try {
    // Crear apartamentos si no existen
    const existingApartments = await prisma.apartment.count()
    
    if (existingApartments === 0) {
      await prisma.apartment.createMany({
        data: [
          { name: 'Apartamento 1', description: 'Apartamento rural Los Rubiales', capacity: 6 },
          { name: 'Apartamento 2', description: 'Apartamento rural Los Rubiales', capacity: 6 },
          { name: 'Apartamento 3', description: 'Apartamento rural Los Rubiales', capacity: 6 },
        ]
      })
      console.log('Apartamentos creados correctamente')
    }

    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        status: 'Setup already completed',
        usersCount: existingUsers,
        apartmentsCount: existingApartments === 0 ? 3 : existingApartments,
        credentials: [
          { username: 'admin', password: 'admin123', role: 'admin' },
          { username: 'usuario', password: 'user123', role: 'user' }
        ]
      })
    }

    // Crear usuario admin
    const adminPassword = await hashPassword('admin123')
    await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        name: 'Administrador'
      }
    })

    // Crear usuario básico
    const userPassword = await hashPassword('user123')
    await prisma.user.create({
      data: {
        username: 'usuario',
        password: userPassword,
        role: 'user',
        name: 'Usuario'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully!',
      credentials: [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'usuario', password: 'user123', role: 'user' }
      ],
      apartments: 3
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// POST - Crear usuarios por defecto si no existen
export async function POST() {
  try {
    // Crear apartamentos si no existen
    const existingApartments = await prisma.apartment.count()
    
    if (existingApartments === 0) {
      await prisma.apartment.createMany({
        data: [
          { name: 'Apartamento 1', description: 'Apartamento rural Los Rubiales', capacity: 6 },
          { name: 'Apartamento 2', description: 'Apartamento rural Los Rubiales', capacity: 6 },
          { name: 'Apartamento 3', description: 'Apartamento rural Los Rubiales', capacity: 6 },
        ]
      })
    }

    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Setup already completed',
        usersCount: existingUsers
      })
    }

    // Crear usuario admin
    const adminPassword = await hashPassword('admin123')
    await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        name: 'Administrador'
      }
    })

    // Crear usuario básico
    const userPassword = await hashPassword('user123')
    await prisma.user.create({
      data: {
        username: 'usuario',
        password: userPassword,
        role: 'user',
        name: 'Usuario'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Setup completed',
      users: [
        { username: 'admin', role: 'admin', password: 'admin123' },
        { username: 'usuario', role: 'user', password: 'user123' }
      ]
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
