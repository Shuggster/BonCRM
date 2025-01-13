import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DatabaseTeamMember {
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: DatabaseUser;
}

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    console.log('Starting GET /api/teams/[teamId]/members request')
    
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    console.log('User role:', session.user.role)
    if (session.user.role !== 'admin') {
      console.log('User not admin:', session.user)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    console.log('Fetching team members from Supabase')
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        user_id,
        role,
        joined_at,
        user:users (
          id,
          name,
          email,
          role
        )
      `)
      .eq('team_id', params.teamId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Team members fetched successfully:', members)
    
    // Map the members data to match our TeamMember interface
    const mappedMembers = members?.map(member => ({
      id: member.user_id, // Use user_id as the member id
      name: member.user.name,
      email: member.user.email,
      role: member.role
    })) || []

    return NextResponse.json({ members: mappedMembers })
  } catch (error: any) {
    console.error('Detailed error in GET /api/teams/[teamId]/members:', {
      error,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch team members', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    console.log('Starting POST /api/teams/[teamId]/members request')
    
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    console.log('User role:', session.user.role)
    if (session.user.role !== 'admin') {
      console.log('User not admin:', session.user)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const body = await request.json()
    console.log('Request body:', body)

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First check if the user is already a member of the team
    const { data: existingMember, error: checkError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', params.teamId)
      .eq('user_id', body.userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking existing member:', checkError)
      throw checkError
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    // First get the user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', body.userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw userError
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Add the member
    console.log('Adding member to team in Supabase')
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        team_id: params.teamId,
        user_id: body.userId,
        role: 'member', // Default role for new members
        joined_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error inserting new member:', insertError)
      throw insertError
    }

    // Return the mapped member data
    const mappedMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'member' // The role in the team, not the user's system role
    }

    return NextResponse.json({ member: mappedMember })
  } catch (error: any) {
    console.error('Detailed error in POST /api/teams/[teamId]/members:', {
      error,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    })
    
    if (error?.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add team member', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    console.log('Starting DELETE /api/teams/[teamId]/members request')
    
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    console.log('User role:', session.user.role)
    if (session.user.role !== 'admin') {
      console.log('User not admin:', session.user)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Removing member from team in Supabase')
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', params.teamId)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Team member removed successfully')
    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error: any) {
    console.error('Detailed error in DELETE /api/teams/[teamId]/members:', {
      error,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name
    })
    
    return NextResponse.json(
      { error: 'Failed to remove team member', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 