import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { hashPassword } from '@/lib/auth/bcrypt'

// Initialize Supabase Admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Current user email:', session.user.email)
    const { newPassword } = await req.json()

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password in public.users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', session.user.email)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Update password in auth.users
    const { data: authUser } = await supabase.auth.admin.listUsers()
    const targetUser = authUser.users.find(u => u.email === session.user.email)

    if (targetUser) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      )

      if (authUpdateError) {
        console.error('Error updating auth password:', authUpdateError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
