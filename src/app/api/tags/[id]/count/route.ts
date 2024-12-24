import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { supabase } from "@/lib/supabase/client"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { count, error } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .contains('tags', [params.id])

    if (error) throw error

    return NextResponse.json({ count })
  } catch (error: any) {
    console.error('Error in /api/tags/[id]/count:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get tag count' },
      { status: 500 }
    )
  }
} 