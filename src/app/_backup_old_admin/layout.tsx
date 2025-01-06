import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/(auth)/lib/auth-options'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // Redirect if not an admin
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return children
}
