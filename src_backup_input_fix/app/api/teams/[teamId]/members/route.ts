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
    const supabase = createRouteHandlerClient({ cookies })

    console.log('Fetching team members from Supabase')
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user:user_id (
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
    return NextResponse.json({ 
      members: members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role
      }))
    })
  } catch (error) {
    console.error('Detailed error in GET /api/teams/[teamId]/members:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch team members', details: error.message },
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
    const supabase = createRouteHandlerClient({ cookies })
    
    const body = await request.json()
    console.log('Request body:', body)

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Adding member to team in Supabase')
    const { data: member, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: params.teamId,
        user_id: body.userId,
        added_by: session.user.id,
        added_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Team member added successfully:', member)
    return NextResponse.json({ member })
  } catch (error) {
    console.error('Detailed error in POST /api/teams/[teamId]/members:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Failed to add team member', details: error.message },
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
    const supabase = createRouteHandlerClient({ cookies })
    
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
  } catch (error) {
    console.error('Detailed error in DELETE /api/teams/[teamId]/members:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Failed to remove team member', details: error.message },
      { status: 500 }
    )
  }
} 