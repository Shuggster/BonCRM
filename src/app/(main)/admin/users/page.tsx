import { Users2 } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { UserManagement } from "@/components/admin/UserManagement"

export default function UsersPage() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6">
        <PageHeader 
          heading="User Management" 
          description="Manage user accounts, roles, and permissions"
          icon={Users2}
        />
      </div>

      <div className="flex-1 min-h-0">
        <UserManagement />
      </div>
    </div>
  )
} 