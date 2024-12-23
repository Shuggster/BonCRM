import { Session } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'

export function convertToSupabaseSession(session: any): Session {
  return {
    access_token: session.supabaseAccessToken,
    refresh_token: session.supabaseRefreshToken,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      aud: 'authenticated',
      app_metadata: {
        provider: 'email'
      },
      user_metadata: {},
      created_at: session.user.createdAt
    }
  }
}

export async function getSession(): Promise<Session | null> {
  const nextAuthSession = await getServerSession()
  if (!nextAuthSession) return null
  return convertToSupabaseSession(nextAuthSession)
} 