import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    console.log('Starting GET /api/teams request')
    
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

    console.log('Fetching teams from Supabase')
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, description, department, created_at')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Teams fetched successfully:', teams)
    return NextResponse.json({ teams })
  } catch (error) {
    // Log the full error object
    console.error('Detailed error in GET /api/teams:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST /api/teams request')
    
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

    // Validate required fields
    if (!body.name || !body.department) {
      return NextResponse.json(
        { error: 'Name and department are required' },
        { status: 400 }
      )
    }

    console.log('Creating team in Supabase')
    const { data: team, error } = await supabase
      .from('teams')
      .insert([{
        name: body.name,
        description: body.description || '',
        department: body.department,
        created_by: session.user.id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Team created successfully:', team)
    return NextResponse.json({ team })
  } catch (error) {
    // Log the full error object
    console.error('Detailed error in POST /api/teams:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: 'Failed to create team', details: error.message },
      { status: 500 }
    )
  }
} 