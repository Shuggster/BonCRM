import { Shield } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"

export default function RolesPage() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6">
        <PageHeader 
          heading="Role Management" 
          description="Manage user roles and permissions"
          icon={Shield}
        />
      </div>

      <div className="flex-1 min-h-0 p-6">
        <div className="rounded-lg border border-white/[0.08] p-6">
          <h2 className="text-lg font-semibold mb-4">Available Roles</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <h3 className="font-medium">Admin</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Full system access with all permissions
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <h3 className="font-medium">Manager</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Department-level access with team management
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <h3 className="font-medium">Operational</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Basic access for day-to-day operations
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              Role management functionality will be implemented in a future update. Currently displaying available roles for reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 