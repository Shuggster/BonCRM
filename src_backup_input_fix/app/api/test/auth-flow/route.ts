import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  try {
    // 1. Validate session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // 2. Create database client (server-side only)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // 3. Get data based on user role
    const { role, department } = session.user
    let data

    switch (role) {
      case 'admin':
        // Admins can see all users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email, name, role, department')
        if (usersError) throw usersError
        data = { type: 'admin', users }
        break

      case 'manager':
        // Managers see users in their department
        // If no department is set, they see no users (security first)
        if (!department) {
          data = { type: 'manager', users: [], error: 'No department assigned' }
          break
        }
        const { data: deptUsers, error: deptError } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('department', department)
        if (deptError) throw deptError
        data = { 
          type: 'manager', 
          department,
          users: deptUsers 
        }
        break

      case 'operational':
        // Operational users only see their own info
        const { data: userInfo, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role, department')
          .eq('id', session.user.id)
          .single()
        if (userError) throw userError
        data = { 
          type: 'operational', 
          user: userInfo,
          message: 'You can only view your own information'
        }
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid role' 
        }, { status: 403 })
    }

    // 4. Return role-specific data
    return NextResponse.json({
      success: true,
      role: role,
      department: department || null,
      data: data
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
