import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ 
      error: 'Unauthorized - Admin access required' 
    }, { status: 401 })
  }

  try {
    const { email, password, name, role } = await req.json()
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // Create auth user
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth Error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        name,
        role
      })

    if (profileError) {
      console.error('Profile Error:', profileError)
      await supabase.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
} 