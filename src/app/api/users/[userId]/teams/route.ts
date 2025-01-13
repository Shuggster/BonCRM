import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
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

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get user's team assignments
    const { data: teams, error } = await supabase
      .from("team_members")
      .select(`
        team_id,
        user_id,
        role,
        teams:team_id (
          id,
          name
        )
      `)
      .eq("user_id", params.userId)

    if (error) {
      console.error("Error fetching teams:", error)
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      )
    }

    return NextResponse.json({ teams })
  } catch (error: any) {
    console.error("Error in teams route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 