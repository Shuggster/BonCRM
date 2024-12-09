'use client'

import { Shield } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function SecuritySettingsPage() {
  return (
    <div className="p-6">
      <PageHeader 
        title="Security & Password" 
        icon={Shield}
        iconClass="icon-settings"
      />
      {/* Content will go here */}
    </div>
  )
}
