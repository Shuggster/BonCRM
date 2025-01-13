import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(auth)/lib/auth-options"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  return children
} 