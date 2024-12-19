import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { hashPassword } from "@/lib/auth/bcrypt"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ 
      error: 'Unauthorized - Admin access required' 
    }, { status: 401 })
  }

  try {
    const { email, password, name, role, department } = await req.json()
    
    if (!email || !password || !name || !role || !department) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate role and department
    const validRoles = ['admin', 'manager', 'operational']
    const validDepartments = ['management', 'sales', 'accounts', 'trade_shop']
    
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    
    if (!validDepartments.includes(department)) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
    }

    // Hash the password using bcrypt
    const hashedPassword = await hashPassword(password)

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // Create user directly in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name,
        role: role,
        department: department,
        password_hash: hashedPassword,
        is_active: true,
        requires_password_change: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: userError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department
      },
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}