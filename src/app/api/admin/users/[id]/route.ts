import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface TeamMember {
  id: string;
  role: string;
  team: {
    id: string;
    name: string;
  };
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify admin session
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required' 
      }, { status: 401 })
    }

    // 2. Initialize Supabase with service role
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // 3. Fetch user with proper error handling
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, department')
      .eq('id', params.id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ 
        error: 'Failed to fetch user',
        details: userError.message 
      }, { status: 500 })
    }

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // 4. Fetch team memberships separately
    let teams: { id: string; name: string; role: string }[] = []
    
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        team:teams (
          id,
          name
        )
      `)
      .eq('user_id', params.id)

    if (teamError) {
      console.error('Error fetching teams:', teamError)
    } else if (teamData) {
      teams = teamData.map((t: TeamMember) => ({
        id: t.team.id,
        name: t.team.name,
        role: t.role
      }))
    }

    // 5. Transform and return the data
    const user = {
      ...userData,
      teams
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ 
      error: 'Unauthorized - Admin access required' 
    }, { status: 401 })
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // Delete user from users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete user',
        details: deleteError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ 
      error: 'Unauthorized - Admin access required' 
    }, { status: 401 })
  }

  try {
    const updates = await req.json()
    const { name, role, department } = updates

    // Validate role and department if they are being updated
    if (role) {
      const validRoles = ['admin', 'manager', 'operational']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }
    
    if (department) {
      const validDepartments = ['management', 'sales', 'accounts', 'trade_shop']
      if (!validDepartments.includes(department)) {
        return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
      }
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    // Update user
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({
        name: name,
        role: role,
        department: department,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: updateError.message 
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
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
