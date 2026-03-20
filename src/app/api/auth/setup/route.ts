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

// GET - Ver estado y crear usuarios
export async function GET() {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        status: 'Users already exist',
        count: existingUsers,
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
      message: 'Default users created successfully!',
      credentials: [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'usuario', password: 'user123', role: 'user' }
      ]
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
    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Users already exist',
        count: existingUsers
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
      message: 'Default users created',
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
