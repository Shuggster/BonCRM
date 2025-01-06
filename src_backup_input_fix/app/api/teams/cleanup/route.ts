import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

interface Team {
  id: string
  name: string
  department: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST /api/teams/cleanup request')
    
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    console.log('Session details:', {
      exists: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role,
        name: session.user.name
      } : null
    })
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'No session found. Please log in.' 
      }, { status: 401 })
    }

    // Check if user is admin
    console.log('User role:', session.user.role)
    if (session.user.role !== 'admin') {
      console.log('User not admin:', session.user)
      return NextResponse.json({ 
        error: 'Forbidden', 
        details: 'Admin access required.'
      }, { status: 403 })
    }

    // Initialize Supabase client (for database operations only)
    console.log('Initializing Supabase client')
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // First, get all teams ordered by creation date
    console.log('Fetching all teams')
    const { data: teams, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching teams:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!teams) {
      return NextResponse.json({ message: 'No teams found' })
    }

    console.log(`Found ${teams.length} total teams`)

    // Group teams by department and name
    const groupedTeams = teams.reduce<Record<string, Team[]>>((acc, team) => {
      const key = `${team.department}-${team.name}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(team)
      return acc
    }, {})

    // Find duplicate teams (keeping the oldest one)
    const duplicateIds = Object.values(groupedTeams)
      .filter((group): group is Team[] => group.length > 1)
      .flatMap(group => group.slice(1).map(team => team.id))

    if (duplicateIds.length === 0) {
      console.log('No duplicates found')
      return NextResponse.json({ message: 'No duplicates found' })
    }

    console.log(`Found ${duplicateIds.length} duplicate teams to remove`)
    console.log('Duplicate IDs:', duplicateIds)

    // Delete duplicate teams
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .in('id', duplicateIds)

    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete duplicate teams', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log('Successfully deleted duplicates')
    return NextResponse.json({
      message: 'Cleanup completed successfully',
      deletedCount: duplicateIds.length,
      details: {
        totalTeams: teams.length,
        duplicatesRemoved: duplicateIds.length,
        remainingTeams: teams.length - duplicateIds.length
      }
    })
  } catch (error) {
    console.error('Error in POST /api/teams/cleanup:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
} 