import { Shield } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"

export default function RolesLayout({
  children
}: {
  children: React.ReactNode
}) {
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
        {children}
      </div>
    </div>
  )
} 