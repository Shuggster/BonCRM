import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { verifyPassword } from "@/lib/auth/bcrypt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            department: string;
        }
    }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ 
          cookies: () => cookieStore
        }, {
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        })

        try {
          // Get user from users table
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (userError) throw new Error(userError.message)
          if (!user) throw new Error('User not found')

          // Verify password
          const passwordValid = await verifyPassword(credentials.password, user.password_hash)
          if (!passwordValid) throw new Error('Invalid password')

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
