import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth/bcrypt'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    return NextResponse.json({ hashedPassword })
  } catch (error: any) {
    console.error('Error hashing password:', error)
    return NextResponse.json(
      { error: 'Failed to hash password' },
      { status: 500 }
    )
  }
} 