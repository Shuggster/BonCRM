import { Users } from 'lucide-react'
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { TeamManagement } from "@/components/admin/TeamManagement"

export default async function TeamsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Team Management</h2>
      </div>
      
      <div className="space-y-6">
        <TeamManagement />
      </div>
    </div>
  )
} 