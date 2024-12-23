'use server'

import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '../(auth)/lib/auth-options'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth/bcrypt'

// Create a Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function changePassword(newPassword: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      throw new Error('Not authenticated')
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the password in our users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', session.user.email)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Failed to update password')
    }

    revalidatePath('/settings/security')
    return { success: true }
  } catch (error: any) {
    console.error('Password change error:', error)
    return { error: error.message }
  }
}
