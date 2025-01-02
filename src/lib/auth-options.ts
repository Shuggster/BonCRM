import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          console.log('Attempting login for:', credentials.email)

          // Try to sign in with Supabase Auth
          const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (signInError) {
            console.error('Sign in error:', {
              message: signInError.message,
              details: signInError
            })
            return null
          }

          if (!user) {
            console.log('No user found after sign in')
            return null
          }

          console.log('User authenticated:', user.id)

          // Get user metadata
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)

          if (authError || !authUser) {
            console.error('Error getting user metadata:', authError)
            return null
          }

          return {
            id: user.id,
            email: user.email || '',
            name: authUser.user.user_metadata.name || null,
            role: authUser.user.user_metadata.role || 'user',
            department: authUser.user.user_metadata.department || 'general'
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error('Authorization error:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            })
          } else {
            console.error('Unknown authorization error:', error)
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.name = token.name as string || null
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/login'
  }
} 