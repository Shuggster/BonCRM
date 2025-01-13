import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Fetch the team
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', params.teamId)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team' },
        { status: 500 }
      )
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    if (!body.department) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      )
    }

    // First check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('id, name, department')
      .eq('id', params.teamId)
      .single()

    if (fetchError) {
      console.error('Error fetching team:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch team', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!existingTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData = {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      department: body.department,
      updated_at: new Date().toISOString()
    }

    // Update the team
    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', params.teamId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating team:', updateError)
      return NextResponse.json(
        { error: 'Failed to update team', details: updateError.message },
        { status: 500 }
      )
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found after update' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      team,
      message: 'Team updated successfully' 
    })
  } catch (error) {
    console.error('Error in PATCH /api/teams/[teamId]:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Delete the team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', params.teamId)

    if (error) {
      console.error('Error deleting team:', error)
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/teams/[teamId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 