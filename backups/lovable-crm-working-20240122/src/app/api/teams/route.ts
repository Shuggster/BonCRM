import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"
import { supabase } from "@/lib/supabase"
import { Team } from "@/types/teams"

// GET - List teams (with department filtering)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const department = searchParams.get('department')

  try {
    let query = supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          user_id,
          role,
          users(name, email)
        )
      `)

    // If not admin, only show teams from user's department
    if (session.user.role !== 'admin') {
      query = query.eq('department', session.user.department)
    } 
    // If department filter provided and user is admin
    else if (department) {
      query = query.eq('department', department)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

// POST - Create new team
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, description, department } = await req.json()
    
    // Verify user has permission for this department
    if (session.user.role !== 'admin' && session.user.department !== department) {
      return NextResponse.json({ error: 'Unauthorized department' }, { status: 403 })
    }
    
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        department,
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
} 