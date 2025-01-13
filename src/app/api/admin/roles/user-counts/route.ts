import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
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

    // Get user counts per role
    const { data, error } = await supabase
      .from('users')
      .select('role, count')
      .select('role')
      .then(result => {
        if (result.error) throw result.error
        
        // Count users per role
        const counts = result.data.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return { data: counts, error: null }
      })

    if (error) {
      console.error("Error fetching user counts:", error)
      return NextResponse.json(
        { error: "Failed to fetch user counts" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in user-counts route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 