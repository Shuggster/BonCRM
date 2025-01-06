import { Shield } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"

export default function AdminPage() {
  return (
    <div className="flex-1 p-6">
      <PageHeader 
        heading="Admin Dashboard" 
        description="Manage your system settings and users"
        icon={Shield}
      />
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <a 
          href="/admin/users" 
          className="block rounded-lg border border-white/[0.08] p-6 hover:bg-white/[0.02] transition-colors"
        >
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Manage user accounts, roles, and permissions
          </p>
        </a>

        <a 
          href="/admin/teams" 
          className="block rounded-lg border border-white/[0.08] p-6 hover:bg-white/[0.02] transition-colors"
        >
          <h3 className="text-lg font-semibold">Team Management</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Organize and manage team structures
          </p>
        </a>
      </div>
    </div>
  )
} 