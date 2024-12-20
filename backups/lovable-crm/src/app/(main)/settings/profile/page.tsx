'use client'

import { User2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function ProfileSettingsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Profile Settings" 
        icon={User2}
        iconClass="icon-user"
      />
      {/* Content will go here */}
    </div>
  )
}
