import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
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
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { name, description, department } = await request.json()

    // First check if team exists
    const { data: existingTeam, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', params.teamId)
      .single()

    if (fetchError || !existingTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Update the team
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        name,
        description,
        department,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.teamId)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error in PATCH /api/teams/[teamId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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