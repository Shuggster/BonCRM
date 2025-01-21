import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(auth)/lib/auth-options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get file metadata
    const { data: file, error } = await supabase
      .from('files')
      .select('metadata')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to get file status" },
        { status: 500 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: file.metadata?.status || 'unknown',
      error: file.metadata?.error
    })

  } catch (error) {
    console.error('Error getting file status:', error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
} 