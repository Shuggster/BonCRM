import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string | null
    role: string
    department: string
  }

  interface Session {
    user: User & {
      id: string
      email: string
      name: string | null
      role: string
      department: string
    }
  }
} 