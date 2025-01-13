import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { withAdminProtect } from "@/lib/auth/admin-route"

export const GET = withAdminProtect(async () => {
  const supabase = createClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, department')
    .order('name')

  if (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }

  return NextResponse.json({ users })
})