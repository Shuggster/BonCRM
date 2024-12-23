import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { hashPassword } from "@/lib/auth/bcrypt"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    console.log('Starting user creation process...')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user || session.user.role !== 'admin') {
      console.error('Unauthorized attempt:', {
        hasSession: !!session,
        userRole: session?.user?.role
      })
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    const body = await req.json()
    console.log('Request body:', body)
    
    const { email, password, name, role, department } = body
    
    if (!email || !password || !name || !role || !department) {
      console.error('Missing fields:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasName: !!name,
        hasRole: !!role,
        hasDepartment: !!department
      })
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          email: !email ? 'Missing email' : undefined,
          password: !password ? 'Missing password' : undefined,
          name: !name ? 'Missing name' : undefined,
          role: !role ? 'Missing role' : undefined,
          department: !department ? 'Missing department' : undefined
        }
      }, { status: 400 })
    }

    // Validate role and department
    const validRoles = ['admin', 'manager', 'operational']
    const validDepartments = ['management', 'sales', 'accounts', 'trade_shop']
    
    if (!validRoles.includes(role)) {
      console.error('Invalid role:', role)
      return NextResponse.json({ 
        error: 'Invalid role',
        validRoles 
      }, { status: 400 })
    }
    
    if (!validDepartments.includes(department)) {
      console.error('Invalid department:', department)
      return NextResponse.json({ 
        error: 'Invalid department',
        validDepartments 
      }, { status: 400 })
    }

    console.log('Hashing password...')
    const hashedPassword = await hashPassword(password)

    console.log('Creating Supabase client...')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    console.log('Inserting user into database...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name,
        role: role,
        department: department,
        password_hash: hashedPassword,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', {
        error: userError,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      })
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: userError.message,
        code: userError.code
      }, { status: 500 })
    }

    console.log('User created successfully:', userData)
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
    console.error('Unexpected error during user creation:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}