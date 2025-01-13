import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get search query from URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase() || ""

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get users who are not in the team
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", params.teamId)

    if (teamMembersError) {
      console.error("Error fetching team members:", teamMembersError)
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 }
      )
    }

    const existingMemberIds = teamMembers?.map(member => member.user_id) || []

    console.log('Fetching users not in team:', {
      teamId: params.teamId,
      existingMemberIds,
      search
    })

    // Build the search query
    let query = supabase
      .from("users")
      .select("id, name, email, role, is_active")

    // Only apply the not-in filter if there are existing members
    if (existingMemberIds.length > 0) {
      query = query.filter('id', 'not.in', `(${existingMemberIds.join(',')})`)
    }

    // Apply search filter if provided
    if (search) {
      query = query.filter('name', 'ilike', `%${search}%`)
        .or(`email.ilike.%${search}%`)
    }

    console.log('Final query:', query)

    // Execute the query
    const { data: users, error: usersError } = await query
    console.log('Query result:', {
      searchTerm: search,
      userCount: users?.length || 0,
      error: usersError,
      users
    })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json(
        { 
          error: "Failed to fetch users", 
          details: usersError.message,
          query: search
        },
        { status: 500 }
      )
    }

    // Filter out inactive users
    const activeUsers = users?.filter(user => user.is_active !== false) || []
    console.log('Filtered active users:', activeUsers)

    return NextResponse.json({ users: activeUsers })
  } catch (error: any) {
    console.error("Error in available-users route:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error?.message || 'Unknown error',
        stack: error?.stack
      },
      { status: 500 }
    )
  }
} 