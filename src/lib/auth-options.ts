import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const authOptions: NextAuthOptions = {
  debug: true,
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
          
          // Use server component client as per docs
          const supabase = createServerComponentClient({ cookies })

          // First verify credentials
          const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError) {
            console.error('Auth error:', authError)
            return null
          }

          if (!user) {
            console.log('No user found')
            return null
          }

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Profile error:', profileError)
            return null
          }

          console.log('Login successful:', { user, profile })

          // Return the combined user info
          return {
            id: user.id,
            email: user.email,
            name: profile.name,
            role: profile.role
          }

        } catch (error) {
          console.error('Server error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
} 